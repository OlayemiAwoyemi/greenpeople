import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const values = [
  { kicker: "Leadership", title: "Clean, honest leadership", description: "No more business as usual. We demand leaders who serve the people, not themselves." },
  { kicker: "People", title: "Youth & women at the centre", description: "The future belongs to young Nigerians and the women who hold our communities together." },
  { kicker: "Unity", title: "One united Nigeria", description: "Beyond tribe, beyond religion. We are one people, one nation, one destiny." },
  { kicker: "Future", title: "A green future", description: "Real jobs, clean environment, sustainable opportunity. A Nigeria that prospers for generations." },
  { kicker: "Power", title: "Power belongs to the people", description: "Not to the elite. Not to the connected. To you. To every ordinary Nigerian who dares to believe." },
  { kicker: "Justice", title: "Justice & accountability", description: "Equal rights for all. Leaders held to account. No one above the law, no one beneath it." },
  { kicker: "Trust", title: "Open books, total transparency", description: "Every naira in, every naira out — public for all to see. Trust is built in the open." },
];

const tints = ["gp-card-mint", "gp-card-blue", "gp-card-cream", "gp-card-lilac", "gp-card-mint", "gp-card-blue", "gp-card-cream"];

const WhatWeStandFor = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="values" className="gp-frame bg-background py-20 md:py-28" ref={ref}>
      <div className="gp-divider" />
      <div className="section-container pt-16 md:pt-20">
        <motion.div
          initial={false}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="max-w-3xl mb-14"
        >
          <div className="gp-eyebrow mb-5">Our values</div>
          <h2 className="gp-display text-foreground text-[34px] md:text-[44px] lg:text-[52px]">
            What we stand for.
          </h2>
          <p className="text-foreground/70 text-[16px] md:text-[17px] mt-6 max-w-xl leading-relaxed">
            These are not just words. They are promises we make to every Nigerian.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              initial={false}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.05 + i * 0.05 }}
              className={tints[i]}
            >
              <div className="gp-eyebrow mb-3">{value.kicker}</div>
              <h3 className="gp-display text-[20px] md:text-[22px] text-foreground mb-3">{value.title}</h3>
              <p className="text-foreground/70 text-[14px] leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeStandFor;
