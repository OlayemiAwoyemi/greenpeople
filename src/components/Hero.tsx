import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCheckToSlot, faShieldHalved, faHeart, faGlobe, faLeaf, faUsers, faScaleBalanced, faEye } from "@fortawesome/free-solid-svg-icons";
import LiveCounter from "./LiveCounter";
import greenpeopleBg from "@/assets/green_people_bg.jpg";

const values = [
  { icon: faShieldHalved, title: "Clean Leadership", desc: "Leaders who serve the people" },
  { icon: faHeart, title: "Youth & Women", desc: "At the centre of our future" },
  { icon: faGlobe, title: "One Nigeria", desc: "Beyond tribe and religion" },
  { icon: faLeaf, title: "Green Future", desc: "Jobs and sustainability" },
  { icon: faUsers, title: "People Power", desc: "Power belongs to you" },
  { icon: faScaleBalanced, title: "Justice", desc: "Accountability for all" },
  { icon: faEye, title: "Open Books", desc: "Total finance transparency" },
];

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={greenpeopleBg}
          alt="Green People Movement"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-accent/95 via-accent/85 to-accent/70" />
      </div>

      <div className="relative z-20 section-container py-28 md:py-36">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-3 py-1.5 mb-5"
            >
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              <span className="text-primary-foreground/90 text-xs font-medium whitespace-nowrap">
                The Movement is Live
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground leading-tight mb-4"
            >
              Green People Movement
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-primary-foreground/80 text-base md:text-lg max-w-lg mb-7 leading-relaxed"
            >
              We are registering millions of new voters to own 2027.
              Join the biggest people-powered movement Nigeria has ever seen.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-start gap-3 mb-7"
            >
              <a
                href="#join"
                className="group bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                Join the Movement
                <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="https://cvr.inecnigeria.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/30 text-primary-foreground px-6 py-3 rounded-lg text-sm font-semibold hover:bg-primary-foreground/20 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <FontAwesomeIcon icon={faCheckToSlot} className="w-3.5 h-3.5" />
                Register to Vote
              </a>
            </motion.div>

            <LiveCounter />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="mt-5 text-primary-foreground/50 text-xs"
            >
              From Lagos to Kano, Port Harcourt to Maiduguri — one green future for every Nigerian
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="hidden lg:grid grid-cols-2 gap-3"
          >
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="bg-primary-foreground/8 backdrop-blur-sm border border-primary-foreground/15 rounded-xl p-4 hover:bg-primary-foreground/12 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center mb-2">
                  <FontAwesomeIcon icon={v.icon} className="w-3.5 h-3.5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm text-primary-foreground mb-0.5">{v.title}</h3>
                <p className="text-primary-foreground/60 text-xs">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
