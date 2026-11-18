import { useMemo } from "react";

/** Site-wide fixed "heavenly sky" backdrop. Transform/opacity animation only; static under reduced motion (see index.css). */
const SkyBackdrop = () => {
  const motes = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        bottom: `${(i * 53) % 40}%`,
        size: 2 + ((i * 7) % 3),
        delay: `${(i * 1.3) % 20}s`,
        duration: `${18 + ((i * 5) % 14)}s`,
      })),
    []
  );
  const clouds = [
    { top: "8%", w: 340, d: "140s", delay: "-20s", o: 0.75 },
    { top: "22%", w: 240, d: "170s", delay: "-90s", o: 0.6 },
    { top: "38%", w: 420, d: "200s", delay: "-140s", o: 0.5 },
    { top: "14%", w: 180, d: "120s", delay: "-60s", o: 0.55 },
  ];
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      style={{ background: "linear-gradient(180deg, #A4CDB8 0%, #E4F3DE 45%, #FFFCE8 100%)" }}>
      {/* god-rays */}
      <div className="sky-rays absolute left-1/2 top-[85%] w-[220vmax] h-[220vmax] will-change-transform"
        style={{ transform: "translate(-50%, -50%)", opacity: 0.18,
          background: "repeating-conic-gradient(from 0deg, rgba(255,255,255,0.9) 0deg 4deg, transparent 4deg 14deg)",
          maskImage: "radial-gradient(circle, black 0%, transparent 55%)", WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 55%)" }} />
      {/* sun bloom */}
      <div className="absolute left-1/2 bottom-[-20vh] -translate-x-1/2 w-[110vw] h-[70vh] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(255,253,225,0.95), rgba(255,250,210,0.45) 45%, transparent 75%)" }} />
      {clouds.map((c, i) => (
        <div key={i} className="sky-cloud absolute left-0 will-change-transform"
          style={{ top: c.top, width: c.w, height: c.w * 0.32, opacity: c.o, animationDuration: c.d, animationDelay: c.delay }}>
          <div className="absolute inset-0 rounded-full bg-white blur-2xl" />
          <div className="absolute left-[20%] -top-[40%] w-[45%] h-[110%] rounded-full bg-white blur-xl" />
        </div>
      ))}
      {motes.map((m) => (
        <span key={m.id} className="sky-mote absolute rounded-full bg-white will-change-transform"
          style={{ left: m.left, bottom: m.bottom, width: m.size, height: m.size, animationDelay: m.delay, animationDuration: m.duration,
            boxShadow: "0 0 6px 2px rgba(255,255,220,0.8)" }} />
      ))}
    </div>
  );
};
export default SkyBackdrop;
