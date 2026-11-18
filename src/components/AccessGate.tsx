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

const field =
  "w-full bg-white/70 border rounded-2xl px-4 py-3 min-h-11 text-base sm:text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-[3px] focus:ring-primary/60";

/**
 * Wraps admin-only pages. Visitors sign in with an admin email and password;
 * the database itself refuses admin data to anyone else, so this screen is
 * the front door, not the lock.
 */
// `customCode` is kept so existing pages compile; access now comes from the admin account.
const AccessGate = ({ children }: { children: React.ReactNode; customCode?: string }) => {
  const { session, state } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [firstSetup, setFirstSetup] = useState(false);
  const controls = useAnimationControls();

  useEffect(() => {
    supabase.rpc("admin_exists").then(({ data }) => setFirstSetup(data === false));
  }, []);

  const shake = (msg: string) => {
    setError(msg);
    controls.start({ x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.4 } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setNotice(""); setBusy(true);
    if (firstSetup) {
      const { data, error: err } = await supabase.auth.signUp({ email: email.trim(), password });
      setBusy(false);
      if (err) return shake(err.message);
      if (!data.session) setNotice("Check your email to confirm the account, then come back and sign in.");
      return;
    }
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (err) shake("That email or password isn't right. Please try again.");
  };

  if (state === "admin") {
    return (
      <>
        {children}
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="btn-glass fixed bottom-4 left-4 z-50 !min-h-10 !px-4 text-sm shadow-lg"
          aria-label="Sign out of admin"
        >
          <FontAwesomeIcon icon={faRightFromBracket} className="w-3.5 h-3.5" /> Sign out
        </button>
      </>
    );
  }

  if (state === "checking") {
    return (
      <main className="min-h-screen flex items-center justify-center px-5" aria-busy="true">
        <div className="glass w-full max-w-sm p-8 text-center text-muted-foreground">Checking your access…</div>
      </main>
    );
  }

  if (state === "not-admin") {
    return (
      <main className="min-h-screen flex items-center justify-center px-5 py-10">
        <div className="glass w-full max-w-sm p-8 text-center">
          <img src={greenLogo} alt="Green People" width={44} height={44} className="w-11 h-11 rounded-full mx-auto mb-5" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Admins only</h1>
          <p className="text-muted-foreground text-[15px] mb-6">
            {session?.user.email} is signed in but isn't an admin. Ask an existing admin to add this email.
          </p>
          <button type="button" onClick={() => supabase.auth.signOut()} className="btn-primary w-full">Use another account</button>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mt-5 min-h-11">
            <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" /> Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-10">
      <motion.form animate={controls} onSubmit={handleSubmit} className="glass w-full max-w-sm p-8 text-center" aria-labelledby="gate-title">
        <img src={greenLogo} alt="Green People" width={44} height={44} className="w-11 h-11 rounded-full mx-auto mb-5" />
        <div className="icon-chip w-14 h-14 mx-auto mb-4"><FontAwesomeIcon icon={faLock} className="w-5 h-5" /></div>
        <h1 id="gate-title" className="text-2xl font-bold text-foreground mb-1">
          {firstSetup ? "Create the admin account" : "Admin sign-in"}
        </h1>
        <p className="text-muted-foreground text-[15px] mb-6">
          {firstSetup
            ? "No admin exists yet. The first account made here becomes the admin."
            : "Sign in with your admin email and password"}
        </p>

        <label htmlFor="gate-email" className="sr-only">Email</label>
        <input id="gate-email" type="email" autoComplete="email" required value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          placeholder="Email" autoFocus className={`${field} mb-3 ${error ? "border-destructive" : "border-pale"}`} />

        <label htmlFor="gate-password" className="sr-only">Password</label>
        <div className="relative mb-2">
          <input id="gate-password" type={show ? "text" : "password"} required minLength={8} value={password}
            autoComplete={firstSetup ? "new-password" : "current-password"}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            placeholder={firstSetup ? "Password (8+ characters)" : "Password"}
            aria-invalid={!!error} aria-describedby={error ? "gate-err" : undefined}
            className={`${field} pr-12 ${error ? "border-destructive" : "border-pale"}`} />
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground">
            <FontAwesomeIcon icon={show ? faEyeSlash : faEye} className="w-4 h-4" />
          </button>
        </div>

        <p id="gate-err" role="alert" className="text-destructive text-sm font-medium min-h-5 mb-1">{error}</p>
        {notice && <p role="status" className="text-primary text-sm font-medium mb-3">{notice}</p>}

        <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
          {busy ? "Please wait…" : firstSetup ? "Create admin account" : "Sign in"}
        </button>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mt-5 min-h-11">
          <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" /> Back to home
        </Link>
      </motion.form>
    </main>
  );
};

export default AccessGate;
