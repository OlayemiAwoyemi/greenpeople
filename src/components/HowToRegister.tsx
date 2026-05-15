import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";

const steps = [
  {
    step: "01",
    title: "Visit the INEC online portal",
    description:
      "Go to the official INEC Continuous Voter Registration portal. You can start from your phone — right now.",
  },
  {
    step: "02",
    title: "Book your appointment",
    description:
      "Choose your state, LGA, and registration centre. Pick a date and time that works for you. It's free.",
  },
  {
    step: "03",
    title: "Complete registration",
    description:
      "Visit the centre with your ID. Get your biometrics captured. Collect your PVC. You're now a voter!",
  },
];

const HowToRegister = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="register" className="gp-frame bg-background py-20 md:py-28" ref={ref}>
      <div className="gp-divider" />
      <div className="section-container pt-16 md:pt-20">
        <motion.div
          initial={false}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="max-w-3xl mb-14"
        >
          <div className="gp-eyebrow mb-5">Take action</div>
          <h2 className="gp-display text-foreground text-[34px] md:text-[44px] lg:text-[52px]">
            Register to vote in three simple steps.
          </h2>
          <p className="text-foreground/70 text-[16px] md:text-[17px] mt-6 max-w-xl leading-relaxed">
            It takes less than 5 minutes to start. Your PVC is your power.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={false}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="gp-card-white"
            >
              <div className="gp-display text-[40px] text-foreground/15 mb-2">{s.step}</div>
              <h3 className="gp-display text-[22px] md:text-[24px] text-foreground mb-3">{s.title}</h3>
              <p className="text-foreground/70 text-[14.5px] leading-relaxed">{s.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={false}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
        >
          <a
            href="https://cvr.inecnigeria.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="gp-pill-primary"
          >
            Book your INEC appointment
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-3.5 h-3.5 ml-2" />
          </a>
          <p className="text-foreground/50 text-xs mt-3">
            Official INEC CVR Portal — cvr.inecnigeria.org
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HowToRegister;
