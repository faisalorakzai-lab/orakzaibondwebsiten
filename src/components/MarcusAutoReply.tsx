import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Bot, Loader2, CheckCircle, XCircle, RefreshCw, MessageSquare, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MARCUS_ADDRESS = "marcus-ai";
const MARCUS_USERNAME = "Marcus AI";

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
}

export default function MarcusAutoReply({ enabled, onToggle }: MarcusAutoReplyProps) {
  const [logs, setLogs] = useState<ReplyLog[]>([]);
  const [processing, setProcessing] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const generateReply = async (postContent: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const body = {
      contents: [{
        parts: [{
          text: `You are Marcus, the official AI assistant of OKBOND — a sovereign digital bond platform on Polygon blockchain. You represent Chairman Faisal Orakzai's vision of financial sovereignty. Your replies are:
- Concise (2-3 sentences max)
- Professional yet warm
- Focused on OKBOND's mission of financial empowerment
- Encouraging community engagement
- Never give financial advice, just motivate and inform

Reply to this community post in the same language it's written in:
"${postContent}"

Reply only with your response text, no labels or prefixes.`
        }]
      }],
      generationConfig: { maxOutputTokens: 150, temperature: 0.8 }
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Thank you for your post! The OKBOND community values your contribution.";
  };

  const processUnrepliedPosts = useCallback(async () => {
    if (!enabled || processing) return;
    setProcessing(true);

    try {
      // Get posts from last 24 hours
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data: posts, error: postsErr } = await supabase
        .from("posts")
        .select("id, content, address, created_at")
        .gte("created_at", since)
        .neq("address", MARCUS_ADDRESS)
        .order("created_at", { ascending: false })
        .limit(5);

      if (postsErr) throw postsErr;
      if (!posts || posts.length === 0) {
        setLastRun(new Date());
        setProcessing(false);
        return;
      }

      // Check which posts already have Marcus replies
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

          const { error: insertErr } = await supabase
            .from("comments")
            .insert({
              post_id: post.id,
              address: MARCUS_ADDRESS,
              content: replyText,
            });

          if (insertErr) throw insertErr;

          setLogs(prev => prev.map(l =>
            l.postId === post.id ? { ...l, status: "done", reply: replyText } : l
          ));
        } catch (err) {
          setLogs(prev => prev.map(l =>
            l.postId === post.id ? { ...l, status: "error" } : l
          ));
        }

        // Rate limit — wait 2s between replies
        await new Promise(r => setTimeout(r, 2000));
      }

      setLastRun(new Date());
    } catch (err) {
      console.error("Marcus AutoReply error:", err);
    } finally {
      setProcessing(false);
    }
  }, [enabled, processing]);

  // Auto-run every 5 minutes when enabled
  useEffect(() => {
    if (!enabled) return;
    processUnrepliedPosts();
    const interval = setInterval(processUnrepliedPosts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [enabled]);

  return (
    <div className="space-y-5">
      {/* Toggle Card */}
      <div className="glass-gold rounded-2xl border border-primary/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Marcus Auto-Reply</h3>
              <p className="text-xs text-muted-foreground">AI replies to community posts via Gemini</p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={() => onToggle(!enabled)}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none border ${
              enabled
                ? "bg-primary/90 border-primary shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                : "bg-muted/30 border-border"
            }`}
          >
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
              className={`inline-block h-5 w-5 rounded-full bg-white shadow-md ${
                enabled ? "translate-x-8" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono ${
          enabled ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-muted/20 border border-border text-muted-foreground"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${enabled ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground/40"}`} />
          {enabled ? "ACTIVE — Marcus is watching the community feed" : "INACTIVE — Auto-replies disabled"}
        </div>

        {lastRun && (
          <p className="text-[10px] text-muted-foreground/60 mt-2">
            Last scan: {lastRun.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Settings Info */}
      <div className="glass-card rounded-2xl border border-border p-5 space-y-3">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" /> Behavior Configuration
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Model", value: "Gemini 2.0 Flash" },
            { label: "Scan Interval", value: "Every 5 minutes" },
            { label: "Posts per Scan", value: "Up to 5" },
            { label: "Reply Window", value: "Last 24 hours" },
          ].map(s => (
            <div key={s.label} className="bg-muted/10 rounded-lg p-3 border border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <p className="text-xs font-bold text-primary mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Trigger */}
      <div className="glass-card rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" /> Manual Scan
          </h4>
          <button
            onClick={processUnrepliedPosts}
            disabled={!enabled || processing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/15 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {processing ? "Scanning…" : "Run Now"}
          </button>
        </div>

        {/* Activity Log */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <AnimatePresence>
            {logs.length === 0 ? (
              <p className="text-[11px] text-muted-foreground/50 text-center py-4">No activity yet — enable Marcus and run a scan.</p>
            ) : logs.map((log) => (
              <motion.div
                key={`${log.postId}-${log.ts}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-start gap-2 p-2 rounded-lg text-[11px] border ${
                  log.status === "done" ? "bg-emerald-500/5 border-emerald-500/15" :
                  log.status === "error" ? "bg-red-500/5 border-red-500/15" :
                  "bg-primary/5 border-primary/15"
                }`}
              >
                {log.status === "pending" && <Loader2 className="w-3 h-3 text-primary animate-spin mt-0.5 flex-shrink-0" />}
                {log.status === "done" && <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />}
                {log.status === "error" && <XCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <span className="text-muted-foreground font-mono">Post #{log.postId.slice(0, 8)}…</span>
                  {log.reply && <p className="text-foreground/70 mt-0.5 truncate">"{log.reply.slice(0, 60)}…"</p>}
                  {log.status === "error" && <p className="text-red-400/70">Failed to generate reply</p>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
