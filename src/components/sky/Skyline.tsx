import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Nigerian landmark line-art skyline band, slow horizontal parallax on scroll. */
const Skyline = ({ className }: { className?: string }) => {
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();
  const x = useTransform(scrollY, [0, 3000], [0, reduce ? 0 : -60]);
  return (
    <div aria-hidden="true" className={cn("relative w-full overflow-hidden pointer-events-none", className)}>
      <motion.svg style={{ x }} viewBox="0 0 1600 200" preserveAspectRatio="xMidYMax slice"
        className="w-[110%] h-full text-olive" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
        <g fill="hsl(var(--pale))" fillOpacity="0.55" strokeOpacity="0.7">
          {/* Zuma Rock */}
          <path d="M10 200 C 25 120, 60 70, 110 62 C 150 58, 175 95, 190 200 Z" />
          <path d="M70 110 q 10 20 0 40 M120 90 q 8 25 -4 50" fill="none" />
          {/* Kano city gate */}
          <path d="M210 200 V120 h10 v-8 h10 v8 h10 v-8 h10 v8 h10 v-8 h10 v8 h10 v-8 h10 v8 h10 V200 Z" />
          <path d="M240 200 V160 L260 130 L280 160 V200" fill="hsl(var(--mist))" />
          {/* Groundnut pyramids */}
          <path d="M320 200 h90 l-10 -14 h-70 z M330 186 h70 l-10 -14 h-50 z M340 172 h50 l-10 -14 h-30 z M350 158 h30 l-15 -16 z" />
          {/* National Theatre Lagos */}
          <path d="M430 200 V172 Q 510 120 590 172 V200 Z" />
          <path d="M450 162 Q 510 128 570 162 M470 150 L 470 172 M510 140 L510 172 M550 150 L550 172" fill="none" />
          <path d="M490 136 L510 116 L530 136" fill="none" />
          {/* Jaekel House */}
          <path d="M605 200 V150 h70 V200 Z M598 150 L640 124 L682 150 Z" />
          <path d="M615 200 v-18 a6 6 0 0 1 12 0 v18 M633 200 v-18 a6 6 0 0 1 12 0 v18 M651 200 v-18 a6 6 0 0 1 12 0 v18 M605 175 h70" fill="none" />
          {/* Three Wise Men */}
          <path d="M700 200 V140 a8 8 0 0 1 16 0 V200 Z M722 200 V128 a9 9 0 0 1 18 0 V200 Z M746 200 V144 a8 8 0 0 1 16 0 V200 Z" />
          {/* Lekki–Ikoyi Link Bridge pylon */}
          <path d="M770 186 H900 v6 H770 Z" />
          <path d="M834 186 V60 h4 V186" />
          <path d="M836 66 L775 186 M836 76 L790 186 M836 86 L805 186 M836 96 L820 186 M836 66 L897 186 M836 76 L882 186 M836 86 L867 186 M836 96 L852 186" fill="none" strokeWidth="1" />
          {/* Abuja City Gate */}
          <path d="M935 200 Q 945 170 948 120 V90 h18 V120 Q 968 170 980 200 Z" />
          <path d="M1015 200 Q 1025 170 1028 120 V90 h18 V120 Q 1048 170 1060 200 Z" />
          <path d="M944 82 h106 v10 h-106 z" />
          <path d="M966 82 L997 40 L1028 82 M966 82 L1028 40" fill="none" strokeWidth="1" />
          <path d="M987 30 h22 l-2 10 l4 6 h-24 l2 -8 z" fill="hsl(var(--lime))" fillOpacity="0.6" />
          {/* Aso Rock behind National Assembly */}
          <path d="M1070 200 C 1090 110, 1140 70, 1200 72 C 1260 74, 1300 120, 1320 200 Z" fillOpacity="0.35" />
          {/* National Assembly */}
          <path d="M1100 200 V168 h200 V200 Z" fill="#ffffff" fillOpacity="0.9" />
          <path d="M1170 168 V150 h60 V168 Z" fill="#ffffff" fillOpacity="0.9" />
          <path d="M1175 150 Q 1200 96 1225 150 Z" fill="hsl(var(--lime))" fillOpacity="0.55" />
          <path d="M1200 104 v-10" fill="none" />
          <path d="M1110 168 Q 1125 150 1140 168 Z M1260 168 Q 1275 150 1290 168 Z" fill="hsl(var(--lime))" fillOpacity="0.45" />
          <path d="M1185 200 v-20 M1200 200 v-20 M1215 200 v-20" fill="none" />
          {/* National Christian Centre */}
          <path d="M1345 200 V140 L1395 92 L1445 140 V200 Z" />
          <path d="M1395 92 V60 M1385 72 h20 M1380 200 v-30 a15 15 0 0 1 30 0 v30" fill="none" />
          {/* National Mosque */}
          <path d="M1475 200 V150 h100 V200 Z" />
          <path d="M1490 150 Q 1525 92 1560 150 Z" fill="hsl(var(--lime))" fillOpacity="0.45" />
          <path d="M1525 104 v-12 M1520 90 a5 5 0 1 0 10 0" fill="none" />
          <path d="M1462 200 V96 h6 V200 Z M1582 200 V96 h6 V200 Z M1462 96 l3 -12 l3 12 M1582 96 l3 -12 l3 12" />
        </g>
        <path d="M0 199 H1600" strokeOpacity="0.5" />
      </motion.svg>
    </div>
  );
};
export default Skyline;
