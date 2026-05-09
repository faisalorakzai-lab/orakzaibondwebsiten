import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Bot, Loader2, CheckCircle, XCircle, RefreshCw, MessageSquare, Zap, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MARCUS_ADDRESS = "marcus-ai";

// ── OKBOND Knowledge Base ──────────────────────────────────────────────────
const MARCUS_SYSTEM_PROMPT = `You are Marcus — the official AI Ambassador of Orakzai Bond ($OKBOND), built by Chairman Faisal Orakzai.

PROJECT OVERVIEW:
- Orakzai Bond ($OKBOND) is a sovereign digital bond ecosystem on the Polygon Network (PoS blockchain)
- Total Supply: 10,000,000 OKBOND tokens | Standard: ERC-20 | Decimals: 18
- Contract on Polygon Mainnet — audited and verified on PolygonScan
- Mission: Financial sovereignty, capital preservation, and community wealth through blockchain

TOKEN DISTRIBUTION (official final tokenomics — 10,000,000 total supply):
- Staking Rewards: 28% (2,800,000 OKBOND) — APY ecosystem, holder retention, long-term incentives
- Community & Ecosystem: 20% (2,000,000 OKBOND) — ambassador program, partnerships, airdrops
- Liquidity Reserves: 20% (2,000,000 OKBOND) — DEX liquidity, CEX preparation, market depth
- Development Fund: 12% (1,200,000 OKBOND) — AI infrastructure, smart contracts, security audits
- Team & Advisors: 10% (1,000,000 OKBOND) — 1 year cliff, 2 year vesting
- Public Sale (ICO): 10% (1,000,000 OKBOND) — 3 rounds at $0.50 / $0.70 / $1.00

ICO PHASES:
- Phase 1 (LIVE): $0.50 per OKBOND — 333,333 OKBOND available
- Phase 2: $0.70 per OKBOND — 333,333 OKBOND
- Phase 3: $1.00 per OKBOND — 333,334 OKBOND
- Total ICO Supply: 1,000,000 OKBOND (10% of total supply)

STAKING PROGRAM:
- 28% of total supply (2,800,000 OKBOND) allocated as staking rewards
- Pools: 30d (12% APY) · 90d (15% APY) · 180d (18% APY) · 365d (24% APY)
- All staking is live on Polygon Mainnet via verified smart contract

ECOSYSTEM HUBS (key utility products):
1. OTC Hub — Peer-to-peer OKBOND trading desk for large, private transactions off-exchange
2. OreC Hub — OKBOND-based credit and lending ecosystem for community members
3. TinkTak Hub — Creative & entertainment platform rewarding content creators in OKBOND
4. Smart Lottery — Transparent, on-chain lottery powered by smart contracts (currently live on Polygon)

CAPITAL PRESERVATION MODEL:
- 100% reserve-backed bond structure — every OKBOND is backed by real reserve value
- The model is designed to preserve investor capital while generating yield through staking and ecosystem revenue
- Reserve health is maintained and monitored publicly (target: always at or above 100% backing)
- Not a speculative meme coin — OKBOND is a structured digital bond with sovereign-grade design

NETWORK:
- Polygon PoS (Proof of Stake) — fast, low-cost transactions
- Gas fees are a fraction of a cent — perfect for micro-transactions and frequent staking interactions

REPLY RULES:
- Always be concise (2-4 sentences max)
- Be warm, confident, and professional — like a sovereign institution's official voice
- Always mention Polygon Network when discussing technical questions
- Never give financial advice — say "this is for informational purposes only"
- Reply in the same language the post is written in
- If someone asks about pricing: say current Phase 1 is $0.50, Phase 2 is $0.70, Phase 3 is $1.00
- Encourage community members to join, stake, and participate in the ecosystem
- Sign off naturally as Marcus — no need for formal signatures`;

interface Post {
  id: string;
  content: string;
  address: string;
  created_at: string;
}

interface ReplyLog {
  postId: string;
  status: "pending" | "done" | "error";
  reply?: string;
  ts: number;
}

interface MarcusAutoReplyProps {
  enabled: boolean;
  onToggle: (val: boolean) => void;
  geminiApiKey?: string;
}

