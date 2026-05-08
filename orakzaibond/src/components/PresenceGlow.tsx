/**
 * PresenceGlow — "Founder's Aura"
 * --------------------------------------------------------------------------
 * A subtle, breathing 24K-gold ambient light around the viewport edges that
 * activates when the Chairman's session is detected (signed Admin proof).
 *
 * Quietly polls the Admin proof every 3s. Pure CSS keyframes do the work, so
 * there is zero runtime cost while the aura is dormant.
 * --------------------------------------------------------------------------
 */

import { useEffect, useState } from "react";
import { loadAdminProof, isProofValid } from "@/lib/adminAuth";
import { useWallet } from "@/hooks/useWallet";

const POLL_MS = 3000;

export default function PresenceGlow() {
  const { address } = useWallet();
  const [chairmanPresent, setChairmanPresent] = useState(false);

  useEffect(() => {
    const tick = () => {
      const proof = loadAdminProof();
      setChairmanPresent(isProofValid(proof, address));
    };
    tick();
    const id = window.setInterval(tick, POLL_MS);

    // also re-check on storage / focus / visibility events
    const onVis = () => tick();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);
    window.addEventListener("storage", onVis);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onVis);
      window.removeEventListener("storage", onVis);
    };
  }, [address]);

  if (!chairmanPresent) return null;

  return (
    <>
      {/* Outer breathing aura — 4 directional gold bleeds */}
      <div
        aria-hidden="true"
        data-testid="presence-glow"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 60, // above content, below modals/orb (orb sits at z-[100]+)
          mixBlendMode: "screen",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 90% 30% at 50% 0%,    rgba(252,246,186,0.22), transparent 60%)," +
              "radial-gradient(ellipse 90% 30% at 50% 100%,  rgba(191,149,63,0.18),  transparent 60%)," +
              "radial-gradient(ellipse 30% 90% at 0%   50%,  rgba(252,246,186,0.16), transparent 60%)," +
              "radial-gradient(ellipse 30% 90% at 100% 50%,  rgba(191,149,63,0.16),  transparent 60%)",
            animation: "presenceGlowBreath 5.5s ease-in-out infinite",
            filter: "blur(2px)",
          }}
        />
        {/* Inner gold edge halo — sharper, slower */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            boxShadow:
              "inset 0 0 80px 8px rgba(252,246,186,0.10), inset 0 0 220px 24px rgba(191,149,63,0.08)",
            animation: "presenceGlowEdge 7s ease-in-out infinite",
          }}
        />
      </div>

      {/* "CHAIRMAN PRESENT" gold tag — top-right, subtle */}
      <div
        aria-hidden="true"
        data-testid="presence-glow-tag"
        style={{
          position: "fixed",
          top: 14,
          right: 14,
          zIndex: 61,
          pointerEvents: "none",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize: 10,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: "#FCF6BA",
          padding: "6px 12px",
          borderRadius: 999,
          background:
            "linear-gradient(135deg, rgba(20,18,12,0.65) 0%, rgba(10,9,6,0.85) 100%)",
          border: "1px solid rgba(252,246,186,0.32)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          textShadow: "0 0 8px rgba(252,246,186,0.6)",
          boxShadow:
            "0 0 18px rgba(191,149,63,0.4), inset 0 0 8px rgba(252,246,186,0.15)",
          animation: "presenceGlowTag 4s ease-in-out infinite",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#FCF6BA",
            boxShadow: "0 0 8px #FCF6BA, 0 0 14px #BF953F",
            marginRight: 8,
            verticalAlign: "middle",
            animation: "presenceGlowDot 1.6s ease-in-out infinite",
          }}
        />
        Chairman Orakzai · Present
      </div>
    </>
  );
}
