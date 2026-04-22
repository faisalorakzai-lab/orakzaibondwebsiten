export default function Slide03HowItWorks() {
  const steps = [
    { num: "01", title: "Connect Wallet", desc: "User apna crypto wallet securely connect karta hai" },
    { num: "02", title: "Deposit Entry", desc: "Fixed 100 tokens deposit karo — no hidden fees" },
    { num: "03", title: "Pool Creation", desc: "Smart contract automatically pool create karta hai" },
    { num: "04", title: "Lock Duration", desc: "Lock period complete hone ka intezaar karo" },
    { num: "05", title: "Winners Selected", desc: "Smart contract impartially winners select karta hai" },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0B0F1A" }}>
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div
        className="absolute top-0 right-0 w-[45vw] h-[50vh]"
        style={{ background: "linear-gradient(225deg, rgba(212,175,55,0.06) 0%, transparent 60%)" }}
      />

      <div className="relative z-10 h-full flex flex-col px-[8vw] pt-[6vh]">
        <div className="mb-[4vh]">
          <div
            className="text-[0.85vw] font-body tracking-[0.4em] uppercase mb-[1vh]"
            style={{ color: "#D4AF37" }}
          >
            03 / System Flow
          </div>
          <h2
            className="font-display font-bold uppercase tracking-wider"
            style={{ fontSize: "3.2vw", color: "#F0E8D0" }}
          >
            How It <span style={{ color: "#D4AF37" }}>Works</span>
          </h2>
        </div>

        <div className="flex gap-[2vw] flex-1 pb-[6vh]">
          {steps.map((step, i) => (
            <div key={i} className="flex-1 flex flex-col">
              <div
                className="glass-card rounded-xl p-[2vh_1.5vw] flex-1 flex flex-col"
              >
                <div
                  className="font-display font-black mb-[1.5vh]"
                  style={{ fontSize: "2.5vw", color: "rgba(212,175,55,0.25)" }}
                >
                  {step.num}
                </div>

                <div
                  className="w-full h-[0.15vh] mb-[1.5vh]"
                  style={{ background: "linear-gradient(90deg, #D4AF37, transparent)" }}
                />

                <div
                  className="font-display font-bold uppercase tracking-wide mb-[1.5vh] leading-tight"
                  style={{ fontSize: "1.1vw", color: "#D4AF37" }}
                >
                  {step.title}
                </div>

                <p
                  className="font-body leading-relaxed flex-1"
                  style={{ fontSize: "0.95vw", color: "rgba(240,232,208,0.75)" }}
                >
                  {step.desc}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden" />
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-[4vw] pb-[4vh]">
          <div
            className="flex-1 rounded-xl p-[2vh_2.5vw] flex items-center gap-[2vw]"
            style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.35)" }}
          >
            <div
              className="font-display font-black text-[1.8vw]"
              style={{ color: "#D4AF37" }}
            >
              WIN
            </div>
            <div>
              <div className="font-body font-semibold text-[1.1vw]" style={{ color: "#F0E8D0" }}>Winners</div>
              <div className="font-body text-[0.9vw]" style={{ color: "rgba(240,232,208,0.65)" }}>Reward directly claim karein</div>
            </div>
          </div>

          <div
            className="flex-1 rounded-xl p-[2vh_2.5vw] flex items-center gap-[2vw]"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div
              className="font-display font-black text-[1.8vw]"
              style={{ color: "rgba(240,232,208,0.6)" }}
            >
              REF
            </div>
            <div>
              <div className="font-body font-semibold text-[1.1vw]" style={{ color: "#F0E8D0" }}>Non-Winners</div>
              <div className="font-body text-[0.9vw]" style={{ color: "rgba(240,232,208,0.65)" }}>Full refund automatically available</div>
            </div>
          </div>

          <div
            className="flex-1 rounded-xl p-[2vh_2.5vw] flex items-center gap-[2vw]"
            style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.2)" }}
          >
            <div
              className="font-display font-black text-[1.8vw]"
              style={{ color: "#D4AF37" }}
            >
              FAIR
            </div>
            <div>
              <div className="font-body font-semibold text-[1.1vw]" style={{ color: "#F0E8D0" }}>Equal Chance</div>
              <div className="font-body text-[0.9vw]" style={{ color: "rgba(240,232,208,0.65)" }}>Fair system for everyone — no bias</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
