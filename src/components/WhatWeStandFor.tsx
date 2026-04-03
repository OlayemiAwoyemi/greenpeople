import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Heart, Globe, Leaf, Users } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Clean, Honest Leadership",
    description: "No more business as usual. We demand leaders who serve the people, not themselves.",
  },
  {
    icon: Heart,
    title: "Youth & Women at the Centre",
    description: "The future belongs to young Nigerians and the women who hold our communities together.",
  },
  {
    icon: Globe,
    title: "One United Nigeria",
    description: "Beyond tribe, beyond religion. We are one people, one nation, one destiny.",
  },
  {
    icon: Leaf,
    title: "Green Future",
    description: "Real jobs, clean environment, sustainable opportunity. A Nigeria that prospers for generations.",
  },
  {
    icon: Users,
    title: "Power Belongs to the People",
    description: "Not to the elite. Not to the connected. To you. To every ordinary Nigerian who dares to believe.",
  },
];

const WhatWeStandFor = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="values" className="py-24 md:py-32 bg-warm-white" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-widest mb-4 block">
            Our Values
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-tight">
            What we <span className="text-gradient-green">stand for</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            These are not just words. They are promises we make to every Nigerian — from every village to every city.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.1 }}
              className={`glass-card p-8 group hover:shadow-lg hover:shadow-primary/5 transition-all ${
                i === 4 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-green-light flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <value.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">{value.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeStandFor;
