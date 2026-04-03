import { motion } from "framer-motion";
import { ArrowRight, Vote } from "lucide-react";
import heroPeople from "@/assets/hero-people.jpg";
import LiveCounter from "./LiveCounter";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroPeople}
          alt="Diverse Nigerians standing together in unity"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/60 to-foreground/80" />
      </div>

      {/* Nigerian flag accent stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 flex">
        <div className="flex-1 bg-primary" />
        <div className="flex-1 bg-primary-foreground" />
        <div className="flex-1 bg-primary" />
      </div>

      <div className="relative z-20 section-container text-center py-32 md:py-40">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-4 py-2 mb-8"
        >
          <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <span className="text-primary-foreground/90 text-sm font-medium">
            The Movement is Live — Join Today
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-primary-foreground leading-[0.95] mb-6"
        >
          Green People
          <br />
          <span className="text-accent">Movement</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-primary-foreground/80 text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          We are registering millions of new voters to own 2027.
          <br className="hidden md:block" />
          Join the biggest people-powered movement Nigeria has ever seen.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        >
          <a
            href="#join"
            className="group bg-accent text-accent-foreground px-8 py-4 rounded-full text-lg font-bold hover:opacity-90 transition-all flex items-center gap-2 animate-pulse-glow"
          >
            Join the Movement Now (Free)
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="https://cvr.inecnigeria.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-primary-foreground/10 backdrop-blur-sm border-2 border-primary-foreground/30 text-primary-foreground px-8 py-4 rounded-full text-lg font-bold hover:bg-primary-foreground/20 transition-all flex items-center gap-2"
          >
            <Vote className="w-5 h-5" />
            Register to Vote Today
          </a>
        </motion.div>

        <LiveCounter />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mt-8 text-primary-foreground/50 text-sm md:text-base"
        >
          From Lagos to Kano, Port Harcourt to Maiduguri — one green future for every Nigerian
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-1.5">
          <div className="w-1.5 h-3 bg-primary-foreground/50 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
