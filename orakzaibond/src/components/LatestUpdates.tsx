import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Zap, FileText, Handshake, ExternalLink, ChevronRight, Send } from "lucide-react";

const TELEGRAM_URL = "https://t.me/orakzaibond";

// ── Static fallback posts ─────────────────────────────────────────────────────
const STATIC_NEWS = [
  {
    id: 1,
    tag: "ICO",
    tagColor: "bg-primary/15 text-primary border-primary/25",
    dotColor: "bg-primary",
    Icon: Zap,
    title: "ICO Phase 1 is officially LIVE!",
    body: "OKBOND Phase 1 is now open at $0.50/token. 333,333 OKBOND available — early investors get the best price before the listing.",
    date: "Apr 10, 2026",
    link: "/ico",
    external: false,
  },
  {
    id: 2,
    tag: "Document",
    tagColor: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    dotColor: "bg-blue-400",
    Icon: FileText,
    title: "Whitepaper v1.0 Released",
    body: "The official Orakzai Bond whitepaper is now available. Full tokenomics, Lottery mechanics, ICO structure, and roadmap — all in one document.",
    date: "Apr 9, 2026",
    link: TELEGRAM_URL,
    external: true,
  },
  {
    id: 3,
    tag: "Partnership",
    tagColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    dotColor: "bg-emerald-400",
    Icon: Handshake,
    title: "New Partnership with Orakzai Transport Corp (OTC)",
    body: "OKBOND has officially partnered with Orakzai Transport Corporation — expanding real-world utility and cross-sector backing for the token ecosystem.",
    date: "Apr 7, 2026",
    link: TELEGRAM_URL,
    external: true,
  },
];

// ── Telegram post from API ────────────────────────────────────────────────────
interface TelegramPost {
  id: number;
  text: string;
  date: number;
  url: string;
}

function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function truncate(text: string, max = 120): string {
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LatestUpdates() {
  const [livePosts, setLivePosts] = useState<TelegramPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
    fetch(`${baseUrl}/api/telegram/posts`)
      .then((r) => r.json())
      .then((d: { ok: boolean; posts: TelegramPost[] }) => {
        if (d.ok && d.posts.length > 0) setLivePosts(d.posts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Decide which posts to show
  const usingLive = livePosts.length > 0;

  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-foreground">Latest Updates</h2>
                {usingLive && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <Send className="w-3 h-3" />
                From the official Orakzai Bond Telegram channel
              </p>
            </div>
          </div>
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/25 px-3.5 py-1.5 rounded-lg hover:bg-primary/10 transition-all"
          >
            Follow on Telegram <ExternalLink className="w-3 h-3" />
          </a>
        </motion.div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="glass-card rounded-2xl border border-primary/10 p-5 animate-pulse">
                <div className="flex gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-white/5" />
                  <div className="w-20 h-5 rounded bg-white/5" />
                </div>
                <div className="w-full h-4 rounded bg-white/5 mb-2" />
                <div className="w-3/4 h-4 rounded bg-white/5 mb-4" />
                <div className="w-full h-3 rounded bg-white/5" />
                <div className="w-2/3 h-3 rounded bg-white/5 mt-2" />
              </div>
            ))}
          </div>
        )}

        {/* Cards — live Telegram posts */}
        {!loading && usingLive && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {livePosts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.1 }}
              >
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col h-full glass-card rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-transparent to-transparent p-5 hover:border-primary/35 hover:from-primary/10 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center flex-shrink-0">
                        <Send className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border bg-primary/15 text-primary border-primary/25">
                        Telegram
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-[10px] text-muted-foreground font-mono">{formatDate(post.date)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed flex-1">
                    {truncate(post.text)}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-primary/70 group-hover:text-primary transition-colors">
                    View on Telegram <ExternalLink className="w-3 h-3" />
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        )}

        {/* Cards — static fallback */}
        {!loading && !usingLive && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STATIC_NEWS.map((item, idx) => {
              const Icon = item.Icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: idx * 0.1 }}
                >
                  <a
                    href={item.link}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="group flex flex-col h-full glass-card rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-transparent to-transparent p-5 hover:border-primary/35 hover:from-primary/10 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border ${item.tagColor}`}>
                          {item.tag}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor}`} />
                        <span className="text-[10px] text-muted-foreground font-mono">{item.date}</span>
                      </div>
                    </div>
                    <h3 className="text-sm font-extrabold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                      {item.body}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-primary/70 group-hover:text-primary transition-colors">
                      {item.external ? (
                        <>View on Telegram <ExternalLink className="w-3 h-3" /></>
                      ) : (
                        <>Read more <ChevronRight className="w-3 h-3" /></>
                      )}
                    </div>
                  </a>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Mobile Telegram link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-6 flex sm:hidden justify-center"
        >
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-primary border border-primary/25 px-4 py-2 rounded-lg hover:bg-primary/10 transition-all"
          >
            Follow us on Telegram <ExternalLink className="w-3 h-3" />
          </a>
        </motion.div>

      </div>
    </section>
  );
}
