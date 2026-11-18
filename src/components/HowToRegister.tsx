import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardList, faLocationDot, faCircleCheck, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { Reveal, Pop } from "./sky/Reveal";

const steps = [
  { icon: faClipboardList, step: "1", title: "Visit the INEC online portal",
    description: "Go to the official INEC Continuous Voter Registration portal. You can start from your phone — right now." },
  { icon: faLocationDot, step: "2", title: "Book your appointment",
    description: "Choose your state, LGA, and registration centre. Pick a date and time that works for you. It's free." },
  { icon: faCircleCheck, step: "3", title: "Complete registration",
    description: "Visit the centre with your ID. Get your biometrics captured. Collect your PVC. You're now a voter!" },
];

const HowToRegister = () => (
  <section id="register" className="py-20 md:py-28 relative" aria-labelledby="register-title">
    <div className="section-container">
      <Reveal className="text-center max-w-2xl mx-auto mb-14">
        <span className="eyebrow">Take action</span>
        <h2 id="register-title" className="text-3xl md:text-[2.75rem] font-bold text-foreground mb-3">Register to vote in 3 simple steps</h2>
        <p className="text-muted-foreground text-lg">It takes less than 5 minutes to start. Your PVC is your power.</p>
      </Reveal>

      <ol className="relative grid md:grid-cols-3 gap-6 mb-12">
        {/* progress line */}
        <div aria-hidden="true" className="hidden md:block absolute top-7 left-[16%] right-[16%] h-1 rounded-full bg-pale">
          <div className="h-full w-full rounded-full bg-primary origin-left" />
        </div>
        <div aria-hidden="true" className="md:hidden absolute top-4 bottom-4 left-7 w-1 rounded-full bg-pale" />
        {steps.map((s, i) => (
          <li key={s.step} className="relative">
            <Pop delay={i * 0.08} className="flex md:flex-col items-start md:items-center gap-4 md:text-center">
              <div className="relative z-10 shrink-0 w-14 h-14 rounded-full bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center shadow-[0_8px_24px_-8px_hsl(var(--lime)/0.55)]">
                {s.step}
              </div>
              <div className="glass p-6 flex-1 w-full">
                <div className="icon-chip w-10 h-10 mb-3 md:mx-auto"><FontAwesomeIcon icon={s.icon} className="w-4 h-4" /></div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-[15px] leading-relaxed">{s.description}</p>
              </div>
            </Pop>
          </li>
        ))}
      </ol>

      <Reveal className="text-center">
        <a href="https://cvr.inecnigeria.org/" target="_blank" rel="noopener noreferrer" className="btn-primary">
          Book your INEC appointment now
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-3.5 h-3.5" />
        </a>
        <p className="text-muted-foreground text-sm mt-3">Official INEC CVR portal — cvr.inecnigeria.org</p>
      </Reveal>
    </div>
  </section>
);

export default HowToRegister;
