import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faBullhorn, faBullseye } from "@fortawesome/free-solid-svg-icons";
import missionPeople from "@/assets/mission-people.webp";

const missions = [
  {
    icon: faUserPlus,
    title: "Mass Voter Registration Drive",
    description:
      "We're going to every village, every market, every campus. If you're 18 and above, you should be registered.",
    stat: "10M+",
    statLabel: "Target New Voters",
  },
  {
    icon: faBullhorn,
    title: "Build the Largest People Movement",
    description:
      "Not a party. Not a politician. A people movement. When millions move together, nothing can stop us.",
    stat: "36+FCT",
    statLabel: "States Mobilising",
  },
  {
    icon: faBullseye,
    title: "Create Real Change for 2027",
    description:
      "Every new voter is a new voice. Every new voice makes the people stronger. 2027 will be decided by us.",
    stat: "2027",
    statLabel: "Our Target Year",
  },
];

const OurMission = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="mission" className="py-20 md:py-28" ref={ref}>
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              className="eyebrow"
            >
              Our mission
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-[2.75rem] font-bold text-foreground mb-10 leading-tight"
            >
              Three goals. <span className="text-gradient-green">One green future.</span>
            </motion.h2>

            <div className="space-y-6">
              {missions.map((mission, i) => (
                <motion.div
                  key={mission.title}
                  initial={{ opacity: 0, x: -15 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.15 + i * 0.1 }}
                  className="flex gap-4 group"
                >
                  <div className="shrink-0 icon-chip w-11 h-11">
                    <FontAwesomeIcon icon={mission.icon} className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-foreground">{mission.title}</h3>
                      <span className="text-olive font-bold text-sm">{mission.stat}</span>
                    </div>
                    <p className="text-muted-foreground text-[15px] leading-relaxed">
                      {mission.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative"
          >
            <div className="rounded-glass overflow-hidden shadow-[0_24px_60px_-28px_rgba(14,49,51,0.45)]">
              <img
                src={missionPeople}
                alt="Nigerians of every age and walk of life standing together with fists raised"
                className="w-full h-80 md:h-96 object-cover object-[50%_35%]"
                width={1200}
                height={960}
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 glass px-5 py-3">
              <div className="text-xl font-bold">10M+</div>
              <div className="text-sm text-muted-foreground font-semibold">Voters target</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OurMission;
