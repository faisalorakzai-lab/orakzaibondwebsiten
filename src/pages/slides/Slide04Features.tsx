export default function Slide04Features() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0B0F1A" }}>
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div
        className="absolute inset-y-0 left-0 w-[0.15vw]"
        style={{ background: "linear-gradient(to bottom, transparent, #D4AF37, transparent)" }}
      />

      <div className="relative z-10 h-full flex">
        <div className="w-[38vw] flex flex-col justify-center pl-[8vw] pr-[4vw]">
          <div
            className="text-[0.85vw] font-body tracking-[0.4em] uppercase mb-[1.5vh]"
            style={{ color: "#D4AF37" }}
          >
            04 / Core Features
          </div>

          <h2
            className="font-display font-bold uppercase tracking-wider leading-tight mb-[4vh]"
            style={{ fontSize: "3.2vw", color: "#F0E8D0" }}
          >
            Key<br /><span style={{ color: "#D4AF37" }}>Features</span>
          </h2>

          <div
            className="w-[6vw] h-[0.15vh] mb-[4vh]"
            style={{ background: "linear-gradient(90deg, #D4AF37, transparent)" }}
          />

          <div className="mb-[4vh]">
            <div
              className="font-display font-bold uppercase tracking-wide text-[1.2vw] mb-[2vh]"
              style={{ color: "#F0E8D0" }}
            >
              Why It's Different?
            </div>

            <div
              className="glass-card rounded-xl p-[2vh_2vw] mb-[1.5vh] flex items-center gap-[1.5vw]"
            >
              <div className="w-[1vw] h-[1vw] rounded-full" style={{ background: "#555" }} />
              <div>
                <div className="font-body font-medium text-[1vw]" style={{ color: "rgba(240,232,208,0.5)" }}>Traditional Lotteries</div>
                <div className="font-display font-bold text-[1vw]" style={{ color: "#C0392B" }}>Centralized — No Trust</div>
              </div>
            </div>

            <div
              className="rounded-xl p-[2vh_2vw] flex items-center gap-[1.5vw]"
              style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.4)" }}
            >
              <div className="w-[1vw] h-[1vw] rounded-full" style={{ background: "#D4AF37" }} />
              <div>
                <div className="font-body font-medium text-[1vw]" style={{ color: "rgba(240,232,208,0.7)" }}>Orakzai Bond</div>
                <div className="font-display font-bold text-[1vw]" style={{ color: "#D4AF37" }}>Decentralized — Pure Trust</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center pr-[8vw] pl-[4vw] gap-[2vh]">
          <div className="grid grid-cols-2 gap-[2vh]">
            <div className="glass-card rounded-xl p-[2.5vh_2vw]">
              <div className="font-display font-bold text-[1.1vw] mb-[1vh]" style={{ color: "#D4AF37" }}>Fully Decentralized</div>
              <div className="font-body text-[0.9vw]" style={{ color: "rgba(240,232,208,0.65)" }}>No central authority controls the system</div>
            </div>

            <div className="glass-card rounded-xl p-[2.5vh_2vw]">
              <div className="font-display font-bold text-[1.1vw] mb-[1vh]" style={{ color: "#D4AF37" }}>Smart Contract Based</div>
              <div className="font-body text-[0.9vw]" style={{ color: "rgba(240,232,208,0.65)" }}>Code executes automatically without intermediaries</div>
            </div>

            <div className="glass-card rounded-xl p-[2.5vh_2vw]">
              <div className="font-display font-bold text-[1.1vw] mb-[1vh]" style={{ color: "#D4AF37" }}>Transparent On-Chain</div>
              <div className="font-body text-[0.9vw]" style={{ color: "rgba(240,232,208,0.65)" }}>All transactions verified publicly on blockchain</div>
            </div>

            <div className="glass-card rounded-xl p-[2.5vh_2vw]">
              <div className="font-display font-bold text-[1.1vw] mb-[1vh]" style={{ color: "#D4AF37" }}>No Human Interference</div>
              <div className="font-body text-[0.9vw]" style={{ color: "rgba(240,232,208,0.65)" }}>Automated selection — zero manipulation possible</div>
            </div>

            <div className="glass-card rounded-xl p-[2.5vh_2vw]">
              <div className="font-display font-bold text-[1.1vw] mb-[1vh]" style={{ color: "#D4AF37" }}>Auto Winner Selection</div>
              <div className="font-body text-[0.9vw]" style={{ color: "rgba(240,232,208,0.65)" }}>Algorithm picks winners fairly and instantly</div>
            </div>

            <div className="glass-card rounded-xl p-[2.5vh_2vw]">
              <div className="font-display font-bold text-[1.1vw] mb-[1vh]" style={{ color: "#D4AF37" }}>Refund System</div>
              <div className="font-body text-[0.9vw]" style={{ color: "rgba(240,232,208,0.65)" }}>Non-winners get their full deposit returned</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
