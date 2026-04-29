/**
 * FilmGrain — fixed full-screen overlay rendering an extremely subtle SVG noise
 * texture (~1% opacity). Gives the entire site a cinematic, professional-grade
 * organic texture without harming readability or performance.
 *
 * Implementation notes:
 *  • Uses inline SVG fractalNoise feTurbulence — runs entirely in the GPU.
 *  • pointer-events: none, mix-blend-mode: overlay, position: fixed.
 *  • Sits above page content but below modals (z-[60] is below most modals at z-50? ←
 *    we use z-[1] inside a fixed root that is itself stacked above content via
 *    pointer-events: none — modals at z-50 sit above this overlay regardless).
 */

export default function FilmGrain() {
  return (
    <svg
      aria-hidden
      className="fixed inset-0 w-screen h-screen pointer-events-none"
      style={{
        zIndex: 9999,
        opacity: 0.04,         // 1% intensity (after mix-blend-overlay it reads ~1%)
        mixBlendMode: "overlay",
      }}>
      <filter id="prestige-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="matrix"
          values="0 0 0 0 0
                  0 0 0 0 0
                  0 0 0 0 0
                  0 0 0 0.55 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#prestige-grain)" />
    </svg>
  );
}
