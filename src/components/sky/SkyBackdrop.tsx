import { useEffect, useMemo, useState } from "react";
import far from "@/assets/landmarks/far.webp";

/**
 * Site-wide fixed "heavenly sky".
 * - Follows the real time of day in Nigeria: sunrise, day, golden dusk, and a
 *   soft starlit evening (kept light enough for every page to stay readable).
 * - A faint horizon of Nigerian landmarks drifts along the bottom on every page.
 * - On desktop, the sky and landmarks lean gently with the pointer.
 * Transform/opacity animation only; still under reduced motion.
 */
type Phase = "sunrise" | "day" | "dusk" | "evening";

const SKIES: Record<Phase, { bg: string; sun: string; rays: number; stars: number }> = {
  sunrise: { bg: "linear-gradient(180deg, #A9CFC0 0%, #EAF3DA 46%, #FFF1D6 100%)", sun: "rgba(255,236,200,0.95)", rays: 0.2, stars: 0 },
  day:     { bg: "linear-gradient(180deg, #A4CDB8 0%, #E4F3DE 45%, #FFFCE8 100%)", sun: "rgba(255,253,225,0.95)", rays: 0.18, stars: 0 },
  dusk:    { bg: "linear-gradient(180deg, #8FB9AE 0%, #E2EBD2 44%, #FBE3C2 100%)", sun: "rgba(255,214,170,0.9)", rays: 0.16, stars: 0 },
  evening: { bg: "linear-gradient(180deg, #6E9C97 0%, #CFE0D0 48%, #F1F2E2 100%)", sun: "rgba(235,245,225,0.7)", rays: 0.08, stars: 0.75 },
};

const lagosHour = () => {
  try {
    return Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Africa/Lagos" }).format(new Date()));
  } catch { return new Date().getHours(); }
};
const phaseFor = (h: number): Phase => (h >= 5 && h < 8 ? "sunrise" : h >= 8 && h < 17 ? "day" : h >= 17 && h < 19 ? "dusk" : "evening");

const SkyBackdrop = () => {
  const [phase, setPhase] = useState<Phase>(() => phaseFor(lagosHour()));

  useEffect(() => {
    const t = setInterval(() => setPhase(phaseFor(lagosHour())), 5 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  // pointer lean for the landmark layers (fine pointers only)
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = document.documentElement.style;
        r.setProperty("--lean-x", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
        r.setProperty("--lean-y", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { window.removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, []);

  const motes = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i, left: `${(i * 37) % 100}%`, bottom: `${(i * 53) % 40}%`, size: 2 + ((i * 7) % 3),
        delay: `${(i * 1.3) % 20}s`, duration: `${18 + ((i * 5) % 14)}s`,
      })),
    []
  );
  const stars = useMemo(
    () => Array.from({ length: 36 }, (_, i) => ({ id: i, left: `${(i * 29 + 7) % 100}%`, top: `${(i * 17 + 3) % 42}%`, size: 1 + (i % 2), delay: `${(i * 0.7) % 6}s` })),
    []
  );
  const clouds = [
    { top: "8%", w: 340, d: "140s", delay: "-20s", o: 0.75 },
    { top: "22%", w: 240, d: "170s", delay: "-90s", o: 0.6 },
    { top: "38%", w: 420, d: "200s", delay: "-140s", o: 0.5 },
    { top: "14%", w: 180, d: "120s", delay: "-60s", o: 0.55 },
  ];
  const sky = SKIES[phase];

  return (
    <div aria-hidden="true" data-sky={phase} className="fixed inset-0 -z-10 overflow-hidden pointer-events-none transition-[background] duration-[2000ms]"
      style={{ background: sky.bg }}>
      {sky.stars > 0 && stars.map((s) => (
        <span key={s.id} className="sky-star absolute rounded-full bg-white"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, opacity: sky.stars, animationDelay: s.delay }} />
      ))}
      {/* god-rays */}
      <div className="sky-rays absolute left-1/2 top-[85%] w-[220vmax] h-[220vmax] will-change-transform"
        style={{ transform: "translate(-50%, -50%)", opacity: sky.rays,
          background: "repeating-conic-gradient(from 0deg, rgba(255,255,255,0.9) 0deg 4deg, transparent 4deg 14deg)",
          maskImage: "radial-gradient(circle, black 0%, transparent 55%)", WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 55%)" }} />
      {/* sun bloom */}
      <div className="absolute left-1/2 bottom-[-20vh] -translate-x-1/2 w-[110vw] h-[70vh] rounded-full"
        style={{ background: `radial-gradient(closest-side, ${sky.sun}, rgba(255,250,210,0.4) 45%, transparent 75%)` }} />
      {clouds.map((c, i) => (
        <div key={i} className="sky-cloud absolute left-0 will-change-transform"
          style={{ top: c.top, width: c.w, height: c.w * 0.32, opacity: c.o, animationDuration: c.d, animationDelay: c.delay }}>
          <div className="absolute inset-0 rounded-full bg-white blur-2xl" />
          <div className="absolute left-[20%] -top-[40%] w-[45%] h-[110%] rounded-full bg-white blur-xl" />
        </div>
      ))}
      {/* faint landmark horizon on every page */}
      <div className="absolute inset-x-0 bottom-0 h-[16vh] min-h-[90px] opacity-[0.28] landmark-par-1">
        <div className="landmark-drift flex h-full w-max">
          <img src={far} alt="" className="h-full w-auto max-w-none" decoding="async" />
          <img src={far} alt="" className="h-full w-auto max-w-none" decoding="async" />
        </div>
      </div>
      {motes.map((m) => (
        <span key={m.id} className="sky-mote absolute rounded-full bg-white will-change-transform"
          style={{ left: m.left, bottom: m.bottom, width: m.size, height: m.size, animationDelay: m.delay, animationDuration: m.duration,
            boxShadow: "0 0 6px 2px rgba(255,255,220,0.8)" }} />
      ))}
    </div>
  );
};
export default SkyBackdrop;
