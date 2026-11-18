import { motion, useInView, animate, useReducedMotion } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";

/** Soft blur-to-sharp + 12px rise reveal. */
export const Reveal = ({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) => (
  <motion.div className={className}
    initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.4, ease: "easeOut", delay }}>
    {children}
  </motion.div>
);

/** Card pop with gentle overshoot. */
export const Pop = ({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) => (
  <motion.div className={className}
    initial={{ opacity: 0, scale: 0.94, y: 10 }}
    whileInView={{ opacity: 1, scale: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ type: "spring", stiffness: 260, damping: 18, delay }}>
    {children}
  </motion.div>
);

/** Counts up to `value` once scrolled into view. */
export const CountUp = ({ value, format = (n) => n.toLocaleString("en-NG") }: { value: number; format?: (n: number) => string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) { setN(value); return; }
    const c = animate(0, value, { duration: 1.2, ease: "easeOut", onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, value, reduce]);
  return <span ref={ref}>{format(n)}</span>;
};
