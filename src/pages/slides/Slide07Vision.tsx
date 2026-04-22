export default function Slide07Vision() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0B0F1A" }}>
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.06) 0%, transparent 65%)" }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-[8vw] text-center">
        <div
          className="text-[0.85vw] font-body tracking-[0.4em] uppercase mb-[2vh]"
          style={{ color: "#D4AF37" }}
        >
          07 / Scale & Vision
        </div>

        <h2
          className="font-display font-black uppercase tracking-wider mb-[1.5vh]"
          style={{ fontSize: "4vw", color: "#F0E8D0" }}
        >
          The Bigger <span style={{ color: "#D4AF37" }}>Picture</span>
        </h2>

        <p
          className="font-body text-[1.3vw] mb-[5vh] max-w-[55vw]"
          style={{ color: "rgba(240,232,208,0.65)" }}
        >
          Orakzai Bond sirf ek product nahi hai — yeh aik bade ecosystem ka hissa hai
        </p>

        <div className="flex gap-[6vw] mb-[6vh]">
          <div className="text-center">
            <div
              className="font-display font-black mb-[1vh]"
              style={{ fontSize: "8vw", color: "#D4AF37", textShadow: "0 0 30px rgba(212,175,55,0.4)" }}
            >
              12
            </div>
            <div
              className="font-body font-medium uppercase tracking-widest text-[1vw]"
              style={{ color: "rgba(240,232,208,0.6)" }}
            >
              Industries
            </div>
          </div>

          <div
            className="w-[0.1vw] self-stretch my-[2vh]"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(212,175,55,0.4), transparent)" }}
          />

          <div className="text-center">
            <div
              className="font-display font-black mb-[1vh]"
              style={{ fontSize: "8vw", color: "#D4AF37", textShadow: "0 0 30px rgba(212,175,55,0.4)" }}
            >
              250+
            </div>
            <div
              className="font-body font-medium uppercase tracking-widest text-[1vw]"
              style={{ color: "rgba(240,232,208,0.6)" }}
            >
              Active & Upcoming Projects
            </div>
          </div>
        </div>

        <div
          className="w-[20vw] h-[0.15vh] mb-[4vh]"
          style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }}
        />

        <div
          className="glass-card rounded-2xl px-[4vw] py-[3vh] max-w-[55vw]"
        >
          <p
            className="font-display font-bold uppercase tracking-wide text-[1.4vw]"
            style={{ color: "#D4AF37" }}
          >
            Vision
          </p>
          <p
            className="font-body text-[1.1vw] mt-[1.5vh]"
            style={{ color: "rgba(240,232,208,0.8)" }}
          >
            To build a global decentralized ecosystem jahan har user ko fair opportunity mile
          </p>
        </div>
      </div>
    </div>
  );
}
