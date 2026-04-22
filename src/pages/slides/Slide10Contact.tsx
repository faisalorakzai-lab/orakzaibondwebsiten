export default function Slide10Contact() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0B0F1A" }}>
      <div className="absolute inset-0 grid-bg opacity-35" />

      <div
        className="absolute top-0 left-0 w-full h-[0.2vh]"
        style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }}
      />

      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(212,175,55,0.07) 0%, transparent 60%)" }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-[8vw] text-center">
        <div
          className="text-[0.85vw] font-body tracking-[0.4em] uppercase mb-[2vh]"
          style={{ color: "#D4AF37" }}
        >
          10 / Connect With Us
        </div>

        <h2
          className="font-display font-black uppercase tracking-wider mb-[1.5vh]"
          style={{
            fontSize: "4.5vw",
            color: "#D4AF37",
            textShadow: "0 0 25px rgba(212,175,55,0.4)"
          }}
        >
          ORAKZAI BOND
        </h2>

        <p
          className="font-body font-light tracking-[0.3em] uppercase text-[1.2vw] mb-[5vh]"
          style={{ color: "rgba(240,232,208,0.5)" }}
        >
          Decentralized Reward System
        </p>

        <div className="flex gap-[3vw] mb-[5vh]">
          <div
            className="glass-card rounded-xl px-[3vw] py-[2.5vh] flex flex-col items-center gap-[1.5vh] min-w-[15vw]"
          >
            <div
              className="font-display font-bold uppercase tracking-widest text-[0.85vw]"
              style={{ color: "rgba(212,175,55,0.6)" }}
            >
              Website
            </div>
            <a
              href="https://www.orakzaibond.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body font-medium text-[1.1vw] underline underline-offset-4"
              style={{ color: "#F0E8D0" }}
            >
              orakzaibond.com
            </a>
          </div>

          <div
            className="glass-card rounded-xl px-[3vw] py-[2.5vh] flex flex-col items-center gap-[1.5vh] min-w-[15vw]"
          >
            <div
              className="font-display font-bold uppercase tracking-widest text-[0.85vw]"
              style={{ color: "rgba(212,175,55,0.6)" }}
            >
              Telegram
            </div>
            <a
              href="https://t.me/orakzaibond"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body font-medium text-[1.1vw] underline underline-offset-4"
              style={{ color: "#F0E8D0" }}
            >
              orakzaibond
            </a>
          </div>

          <div
            className="glass-card rounded-xl px-[3vw] py-[2.5vh] flex flex-col items-center gap-[1.5vh] min-w-[15vw]"
          >
            <div
              className="font-display font-bold uppercase tracking-widest text-[0.85vw]"
              style={{ color: "rgba(212,175,55,0.6)" }}
            >
              Twitter X
            </div>
            <a
              href="https://x.com/orakzaibond"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body font-medium text-[1.1vw] underline underline-offset-4"
              style={{ color: "#F0E8D0" }}
            >
              orakzaibond
            </a>
          </div>
        </div>

        <div
          className="w-[25vw] h-[0.15vh] mb-[4vh]"
          style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }}
        />

        <div
          className="font-display font-black uppercase tracking-[0.4em] text-[1.5vw]"
          style={{ color: "rgba(212,175,55,0.5)" }}
        >
          Transparent — Secure — Global
        </div>
      </div>
    </div>
  );
}
