import founderImg from "@assets/IMG-20260402-WA0080_1775666609315.jpg";

export default function Slide06Founder() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0B0F1A" }}>
      <div className="absolute inset-0 grid-bg opacity-25" />

      <div
        className="absolute top-0 right-0 w-[50vw] h-full"
        style={{ background: "linear-gradient(270deg, rgba(212,175,55,0.05) 0%, transparent 60%)" }}
      />

      <div
        className="absolute bottom-0 left-0 w-[30vw] h-[30vw] rounded-full opacity-8"
        style={{ background: "radial-gradient(circle, #D4AF37 0%, transparent 70%)", transform: "translate(-30%, 30%)" }}
      />

      <div className="relative z-10 h-full flex">
        <div className="w-[45vw] flex flex-col justify-center pl-[8vw] pr-[4vw]">
          <div
            className="text-[0.85vw] font-body tracking-[0.4em] uppercase mb-[2vh]"
            style={{ color: "#D4AF37" }}
          >
            06 / Leadership
          </div>

          <div
            className="font-display font-black uppercase tracking-wider leading-tight mb-[1.5vh]"
            style={{ fontSize: "2vw", color: "rgba(240,232,208,0.5)" }}
          >
            Founder
          </div>

          <h2
            className="font-display font-black uppercase tracking-wider leading-tight mb-[3vh]"
            style={{
              fontSize: "3vw",
              color: "#D4AF37",
              textShadow: "0 0 20px rgba(212,175,55,0.4)"
            }}
          >
            Malak Faisal<br />Orakzai
          </h2>

          <div
            className="w-[6vw] h-[0.15vh] mb-[3vh]"
            style={{ background: "linear-gradient(90deg, #D4AF37, transparent)" }}
          />

          <p
            className="font-body leading-relaxed mb-[3.5vh] text-[1.1vw]"
            style={{ color: "rgba(240,232,208,0.75)" }}
          >
            Faisal Orakzai ek visionary entrepreneur hain jo decentralized finance aur real-world systems ko combine kar rahe hain.
          </p>

          <div className="flex flex-col gap-[1.5vh] mb-[3.5vh]">
            <div className="flex items-center gap-[1.2vw]">
              <div className="w-[2vw] h-[0.1vh]" style={{ background: "#D4AF37" }} />
              <span className="font-body text-[1vw]" style={{ color: "rgba(240,232,208,0.8)" }}>Scalable ecosystems</span>
            </div>
            <div className="flex items-center gap-[1.2vw]">
              <div className="w-[2vw] h-[0.1vh]" style={{ background: "#D4AF37" }} />
              <span className="font-body text-[1vw]" style={{ color: "rgba(240,232,208,0.8)" }}>Transparent financial models</span>
            </div>
            <div className="flex items-center gap-[1.2vw]">
              <div className="w-[2vw] h-[0.1vh]" style={{ background: "#D4AF37" }} />
              <span className="font-body text-[1vw]" style={{ color: "rgba(240,232,208,0.8)" }}>Global-level innovation</span>
            </div>
          </div>

          <div
            className="font-display font-bold uppercase tracking-widest text-[1vw]"
            style={{ color: "rgba(212,175,55,0.6)" }}
          >
            Leadership + Vision + Execution
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center pr-[8vw]">
          <div className="relative mb-[3vh]">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(212,175,55,0.3) 0%, transparent 70%)",
                transform: "scale(1.15)",
                filter: "blur(12px)"
              }}
            />
            <div
              className="relative rounded-full overflow-hidden"
              style={{
                width: "22vw",
                height: "22vw",
                border: "2px solid rgba(212,175,55,0.55)",
                boxShadow: "0 0 40px rgba(212,175,55,0.2), 0 0 80px rgba(212,175,55,0.08)"
              }}
            >
              <img
                src={founderImg}
                crossOrigin="anonymous"
                alt="Malak Faisal Orakzai – Founder"
                className="w-full h-full object-cover object-top"
              />
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: "linear-gradient(to bottom, transparent 60%, rgba(11,15,26,0.6) 100%)" }}
              />
            </div>

            <div
              className="absolute -bottom-[1vh] left-[50%] -translate-x-[50%] rounded-full px-[1.5vw] py-[0.6vh]"
              style={{
                background: "rgba(11,15,26,0.9)",
                border: "1px solid rgba(212,175,55,0.45)",
                whiteSpace: "nowrap"
              }}
            >
              <span
                className="font-display font-bold uppercase tracking-widest text-[0.8vw]"
                style={{ color: "#D4AF37" }}
              >
                Founder — Orakzai Bond
              </span>
            </div>
          </div>

          <div className="text-center mt-[2vh]">
            <div
              className="w-[15vw] h-[0.1vh] mx-auto"
              style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
