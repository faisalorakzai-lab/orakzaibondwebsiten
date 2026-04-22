const base = import.meta.env.BASE_URL;

export default function Slide01Cover() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0B0F1A" }}>
      <div className="absolute inset-0 grid-bg opacity-60" />

      <img
        src={`${base}blockchain-hero.png`}
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover opacity-25"
        alt="Blockchain background"
      />

      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, rgba(11,15,26,0.95) 0%, rgba(11,15,26,0.7) 50%, rgba(11,15,26,0.9) 100%)"
        }}
      />

      <div
        className="absolute top-0 right-0 w-[50vw] h-[50vh] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #D4AF37 0%, transparent 70%)", transform: "translate(20%, -20%)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-[40vw] h-[40vh] rounded-full opacity-8"
        style={{ background: "radial-gradient(circle, #D4AF37 0%, transparent 70%)", transform: "translate(-20%, 20%)" }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-[8vw]">
        <div
          className="text-[0.9vw] font-body tracking-[0.5em] uppercase mb-[2vh]"
          style={{ color: "#D4AF37" }}
        >
          Powered by Smart Contracts
        </div>

        <h1
          className="font-display font-black uppercase leading-none tracking-wider mb-[2vh]"
          style={{
            fontSize: "8vw",
            color: "#D4AF37",
            textShadow: "0 0 30px rgba(212,175,55,0.6), 0 0 60px rgba(212,175,55,0.3)"
          }}
        >
          ORAKZAI
        </h1>

        <h2
          className="font-display font-black uppercase leading-none tracking-widest mb-[4vh]"
          style={{
            fontSize: "5vw",
            color: "#F5D47F",
            textShadow: "0 0 20px rgba(212,175,55,0.4)"
          }}
        >
          BOND
        </h2>

        <div
          className="w-[12vw] h-[0.2vh] mb-[3vh]"
          style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }}
        />

        <p
          className="font-body font-light tracking-[0.25em] uppercase text-[1.3vw] mb-[5vh]"
          style={{ color: "#F0E8D0" }}
        >
          Decentralized Reward System
        </p>

        <div
          className="flex gap-[3vw] text-[1.1vw] font-body font-medium tracking-widest uppercase"
          style={{ color: "#D4AF37" }}
        >
          <span>Transparent</span>
          <span style={{ color: "rgba(212,175,55,0.4)" }}>•</span>
          <span>Secure</span>
          <span style={{ color: "rgba(212,175,55,0.4)" }}>•</span>
          <span>Global Opportunity</span>
        </div>
      </div>

      <div
        className="absolute bottom-[3vh] w-full text-center font-body text-[1.1vw] font-light tracking-widest"
        style={{ color: "rgba(212,175,55,0.6)" }}
      >
        www.orakzaibond.com
      </div>

      <div
        className="absolute left-[3vw] top-[50vh] w-[0.1vw] h-[25vh]"
        style={{ background: "linear-gradient(to bottom, transparent, #D4AF37, transparent)" }}
      />
      <div
        className="absolute right-[3vw] top-[25vh] w-[0.1vw] h-[25vh]"
        style={{ background: "linear-gradient(to bottom, transparent, #D4AF37, transparent)" }}
      />
    </div>
  );
}