export default function MarcusAutoReply({ enabled, onToggle, geminiApiKey }: MarcusAutoReplyProps) {
  const [logs, setLogs] = useState<ReplyLog[]>([]);
  const [processing, setProcessing] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  const generateReply = async (postContent: string): Promise<string> => {
    const apiKey = geminiApiKey || (import.meta.env.VITE_GEMINI_API_KEY as string);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const body = {
      contents: [{
        parts: [{
          text: `${MARCUS_SYSTEM_PROMPT}\n\nNow reply to this community post:\n"${postContent}"\n\nReply only with your response. No labels, no prefixes.`
        }]
      }],
      generationConfig: { maxOutputTokens: 180, temperature: 0.75 }
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Thank you for contributing to the OKBOND community on Polygon. Your voice matters here.";
  };

  const processUnrepliedPosts = useCallback(async () => {
    if (!enabled || processing) return;
    setProcessing(true);

    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data: posts, error: postsErr } = await supabase
        .from("posts")
        .select("id, content, address, created_at")
        .gte("created_at", since)
        .neq("address", MARCUS_ADDRESS)
        .order("created_at", { ascending: false })
        .limit(5);

      if (postsErr) throw postsErr;
      if (!posts || posts.length === 0) { setLastRun(new Date()); setProcessing(false); return; }

      const postIds = posts.map((p: Post) => p.id);
      const { data: existingReplies } = await supabase
        .from("comments")
        .select("post_id")
        .in("post_id", postIds)
        .eq("address", MARCUS_ADDRESS);

      const repliedPostIds = new Set((existingReplies || []).map((r: { post_id: string }) => r.post_id));
      const unrepliedPosts = posts.filter((p: Post) => !repliedPostIds.has(p.id));

      for (const post of unrepliedPosts) {
        const logEntry: ReplyLog = { postId: post.id, status: "pending", ts: Date.now() };
        setLogs(prev => [logEntry, ...prev].slice(0, 10));

        try {
          const replyText = await generateReply(post.content);
          await supabase.from("comments").insert({ post_id: post.id, address: MARCUS_ADDRESS, content: replyText });
          setLogs(prev => prev.map(l => l.postId === post.id ? { ...l, status: "done", reply: replyText } : l));
        } catch {
          setLogs(prev => prev.map(l => l.postId === post.id ? { ...l, status: "error" } : l));
        }

        await new Promise(r => setTimeout(r, 2000));
      }

      setLastRun(new Date());
    } catch (err) {
      console.error("Marcus AutoReply error:", err);
    } finally {
      setProcessing(false);
    }
  }, [enabled, processing, geminiApiKey]);

  const handleToggle = async (val: boolean) => {
    onToggle(val);
    setSaving(true);
    try {
      await supabase.from("settings").upsert({ key: "marcus_enabled", value: val });
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2000);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  useEffect(() => {
    if (!enabled) return;
    processUnrepliedPosts();
    const interval = setInterval(processUnrepliedPosts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [enabled]);

  return (
    <div className="space-y-5">
      <div className="glass-gold rounded-2xl border border-primary/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Marcus Auto-Reply</h3>
              <p className="text-xs text-muted-foreground">AI replies via Gemini 2.0 Flash — Polygon-aware</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saving && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
            {savedOk && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            <button
              onClick={() => handleToggle(!enabled)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none border ${
                enabled ? "bg-primary/90 border-primary shadow-[0_0_15px_rgba(234,179,8,0.4)]" : "bg-muted/30 border-border"
              }`}
            >
              <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 35 }}
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-md ${enabled ? "translate-x-8" : "translate-x-1"}`}
              />
            </button>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono ${
          enabled ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-muted/20 border border-border text-muted-foreground"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${enabled ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground/40"}`} />
          {enabled ? "ACTIVE — Marcus watches community posts every 5 minutes" : "INACTIVE — Auto-replies paused"}
        </div>
        {lastRun && <p className="text-[10px] text-muted-foreground/60 mt-2">Last scan: {lastRun.toLocaleTimeString()}</p>}
      </div>

      <div className="glass-card rounded-2xl border border-border p-5 space-y-3">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" /> Marcus Knowledge Base
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            { label: "Model", value: "Gemini 2.0 Flash" },
            { label: "Network Context", value: "Polygon PoS" },
            { label: "Scan Interval", value: "5 minutes" },
            { label: "Reply Window", value: "Last 24h" },
            { label: "Posts/Scan", value: "Up to 5" },
            { label: "Knowledge", value: "Full Tokenomics" },
          ].map(s => (
            <div key={s.label} className="bg-muted/10 rounded-lg p-2.5 border border-border/50">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <p className="text-xs font-bold text-primary mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-muted-foreground/60 leading-relaxed p-2 bg-muted/5 rounded-lg border border-border/30">
          Marcus knows: OTC Hub, OreC Hub, TinkTak Hub, Smart Lottery, Capital Preservation Model, Staking (28% pool), ICO Phases, Referral System (L1: 5%, L2: 3%, L3: 2%), and Polygon Network details.
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" /> Manual Scan
          </h4>
          <button onClick={processUnrepliedPosts} disabled={!enabled || processing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/15 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {processing ? "Scanning…" : "Run Now"}
          </button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          <AnimatePresence>
            {logs.length === 0 ? (
              <p className="text-[11px] text-muted-foreground/50 text-center py-4">No activity yet. Enable Marcus and run a scan.</p>
            ) : logs.map((log) => (
              <motion.div key={`${log.postId}-${log.ts}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                className={`flex items-start gap-2 p-2 rounded-lg text-[11px] border ${
                  log.status === "done" ? "bg-emerald-500/5 border-emerald-500/15" :
                  log.status === "error" ? "bg-red-500/5 border-red-500/15" :
                  "bg-primary/5 border-primary/15"
                }`}>
                {log.status === "pending" && <Loader2 className="w-3 h-3 text-primary animate-spin mt-0.5 flex-shrink-0" />}
                {log.status === "done" && <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />}
                {log.status === "error" && <XCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <span className="text-muted-foreground font-mono">Post #{log.postId.slice(0, 8)}…</span>
                  {log.reply && <p className="text-foreground/70 mt-0.5 truncate">"{log.reply.slice(0, 70)}…"</p>}
                  {log.status === "error" && <p className="text-red-400/70">Reply failed</p>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
