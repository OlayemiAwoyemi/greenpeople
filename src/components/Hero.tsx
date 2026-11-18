import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCheckToSlot, faShieldHalved, faHeart, faGlobe, faLeaf, faUsers, faScaleBalanced, faEye } from "@fortawesome/free-solid-svg-icons";
import LiveCounter from "./LiveCounter";
import Skyline from "./sky/Skyline";

const values = [
  { icon: faShieldHalved, title: "Clean leadership", desc: "Leaders who serve the people" },
  { icon: faHeart, title: "Youth & women", desc: "At the centre of our future" },
  { icon: faGlobe, title: "One Nigeria", desc: "Beyond tribe and religion" },
  { icon: faLeaf, title: "Green future", desc: "Jobs and sustainability" },
  { icon: faUsers, title: "People power", desc: "Power belongs to you" },
  { icon: faScaleBalanced, title: "Justice", desc: "Accountability for all" },
  { icon: faEye, title: "Open books", desc: "Total finance transparency" },
];

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 12, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.4, ease: "easeOut" as const, delay },
});

const Hero = () => (
  <section className="relative min-h-screen flex flex-col justify-center overflow-hidden" aria-labelledby="hero-title">
    <div className="relative z-10 section-container pt-28 pb-10 md:pt-36">
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <motion.div {...rise(0)} className="glass !rounded-full inline-flex items-center gap-2 px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-foreground text-sm font-semibold whitespace-nowrap">The movement is live</span>
          </motion.div>

          <motion.h1 id="hero-title" {...rise(0.08)} className="text-[2.6rem] sm:text-5xl md:text-6xl font-extrabold text-foreground leading-[1.05] mb-5">
            Green People Movement
          </motion.h1>

          <motion.p {...rise(0.16)} className="text-muted-foreground text-lg md:text-xl max-w-lg mb-8 leading-relaxed">
            We are registering millions of new voters to own 2027.
            Join the biggest people-powered movement Nigeria has ever seen.
          </motion.p>

          <motion.div {...rise(0.24)} className="flex flex-col sm:flex-row items-start gap-3 mb-8">
            <a href="#join" className="btn-primary group">
              Join the movement
              <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a href="https://cvr.inecnigeria.org/" target="_blank" rel="noopener noreferrer" className="btn-glass">
              <FontAwesomeIcon icon={faCheckToSlot} className="w-3.5 h-3.5" />
              Register to vote
            </a>
          </motion.div>

          <LiveCounter />

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.6 }} className="mt-6 text-muted-foreground text-sm">
            From Lagos to Kano, Port Harcourt to Maiduguri — one green future for every Nigerian
          </motion.p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {values.map((v, i) => (
            <motion.div key={v.title}
              initial={{ opacity: 0, scale: 0.94, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.4 + i * 0.07 }}
              className={`glass !rounded-3xl p-4 ${i === values.length - 1 ? "col-span-2 sm:col-span-1" : ""}`}>
              <div className="icon-chip w-9 h-9 mb-2 !bg-primary"><FontAwesomeIcon icon={v.icon} className="w-3.5 h-3.5 text-primary-foreground" /></div>
              <h3 className="font-semibold text-[15px] text-foreground">{v.title}</h3>
              <p className="text-muted-foreground text-sm leading-snug">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
    <Skyline withGate className="h-56 sm:h-72 md:h-96 mt-auto" />
  </section>
);

export default Hero;
