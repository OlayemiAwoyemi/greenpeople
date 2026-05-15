import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import missionHands from "@/assets/mission-hands.jpg";

const missions = [
  {
    stat: "10M+",
    label: "Target new voters",
    title: "Mass voter registration drive",
    description:
      "We're going to every village, every market, every campus. If you're 18 and above, you should be registered.",
    tint: "gp-card-blue",
  },
  {
    stat: "36 + FCT",
    label: "States mobilising",
    title: "Build the largest people movement",
    description:
      "Not a party. Not a politician. A people movement. When millions move together, nothing can stop us.",
    tint: "gp-card-mint",
  },
  {
    stat: "2027",
    label: "Our target year",
    title: "Create real change for 2027",
    description:
      "Every new voter is a new voice. Every new voice makes the people stronger. 2027 will be decided by us.",
    tint: "gp-card-cream",
  },
];

const OurMission = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="mission" className="gp-frame bg-background py-20 md:py-28" ref={ref}>
      <div className="gp-divider" />
      <div className="section-container pt-16 md:pt-20">
        <div className="grid lg:grid-cols-12 gap-10 items-start mb-12">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              className="gp-eyebrow mb-5"
            >
              Our mission
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="gp-display text-foreground text-[34px] md:text-[44px] lg:text-[52px]"
            >
              Three goals. One green future for every Nigerian.
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:col-span-5"
          >
            <div className="rounded-2xl overflow-hidden aspect-[4/3]">
              <img
                src={missionHands}
                alt="Nigerian community joining hands with green wristbands for voter registration"
                className="w-full h-full object-cover"
                width={1024}
                height={832}
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {missions.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 14 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 + i * 0.08 }}
              className={m.tint}
            >
              <div className="gp-display text-foreground text-[28px] md:text-[32px]">{m.stat}</div>
              <div className="text-[13px] text-foreground/60 mt-1">{m.label}</div>
              <h3 className="font-semibold text-foreground text-[15px] mt-5">{m.title}</h3>
              <p className="text-foreground/70 text-[14px] leading-relaxed mt-2">{m.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurMission;
