import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faChartLine, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

const testimonials = [
  {
    name: "Amina Bello",
    location: "Kano State",
    quote: "I never believed my vote mattered until Green People showed me — we are the majority. I registered my whole family.",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80&auto=format&fit=crop&crop=face",
  },
  {
    name: "Chidi Okonkwo",
    location: "Enugu State",
    quote: "From Nsukka to Lagos, this movement is real. I've brought 47 new voters into the fold. We are unstoppable.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80&auto=format&fit=crop&crop=face",
  },
  {
    name: "Tunde Adeyemi",
    location: "Lagos State",
    quote: "I'm 22 and I've never voted. Green People made me realise — if I don't vote, someone else decides my future.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80&auto=format&fit=crop&crop=face",
  },
];

const AnimatedCounter = ({ target, label, icon }: { target: number; label: string; icon: IconDefinition }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
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
        {count.toLocaleString("en-NG")}+
      </div>
      <div className="text-muted-foreground text-xs mt-1">{label}</div>
    </div>
  );
};

const Momentum = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
          className="grid grid-cols-3 gap-6 max-w-md mx-auto mb-16"
        >
          <AnimatedCounter target={247832} label="Members Joined" icon={faUsers} />
          <AnimatedCounter target={184621} label="Voters Registered" icon={faChartLine} />
          <AnimatedCounter target={34} label="States Reached" icon={faLocationDot} />
        </motion.div>

        {/* Testimonials */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-background border border-border rounded-xl p-6 md:p-8 relative">
            <div className="absolute top-4 left-6 text-4xl text-primary/10 font-bold">"</div>
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={false}
                animate={{
                  opacity: activeTestimonial === i ? 1 : 0,
                  x: activeTestimonial === i ? 0 : 15,
                }}
                transition={{ duration: 0.4 }}
                className={`${activeTestimonial === i ? "block" : "hidden"}`}
              >
                <p className="text-sm md:text-base text-foreground leading-relaxed mb-6 relative z-10">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-border"
                    loading="lazy"
                  />
                  <div>
                    <div className="font-semibold text-sm text-foreground">{t.name}</div>
                    <div className="text-muted-foreground text-xs">{t.location}</div>
                  </div>
                </div>
              </motion.div>
            ))}

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
          </div>
        </div>
      </div>
    </section>
  );
};

export default Momentum;
