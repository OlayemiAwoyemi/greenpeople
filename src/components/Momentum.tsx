import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { initialsAfterFirst, normalizeName } from "@/lib/textNormalize";

const AnimatedCounter = ({ target, label }: { target: number; label: string }) => {
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
    <div ref={ref}>
      <div className="gp-display text-foreground text-[40px] md:text-[56px]">
        {count.toLocaleString("en-NG")}
      </div>
      <div className="text-foreground/60 text-[13px] mt-1">{label}</div>
    </div>
  );
};

const Momentum = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [stats, setStats] = useState({ members: 0, pvcHolders: 0, states: 0, lgas: 0 });
  const [testimonials, setTestimonials] = useState<{ full_name: string; state: string; reason: string }[]>([]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { count: totalMembers } = await supabase
        .from("members").select("*", { count: "exact", head: true });

      const { count: totalPvc } = await supabase
        .from("members").select("*", { count: "exact", head: true })
        .eq("has_pvc", "Yes");

      const { data: locationData } = await supabase
        .from("members").select("state, lga");

      const uniqueStates = new Set(locationData?.map(m => m.state) || []);
      const uniqueLgas = new Set(locationData?.map(m => `${m.state}|${m.lga}`) || []);

      setStats({
        members: totalMembers || 0,
        pvcHolders: totalPvc || 0,
        states: uniqueStates.size,
        lgas: uniqueLgas.size,
      });

      const { data: reasons } = await supabase
        .from("members")
        .select("full_name, state, reason")
        .not("reason", "is", null)
        .not("reason", "eq", "")
        .order("created_at", { ascending: false })
        .limit(20);

      if (reasons && reasons.length > 0) {
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
    <section id="momentum" className="gp-frame bg-background py-20 md:py-28" ref={ref}>
      <div className="gp-divider" />
      <div className="section-container pt-16 md:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="max-w-3xl mb-14"
        >
          <div className="gp-eyebrow mb-5">Momentum</div>
          <h2 className="gp-display text-foreground text-[34px] md:text-[44px] lg:text-[52px]">
            The movement is growing — every day.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 mb-20"
        >
          <AnimatedCounter target={stats.members} label="Members joined" />
          <AnimatedCounter target={stats.pvcHolders} label="PVC holders" />
          <AnimatedCounter target={stats.states} label="States reached" />
          <AnimatedCounter target={stats.lgas} label="LGAs reached" />
        </motion.div>

        {testimonials.length > 0 && (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4">
              <div className="gp-eyebrow mb-3">Testimonials</div>
              <h3 className="gp-display text-[26px] md:text-[30px] text-foreground">
                Why people believe in Green People.
              </h3>
            </div>
            <div className="lg:col-span-8">
              <div className="gp-card-cream relative min-h-[200px]">
                {testimonials.map((t, i) => (
                  <motion.div
                    key={i}
                    initial={false}
                    animate={{
                      opacity: activeTestimonial === i ? 1 : 0,
                    }}
                    transition={{ duration: 0.4 }}
                    className={activeTestimonial === i ? "block" : "hidden"}
                  >
                    <p className="gp-display text-[20px] md:text-[26px] text-foreground leading-snug mb-6">
                      "{t.reason}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm">
                        {normalizeName(t.full_name).charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-[14px] text-foreground">{initialsAfterFirst(t.full_name)}</div>
                        <div className="text-foreground/60 text-[13px]">{t.state}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {testimonials.length > 1 && (
                  <div className="flex gap-1.5 mt-8">
                    {testimonials.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveTestimonial(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          activeTestimonial === i ? "bg-foreground w-6" : "bg-foreground/20 w-1.5"
                        }`}
                        aria-label={`Show testimonial ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Momentum;
