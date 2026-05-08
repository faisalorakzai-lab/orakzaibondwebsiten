import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ImageLightboxProps {
  src: string | null;
  onClose: () => void;
  alt?: string;
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;

export default function ImageLightbox({ src, onClose, alt = "Image" }: ImageLightboxProps) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const lastTouchDist = useRef<number | null>(null);
  const swipeStart = useRef<{ x: number; y: number; t: number } | null>(null);
  const dragStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const lastTap = useRef<number>(0);

  // Reset on open / src change
  useEffect(() => {
    if (src) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    }
  }, [src]);

  // ESC + lock body scroll
  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "+" || e.key === "=") setScale(s => Math.min(MAX_SCALE, s + 0.5));
      else if (e.key === "-") setScale(s => Math.max(MIN_SCALE, s - 0.5));
      else if (e.key === "0") { setScale(1); setTranslate({ x: 0, y: 0 }); }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [src, onClose]);

  function reset() {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }

  function handleWheel(e: React.WheelEvent) {
    const delta = -e.deltaY * 0.0025;
    setScale(s => {
      const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, s + delta));
      if (next === MIN_SCALE) setTranslate({ x: 0, y: 0 });
      return next;
    });
  }

  function dist(a: React.Touch, b: React.Touch) {
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      lastTouchDist.current = dist(e.touches[0], e.touches[1]);
      swipeStart.current = null;
      dragStart.current = null;
      return;
    }
    if (e.touches.length === 1) {
      const t = e.touches[0];
      const now = Date.now();
      // Double-tap to toggle zoom
      if (now - lastTap.current < 300) {
        if (scale > 1) reset();
        else setScale(2.2);
        lastTap.current = 0;
        return;
      }
      lastTap.current = now;

      if (scale > 1) {
        dragStart.current = { x: t.clientX, y: t.clientY, tx: translate.x, ty: translate.y };
        swipeStart.current = null;
      } else {
        swipeStart.current = { x: t.clientX, y: t.clientY, t: now };
        dragStart.current = null;
      }
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2 && lastTouchDist.current !== null) {
      const newDist = dist(e.touches[0], e.touches[1]);
      const ratio = newDist / lastTouchDist.current;
      setScale(s => Math.max(MIN_SCALE, Math.min(MAX_SCALE, s * ratio)));
      lastTouchDist.current = newDist;
      return;
    }
    if (e.touches.length === 1) {
      const t = e.touches[0];
      if (scale > 1 && dragStart.current) {
        const dx = t.clientX - dragStart.current.x;
        const dy = t.clientY - dragStart.current.y;
        setTranslate({ x: dragStart.current.tx + dx, y: dragStart.current.ty + dy });
      }
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    // Vertical swipe to close (when not zoomed)
    if (swipeStart.current && e.changedTouches.length === 1 && scale === 1) {
      const t = e.changedTouches[0];
      const dx = t.clientX - swipeStart.current.x;
      const dy = t.clientY - swipeStart.current.y;
      const dt = Date.now() - swipeStart.current.t;
      if (Math.abs(dy) > 80 && Math.abs(dy) > Math.abs(dx) && dt < 600) {
        onClose();
      }
    }
    if (e.touches.length < 2) lastTouchDist.current = null;
    if (e.touches.length === 0) {
      dragStart.current = null;
      swipeStart.current = null;
    }
  }

  return (
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md select-none"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          {/* Top bar — gold accents */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 sm:px-5 py-3 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-primary/40 backdrop-blur">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest font-mono">
                {Math.round(scale * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setScale(s => Math.max(MIN_SCALE, s - 0.5)); }}
                className="p-2 rounded-full bg-black/60 border border-primary/40 text-primary hover:bg-primary/20 hover:shadow-[0_0_15px_rgba(234,179,8,0.4)] transition-all"
                aria-label="Zoom out"
              >
                <ZoomOut size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setScale(s => Math.min(MAX_SCALE, s + 0.5)); }}
                className="p-2 rounded-full bg-black/60 border border-primary/40 text-primary hover:bg-primary/20 hover:shadow-[0_0_15px_rgba(234,179,8,0.4)] transition-all"
                aria-label="Zoom in"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); reset(); }}
                className="p-2 rounded-full bg-black/60 border border-primary/40 text-primary hover:bg-primary/20 hover:shadow-[0_0_15px_rgba(234,179,8,0.4)] transition-all hidden sm:inline-flex"
                aria-label="Reset"
              >
                <RotateCcw size={15} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="p-2 rounded-full bg-black/70 border-2 border-primary text-primary hover:bg-primary hover:text-black hover:shadow-[0_0_22px_rgba(234,179,8,0.6)] transition-all"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Image stage */}
          <div
            className="w-full h-full flex items-center justify-center overflow-hidden touch-none"
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (scale > 1) reset(); else setScale(2.2);
            }}
          >
            <motion.img
              src={src}
              alt={alt}
              draggable={false}
              animate={{ scale, x: translate.x, y: translate.y }}
              transition={{ type: "tween", duration: 0.05, ease: "linear" }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-[95vw] max-h-[88vh] object-contain rounded-lg shadow-[0_0_60px_rgba(234,179,8,0.18)]"
              style={{ cursor: scale > 1 ? "grab" : "zoom-in" }}
            />
          </div>

          {/* Bottom hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 border border-primary/30 backdrop-blur pointer-events-none">
            <span className="text-[10px] text-primary/80 font-mono tracking-wider hidden md:block">
              ESC to close · Scroll to zoom · Double-click to toggle
            </span>
            <span className="text-[10px] text-primary/80 font-mono tracking-wider md:hidden">
              Pinch to zoom · Double-tap · Swipe down to close
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
