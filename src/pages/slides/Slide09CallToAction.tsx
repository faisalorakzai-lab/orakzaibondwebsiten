export default function Slide09CallToAction() {
  const steps = [
    { num: "01", label: "Connect Wallet" },
    { num: "02", label: "Enter Lottery" },
    { num: "03", label: "Be Part of the System" },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#080C14" }}>
      <div className="absolute inset-0 grid-bg opacity-40" />

      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(212,175,55,0.1) 0%, transparent 60%)" }}
      />

      <div
        className="absolute top-0 left-0 w-full h-[0.2vh]"
        style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-full h-[0.2vh]"
        style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-[8vw]">
        <div
          className="text-[0.85vw] font-body tracking-[0.4em] uppercase mb-[2vh]"
          style={{ color: "#D4AF37" }}
        >
          09 / Call to Action
        </div>

        <h2
          className="font-display font-black uppercase tracking-wider mb-[1.5vh]"
          style={{
            fontSize: "6vw",
            color: "#D4AF37",
            textShadow: "0 0 40px rgba(212,175,55,0.5), 0 0 80px rgba(212,175,55,0.2)"
          }}
        >
          Join Now
        </h2>

        <a
          href="https://www.orakzaibond.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-body font-medium tracking-widest uppercase text-[1.2vw] mb-[5vh] underline underline-offset-4"
          style={{ color: "rgba(240,232,208,0.7)" }}
        >
          www.orakzaibond.com
        </a>

        <div className="flex gap-[3vw] mb-[6vh]">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-[3vw]">
              <div className="text-center">
                <div
                  className="w-[8vw] h-[8vw] rounded-full flex items-center justify-center mx-auto mb-[1.5vh]"
                  style={{
                    border: "1px solid rgba(212,175,55,0.4)",
                    background: "rgba(212,175,55,0.08)"
                  }}
                >
                  <div
                    className="font-display font-black"
                    style={{ fontSize: "2.5vw", color: "#D4AF37" }}
                  >
                    {step.num}
                  </div>
                </div>
                <div
                  className="font-display font-bold uppercase tracking-wide text-[0.95vw]"
                  style={{ color: "#F0E8D0" }}
                >
                  {step.label}
                </div>
              </div>
              {i < steps.length - 1 && (
                <div
                  className="w-[5vw] h-[0.1vh]"
                  style={{ background: "rgba(212,175,55,0.35)" }}
                />
              )}
            </div>
          ))}
        </div>

        <div
          className="w-[30vw] h-[0.15vh] mb-[3vh]"
          style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }}
        />

        <p
          className="font-display font-bold uppercase tracking-[0.2em] text-[1.2vw]"
          style={{ color: "rgba(240,232,208,0.7)" }}
        >
          The Future of Decentralized Opportunities Starts Here
        </p>
      </div>
    </div>
  );
}
