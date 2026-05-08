import { useState, useEffect, useCallback, ReactNode } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2, Wallet, Lock, LogOut } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import {
  isAdminAddress,
  loadAdminProof,
  isProofValid,
  signAdminProof,
  clearAdminProof,
  ADMIN_WALLET,
} from "@/lib/adminAuth";
import NotFound from "@/pages/not-found";

interface AdminGateProps {
  children: ReactNode;
}

export default function AdminGate({ children }: AdminGateProps) {
  const { address, provider, connect } = useWallet();
  const [authed, setAuthed] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState<boolean>(false);

  const walletIsAdmin = isAdminAddress(address);

  useEffect(() => {
    const proof = loadAdminProof();
    setAuthed(isProofValid(proof, address));
    setHydrated(true);
  }, [address]);

  /* ── HIDE FROM SEARCH ENGINES ───────────────────────────────────── */
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow, noarchive, nosnippet, noimageindex";
    document.head.appendChild(meta);

    const xRobots = document.createElement("meta");
    xRobots.httpEquiv = "X-Robots-Tag";
    xRobots.content = "noindex, nofollow";
    document.head.appendChild(xRobots);

    const prevTitle = document.title;
    document.title = "Restricted";

    return () => {
      meta.remove();
      xRobots.remove();
      document.title = prevTitle;
    };
  }, []);

  const handleVerify = useCallback(async () => {
    if (!address) {
      setErrorMsg("Wallet not connected.");
      return;
    }
    if (!walletIsAdmin) {
      setErrorMsg("Connected wallet is not authorized.");
      return;
    }
    setVerifying(true);
    setErrorMsg(null);
    try {
      await signAdminProof(provider, address);
      setAuthed(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message.slice(0, 200));
      } else {
        setErrorMsg("Verification failed.");
      }
    } finally {
      setVerifying(false);
    }
  }, [provider, address, walletIsAdmin]);

  const handleSignOut = useCallback(() => {
    clearAdminProof();
    setAuthed(false);
  }, []);

  if (!hydrated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (address && !walletIsAdmin) {
    return <NotFound />;
  }

  if (!address) {
    return (
      <div className="min-h-[80vh] w-full flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-border bg-card/60 backdrop-blur-md p-8 text-center"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-extrabold text-foreground mb-2">Restricted Area</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Connect the authorized wallet to continue.
          </p>
          <button
            onClick={connect}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
          >
            <Wallet className="w-4 h-4" /> Connect Wallet
          </button>
        </motion.div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-[80vh] w-full flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-border bg-card/60 backdrop-blur-md p-8"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-extrabold text-foreground text-center mb-2">
            Admin Access Verification
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-2">
            Verify ownership of the authorized wallet to enter the OKBOND Admin Panel.
          </p>
          <p className="text-[11px] text-muted-foreground/70 font-mono text-center mb-6 break-all">
            {ADMIN_WALLET}
          </p>

          <button
            onClick={handleVerify}
            disabled={verifying}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {verifying ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
            ) : (
              <><ShieldCheck className="w-4 h-4" /> Verify &amp; Enter</>
            )}
          </button>

          {errorMsg && (
            <p className="mt-4 text-xs text-red-400 text-center">{errorMsg}</p>
          )}
          <p className="mt-5 text-[11px] text-muted-foreground/60 text-center">
            Address-only verification. No signature, no gas, no transaction. Session expires in 1 hour.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute right-4 top-4 z-50">
        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 bg-background/70 backdrop-blur text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition"
          title="End admin session"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
      {children}
    </div>
  );
}
