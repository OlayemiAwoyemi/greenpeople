import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useAnimationControls } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faEye, faEyeSlash, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import greenLogo from "@/assets/green-logo.png";

const ACCESS_CODE = "sterces";

const AccessGate = ({ children }: { children: React.ReactNode }) => {
  const [granted, setGranted] = useState(false);
  const [code, setCode] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const controls = useAnimationControls();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === ACCESS_CODE) {
      sessionStorage.setItem("gp_access", ACCESS_CODE);
      setGranted(true);
    } else {
      setError(true);
      controls.start({ x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.4 } });
    }
  };

  if (granted) return <>{children}</>;

  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-10">
      <motion.form animate={controls} onSubmit={handleSubmit} className="glass w-full max-w-sm p-8 text-center" aria-labelledby="gate-title">
        <img src={greenLogo} alt="Green People" width={44} height={44} className="w-11 h-11 rounded-full mx-auto mb-5" />
        <div className="icon-chip w-14 h-14 mx-auto mb-4"><FontAwesomeIcon icon={faLock} className="w-5 h-5" /></div>
        <h1 id="gate-title" className="text-2xl font-bold text-foreground mb-1">Members' area</h1>
        <p className="text-muted-foreground text-[15px] mb-6">Enter the access code to continue</p>
        <label htmlFor="gate-code" className="sr-only">Access code</label>
        <div className="relative mb-2">
          <input id="gate-code" type={show ? "text" : "password"} value={code}
            onChange={(e) => { setCode(e.target.value); setError(false); }}
            placeholder="Access code" autoFocus aria-invalid={error} aria-describedby={error ? "gate-err" : undefined}
            className={`w-full bg-white/70 border rounded-2xl pl-4 pr-12 py-3 min-h-11 text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-[3px] focus:ring-primary/60 ${error ? "border-destructive" : "border-pale"}`} />
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide code" : "Show code"}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground">
            <FontAwesomeIcon icon={show ? faEyeSlash : faEye} className="w-4 h-4" />
          </button>
        </div>
        <p id="gate-err" role="alert" className="text-destructive text-sm font-medium min-h-5 mb-3">{error ? "That code isn't right. Please try again." : ""}</p>
        <button type="submit" className="btn-primary w-full">Continue</button>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mt-5 min-h-11">
          <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" /> Back to home
        </Link>
      </motion.form>
    </main>
  );
};

export default AccessGate;
