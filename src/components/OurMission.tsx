import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { UserPlus, Megaphone, Target } from "lucide-react";
import registerVoters from "@/assets/register-voters.jpg";

const missions = [
  {
    icon: UserPlus,
    title: "Mass Voter Registration Drive",
    description:
      "We're going to every village, every market, every campus. If you're 18 and above, you should be registered. We make it easy.",
    stat: "10M+",
    statLabel: "Target New Voters",
  },
  {
    icon: Megaphone,
    title: "Build the Largest People Movement",
    description:
      "Not a party. Not a politician. A people movement. When millions move together, nothing can stop us.",
    stat: "36",
    statLabel: "States Mobilising",
  },
  {
    icon: Target,
    title: "Create Real Change for 2027",
    description:
      "Every new voter is a new voice. Every new voice makes the people stronger. 2027 will be decided by us — the people.",
    stat: "2027",
    statLabel: "Our Target Year",
  },
];

const OurMission = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="mission" className="py-24 md:py-32 relative overflow-hidden" ref={ref}>
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              className="text-accent font-semibold text-sm uppercase tracking-widest mb-4 block"
            >
              Our Mission
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl font-black text-foreground mb-12 leading-tight"
            >
              Three goals.
              <br />
              <span className="text-gradient-green">One green future.</span>
            </motion.h2>

            <div className="space-y-8">
              {missions.map((mission, i) => (
                <motion.div
                  key={mission.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.15 }}
                  className="flex gap-5 group"
                >
                  <div className="shrink-0 w-14 h-14 rounded-xl gradient-green flex items-center justify-center group-hover:scale-110 transition-transform">
                    <mission.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-3 mb-1">
                      <h3 className="font-bold text-lg text-foreground">{mission.title}</h3>
                      <span className="text-accent font-bold text-sm">{mission.stat}</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {mission.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl shadow-primary/10">
              <img
                src={registerVoters}
                alt="Nigerians registering to vote"
                className="w-full h-auto object-cover"
                loading="lazy"
                width={1280}
                height={720}
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground px-6 py-4 rounded-2xl shadow-xl">
              <div className="text-3xl font-black">10M+</div>
              <div className="text-sm text-primary-foreground/80">Voters Target</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OurMission;
