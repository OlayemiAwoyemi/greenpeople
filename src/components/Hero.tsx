import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCheckToSlot } from "@fortawesome/free-solid-svg-icons";
import greenpeopleBg from "@/assets/green_people_bg.jpg";

const Hero = () => {
  return (
    <section className="gp-frame bg-background pt-12 md:pt-20 pb-16 md:pb-24">
      <div className="section-container">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left: editorial headline */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="gp-eyebrow mb-6"
            >
              A People's Movement
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="gp-display text-foreground text-[40px] sm:text-5xl md:text-6xl lg:text-[64px] xl:text-[72px] mb-8"
            >
              How everyday Nigerians are taking back 2027 — one new voter at a time.
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="flex flex-wrap items-center gap-3"
            >
              <a href="#join" className="gp-pill-primary group">
                Join the movement
                <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="https://cvr.inecnigeria.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="gp-pill-ghost border border-border"
              >
                <FontAwesomeIcon icon={faCheckToSlot} className="w-3.5 h-3.5 mr-2" />
                Register to vote
              </a>
            </motion.div>
          </div>

          {/* Right: image card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="rounded-2xl overflow-hidden bg-secondary aspect-[4/5] sm:aspect-[5/6] lg:aspect-[4/5]">
              <img
                src={greenpeopleBg}
                alt="Green People Movement"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>

        {/* Two pastel info cards */}
        <div className="grid sm:grid-cols-2 gap-4 mt-12 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="gp-card-blue"
          >
            <div className="gp-display text-[28px] md:text-[32px] text-foreground mb-2">
              10M+ <span className="block text-[20px] md:text-[22px] font-semibold">new voters</span>
            </div>
            <p className="text-[14px] text-foreground/70 mt-4">
              Our 2027 target — every village, market and campus.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="gp-card-mint"
          >
            <div className="gp-display text-[28px] md:text-[32px] text-foreground mb-2">
              36 + FCT <span className="block text-[20px] md:text-[22px] font-semibold">mobilising</span>
            </div>
            <p className="text-[14px] text-foreground/70 mt-4">
              From Lagos to Kano, Port Harcourt to Maiduguri.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
