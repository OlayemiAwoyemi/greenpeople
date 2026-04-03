import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ClipboardList, MapPin, CheckCircle, ExternalLink } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    step: "01",
    title: "Visit INEC Online Portal",
    description:
      "Go to the official INEC Continuous Voter Registration portal. You can start your registration from your phone — right now.",
  },
  {
    icon: MapPin,
    step: "02",
    title: "Book Your Appointment",
    description:
      "Choose your state, LGA, and registration centre. Pick a date and time that works for you. It's free.",
  },
  {
    icon: CheckCircle,
    step: "03",
    title: "Complete Registration",
    description:
      "Visit the centre with your ID. Get your biometrics captured. Collect your PVC when ready. You're now a voter!",
  },
];

const HowToRegister = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="register" className="py-24 md:py-32 gradient-green relative overflow-hidden" ref={ref}>
      {/* Decorative circles */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-widest mb-4 block">
            Take Action
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-primary-foreground mb-6 leading-tight">
            Register to vote in
            <br />
            3 simple steps
          </h2>
          <p className="text-primary-foreground/70 text-lg">
            It takes less than 5 minutes to start. Your PVC is your power. Don't let anyone choose for you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.15 }}
              className="bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10 rounded-2xl p-8 text-center"
            >
              <div className="text-accent font-black text-5xl mb-4 font-display">{step.step}</div>
              <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-5">
                <step.icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-bold text-xl text-primary-foreground mb-3">{step.title}</h3>
              <p className="text-primary-foreground/70 text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <a
            href="https://cvr.inecnigeria.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-10 py-5 rounded-full text-lg font-bold hover:opacity-90 transition-opacity shadow-xl"
          >
            Book Your INEC Appointment Now
            <ExternalLink className="w-5 h-5" />
          </a>
          <p className="text-primary-foreground/50 text-sm mt-4">
            Official INEC CVR Portal — cvr.inecnigeria.org
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HowToRegister;
