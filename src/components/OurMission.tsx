import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faBullhorn, faBullseye } from "@fortawesome/free-solid-svg-icons";
import missionHands from "@/assets/mission-hands.jpg";

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
    <section id="mission" className="py-20 md:py-28 bg-secondary/30" ref={ref}>
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              className="text-primary font-semibold text-xs uppercase tracking-widest mb-3 block"
            >
              Our Mission
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="text-2xl md:text-3xl font-bold text-foreground mb-10 leading-tight"
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
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <FontAwesomeIcon icon={mission.icon} className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <h3 className="font-semibold text-sm text-foreground">{mission.title}</h3>
                      <span className="text-primary font-bold text-xs">{mission.stat}</span>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">
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
            <div className="rounded-xl overflow-hidden">
              <img
                src={missionHands}
                alt="Nigerian community joining hands with green wristbands for voter registration"
                className="w-full h-80 object-cover"
                width={1024}
                height={832}
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-accent text-accent-foreground px-4 py-3 rounded-lg shadow-lg">
              <div className="text-xl font-bold">10M+</div>
              <div className="text-xs text-accent-foreground/80">Voters Target</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OurMission;
