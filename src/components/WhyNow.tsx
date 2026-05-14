import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faHandshake, faSeedling } from "@fortawesome/free-solid-svg-icons";

const features = [
  {
    icon: faUsers,
    title: "Youth Power",
    description:
      "Over 60% of Nigerians are under 35. Your generation has the numbers to decide 2027. But only if you register and vote.",
  },
  {
    icon: faHandshake,
    title: "Unity Across States",
    description:
      "North, South, East, West — our strength is in our diversity. One movement, 36 states + FCT, one green future.",
  },
  {
    icon: faSeedling,
    title: "Sustainable Future",
    description:
      "Jobs, clean environment, opportunity for every child. A Nigeria where your hard work actually pays off.",
  },
];

const WhyNow = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="why-now" className="py-20 md:py-32 bg-white" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="text-primary font-semibold text-xs uppercase tracking-widest mb-3 block">
            The Time is Now
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
            Nigeria is ready for something new
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Our youth want jobs and a future. Our parents want security and good schools.
            Our elders want legacy and peace. <strong className="text-foreground">This is our moment.</strong>
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
              className="glass-card p-10 text-center hover:shadow-2xl hover:-translate-y-2 transition-all border-none"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-6">
                <FontAwesomeIcon icon={feature.icon} className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-4">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyNow;
