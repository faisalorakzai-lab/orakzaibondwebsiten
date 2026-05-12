import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Star, Gem, CheckCircle2, Globe, MessageCircle, User, Link, MapPin, ChevronDown, ChevronUp, Shield, Zap, Award, Activity, Radio } from "lucide-react";

const TIERS = [
  {
    id: "silver",
    name: "Silver Ambassador",
    reward: "$20 Grant",
    rewardLabel: "Performance Grant",
    icon: Star,
    color: "#C0C0C0",
    glow: "rgba(192,192,192,0.25)",
    border: "rgba(192,192,192,0.4)",
    bg: "rgba(192,192,192,0.06)",
    badge: "SILVER",
    description:
      "Entry-level ambassadors representing OKBOND across social platforms. Verified community builders rewarded for authentic outreach.",
    perks: [
      "Official Silver Ambassador Badge",
      "$20 USD performance grant on activation",
      "Early ICO whitelist access",
      "Dedicated onboarding support",
      "Ambassador-only community channel",
    ],
    requirements: [
      "Minimum 500 social followers",
      "Active engagement history",
      "Completed KYC",
    ],
  },
  {
    id: "gold",
    name: "Gold Ambassador",
    reward: "$1,000 Performance Award",
    rewardLabel: "Performance Award",
    icon: Crown,
    color: "#EAB308",
    glow: "rgba(234,179,8,0.35)",
    border: "rgba(234,179,8,0.55)",
    bg: "rgba(234,179,8,0.08)",
    badge: "GOLD",
    description:
      "High-impact regional leaders driving institutional awareness. Gold Ambassadors represent the Orakzai Bond at events and institutional forums.",
    perks: [
      "Official Gold Ambassador Certification",
      "$1,000 USD performance award",
      "Priority ICO allocation",
      "Co-branded promotional materials",
      "Monthly Chairman briefing access",
      "Revenue-share referral program",
    ],
    requirements: [
      "Minimum 5,000 social followers",
      "Proven track record in crypto/Web3",
      "Regional leadership experience",
      "Completed enhanced KYC",
    ],
  },
  {
    id: "diamond",
    name: "Diamond Partner",
    reward: "Institutional Equity",
    rewardLabel: "Equity Partnership",
    icon: Gem,
    color: "#60A5FA",
    glow: "rgba(96,165,250,0.3)",
    border: "rgba(96,165,250,0.5)",
    bg: "rgba(96,165,250,0.07)",
    badge: "DIAMOND",
    description:
      "Exclusive institutional-grade partnership for family offices, sovereign wealth arms, and high-net-worth principals seeking equity in the Orakzai ecosystem.",
    perks: [
      "Institutional equity stake in the Group",
      "Direct line to Chairman Orakzai",
      "Board advisory consideration",
      "Priority participation in all Group initiatives",
      "Customised sovereign investment structure",
      "Full due diligence package + whitepaper access",
    ],
    requirements: [
      "Institutional or HNWI accreditation",
      "Minimum commitment threshold applies",
      "Private negotiation required",
      "NDA and legal review",
    ],
  },
];

const CODE_OF_CONDUCT = `ORAKZAI SOVEREIGN CODE OF CONDUCT — AMBASSADOR CHARTER

By joining the Orakzai Ambassador Program, I solemnly affirm and commit to the following:

1. INTEGRITY — I will represent the Orakzai Group and OKBOND with honesty, accuracy, and dignity at all times. I will not make unverified claims about tokenomics, returns, or legal status.

2. TRANSPARENCY — I will clearly disclose my Ambassador status when promoting OKBOND across any platform or in any conversation.

3. RESPECT — I will engage all community members, investors, and public audiences with respect and professionalism, embodying the values of the Orakzai Sovereign standard.

4. COMPLIANCE — I will adhere to all applicable laws and regulations in my region regarding financial promotions, digital assets, and marketing communications.

5. EXCLUSIVITY — I will not represent competing blockchain or digital asset projects in a manner that conflicts with my duties as an Orakzai Ambassador.

6. CONFIDENTIALITY — I will protect any non-public information shared with me by the Orakzai Group, its officers, and its Chairman.

7. ACCOUNTABILITY — I understand that breach of this Code may result in immediate termination of my Ambassador status, forfeiture of any unpaid rewards, and legal action where applicable.

This Charter is subject to the laws of the Islamic Republic of Pakistan and the jurisdiction of Khyber Pakhtunkhwa under the sovereign authority of the Orakzai Group.`;

interface FormState {
  name: string;
  socialUrl: string;
  whatsapp: string;
  region: string;
  tier: string;
  conductAgreed: boolean;
}

