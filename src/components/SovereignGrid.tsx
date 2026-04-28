/**
 * SovereignGrid — pure CSS/SVG OSG visualization.
 * Replaces the previous @react-three/fiber Canvas (which pulls in a React 19
 * reconciler incompatible with this project's React 18.3.1, causing the entire
 * app to crash with "Cannot read properties of undefined (reading 'S')").
 */

export default function SovereignGrid() {
  // 40 deterministic points distributed on a sphere via Fibonacci spiral,
  // projected to 2D for a wireframe-style preview.
  const nodes = Array.from({ length: 40 }, (_, i) => {
    const phi = Math.acos(-1 + (2 * i) / 40);
    const theta = Math.sqrt(40 * Math.PI) * phi;
    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.sin(phi) * Math.sin(theta);
    const z = Math.cos(phi);
    return { x, y, z };
  });

  // 12 great-circle latitude/longitude lines for the wireframe shell
  const latitudes = Array.from({ length: 5 }, (_, i) => {
    const t = (i + 1) / 6;
    return 50 - Math.sin(Math.PI * t) * 38;
  });

  return (
    <div className="w-32 h-32 relative pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl animate-pulse" />

      <div className="absolute inset-0 osg-spin-slow">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <radialGradient id="osgCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%"  stopColor="rgba(234,179,8,0.35)" />
              <stop offset="60%" stopColor="rgba(234,179,8,0.08)" />
              <stop offset="100%" stopColor="rgba(234,179,8,0)" />
            </radialGradient>
          </defs>

          <circle cx="50" cy="50" r="38" fill="url(#osgCore)" />

          {/* Wireframe shell */}
          <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(234,179,8,0.45)" strokeWidth="0.4" />
          {latitudes.map((ry, i) => (
            <ellipse
              key={`lat-${i}`}
              cx="50" cy="50" rx="38" ry={ry}
              fill="none"
              stroke="rgba(234,179,8,0.25)"
              strokeWidth="0.3"
            />
          ))}
          {[0, 30, 60, 90, 120, 150].map((deg) => (
            <ellipse
              key={`lon-${deg}`}
              cx="50" cy="50" rx="12" ry="38"
              fill="none"
              stroke="rgba(234,179,8,0.22)"
              strokeWidth="0.3"
              transform={`rotate(${deg} 50 50)`}
            />
          ))}

          {/* Nodes */}
          {nodes.map((n, i) => {
            const cx = 50 + n.x * 38;
            const cy = 50 + n.y * 38;
            const opacity = 0.35 + (n.z + 1) * 0.32;
            const r = 0.45 + (n.z + 1) * 0.4;
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="rgba(234,179,8,1)"
                opacity={opacity}
              />
            );
          })}
        </svg>
      </div>

      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="text-[8px] font-mono font-bold text-primary/60 uppercase tracking-[0.2em] bg-black/40 px-2 py-0.5 rounded-full border border-primary/10">
          OSG Active
        </span>
      </div>

      <style>{`
        @keyframes osg-spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .osg-spin-slow { animation: osg-spin-slow 28s linear infinite; }
      `}</style>
    </div>
  );
}
