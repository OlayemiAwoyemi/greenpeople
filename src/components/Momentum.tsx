import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faChartLine, faLocationDot, faIdCard } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "@/integrations/supabase/client";
import { initialsAfterFirst, normalizeName } from "@/lib/textNormalize";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

const AnimatedCounter = ({ target, label, icon }: { target: number; label: string; icon: IconDefinition }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView || target === 0) return;
    let start = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 30);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <div ref={ref} className="glass text-center p-5">
      <div className="icon-chip w-10 h-10 mx-auto mb-3"><FontAwesomeIcon icon={icon} className="w-4 h-4" /></div>
      <div className="text-3xl md:text-[2.75rem] font-bold text-foreground">
        {count.toLocaleString("en-NG")}
      </div>
      <div className="text-muted-foreground text-sm font-semibold mt-1">{label}</div>
    </div>
  );
};

const Momentum = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [stats, setStats] = useState({ members: 0, pvcHolders: 0, states: 0, lgas: 0 });
  const [testimonials, setTestimonials] = useState<{ full_name: string; state: string; reason: string }[]>([]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: statRows } = await supabase.rpc("public_member_stats");
      const s = statRows?.[0];
      setStats({
        members: Number(s?.members ?? 0),
        pvcHolders: Number(s?.pvc_holders ?? 0),
        states: Number(s?.states ?? 0),
        lgas: Number(s?.lgas ?? 0),
      });

      const { data: reasons } = await supabase.rpc("public_testimonials", { p_limit: 20 });

      if (reasons && reasons.length > 0) {
        // Shuffle on every page load
        const shuffled = [...reasons]
          .filter((r) => r.reason)
          .sort(() => Math.random() - 0.5)
          .slice(0, 10);
        setTestimonials(shuffled as { full_name: string; state: string; reason: string }[]);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section id="momentum" className="py-20 md:py-28" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="eyebrow">
            Momentum
          </span>
          <h2 className="text-3xl md:text-[2.75rem] font-bold text-foreground mb-3 leading-tight">
            The movement is growing
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16"
        >
          <AnimatedCounter target={stats.members} label="Members joined" icon={faUsers} />
          <AnimatedCounter target={stats.pvcHolders} label="PVC holders" icon={faIdCard} />
          <AnimatedCounter target={stats.states} label="States reached" icon={faLocationDot} />
          <AnimatedCounter target={stats.lgas} label="LGAs reached" icon={faChartLine} />
        </motion.div>

        {/* Real testimonials from form submissions */}
        {testimonials.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <h3 className="text-center text-base font-semibold text-muted-foreground mb-6">
              Why people believe in Green People
            </h3>
            <div className="glass p-6 md:p-8 relative min-h-[140px]">
              <div className="absolute top-4 left-6 text-4xl text-primary/10 font-bold">"</div>
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{
                    opacity: activeTestimonial === i ? 1 : 0,
                    x: activeTestimonial === i ? 0 : 15,
                  }}
                  transition={{ duration: 0.4 }}
                  className={`${activeTestimonial === i ? "block" : "hidden"}`}
                >
                  <p className="text-sm md:text-base text-foreground leading-relaxed mb-6 relative z-10">
                    "{t.reason}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {normalizeName(t.full_name).charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">{initialsAfterFirst(t.full_name)}</div>
                      <div className="text-muted-foreground text-xs">{t.state}</div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {testimonials.length > 1 && (
                <div className="flex gap-1.5 mt-6">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTestimonial(i)}
                      aria-label={`Show testimonial ${i + 1}`}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        activeTestimonial === i ? "bg-primary" : "bg-border"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Momentum;
