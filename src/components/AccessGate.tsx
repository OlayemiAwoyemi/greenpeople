import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useAnimationControls } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faEye, faEyeSlash, faArrowLeft, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import greenLogo from "@/assets/green-logo.png";

type AdminState = "checking" | "signed-out" | "not-admin" | "admin";

/** Tracks the signed-in account and whether it is a Green People admin. */
export const useAdmin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [state, setState] = useState<AdminState>("checking");

  const evaluate = useCallback(async (s: Session | null) => {
    setSession(s);
    if (!s) { setState("signed-out"); return; }
    // The very first account to sign in becomes the admin.
    const { data: exists } = await supabase.rpc("admin_exists");
    if (exists === false) await supabase.rpc("claim_first_admin");
    const { data: ok } = await supabase.rpc("is_admin");
    setState(ok ? "admin" : "not-admin");
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => evaluate(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { evaluate(s); });
    return () => sub.subscription.unsubscribe();
  }, [evaluate]);

  return { session, state, isAdmin: state === "admin" };
};

// All secret pages share one access code. Behind the scenes the code is the
// password of a shared admin account, so the database still only opens its
// private data to someone who knows the code. The code itself is never stored
// in the website's files.
const ADMIN_EMAIL = "access@greenpeople.ng";

// `customCode` is kept so existing pages compile; every page uses the same code.
const AccessGate = ({ children }: { children: React.ReactNode; customCode?: string }) => {
  const { state } = useAdmin();
  const [code, setCode] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const controls = useAnimationControls();

  const shake = (msg: string) => {
    setError(msg);
    controls.start({ x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.4 } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setError(""); setBusy(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: code });
    if (err) {
      // First ever use: create the shared access account with this code.
      const { data: exists } = await supabase.rpc("admin_exists");
      if (exists === false) {
        const { data, error: upErr } = await supabase.auth.signUp({ email: ADMIN_EMAIL, password: code });
        setBusy(false);
        if (upErr) return shake(upErr.message);
        if (!data.session) return shake("Access account created but it needs email confirmation. Turn off email confirmation in Cloud settings, then try again.");
        return;
      }
      setBusy(false);
      return shake("That code isn't right. Please try again.");
    }
    setBusy(false);
  };

  if (state === "admin") {
    return (
      <>
        {children}
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="btn-glass fixed bottom-4 left-4 z-50 !min-h-10 !px-4 text-sm shadow-lg"
          aria-label="Lock the secret pages"
        >
          <FontAwesomeIcon icon={faRightFromBracket} className="w-3.5 h-3.5" /> Lock
        </button>
      </>
    );
  }

  if (state === "checking") {
    return (
      <main className="min-h-screen flex items-center justify-center px-5" aria-busy="true">
        <div className="glass w-full max-w-sm p-8 text-center text-muted-foreground">Checking access…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-10">
      <motion.form animate={controls} onSubmit={handleSubmit} className="glass w-full max-w-sm p-8 text-center" aria-labelledby="gate-title">
        <img src={greenLogo} alt="Green People" width={44} height={44} className="w-11 h-11 rounded-full mx-auto mb-5" />
        <div className="icon-chip w-14 h-14 mx-auto mb-4"><FontAwesomeIcon icon={faLock} className="w-5 h-5" /></div>
        <h1 id="gate-title" className="text-2xl font-bold text-foreground mb-1">Members' area</h1>
        <p className="text-muted-foreground text-[15px] mb-6">
          {state === "not-admin" ? "This device is signed in without access. Enter the access code." : "Enter the access code to continue"}
        </p>
        <label htmlFor="gate-code" className="sr-only">Access code</label>
        <div className="relative mb-2">
          <input id="gate-code" type={show ? "text" : "password"} value={code} autoComplete="current-password"
            onChange={(e) => { setCode(e.target.value); setError(""); }}
            placeholder="Access code" autoFocus aria-invalid={!!error} aria-describedby={error ? "gate-err" : undefined}
            className={`w-full field rounded-2xl pl-4 pr-12 py-3 min-h-11 text-base sm:text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-0 ${error ? "is-invalid" : ""}`} />
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide code" : "Show code"}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground">
            <FontAwesomeIcon icon={show ? faEyeSlash : faEye} className="w-4 h-4" />
          </button>
        </div>
        <p id="gate-err" role="alert" className="text-destructive text-sm font-medium min-h-5 mb-3">{error}</p>
        <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">{busy ? "Checking…" : "Continue"}</button>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mt-5 min-h-11">
          <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" /> Back to home
        </Link>
      </motion.form>
    </main>
  );
};

export default AccessGate;
