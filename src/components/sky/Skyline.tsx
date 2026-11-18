import { cn } from "@/lib/utils";
import far from "@/assets/landmarks/far.webp";
import mid from "@/assets/landmarks/mid.webp";
import gate from "@/assets/landmarks/gate.webp";

/**
 * Nigeria in layers, drawn from the Election Matters artwork:
 *  far  — Zuma Rock, a Kano gate, groundnut pyramids, the National Theatre,
 *         Jaekel House, the Three Wise Men, the first storey building,
 *         the National Christian Centre and the National Mosque (drifts slowly);
 *  mid  — Lagos: the Lekki–Ikoyi Link Bridge and the Marina skyline, then
 *         Abuja: CBD towers, Christian Centre, Mosque, Aso Rock and the
 *         National Assembly (pans gently, like the video camera);
 *  gate — the Abuja City Gate, front and centre (optional).
 * Layers also lean with the pointer on desktop (see SkyBackdrop).
 */
const Skyline = ({ className, withGate = false }: { className?: string; withGate?: boolean }) => (
  <div aria-hidden="true" className={cn("relative w-full overflow-hidden pointer-events-none select-none", className)}>
    {/* far strip: two copies side by side for a seamless loop */}
    <div className="absolute inset-x-0 bottom-[22%] h-[42%] opacity-80 landmark-par-1">
      <div className="landmark-drift flex h-full w-max">
        <img src={far} alt="" className="h-full w-auto max-w-none" loading="lazy" decoding="async" />
        <img src={far} alt="" className="h-full w-auto max-w-none" loading="lazy" decoding="async" />
      </div>
    </div>
    {/* soft haze between the layers for depth */}
    <div className="absolute inset-x-0 bottom-[18%] h-[30%] bg-gradient-to-t from-white/50 to-transparent" />
    {/* Abuja */}
    <div className="absolute inset-x-0 bottom-0 h-[86%] flex justify-end landmark-par-2">
      <img src={mid} alt="" className="landmark-pan h-full w-auto max-w-none" loading="lazy" decoding="async" />
    </div>
    {withGate && (
      <div className="absolute inset-x-0 bottom-0 h-full flex justify-center landmark-par-3">
        <img src={gate} alt="" className="landmark-float h-full w-auto max-w-none drop-shadow-[0_18px_30px_rgba(14,49,51,0.18)]" decoding="async" />
      </div>
    )}
    {/* blend into the page */}
    <div className="absolute inset-x-0 bottom-0 h-[22%]" style={{ background: "linear-gradient(to top, hsl(var(--background)), hsl(var(--background) / 0.6) 45%, transparent)" }} />
  </div>
);

export default Skyline;
