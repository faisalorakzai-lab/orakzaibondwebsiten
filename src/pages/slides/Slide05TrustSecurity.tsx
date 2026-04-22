const base = import.meta.env.BASE_URL;

export default function Slide05TrustSecurity() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#080C14" }}>
      <img
        src={`${base}blockchain-nodes.png`}
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover opacity-20"
        alt="Blockchain nodes"
      />

      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, rgba(8,12,20,0.92) 0%, rgba(8,12,20,0.75) 50%, rgba(8,12,20,0.92) 100%)" }}
      />

      <div className="absolute inset-0 grid-bg opacity-20" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-[8vw] text-center">
        <div
          className="text-[0.85vw] font-body tracking-[0.4em] uppercase mb-[2vh]"
          style={{ color: "#D4AF37" }}
        >
          05 / Trust & Security
        </div>

        <h2
          className="font-display font-black uppercase tracking-wider mb-[2vh]"
          style={{
            fontSize: "5vw",
            color: "#D4AF37",
            textShadow: "0 0 30px rgba(212,175,55,0.5)"
          }}
        >
          Trust is Built
        </h2>

        <p
          className="font-display font-light uppercase tracking-[0.3em] mb-[5vh]"
          style={{ fontSize: "1.5vw", color: "rgba(240,232,208,0.6)" }}
        >
          Into the System — Not Promised
        </p>

        <div className="flex gap-[3vw] w-full max-w-[80vw]">
          <div
            className="flex-1 glass-card rounded-2xl p-[4vh_2.5vw] text-left"
          >
            <div
              className="font-display font-bold uppercase tracking-wide text-[1.2vw] mb-[2.5vh]"
              style={{ color: "#D4AF37" }}
            >
              Transparency System
            </div>
            <div
              className="w-[4vw] h-[0.15vh] mb-[2.5vh]"
              style={{ background: "linear-gradient(90deg, #D4AF37, transparent)" }}
            />
            <div className="flex flex-col gap-[1.5vh]">
              <div className="flex items-center gap-[1vw]">
                <div className="w-[0.6vw] h-[0.6vw] rounded-full" style={{ background: "#D4AF37" }} />
                <span className="font-body text-[1vw]" style={{ color: "rgba(240,232,208,0.8)" }}>All transactions public on blockchain</span>
              </div>
              <div className="flex items-center gap-[1vw]">
                <div className="w-[0.6vw] h-[0.6vw] rounded-full" style={{ background: "#D4AF37" }} />
                <span className="font-body text-[1vw]" style={{ color: "rgba(240,232,208,0.8)" }}>Smart contract verified on-chain</span>
              </div>
              <div className="flex items-center gap-[1vw]">
                <div className="w-[0.6vw] h-[0.6vw] rounded-full" style={{ background: "#D4AF37" }} />
                <span className="font-body text-[1vw]" style={{ color: "rgba(240,232,208,0.8)" }}>No backend manipulation possible</span>
              </div>
            </div>
          </div>

          <div
            className="w-[0.1vw] self-stretch my-[2vh]"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(212,175,55,0.4), transparent)" }}
          />

          <div
            className="flex-1 glass-card rounded-2xl p-[4vh_2.5vw] text-left"
          >
            <div
              className="font-display font-bold uppercase tracking-wide text-[1.2vw] mb-[2.5vh]"
              style={{ color: "#D4AF37" }}
            >
              Security Architecture
            </div>
            <div
              className="w-[4vw] h-[0.15vh] mb-[2.5vh]"
              style={{ background: "linear-gradient(90deg, #D4AF37, transparent)" }}
            />
            <div className="flex flex-col gap-[1.5vh]">
              <div className="flex items-center gap-[1vw]">
                <div className="w-[0.6vw] h-[0.6vw] rounded-full" style={{ background: "#D4AF37" }} />
                <span className="font-body text-[1vw]" style={{ color: "rgba(240,232,208,0.8)" }}>Funds controlled by smart contract only</span>
              </div>
              <div className="flex items-center gap-[1vw]">
                <div className="w-[0.6vw] h-[0.6vw] rounded-full" style={{ background: "#D4AF37" }} />
                <span className="font-body text-[1vw]" style={{ color: "rgba(240,232,208,0.8)" }}>No third-party control or access</span>
              </div>
              <div className="flex items-center gap-[1vw]">
                <div className="w-[0.6vw] h-[0.6vw] rounded-full" style={{ background: "#D4AF37" }} />
                <span className="font-body text-[1vw]" style={{ color: "rgba(240,232,208,0.8)" }}>No hidden fees — fully disclosed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
