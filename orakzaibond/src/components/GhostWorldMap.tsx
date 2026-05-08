/**
 * GhostWorldMap — Phantom engraving of the world, gold wireframe.
 *
 * Brand brief (Chairman's directive):
 *   "Minimalist gold wireframe, max 2% opacity. Engraving on expensive
 *    glass — not an animation."
 *
 * Implementation:
 *   • Pure inline SVG (no canvas, no GPU work)
 *   • Stationary — zero animation, zero motion
 *   • Stroke: champagne gold (#FCF6BA), opacity 0.02 wrapper
 *   • Stylised continent silhouettes + faint graticule
 *   • Pointer-events: none, aria-hidden
 *
 * Place inside any backdrop with `position: relative` to layer it as
 * a static phantom map.
 */

export default function GhostWorldMap() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity: 0.02,
        mixBlendMode: "screen",
        // No animation — engraving is timeless.
      }}
    >
      <svg
        viewBox="0 0 1000 500"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      >
        <defs>
          <radialGradient id="ghostmap-vignette" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#FCF6BA" stopOpacity="1" />
            <stop offset="60%" stopColor="#FCF6BA" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FCF6BA" stopOpacity="0" />
          </radialGradient>
          <mask id="ghostmap-mask">
            <rect x="0" y="0" width="1000" height="500" fill="url(#ghostmap-vignette)" />
          </mask>
        </defs>

        <g mask="url(#ghostmap-mask)" stroke="#FCF6BA" fill="none" strokeLinejoin="round" strokeLinecap="round">
          {/* ── GRATICULE ─────────────────────────────────────────────
              Faint lat/lon engraved lines. Hairline weight, no fill.
              ──────────────────────────────────────────────────────── */}
          <g strokeWidth="0.5" opacity="0.55">
            {/* longitude lines every 30° (12 meridians) */}
            {Array.from({ length: 11 }, (_, i) => {
              const x = (i + 1) * (1000 / 12);
              return <line key={`lon-${i}`} x1={x} y1="0" x2={x} y2="500" />;
            })}
            {/* latitude lines every 30° (5 parallels) */}
            {Array.from({ length: 5 }, (_, i) => {
              const y = (i + 1) * (500 / 6);
              return <line key={`lat-${i}`} x1="0" y1={y} x2="1000" y2={y} />;
            })}
          </g>

          {/* Equator + Prime Meridian — slightly heavier */}
          <g strokeWidth="0.7" opacity="0.85">
            <line x1="0" y1="250" x2="1000" y2="250" />
            <line x1="500" y1="0" x2="500" y2="500" />
          </g>

          {/* ── CONTINENT SILHOUETTES ─────────────────────────────────
              Hand-stylised, recognisable at low opacity. Equirectangular
              projection on a 1000×500 grid (centred on Greenwich).
              ──────────────────────────────────────────────────────── */}
          <g strokeWidth="1.1" opacity="0.95">
            {/* North America */}
            <path d="M 130 95
                     Q 175 78 220 88
                     L 270 100
                     Q 305 112 322 138
                     L 332 178
                     Q 332 210 318 232
                     L 296 252
                     Q 268 262 240 258
                     L 218 248
                     L 230 268
                     L 218 282
                     L 200 270
                     L 188 248
                     Q 162 230 146 200
                     Q 132 168 130 132 Z" />
            {/* Greenland */}
            <path d="M 360 78
                     Q 388 70 412 82
                     L 422 105
                     Q 415 122 396 124
                     L 372 116
                     Q 360 102 360 88 Z" />
            {/* South America */}
            <path d="M 270 270
                     Q 295 268 318 278
                     L 340 298
                     Q 352 322 350 350
                     L 340 388
                     Q 326 420 308 438
                     L 296 444
                     L 286 432
                     L 286 408
                     Q 280 380 274 350
                     L 268 318
                     Q 264 292 270 278 Z" />
            {/* Europe */}
            <path d="M 470 158
                     Q 498 152 528 158
                     L 552 168
                     Q 562 178 558 188
                     L 540 198
                     Q 518 202 498 200
                     L 478 192
                     L 472 178
                     L 484 174
                     L 478 168 Z" />
            {/* Africa */}
            <path d="M 498 210
                     Q 528 208 552 220
                     L 572 240
                     Q 582 268 580 296
                     L 572 330
                     Q 558 365 540 388
                     L 522 408
                     L 510 408
                     L 498 388
                     Q 488 360 484 332
                     L 482 300
                     Q 484 268 488 240
                     L 494 220 Z" />
            {/* Asia (large composite mass) */}
            <path d="M 558 152
                     Q 612 138 672 145
                     L 738 158
                     Q 792 172 822 195
                     L 848 220
                     Q 858 245 848 270
                     L 822 288
                     Q 778 296 738 290
                     L 700 280
                     L 720 296
                     L 712 308
                     L 690 296
                     L 668 286
                     L 638 282
                     L 612 270
                     Q 580 252 568 222
                     L 558 192 Z" />
            {/* India */}
            <path d="M 668 240
                     Q 686 244 700 254
                     L 706 280
                     L 696 302
                     L 688 312
                     L 680 304
                     L 672 282
                     L 666 260 Z" />
            {/* Indonesia / SE Asia archipelago — dotted */}
            <g fill="#FCF6BA" stroke="none" opacity="0.9">
              <circle cx="780" cy="312" r="1.6" />
              <circle cx="795" cy="318" r="1.4" />
              <circle cx="808" cy="316" r="1.6" />
              <circle cx="820" cy="322" r="1.2" />
              <circle cx="835" cy="320" r="1.4" />
              <circle cx="772" cy="320" r="1.2" />
            </g>
            {/* Australia */}
            <path d="M 778 348
                     Q 818 342 852 352
                     L 872 372
                     Q 872 396 850 406
                     L 818 410
                     L 790 408
                     Q 772 398 770 380
                     L 772 360 Z" />
            {/* Antarctic shelf hint — top fringe */}
            <path d="M 80 470
                     Q 260 462 460 466
                     L 700 466
                     Q 880 462 980 470" strokeWidth="0.8" opacity="0.6" />
          </g>

          {/* ── CORNER TICKS — engraved bezel ─────────────────────────
              Subtle "registration marks" suggesting a precision instrument.
              ──────────────────────────────────────────────────────── */}
          <g strokeWidth="0.8" opacity="0.7">
            <path d="M 8 8 L 28 8 M 8 8 L 8 28" />
            <path d="M 992 8 L 972 8 M 992 8 L 992 28" />
            <path d="M 8 492 L 28 492 M 8 492 L 8 472" />
            <path d="M 992 492 L 972 492 M 992 492 L 992 472" />
          </g>
        </g>
      </svg>
    </div>
  );
}
