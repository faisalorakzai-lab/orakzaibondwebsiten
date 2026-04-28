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
  const { address, provider, isPolygon, connect, switchToPolygon } = useWallet();
  const [authed, setAuthed] = useState<boolean>(false);
  const [signing, setSigning] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState<boolean>(false);

  const walletIsAdmin = isAdminAddress(address);

  useEffect(() => {
    const proof = loadAdminProof();
    setAuthed(isProofValid(proof, address));
    setHydrated(true);
  }, [address]);

  const handleSignIn = useCallback(async () => {
    if (!provider || !address) {
      setErrorMsg("Wallet not connected.");
      return;
    }
    if (!walletIsAdmin) {
      setErrorMsg("Connected wallet is not authorized.");
      return;
    }
    setSigning(true);
    setErrorMsg(null);
    try {
      await signAdminProof(provider, address);
      setAuthed(true);
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? (err as { code: string | number }).code : null;
      if (code === "ACTION_REJECTED" || code === 4001) {
        setErrorMsg("You rejected the signature request.");
      } else if (err instanceof Error) {
        setErrorMsg(err.message.slice(0, 200));
      } else {
        setErrorMsg("Sign-in failed.");
      }
    } finally {
      setSigning(false);
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
            Admin Sign-In Required
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-2">
            Sign a message with your wallet to prove ownership.
          </p>
          <p className="text-[11px] text-muted-foreground/70 font-mono text-center mb-6 break-all">
            {ADMIN_WALLET}
          </p>

          {!isPolygon && (
            <button
              onClick={switchToPolygon}
              className="w-full mb-3 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-sm font-semibold hover:bg-amber-500/20 transition"
            >
              Switch to Polygon
            </button>
          )}

          <button
            onClick={handleSignIn}
            disabled={signing}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {signing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Waiting for signature…</>
            ) : (
              <><ShieldCheck className="w-4 h-4" /> Sign In With Ethereum</>
            )}
          </button>

          {errorMsg && (
            <p className="mt-4 text-xs text-red-400 text-center">{errorMsg}</p>
          )}
          <p className="mt-5 text-[11px] text-muted-foreground/60 text-center">
            This signature does not trigger a transaction or cost gas. Session expires in 1 hour.
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