const REGIONS = [
  "Pakistan — Punjab", "Pakistan — Sindh", "Pakistan — KPK", "Pakistan — Balochistan", "Pakistan — AJK",
  "United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain",
  "United Kingdom", "United States", "Canada", "Australia", "Germany",
  "Turkey", "Malaysia", "Indonesia", "India", "Bangladesh",
  "Afghanistan", "Other",
];

function SovereignStatusBar() {
  return (
    <div
      className="rounded-xl px-4 py-2.5 flex items-center justify-between gap-x-5 gap-y-2 flex-wrap"
      style={{
        background: "linear-gradient(180deg, rgba(20,16,8,0.55), rgba(8,6,3,0.55))",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(212,175,55,0.35)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(212,175,55,0.18)",
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#EAB308" }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#EAB308" }} />
        </span>
        <Activity className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(244,206,69,0.85)" }} />
        <span className="text-[10px] font-mono uppercase tracking-[0.18em] whitespace-nowrap" style={{ color: "rgba(212,175,55,0.7)" }}>
          Ambassador Program
        </span>
        <span className="text-xs font-bold tabular-nums" style={{ color: "#F4CE45" }}>
          Active · 2026
        </span>
      </div>
      <div className="hidden md:block h-4 w-px" style={{ background: "rgba(212,175,55,0.25)" }} />
      <div className="flex items-center gap-2 flex-shrink-0">
        <Radio className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(244,206,69,0.85)" }} />
        <span className="text-[10px] font-mono uppercase tracking-[0.18em]" style={{ color: "rgba(212,175,55,0.7)" }}>
          Orakzai Group · Sovereign Initiative
        </span>
      </div>
    </div>
  );
}

export default function AmbassadorPage() {
  const [activeTier, setActiveTier] = useState<string | null>(null);
  const [conductOpen, setConductOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "", socialUrl: "", whatsapp: "", region: "", tier: "silver", conductAgreed: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.conductAgreed) {
      setError("You must agree to the Orakzai Sovereign Code of Conduct to proceed.");
      return;
    }
    if (!form.name.trim() || !form.whatsapp.trim() || !form.region) {
      setError("Please complete all required fields.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      // 1. Save locally
      const stored: FormState[] = JSON.parse(localStorage.getItem("okbond_ambassador_registrations") || "[]");
      stored.push({ ...form });
      localStorage.setItem("okbond_ambassador_registrations", JSON.stringify(stored));

      // 2. Send email to team@orakzaibond.com via API
      try {
        const res = await fetch("/api/ambassador-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            socialUrl: form.socialUrl.trim(),
            whatsapp: form.whatsapp.trim(),
            region: form.region,
            tier: form.tier,
          }),
        });
        if (!res.ok) console.warn("[ambassador] email API returned", res.status);
      } catch (emailErr) {
        console.warn("[ambassador] email send failed:", emailErr);
        // Don't block submission on email failure
      }

      setSubmitted(true);
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden neural-grid-strong">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header — Community-style ───────────────────────────────── */}
        <header className="relative z-30 mb-6">
          <div className="flex items-end justify-between gap-3 px-1 mb-3">
            <div className="min-w-0 flex-1 flex items-center gap-3">
              <div
                className="flex-shrink-0 rounded-full overflow-hidden"
                style={{
                  width: 56, height: 56,
                  border: "1.5px solid rgba(234,179,8,0.55)",
                  boxShadow: "0 0 20px rgba(234,179,8,0.35), inset 0 0 12px rgba(0,0,0,0.6)",
                  background: "rgba(0,0,0,0.4)",
                }}
              >
                <img src="/okbond-logo.png" alt="OKBOND" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] mb-1" style={{ color: "rgba(212,175,55,0.75)" }}>
                  OKBOND · Sovereign Program
                </p>
                <h1
                  className="leading-none tracking-tight"
                  style={{
                    color: "#F4CE45",
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 800,
                    fontSize: "clamp(1.4rem, 4.2vw, 2.3rem)",
                    textShadow: "0 0 24px rgba(212,175,55,0.4)",
                  }}
                >
                  Ambassador Program
                </h1>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-px w-16" style={{ background: "linear-gradient(90deg, #D4AF37, transparent)" }} />
                  <span className="text-[9px] font-mono uppercase tracking-[0.25em]" style={{ color: "rgba(212,175,55,0.5)" }}>
                    Orakzai Bond Network
                  </span>
                </div>
              </div>
            </div>
          </div>
          <SovereignStatusBar />
        </header>

        {/* ── Stats strip ──────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Active Ambassadors", value: "Growing", icon: Award },
            { label: "Global Regions", value: "22+", icon: Globe },
            { label: "Program Since", value: "2026", icon: Shield },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4 text-center"
                style={{
                  background: "linear-gradient(180deg, rgba(20,16,8,0.55), rgba(8,6,3,0.55))",
                  border: "1px solid rgba(234,179,8,0.2)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.12)",
                }}
              >
                <Icon className="w-4 h-4 mx-auto mb-2" style={{ color: "#EAB308" }} />
                <p className="text-lg font-bold" style={{ color: "#EAB308" }}>{s.value}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">{s.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* ── Tier Cards — Community card style ────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {TIERS.map((tier, i) => {
            const Icon = tier.icon;
            const isActive = activeTier === tier.id;
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                onClick={() => setActiveTier(isActive ? null : tier.id)}
                className="relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  background: isActive
                    ? `linear-gradient(180deg, ${tier.bg}, rgba(8,6,3,0.7))`
                    : "linear-gradient(180deg, rgba(20,16,8,0.55), rgba(8,6,3,0.55))",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  border: `1px solid ${isActive ? tier.border : "rgba(212,175,55,0.2)"}`,
                  boxShadow: isActive
                    ? `0 0 40px ${tier.glow}, 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.18)`
                    : "0 4px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(212,175,55,0.08)",
                  transform: isActive ? "translateY(-4px)" : "none",
                }}
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(to right, transparent, ${tier.color}, transparent)` }}
                />

                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${tier.bg}, rgba(0,0,0,0.4))`,
                        border: `1px solid ${tier.border}`,
                        boxShadow: `0 0 16px ${tier.glow}`,
                      }}
                    >
                      <Icon className="w-6 h-6" style={{ color: tier.color }} />
                    </div>
                    <span
                      className="text-[9px] font-black tracking-[0.25em] px-3 py-1 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, ${tier.bg}, rgba(0,0,0,0.3))`,
                        border: `1px solid ${tier.border}`,
                        color: tier.color,
                      }}
                    >
                      {tier.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{tier.name}</h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-xl font-black" style={{ color: tier.color }}>{tier.reward}</span>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-4">{tier.description}</p>

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="rounded-xl p-4 mb-3"
                          style={{
                            background: `linear-gradient(135deg, ${tier.bg}, rgba(0,0,0,0.3))`,
                            border: `1px solid ${tier.border}`,
                          }}
                        >
                          <p className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: tier.color }}>
                            Perks
                          </p>
                          <ul className="space-y-1.5">
                            {tier.perks.map((p) => (
                              <li key={p} className="flex items-start gap-2 text-sm text-zinc-300">
                                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: tier.color }} />
                                {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div
                          className="rounded-xl p-4"
                          style={{
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <p className="text-[10px] uppercase tracking-widest font-bold mb-2 text-zinc-500">
                            Requirements
                          </p>
                          <ul className="space-y-1.5">
                            {tier.requirements.map((r) => (
                              <li key={r} className="flex items-start gap-2 text-xs text-zinc-500">
                                <Shield className="w-3 h-3 mt-0.5 flex-shrink-0 text-zinc-600" />
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    className="w-full mt-4 flex items-center justify-center gap-2 text-xs font-semibold py-2.5 rounded-xl transition-all"
                    style={{
                      color: tier.color,
                      border: `1px solid ${tier.border}`,
                      background: isActive ? tier.bg : "transparent",
                    }}
                    onClick={(e) => { e.stopPropagation(); setActiveTier(isActive ? null : tier.id); }}
                  >
                    {isActive ? <><ChevronUp className="w-3.5 h-3.5" /> Show Less</> : <><ChevronDown className="w-3.5 h-3.5" /> View Details</>}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Join the Movement Form ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, rgba(234,179,8,0.3))" }} />
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#EAB308" }} />
              <div className="h-px flex-1" style={{ background: "linear-gradient(to left, transparent, rgba(234,179,8,0.3))" }} />
            </div>
            <h2
              className="text-3xl font-black mb-2"
              style={{
                color: "#F4CE45",
                fontFamily: "'Playfair Display', serif",
                textShadow: "0 0 24px rgba(212,175,55,0.4)",
              }}
            >
              Join the Movement
            </h2>
            <p className="text-sm text-zinc-400">
              Complete the form below to begin your Ambassador journey with the Orakzai Group.
            </p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 rounded-2xl"
              style={{
                background: "linear-gradient(180deg, rgba(234,179,8,0.08), rgba(0,0,0,0.4))",
                border: "1px solid rgba(234,179,8,0.25)",
                boxShadow: "0 0 40px rgba(234,179,8,0.1), inset 0 1px 0 rgba(212,175,55,0.2)",
              }}
            >
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: "#EAB308" }} />
              <h3 className="text-2xl font-bold text-white mb-2">Application Submitted</h3>
              <p className="text-zinc-400 max-w-sm mx-auto text-sm leading-relaxed">
                Your Ambassador application has been received. Our team will review your credentials and reach out via WhatsApp within 48–72 hours.
              </p>
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500">
                <Zap className="w-3.5 h-3.5" style={{ color: "#EAB308" }} />
                <span>Reference your WhatsApp for onboarding communication</span>
              </div>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl p-8 space-y-5"
              style={{
                background: "linear-gradient(180deg, rgba(20,16,8,0.65), rgba(8,6,3,0.65))",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                border: "1px solid rgba(234,179,8,0.2)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.15)",
              }}
            >
              {/* Tier Select */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: "#EAB308" }}>
                  Tier Applying For
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {TIERS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, tier: t.id }))}
                      className="py-2.5 px-3 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: form.tier === t.id
                          ? `linear-gradient(135deg, ${t.bg}, rgba(0,0,0,0.4))`
                          : "rgba(255,255,255,0.03)",
                        border: `1px solid ${form.tier === t.id ? t.border : "rgba(255,255,255,0.08)"}`,
                        color: form.tier === t.id ? t.color : "#71717a",
                        boxShadow: form.tier === t.id ? `0 0 16px ${t.glow}` : "none",
                      }}
                    >
                      {t.badge}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-zinc-400">
                  <User className="inline w-3 h-3 mr-1" />Full Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your full legal name"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(234,179,8,0.2)",
                  }}
                  required
                />
              </div>

              {/* Social URL */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-zinc-400">
                  <Link className="inline w-3 h-3 mr-1" />Primary Social URL *
                </label>
                <input
                  type="url"
                  value={form.socialUrl}
                  onChange={(e) => setForm((f) => ({ ...f, socialUrl: e.target.value }))}
                  placeholder="https://twitter.com/yourhandle"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(234,179,8,0.2)",
                  }}
                  required
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-zinc-400">
                  <MessageCircle className="inline w-3 h-3 mr-1" />WhatsApp Number *
                </label>
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                  placeholder="+92 3XX XXXXXXX"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(234,179,8,0.2)",
                  }}
                  required
                />
              </div>

              {/* Region */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-zinc-400">
                  <MapPin className="inline w-3 h-3 mr-1" />Region *
                </label>
                <select
                  value={form.region}
                  onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                  style={{
                    background: "rgba(15,12,8,0.95)",
                    border: "1px solid rgba(234,179,8,0.2)",
                  }}
                  required
                >
                  <option value="" disabled>Select your region</option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Code of Conduct */}
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(234,179,8,0.25)" }}
              >
                <button
                  type="button"
                  onClick={() => setConductOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
                  style={{ background: "rgba(234,179,8,0.04)" }}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" style={{ color: "#EAB308" }} />
                    <span className="text-xs font-semibold text-zinc-300">Orakzai Sovereign Code of Conduct</span>
                  </div>
                  {conductOpen ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                </button>
                <AnimatePresence>
                  {conductOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <pre
                        className="text-[11px] text-zinc-400 leading-relaxed whitespace-pre-wrap px-4 py-4 max-h-48 overflow-y-auto"
                        style={{ fontFamily: "inherit" }}
                      >
                        {CODE_OF_CONDUCT}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Agree checkbox */}
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={form.conductAgreed}
                    onChange={(e) => setForm((f) => ({ ...f, conductAgreed: e.target.checked }))}
                    className="sr-only"
                  />
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center transition-all"
                    style={{
                      background: form.conductAgreed ? "rgba(234,179,8,0.2)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${form.conductAgreed ? "rgba(234,179,8,0.6)" : "rgba(255,255,255,0.15)"}`,
                    }}
                    onClick={() => setForm((f) => ({ ...f, conductAgreed: !f.conductAgreed }))}
                  >
                    {form.conductAgreed && <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#EAB308" }} />}
                  </div>
                </div>
                <span className="text-xs text-zinc-400 leading-relaxed">
                  I have read and agree to the Orakzai Sovereign Code of Conduct and Ambassador Charter. I understand this is a binding commitment.
                </span>
              </label>

              {error && (
                <div
                  className="rounded-xl px-4 py-3 text-xs"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #D4AF37, #EAB308, #A07A1F)",
                  color: "#050505",
                  boxShadow: "0 0 24px rgba(234,179,8,0.4)",
                }}
              >
                {submitting ? "Submitting…" : "Submit Application"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
