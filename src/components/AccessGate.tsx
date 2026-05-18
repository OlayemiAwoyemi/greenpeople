import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";

const ACCESS_CODE = "sterces";

const AccessGate = ({ children, customCode }: { children: React.ReactNode; customCode?: string }) => {
  const [granted, setGranted] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const targetCode = customCode || ACCESS_CODE;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === targetCode) {
      sessionStorage.setItem("gp_access", targetCode);
      setGranted(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  if (granted) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <form onSubmit={handleSubmit} className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <FontAwesomeIcon icon={faLock} className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Access Required</h1>
        <p className="text-muted-foreground text-sm mb-6">Enter the access code to continue</p>
        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Access code"
          className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-base md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 mb-3 text-center tracking-widest"
          autoFocus
        />
        {error && <p className="text-destructive text-xs mb-3">Incorrect access code</p>}
        <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
          Continue
        </button>
      </form>
    </div>
  );
};

export default AccessGate;
