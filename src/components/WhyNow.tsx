import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    kicker: "01",
    title: "Youth power",
    description:
      "Over 60% of Nigerians are under 35. Your generation has the numbers to decide 2027 — but only if you register and vote.",
  },
  {
    kicker: "02",
    title: "Unity across states",
    description:
      "North, South, East, West — our strength is in our diversity. One movement, 36 states + FCT, one green future.",
  },
  {
    kicker: "03",
    title: "A sustainable future",
    description:
      "Jobs, clean environment, opportunity for every child. A Nigeria where your hard work actually pays off.",
  },
];

const WhyNow = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="why-now" className="gp-frame bg-background py-20 md:py-28" ref={ref}>
      <div className="gp-divider" />
      <div className="section-container pt-16 md:pt-20">
        <motion.div
          initial={false}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-14"
        >
          <div className="gp-eyebrow mb-5">Why now</div>
          <h2 className="gp-display text-foreground text-[34px] md:text-[44px] lg:text-[52px]">
            Nigeria is ready for something new.
          </h2>
          <p className="text-foreground/70 text-[16px] md:text-[17px] mt-6 max-w-2xl leading-relaxed">
            Our youth want jobs and a future. Our parents want security and good schools. Our elders want legacy and peace.
            <span className="text-foreground font-semibold"> This is our moment.</span>
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={false}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
              className="gp-card-white"
            >
              <div className="gp-eyebrow mb-3">{feature.kicker}</div>
              <h3 className="gp-display text-[22px] md:text-[24px] text-foreground mb-3">{feature.title}</h3>
              <p className="text-foreground/70 text-[14.5px] leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyNow;
