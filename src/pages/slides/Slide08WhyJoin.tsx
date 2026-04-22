export default function Slide08WhyJoin() {
  const benefits = [
    { title: "Transparent Earning", desc: "Full visibility into every step of the process" },
    { title: "Fair Participation", desc: "Equal opportunity for every participant globally" },
    { title: "No Hidden Rules", desc: "What you see is exactly what the contract executes" },
    { title: "Blockchain Security", desc: "Cryptographic protection on every transaction" },
    { title: "Global Access", desc: "Participate from anywhere in the world, anytime" },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0B0F1A" }}>
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div
        className="absolute top-0 right-0 w-[40vw] h-full"
        style={{ background: "linear-gradient(270deg, rgba(212,175,55,0.05) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 h-full flex">
        <div className="w-[42vw] flex flex-col justify-center pl-[8vw] pr-[4vw]">
          <div
            className="text-[0.85vw] font-body tracking-[0.4em] uppercase mb-[2vh]"
            style={{ color: "#D4AF37" }}
          >
            08 / Benefits
          </div>

          <h2
            className="font-display font-bold uppercase tracking-wider leading-tight mb-[2vh]"
            style={{ fontSize: "3.5vw", color: "#F0E8D0" }}
          >
            Why <span style={{ color: "#D4AF37" }}>Join?</span>
          </h2>

          <div
            className="w-[6vw] h-[0.15vh] mb-[3vh]"
            style={{ background: "linear-gradient(90deg, #D4AF37, transparent)" }}
          />

          <p
            className="font-body text-[1.2vw] mb-[4vh]"
            style={{ color: "rgba(240,232,208,0.7)" }}
          >
            Orakzai Bond mein join karna matlab — aik fair, transparent, aur secure financial opportunity.
          </p>

          <div
            className="rounded-xl p-[2.5vh_2vw]"
            style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)" }}
          >
            <div className="font-display font-bold uppercase tracking-wide text-[1.1vw] mb-[2vh]" style={{ color: "#D4AF37" }}>For Users</div>
            <div className="flex flex-col gap-[1vh]">
              <div className="flex items-center gap-[1vw]">
                <div className="w-[0.5vw] h-[0.5vw] rounded-full" style={{ background: "#D4AF37" }} />
                <span className="font-body text-[1vw]" style={{ color: "rgba(240,232,208,0.8)" }}>Simple entry process</span>
              </div>
              <div className="flex items-center gap-[1vw]">
                <div className="w-[0.5vw] h-[0.5vw] rounded-full" style={{ background: "#D4AF37" }} />
                <span className="font-body text-[1vw]" style={{ color: "rgba(240,232,208,0.8)" }}>Crystal clear system</span>
              </div>
              <div className="flex items-center gap-[1vw]">
                <div className="w-[0.5vw] h-[0.5vw] rounded-full" style={{ background: "#D4AF37" }} />
                <span className="font-body text-[1vw]" style={{ color: "rgba(240,232,208,0.8)" }}>Equal chance for everyone</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center pr-[8vw] pl-[4vw] gap-[2vh]">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="glass-card rounded-xl p-[2vh_2vw] flex items-center gap-[2vw]"
            >
              <div
                className="font-display font-black flex-shrink-0"
                style={{ fontSize: "1.5vw", color: "rgba(212,175,55,0.3)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div
                className="w-[0.1vw] self-stretch"
                style={{ background: "rgba(212,175,55,0.3)" }}
              />
              <div>
                <div className="font-display font-bold text-[1vw] mb-[0.5vh]" style={{ color: "#D4AF37" }}>{b.title}</div>
                <div className="font-body text-[0.9vw]" style={{ color: "rgba(240,232,208,0.65)" }}>{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
