import { motion } from "framer-motion";
import { Quote, BadgeCheck, ScrollText } from "lucide-react";

const GOLD = "#D4AF37";
const GOLD_BRIGHT = "#F4CE45";
const GOLD_DEEP = "#A07A1F";

export default function SovereignGuarantee() {
  return (
    <section
      className="relative py-24 px-4 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(212,175,55,0.08), transparent 65%), linear-gradient(180deg, #050505 0%, #0a0805 100%)",
        borderTop: `1px solid ${GOLD}33`,
        borderBottom: `1px solid ${GOLD}33`,
      }}
    >
      {/* Decorative grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #D4AF37 1px, transparent 1px), linear-gradient(to bottom, #D4AF37 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Glow halo */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: 720,
          height: 720,
          background: `radial-gradient(circle, ${GOLD}22 0%, transparent 60%)`,
          filter: "blur(40px)",
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        {/* Eyebrow */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
            style={{ background: GOLD + "10", border: `1px solid ${GOLD}55` }}
          >
            <ScrollText className="w-3 h-3" style={{ color: GOLD_BRIGHT }} />
            <span className="text-[10.5px] font-mono tracking-[0.22em] uppercase" style={{ color: GOLD_BRIGHT }}>
              The Orakzai Bond Guarantee
            </span>
          </div>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative grid grid-cols-1 md:grid-cols-[260px,1fr] gap-8 md:gap-10 items-center rounded-3xl p-7 md:p-10"
          style={{
            background: "linear-gradient(160deg, rgba(20,16,8,0.85), rgba(6,5,3,0.92))",
            backdropFilter: "blur(18px)",
            border: `1px solid ${GOLD}66`,
            boxShadow: `0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 ${GOLD}33, 0 0 50px ${GOLD}22`,
          }}
        >
          {/* Corner ornaments */}
          {[
            { top: 10,    left: 10,    rotate: 0   },
            { top: 10,    right: 10,   rotate: 90  },
            { bottom: 10, right: 10,   rotate: 180 },
            { bottom: 10, left: 10,    rotate: 270 },
          ].map((pos, i) => (
            <div
              key={i}
              aria-hidden
              className="absolute w-6 h-6 pointer-events-none"
              style={{ ...pos, transform: `rotate(${pos.rotate}deg)` }}
            >
              <div
                className="absolute top-0 left-0 w-full h-[2px]"
                style={{ background: `linear-gradient(90deg, ${GOLD_BRIGHT}, transparent)` }}
              />
              <div
                className="absolute top-0 left-0 h-full w-[2px]"
                style={{ background: `linear-gradient(180deg, ${GOLD_BRIGHT}, transparent)` }}
              />
            </div>
          ))}

          {/* Portrait */}
          <div className="flex justify-center md:justify-start">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative"
              style={{ perspective: 1000 }}
            >
              {/* Halo glow */}
              <div
                aria-hidden
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${GOLD}55 0%, transparent 70%)`,
                  filter: "blur(28px)",
                  transform: "scale(1.25)",
                }}
              />
              <div
                className="relative overflow-hidden rounded-2xl"
                style={{
                  width: 220,
                  height: 280,
                  border: `2px solid ${GOLD}`,
                  boxShadow: `0 18px 50px rgba(0,0,0,0.7), 0 0 30px ${GOLD}66, inset 0 0 0 1px ${GOLD}33`,
                  transform: "rotateY(-3deg)",
                }}
              >
                <img
                  src="/chairman-portrait.jpg"
                  alt="Faisal Orakzai, Chairman of the Orakzai Group"
                  className="w-full h-full object-cover object-top"
                  loading="eager"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/faisal-orakzai.jpg";
                  }}
                />
                {/* Gold film overlay */}
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 50%, rgba(212,175,55,0.12) 100%)",
                  }}
                />
              </div>
              {/* Verified ribbon */}
              <div
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD}, ${GOLD_DEEP})`,
                  boxShadow: `0 6px 18px ${GOLD}77, inset 0 1px 0 rgba(255,255,255,0.4)`,
                }}
              >
                <BadgeCheck className="w-3.5 h-3.5" style={{ color: "#0a0a0a" }} />
                <span className="text-[10px] font-extrabold tracking-wider" style={{ color: "#0a0a0a" }}>
                  CHAIRMAN VERIFIED
                </span>
              </div>
            </motion.div>
          </div>

          {/* Quote block */}
          <div className="relative">
            <Quote
              className="absolute -top-4 -left-2 w-12 h-12 opacity-25"
              style={{ color: GOLD }}
              aria-hidden
            />
            <motion.blockquote
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="relative pl-6 md:pl-8"
            >
              <p
                className="text-xl md:text-2xl lg:text-[26px] leading-snug font-medium"
                style={{
                  color: "#f5e9c8",
                  fontFamily: "'Playfair Display', serif",
                  textShadow: `0 0 24px ${GOLD}33`,
                }}
              >
                <span style={{ color: GOLD_BRIGHT, fontWeight: 700 }}>“My character is the ultimate collateral.</span>
                {" "}
                Every <span style={{ color: GOLD_BRIGHT, fontWeight: 700 }}>$OKBOND</span> is backed by the tangible legacy of the{" "}
                <span style={{ color: GOLD_BRIGHT, fontWeight: 700 }}>Orakzai Group</span>.”
              </p>

              {/* Signature divider */}
              <div className="flex items-center gap-3 mt-6">
                <div
                  className="h-[2px] w-12"
                  style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }}
                />
                <div>
                  <p
                    className="text-base font-bold tracking-wide"
                    style={{ color: GOLD_BRIGHT, fontFamily: "'Playfair Display', serif" }}
                  >
                    Faisal Orakzai
                  </p>
                  <p className="text-[10.5px] font-mono uppercase tracking-[0.22em]" style={{ color: GOLD + "aa" }}>
                    Chairman · Orakzai Group
                  </p>
                </div>
              </div>

              {/* Trust meta-row */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-5" style={{ borderTop: `1px dashed ${GOLD}33` }}>
                {[
                  { k: "EST.",        v: "Legacy" },
                  { k: "JURISDICTION", v: "Pakistan" },
                  { k: "PLEDGE",      v: "OKBOND" },
                ].map((m) => (
                  <div key={m.k}>
                    <p className="text-[9.5px] font-mono uppercase tracking-[0.18em]" style={{ color: GOLD + "88" }}>
                      {m.k}
                    </p>
                    <p
                      className="text-sm font-bold mt-0.5"
                      style={{ color: GOLD_BRIGHT, fontFamily: "'Playfair Display', serif" }}
                    >
                      {m.v}
                    </p>
                  </div>
                ))}
              </div>
            </motion.blockquote>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
