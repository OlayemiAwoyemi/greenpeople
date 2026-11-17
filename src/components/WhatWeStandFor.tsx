import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved, faHeart, faGlobe, faLeaf, faUsers, faScaleBalanced, faEye } from "@fortawesome/free-solid-svg-icons";

const values = [
  {
    icon: faShieldHalved,
    title: "Clean, Honest Leadership",
    description: "No more business as usual. We demand leaders who serve the people, not themselves.",
  },
  {
    icon: faHeart,
    title: "Youth & Women at the Centre",
    description: "The future belongs to young Nigerians and the women who hold our communities together.",
  },
  {
    icon: faGlobe,
    title: "One United Nigeria",
    description: "Beyond tribe, beyond religion. We are one people, one nation, one destiny.",
  },
  {
    icon: faLeaf,
    title: "Green Future",
    description: "Real jobs, clean environment, sustainable opportunity. A Nigeria that prospers for generations.",
  },
  {
    icon: faUsers,
    title: "Power Belongs to the People",
    description: "Not to the elite. Not to the connected. To you. To every ordinary Nigerian who dares to believe.",
  },
  {
    icon: faScaleBalanced,
    title: "Justice & Accountability",
    description: "Equal rights for all. Leaders held to account. No one above the law, no one beneath it.",
  },
  {
    icon: faEye,
    title: "Open Books, Total Transparency",
    description: "Every naira in, every naira out — public for all to see. Trust is built in the open.",
  },
];

const WhatWeStandFor = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="values" className="py-20 md:py-28" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="eyebrow">
            Our values
          </span>
          <h2 className="text-3xl md:text-[2.75rem] font-bold text-foreground mb-3 leading-tight">
            What we stand for
          </h2>
          <p className="text-muted-foreground text-lg">
            These are not just words. They are promises we make to every Nigerian.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.05 + i * 0.08 }}
              className="glass p-6 transition-transform hover:-translate-y-1"
            >
              <div className="icon-chip w-11 h-11 mb-4">
                <FontAwesomeIcon icon={value.icon} className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-1">{value.title}</h3>
              <p className="text-muted-foreground text-[15px] leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeStandFor;
