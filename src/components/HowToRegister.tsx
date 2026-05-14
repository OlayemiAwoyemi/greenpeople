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
    <section id="register" className="py-20 md:py-32 bg-white relative overflow-hidden border-y border-gray-100" ref={ref}>
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="text-primary font-semibold text-xs uppercase tracking-widest mb-3 block">
            Take Action
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4 leading-tight tracking-tight">
            Register to vote in 3 simple steps
          </h2>
          <p className="text-muted-foreground text-lg">
            It takes less than 5 minutes to start. Your PVC is your power.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-14">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="bg-white border border-gray-100 rounded-[32px] p-10 text-center shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.06)] transition-all group"
            >
              <div className="text-primary font-black text-5xl mb-6 opacity-20 group-hover:opacity-100 transition-opacity">{step.step}</div>
              <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/10 transition-colors">
                <FontAwesomeIcon icon={step.icon} className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-xl text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-base leading-relaxed">{step.description}</p>
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
            className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-10 py-5 rounded-full text-lg font-bold hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all"
          >
            Book Your INEC Appointment Now
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-4 h-4" />
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
