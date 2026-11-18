/**
 * Green-white-green ribbon burst — fired when someone joins.
 * Pure canvas, removes itself after ~3s, skipped under reduced motion.
 */
export function celebrate() {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c = document.createElement("canvas");
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  c.width = innerWidth * dpr; c.height = innerHeight * dpr;
  Object.assign(c.style, { position: "fixed", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: "9999" });
  document.body.appendChild(c);
  const g = c.getContext("2d")!;
  g.scale(dpr, dpr);
  const colours = ["#008751", "#FFFFFF", "#9AC31F", "#008751", "#FFFFFF"];
  const parts = Array.from({ length: 140 }, (_, i) => {
    const fromLeft = i % 2 === 0;
    return {
      x: fromLeft ? -10 : innerWidth + 10, y: innerHeight * (0.55 + Math.random() * 0.3),
      vx: (fromLeft ? 1 : -1) * (4 + Math.random() * 7), vy: -(7 + Math.random() * 9),
      w: 6 + Math.random() * 6, h: 10 + Math.random() * 10, r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
      col: colours[i % colours.length],
    };
  });
  const start = performance.now();
  const tick = (now: number) => {
    const t = now - start;
    g.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += 0.28; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      g.save(); g.translate(p.x, p.y); g.rotate(p.r);
      g.globalAlpha = Math.max(0, 1 - t / 3000);
      g.fillStyle = p.col; g.shadowColor = "rgba(14,49,51,0.15)"; g.shadowBlur = 2;
      g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)));
      g.restore();
    }
    if (t < 3000) requestAnimationFrame(tick); else c.remove();
  };
  requestAnimationFrame(tick);
}
