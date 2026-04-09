import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faChartLine, faLocationDot, faIdCard } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "@/integrations/supabase/client";
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
    <div ref={ref} className="text-center">
      <FontAwesomeIcon icon={icon} className="w-5 h-5 text-primary mx-auto mb-2" />
      <div className="text-2xl md:text-3xl font-bold text-foreground">
        {count.toLocaleString("en-NG")}
      </div>
      <div className="text-muted-foreground text-xs mt-1">{label}</div>
    </div>
  );
};

const Momentum = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [stats, setStats] = useState({ members: 0, pvcHolders: 0, states: 0 });
  const [testimonials, setTestimonials] = useState<{ full_name: string; state: string; reason: string }[]>([]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { count: totalMembers } = await supabase
        .from("members").select("*", { count: "exact", head: true });

      const { count: totalPvc } = await supabase
        .from("members").select("*", { count: "exact", head: true })
        .eq("has_pvc", "Yes");

      const { data: statesData } = await supabase
        .from("members").select("state");

      const uniqueStates = new Set(statesData?.map(m => m.state) || []);

      setStats({
        members: totalMembers || 0,
        pvcHolders: totalPvc || 0,
        states: uniqueStates.size,
      });

      const { data: reasons } = await supabase
        .from("members")
        .select("full_name, state, reason")
        .not("reason", "is", null)
        .not("reason", "eq", "")
        .order("created_at", { ascending: false })
        .limit(10);

      if (reasons && reasons.length > 0) {
        setTestimonials(reasons.filter(r => r.reason) as { full_name: string; state: string; reason: string }[]);
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
    <section id="momentum" className="py-20 md:py-28 bg-secondary/30" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="text-primary font-semibold text-xs uppercase tracking-widest mb-3 block">
            Momentum
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 leading-tight">
            The movement is growing
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-lg md:max-w-2xl mx-auto mb-16"
        >
          <AnimatedCounter target={stats.members} label="Members Joined" icon={faUsers} />
          <AnimatedCounter target={stats.pvcHolders} label="PVC Holders" icon={faIdCard} />
          <AnimatedCounter target={stats.states} label="States Reached" icon={faLocationDot} />
          <AnimatedCounter target={stats.members > 0 ? Math.round(stats.members * 3.5) : 0} label="Lives Impacted" icon={faChartLine} />
        </motion.div>

        {/* Real testimonials from form submissions */}
        {testimonials.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <h3 className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-6">
              Why People Believe in Green People
            </h3>
            <div className="bg-background border border-border rounded-xl p-6 md:p-8 relative min-h-[140px]">
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
                      {t.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">{t.full_name}</div>
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
                      className={`w-2 h-2 rounded-full transition-colors ${
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
