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
    <section className="relative min-h-[90vh] flex items-center pt-20 bg-white overflow-hidden">
      <div className="section-container relative z-10 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-4 py-1.5 mb-8"
            >
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-primary font-bold text-xs uppercase tracking-wider">
                The Movement is Live
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-7xl font-black text-foreground leading-[1.1] mb-8 tracking-tight"
            >
              Building the future of <span className="text-primary italic">Nigeria</span> together.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-muted-foreground text-lg md:text-xl max-w-xl mb-10 leading-relaxed font-medium"
            >
              We are registering millions of new voters to own 2027.
              Join the biggest people-powered movement Nigeria has ever seen.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center gap-4 mb-10"
            >
              <a
                href="#join"
                className="w-full sm:w-auto group bg-primary text-primary-foreground px-8 py-4 rounded-full text-base font-bold hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                Join the Movement
                <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="https://cvr.inecnigeria.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto group bg-white border border-gray-200 text-foreground px-8 py-4 rounded-full text-base font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faCheckToSlot} className="w-4 h-4 text-primary" />
                Register to Vote
              </a>
            </motion.div>

            <LiveCounter />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 rounded-[32px] overflow-hidden shadow-2xl border-8 border-white">
              <img
                src={greenpeopleBg}
                alt="Green People Movement"
                className="w-full aspect-[4/5] object-cover"
              />
            </div>
            {/* Abstract decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-green-200/20 rounded-full blur-3xl" />
            
            <div className="absolute -right-6 top-1/4 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 animate-counter-pulse">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faLeaf} className="text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Our Goal</p>
                <p className="text-sm font-bold">10M Registered</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
