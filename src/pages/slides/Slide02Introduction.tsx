export default function Slide02Introduction() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0B0F1A" }}>
      <div className="absolute inset-0 grid-bg opacity-40" />

      <div
        className="absolute top-0 left-0 w-[35vw] h-[35vw] rounded-full opacity-8"
        style={{ background: "radial-gradient(circle, #D4AF37 0%, transparent 70%)", transform: "translate(-30%, -30%)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-[30vw] h-[30vw] rounded-full opacity-6"
        style={{ background: "radial-gradient(circle, #D4AF37 0%, transparent 70%)", transform: "translate(20%, 20%)" }}
      />

      <div className="relative z-10 h-full flex">
        <div className="w-[45vw] flex flex-col justify-center pl-[8vw] pr-[4vw]">
          <div
            className="text-[0.85vw] font-body tracking-[0.4em] uppercase mb-[1.5vh]"
            style={{ color: "#D4AF37" }}
          >
            02 / Introduction
          </div>

          <h2
            className="font-display font-bold uppercase tracking-wider leading-tight mb-[3vh]"
            style={{
              fontSize: "3.5vw",
              color: "#F0E8D0",
              textShadow: "0 0 20px rgba(212,175,55,0.2)"
            }}
          >
            What is<br />
            <span style={{ color: "#D4AF37" }}>Orakzai Bond?</span>
          </h2>

          <p
            className="font-body leading-relaxed mb-[4vh] text-[1.4vw]"
            style={{ color: "rgba(240,232,208,0.85)" }}
          >
            Orakzai Bond ek blockchain-based decentralized lottery system hai jahan users directly smart contract ke zariye participate karte hain.
          </p>

          <div
            className="w-[6vw] h-[0.15vh] mb-[3vh]"
            style={{ background: "linear-gradient(90deg, #D4AF37, transparent)" }}
          />

          <p
            className="font-body text-[1.1vw] italic"
            style={{ color: "rgba(212,175,55,0.8)" }}
          >
            No manipulation. No hidden system.<br />Pure smart contract logic.
          </p>
        </div>

        <div
          className="w-[0.1vw] self-stretch my-[8vh]"
          style={{ background: "linear-gradient(to bottom, transparent, #D4AF37, transparent)" }}
        />

        <div className="flex-1 flex flex-col justify-center pl-[5vw] pr-[8vw] gap-[2.5vh]">
          <div
            className="glass-card rounded-xl p-[2.5vh_2vw]"
          >
            <div className="flex items-start gap-[1.5vw]">
              <div
                className="w-[2.5vw] h-[2.5vw] rounded-full flex items-center justify-center flex-shrink-0 mt-[0.3vh]"
                style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.4)" }}
              >
                <div className="w-[0.8vw] h-[0.8vw] rounded-full" style={{ background: "#D4AF37" }} />
              </div>
              <div>
                <div className="font-display font-bold text-[1.1vw] mb-[0.5vh]" style={{ color: "#D4AF37" }}>Fully Transparent</div>
                <div className="font-body text-[1vw]" style={{ color: "rgba(240,232,208,0.7)" }}>Har transaction blockchain par publicly visible hoti hai</div>
              </div>
            </div>
          </div>

          <div
            className="glass-card rounded-xl p-[2.5vh_2vw]"
          >
            <div className="flex items-start gap-[1.5vw]">
              <div
                className="w-[2.5vw] h-[2.5vw] rounded-full flex items-center justify-center flex-shrink-0 mt-[0.3vh]"
                style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.4)" }}
              >
                <div className="w-[0.8vw] h-[0.8vw] rounded-full" style={{ background: "#D4AF37" }} />
              </div>
              <div>
                <div className="font-display font-bold text-[1.1vw] mb-[0.5vh]" style={{ color: "#D4AF37" }}>No Manual Control</div>
                <div className="font-body text-[1vw]" style={{ color: "rgba(240,232,208,0.7)" }}>Kisi bhi manual interference ke baghair chalta hai</div>
              </div>
            </div>
          </div>

          <div
            className="glass-card rounded-xl p-[2.5vh_2vw]"
          >
            <div className="flex items-start gap-[1.5vw]">
              <div
                className="w-[2.5vw] h-[2.5vw] rounded-full flex items-center justify-center flex-shrink-0 mt-[0.3vh]"
                style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.4)" }}
              >
                <div className="w-[0.8vw] h-[0.8vw] rounded-full" style={{ background: "#D4AF37" }} />
              </div>
              <div>
                <div className="font-display font-bold text-[1.1vw] mb-[0.5vh]" style={{ color: "#D4AF37" }}>Smart Contract Powered</div>
                <div className="font-body text-[1vw]" style={{ color: "rgba(240,232,208,0.7)" }}>Code is law — automated, immutable, trustless execution</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
