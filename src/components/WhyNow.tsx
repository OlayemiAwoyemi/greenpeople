import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Users, Handshake, Sprout } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Youth Power",
    description:
      "Over 60% of Nigerians are under 35. Your generation has the numbers to decide 2027. But only if you register and vote.",
  },
  {
    icon: Handshake,
    title: "Unity Across States",
    description:
      "North, South, East, West — our strength is in our diversity. One movement, 36 states, one green future.",
  },
  {
    icon: Sprout,
    title: "Sustainable Future",
    description:
      "Jobs, clean environment, opportunity for every child. A Nigeria where your hard work actually pays off.",
  },
];

const WhyNow = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="why-now" className="py-24 md:py-32 bg-warm-white relative overflow-hidden" ref={ref}>
      {/* Subtle green accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-widest mb-4 block">
            The Time is Now
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-tight">
            Nigeria is ready for
            <br />
            <span className="text-gradient-green">something new</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
            Our youth want jobs and a future. Our parents want security and good schools.
            Our elders want legacy and peace. Every Nigerian deserves a country that works.
            <strong className="text-foreground"> This is our moment.</strong>
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
              className="glass-card p-8 text-center group hover:shadow-xl hover:shadow-primary/5 transition-shadow"
            >
              <div className="w-16 h-16 rounded-2xl gradient-green flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-xl text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyNow;
