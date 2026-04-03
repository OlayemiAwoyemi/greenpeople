import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { MapPin, TrendingUp, Users } from "lucide-react";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";

const testimonials = [
  {
    name: "Amina Bello",
    location: "Kano State",
    quote: "I never believed my vote mattered until Green People showed me — we are the majority. I registered my whole family.",
    image: testimonial1,
  },
  {
    name: "Chidi Okonkwo",
    location: "Enugu State",
    quote: "From Nsukka to Lagos, this movement is real. I've brought 47 new voters into the fold. We are unstoppable.",
    image: testimonial2,
  },
  {
    name: "Tunde Adeyemi",
    location: "Lagos State",
    quote: "I'm 22 and I've never voted. Green People made me realise — if I don't vote, someone else decides my future.",
    image: testimonial3,
  },
];

const AnimatedCounter = ({ target, label, icon: Icon }: { target: number; label: string; icon: typeof Users }) => {
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
      <Icon className="w-8 h-8 text-accent mx-auto mb-3" />
      <div className="text-4xl md:text-5xl font-black text-foreground">
        {count.toLocaleString("en-NG")}+
      </div>
      <div className="text-muted-foreground text-sm mt-1">{label}</div>
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
    <section id="momentum" className="py-24 md:py-32" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-widest mb-4 block">
            Momentum
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-tight">
            The movement is <span className="text-gradient-green">growing</span>
          </h2>
        </motion.div>

        {/* Counters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-20"
        >
          <AnimatedCounter target={247832} label="Members Joined" icon={Users} />
          <AnimatedCounter target={184621} label="New Voters Registered" icon={TrendingUp} />
          <AnimatedCounter target={34} label="States Reached" icon={MapPin} />
        </motion.div>

        {/* Nigeria map stylized */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.3 }}
          className="max-w-lg mx-auto mb-20 text-center"
        >
          <div className="relative inline-block">
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-green-light border-4 border-primary/20 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
              <div className="text-center relative z-10">
                <div className="text-5xl md:text-6xl font-black text-primary">🇳🇬</div>
                <div className="text-primary font-bold text-lg mt-2">34 of 36 States</div>
                <div className="text-muted-foreground text-sm">and growing every day</div>
              </div>
            </div>
            {/* Pulsing dots around the circle */}
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <div
                key={deg}
                className="absolute w-3 h-3 bg-accent rounded-full animate-pulse"
                style={{
                  top: `${50 + 48 * Math.sin((deg * Math.PI) / 180)}%`,
                  left: `${50 + 48 * Math.cos((deg * Math.PI) / 180)}%`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Testimonials */}
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-6 left-8 text-7xl text-primary/10 font-display">"</div>
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={false}
                animate={{
                  opacity: activeTestimonial === i ? 1 : 0,
                  x: activeTestimonial === i ? 0 : 20,
                }}
                transition={{ duration: 0.5 }}
                className={`${activeTestimonial === i ? "block" : "hidden"}`}
              >
                <p className="text-xl md:text-2xl text-foreground leading-relaxed mb-8 relative z-10">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
                    loading="lazy"
                    width={56}
                    height={56}
                  />
                  <div>
                    <div className="font-bold text-foreground">{t.name}</div>
                    <div className="text-muted-foreground text-sm">{t.location}</div>
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="flex gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-3 h-3 rounded-full transition-colors ${
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
