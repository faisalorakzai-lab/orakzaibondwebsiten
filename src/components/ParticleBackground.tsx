import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  alphaSpeed: number;
  shape: "dot" | "bar" | "line";
  color: string;
}

const GOLD_COLORS = [
  "rgba(234,179,8,",
  "rgba(251,191,36,",
  "rgba(245,158,11,",
  "rgba(253,224,71,",
  "rgba(180,130,0,",
];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function createParticle(w: number, h: number): Particle {
  const shapes: Particle["shape"][] = ["dot", "dot", "dot", "bar", "line"];
  return {
    x: rand(0, w),
    y: rand(0, h),
    vx: rand(-0.12, 0.12),
    vy: rand(-0.25, -0.06),
    size: rand(1.5, 5),
    alpha: rand(0.05, 0.35),
    alphaSpeed: rand(0.0005, 0.002),
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    color: GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)],
  };
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];
    let tick = 0;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function init() {
      resize();
      const count = Math.min(80, Math.floor((canvas!.width * canvas!.height) / 14000));
      particles = Array.from({ length: count }, () =>
        createParticle(canvas!.width, canvas!.height)
      );
    }

    function drawParticle(p: Particle) {
      if (!ctx) return;
      ctx.save();
      ctx.globalAlpha = p.alpha;
      const fill = `${p.color}${p.alpha})`;

      if (p.shape === "dot") {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
        // soft glow
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        grd.addColorStop(0, `${p.color}0.15)`);
        grd.addColorStop(1, `${p.color}0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      } else if (p.shape === "bar") {
        const w = p.size * 5;
        const h = p.size * 2;
        ctx.fillStyle = fill;
        ctx.fillRect(p.x - w / 2, p.y - h / 2, w, h);
        // highlight
        ctx.fillStyle = `rgba(255,230,100,${p.alpha * 0.4})`;
        ctx.fillRect(p.x - w / 2 + 1, p.y - h / 2 + 1, w - 2, h * 0.4);
      } else {
        // line (stock chart segment)
        ctx.beginPath();
        ctx.strokeStyle = fill;
        ctx.lineWidth = p.size * 0.4;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + rand(-20, 20), p.y + rand(-10, 10));
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawGrid() {
      if (!canvas || !ctx) return;
      ctx.save();
      ctx.globalAlpha = 0.025;
      ctx.strokeStyle = "rgba(234,179,8,1)";
      ctx.lineWidth = 0.5;
      const gap = 60;
      for (let x = 0; x < canvas.width; x += gap) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      ctx.restore();
    }

    function frame() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tick++;

      drawGrid();

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.alphaSpeed * Math.sin(tick * 0.02);

        // Wrap particles
        if (p.y < -20) p.y = canvas.height + 10;
        if (p.x < -20) p.x = canvas.width + 10;
        if (p.x > canvas.width + 20) p.x = -10;
        p.alpha = Math.max(0.02, Math.min(0.4, p.alpha));

        drawParticle(p);
      }

      animId = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(canvas);
    init();
    frame();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.85 }}
    />
  );
}
