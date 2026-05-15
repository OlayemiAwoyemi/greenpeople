import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardList, faLocationDot, faCircleCheck, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";

const steps = [
  {
    icon: faClipboardList,
    step: "01",
    title: "Visit INEC Online Portal",
    description:
      "Go to the official INEC Continuous Voter Registration portal. You can start from your phone — right now.",
  },
  {
    icon: faLocationDot,
    step: "02",
    title: "Book Your Appointment",
    description:
      "Choose your state, LGA, and registration centre. Pick a date and time that works for you. It's free.",
  },
  {
    icon: faCircleCheck,
    step: "03",
    title: "Complete Registration",
    description:
      "Visit the centre with your ID. Get your biometrics captured. Collect your PVC. You're now a voter!",
  },
];

const HowToRegister = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="register" className="py-20 md:py-28 gradient-green relative overflow-hidden" ref={ref}>
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="text-primary font-semibold text-xs uppercase tracking-widest mb-3 block">
            Take Action
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3 leading-tight">
            Register to vote in 3 simple steps
          </h2>
          <p className="text-primary-foreground/60 text-sm">
            It takes less than 5 minutes to start. Your PVC is your power.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10 rounded-xl p-6 text-center"
            >
              <div className="text-primary font-bold text-3xl mb-3">{step.step}</div>
              <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={step.icon} className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-primary-foreground mb-2">{step.title}</h3>
              <p className="text-primary-foreground/60 text-xs leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <a
            href="https://cvr.inecnigeria.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Book Your INEC Appointment Now
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-3.5 h-3.5" />
          </a>
          <p className="text-primary-foreground/40 text-xs mt-3">
            Official INEC CVR Portal — cvr.inecnigeria.org
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HowToRegister;
