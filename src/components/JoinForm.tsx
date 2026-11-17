import { motion, useInView } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faAward, faShareNodes, faCheck, faDownload } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { nigerianStates, nigerianStatesAndLGAs } from "@/data/nigerianLGAs";
import { normalizeName, normalizeSentence, joinName } from "@/lib/textNormalize";
import PrivacyModal from "./PrivacyModal";
import html2canvas from "html2canvas";

const ageGroups = ["18-24", "25-34", "35-44", "45-54", "55+"];

// --- Validation helpers ---
const hasRepeatingChars = (s: string) => /(.)\1{3,}/i.test(s);
const hasOnlyConsonants = (s: string) => {
  const cleaned = s.replace(/[^a-zA-Z]/g, "");
  return cleaned.length > 3 && !/[aeiouAEIOU]/.test(cleaned);
};
const looksLikeGibberish = (s: string) => {
  const cleaned = s.replace(/\s+/g, " ").trim();
  if (cleaned.length < 3) return true;
  if (hasRepeatingChars(cleaned)) return true;
  if (hasOnlyConsonants(cleaned)) return true;
  // Check for keyboard mashing patterns
  if (/^[^a-zA-Z\s]+$/.test(cleaned)) return true;
  // Name-specific: must have at least 2 "words" for full name
  return false;
};

const validateNameWord = (word: string, label: string): string | null => {
  if (!word || word.trim().length < 2) return `${label} must be at least 2 letters.`;
  if (!/^[a-zA-ZÀ-ÿ'-]+( [a-zA-ZÀ-ÿ'-]+)*$/.test(word.trim())) return `${label} should only contain letters.`;
  if (hasRepeatingChars(word) || hasOnlyConsonants(word)) return `That doesn't look like a real ${label.toLowerCase()}.`;
  return null;
};

const validatePhone = (phone: string): string | null => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 14) return "Please enter a valid Nigerian phone number.";
  if (/^(\d)\1{6,}$/.test(digits)) return "That doesn't look like a real phone number.";
  return null;
};

const validateReason = (reason: string): string | null => {
  const trimmed = reason.trim();
  if (!trimmed) return null; // optional
  if (trimmed.length < 5) return "Please write at least a short sentence.";
  if (looksLikeGibberish(trimmed)) return "Please write a genuine reason for joining.";
  return null;
};

const JoinForm = () => {
  const ref = useRef(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    surname: "",
    phone: "",
    state: "",
    lga: "",
    ageGroup: "",
    gender: "",
    hasPvc: "",
    reason: "",
  });

  const lgaOptions = formData.state ? nigerianStatesAndLGAs[formData.state] || [] : [];

  const handleDownloadCard = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0a2e1a",
        scale: 2,
        useCORS: true,
        logging: false,
        removeContainer: true,
      });
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `GreenPeople-${joinName({ first: formData.firstName, middle: formData.middleName, surname: formData.surname }).replace(/\s+/g, "_")}.png`;
        link.href = url;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, "image/png", 0.92);
    } catch {
      toast({ title: "Could not download card", variant: "destructive" });
    }
  }, [formData.firstName, formData.middleName, formData.surname, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors: Record<string, string> = {};
    const fnErr = validateNameWord(formData.firstName, "First name");
    if (fnErr) newErrors.firstName = fnErr;
    const snErr = validateNameWord(formData.surname, "Surname");
    if (snErr) newErrors.surname = snErr;
    if (formData.middleName.trim()) {
      const mnErr = validateNameWord(formData.middleName, "Middle name");
      if (mnErr) newErrors.middleName = mnErr;
    }
    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) newErrors.phone = phoneErr;
    const reasonErr = validateReason(formData.reason);
    if (reasonErr) newErrors.reason = reasonErr;

    if (!formData.ageGroup) newErrors.ageGroup = "Please select your age group.";
    if (!formData.gender) newErrors.gender = "Please select your gender.";
    if (!formData.hasPvc) newErrors.hasPvc = "Please select your PVC status.";
    if (!formData.state) newErrors.state = "Please select your state.";
    if (!formData.lga) newErrors.lga = "Please select your LGA.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({ title: "Please fix the highlighted fields", variant: "destructive" });
      return;
    }

    setErrors({});
    setLoading(true);

    const cleanReason = normalizeSentence(formData.reason || "");
    const first = normalizeName(formData.firstName);
    const middle = normalizeName(formData.middleName);
    const surname = normalizeName(formData.surname);
    const fullName = joinName({ first, middle, surname });

    const payload = {
      full_name: fullName,
      first_name: first,
      middle_name: middle || null,
      surname,
      phone: formData.phone.trim(),
      state: formData.state,
      lga: formData.lga,
      age_group: formData.ageGroup,
      gender: formData.gender,
      has_pvc: formData.hasPvc,
      reason: cleanReason || null,
    };

    // Insert into the main members table
    const { data: inserted, error } = await supabase
      .from("members")
      .insert(payload)
      .select("id")
      .maybeSingle();

    // ALWAYS write to the append-only signup log — strip name-part fields not in log schema
    const { first_name: _fn, middle_name: _mn, surname: _sn, ...logPayload } = payload;
    try {
      await supabase.from("member_signup_log").insert({
        ...logPayload,
        member_id: inserted?.id ?? null,
        succeeded: !error,
        error_message: error?.message ?? null,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
      });
    } catch (logErr) {
      console.error("Failed to write signup log:", logErr);
    }

    setLoading(false);
    if (error) {
      const isDup = (error.code === "23505") || /duplicate|members_phone_unique|unique constraint/i.test(error.message);
      if (isDup) {
        toast({
          title: "You're already registered",
          description: "This phone number is already on the Green People register. Visit your member page instead.",
          variant: "destructive",
        });
        setErrors({ phone: "This phone number is already registered." });
      } else {
        toast({ title: "Something went wrong", description: error.message, variant: "destructive" });
      }
      return;
    }
    // Persist owner-id so MemberPage knows this browser belongs to this member.
    if (inserted?.id && typeof window !== "undefined") {
      try { localStorage.setItem("gp_member_id", inserted.id); } catch { /* ignore */ }
    }
    setSubmitted(true);
  };

  if (submitted) {
    const needsPvc = formData.hasPvc !== "Yes";
    return (
      <section id="join" className="py-20 md:py-28 gradient-green" ref={ref}>
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center glass p-6 md:p-8"
          >
            <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 14 }} className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-5 shadow-glow" aria-hidden="true">
              <FontAwesomeIcon icon={faCheck} className="w-7 h-7 text-primary-foreground" />
            </motion.div>
            {/* Downloadable card */}
            <div ref={cardRef} className="bg-deep border border-primary/30 rounded-3xl p-6 mb-5">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                <FontAwesomeIcon icon={faCheck} className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Green People Movement
              </h3>
              <p className="text-white/50 text-xs mb-4">Digital Membership Card</p>
              <div className="text-white font-semibold text-base mb-1">
                {joinName({ first: formData.firstName, middle: formData.middleName, surname: formData.surname }) || "Green Member"}
              </div>
              <div className="text-white/50 text-xs">
                {formData.state || "Nigeria"} · {formData.lga}
              </div>
              <div className="mt-4 flex items-center justify-center gap-1.5">
                <FontAwesomeIcon icon={faAward} className="w-3.5 h-3.5 text-primary" />
                <span className="text-primary font-medium text-xs">Verified Green Member</span>
              </div>
              <p className="text-white/20 text-[9px] mt-3">greenpeople.ng</p>
            </div>

            <button
              onClick={handleDownloadCard}
              className="btn-primary font-bold mb-6"
            >
              <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />
              Download Membership Card
            </button>

            <h2 className="text-2xl font-bold text-foreground mb-3">
              Welcome to the Movement! 🎉
            </h2>

            {needsPvc && (
              <div className="bg-primary/20 border border-primary/30 rounded-lg p-4 mb-4 text-left">
                <p className="text-primary-foreground text-sm font-semibold mb-2">
                  🗳️ Get Your PVC — It's Your Power!
                </p>
                <p className="text-muted-foreground text-sm mb-3">
                  {formData.hasPvc === "In Progress"
                    ? "Great that you've started! Complete your registration and collect your PVC before 2027."
                    : "You need your Permanent Voter's Card to vote in 2027. Start your registration today — it's free!"}
                </p>
                <a
                  href="https://cvr.inecnigeria.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  Register on INEC Portal →
                </a>
              </div>
            )}

            <p className="text-muted-foreground text-base mb-4">
              You are now part of something bigger. Share and bring others in.
            </p>

            <a
              href={`/${formData.phone.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-2 bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-foreground/20 transition-all whitespace-nowrap mb-3"
            >
              🏛️ Visit Your Member Page
            </a>

            <div>
              <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap">
                <FontAwesomeIcon icon={faShareNodes} className="w-3.5 h-3.5" />
                Invite friends
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  const inputClass = "w-full bg-white/70 border border-pale rounded-2xl px-4 py-3 min-h-11 text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-[3px] focus:ring-primary/60 focus:border-primary appearance-none transition-shadow";
  const selectClass = "w-full bg-white/70 border border-pale rounded-2xl px-4 py-3 min-h-11 pr-10 text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center]";
  const labelClass = "text-foreground text-sm font-semibold mb-1.5 block";
  const errorClass = "text-destructive text-xs font-medium mt-1";
  const inputErrorBorder = "border-destructive/70";

  return (
    <section id="join" className="py-20 md:py-28 gradient-green relative overflow-hidden" ref={ref}>
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <span className="eyebrow">
            Be part of history
          </span>
          <h2 className="text-3xl md:text-[2.75rem] font-bold text-primary-foreground mb-3 leading-tight">
            Join the Movement
          </h2>
          <p className="text-muted-foreground text-base">
            It's free. It takes 60 seconds. And it could change Nigeria forever.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15 }}
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto glass p-6 md:p-10"
        >
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className={labelClass}>First name *</label>
              <input required type="text" maxLength={50} value={formData.firstName}
                onChange={(e) => { setFormData({ ...formData, firstName: e.target.value }); setErrors(prev => ({ ...prev, firstName: "" })); }}
                placeholder="First" className={`${inputClass} ${errors.firstName ? inputErrorBorder : ""}`} />
              {errors.firstName && <p className={errorClass}>{errors.firstName}</p>}
            </div>
            <div>
              <label className={labelClass}>Middle name</label>
              <input type="text" maxLength={50} value={formData.middleName}
                onChange={(e) => { setFormData({ ...formData, middleName: e.target.value }); setErrors(prev => ({ ...prev, middleName: "" })); }}
                placeholder="Middle (optional)" className={`${inputClass} ${errors.middleName ? inputErrorBorder : ""}`} />
              {errors.middleName && <p className={errorClass}>{errors.middleName}</p>}
            </div>
            <div>
              <label className={labelClass}>Surname *</label>
              <input required type="text" maxLength={50} value={formData.surname}
                onChange={(e) => { setFormData({ ...formData, surname: e.target.value }); setErrors(prev => ({ ...prev, surname: "" })); }}
                placeholder="Surname" className={`${inputClass} ${errors.surname ? inputErrorBorder : ""}`} />
              {errors.surname && <p className={errorClass}>{errors.surname}</p>}
            </div>
          </div>
          <div className="mb-4">
            <label className={labelClass}>Phone/WhatsApp *</label>
            <input required type="tel" maxLength={15} value={formData.phone}
              onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setErrors(prev => ({ ...prev, phone: "" })); }}
              placeholder="080XXXXXXXX" className={`${inputClass} ${errors.phone ? inputErrorBorder : ""}`} />
            {errors.phone && <p className={errorClass}>{errors.phone}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>State *</label>
              <select required value={formData.state}
                onChange={(e) => { setFormData({ ...formData, state: e.target.value, lga: "" }); setErrors(prev => ({ ...prev, state: "" })); }}
                className={`${selectClass} ${errors.state ? inputErrorBorder : ""}`}>
                <option value="" className="text-foreground">Select state</option>
                {nigerianStates.map((s) => (
                  <option key={s} value={s} className="text-foreground">{s}</option>
                ))}
              </select>
              {errors.state && <p className={errorClass}>{errors.state}</p>}
            </div>
            <div>
              <label className={labelClass}>Local government *</label>
              <select required value={formData.lga}
                onChange={(e) => { setFormData({ ...formData, lga: e.target.value }); setErrors(prev => ({ ...prev, lga: "" })); }}
                className={`${selectClass} ${errors.lga ? inputErrorBorder : ""}`} disabled={!formData.state}>
                <option value="" className="text-foreground">
                  {formData.state ? "Select LGA" : "Select state first"}
                </option>
                {lgaOptions.map((lga) => (
                  <option key={lga} value={lga} className="text-foreground">{lga}</option>
                ))}
              </select>
              {errors.lga && <p className={errorClass}>{errors.lga}</p>}
            </div>
          </div>

          {/* Gender */}
          <div className="mb-4">
            <label className={labelClass}>Gender *</label>
            <div className="flex gap-3">
              {["Male", "Female"].map((g) => (
                <button key={g} type="button"
                  onClick={() => { setFormData({ ...formData, gender: g }); setErrors(prev => ({ ...prev, gender: "" })); }}
                  className={`px-5 py-2 rounded-lg text-xs font-medium border transition-all ${
                    formData.gender === g
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-white/70 text-foreground border-pale hover:border-primary min-h-11"
                  }`}>{g}</button>
              ))}
            </div>
            {errors.gender && <p className={errorClass}>{errors.gender}</p>}
          </div>

          {/* Age group */}
          <div className="mb-4">
            <label className={labelClass}>Age group *</label>
            <div className="flex flex-wrap gap-2">
              {ageGroups.map((ag) => (
                <button key={ag} type="button"
                  onClick={() => { setFormData({ ...formData, ageGroup: ag }); setErrors(prev => ({ ...prev, ageGroup: "" })); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    formData.ageGroup === ag
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-white/70 text-foreground border-pale hover:border-primary min-h-11"
                  }`}>{ag}</button>
              ))}
            </div>
            {errors.ageGroup && <p className={errorClass}>{errors.ageGroup}</p>}
          </div>

          {/* PVC Status */}
          <div className="mb-4">
            <label className={labelClass}>Do you have your PVC? *</label>
            <div className="flex flex-wrap gap-2">
              {["Yes", "No", "In Progress"].map((opt) => (
                <button key={opt} type="button"
                  onClick={() => { setFormData({ ...formData, hasPvc: opt }); setErrors(prev => ({ ...prev, hasPvc: "" })); }}
                  className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${
                    formData.hasPvc === opt
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-white/70 text-foreground border-pale hover:border-primary min-h-11"
                  }`}>{opt}</button>
              ))}
            </div>
            {errors.hasPvc && <p className={errorClass}>{errors.hasPvc}</p>}
          </div>

          <div className="mb-6">
            <label className={labelClass}>Why do you believe in Green People?</label>
            <textarea maxLength={500} rows={3} value={formData.reason}
              onChange={(e) => { setFormData({ ...formData, reason: e.target.value }); setErrors(prev => ({ ...prev, reason: "" })); }}
              placeholder="Tell us your why..."
              className={`${inputClass} resize-none ${errors.reason ? inputErrorBorder : ""}`} />
            {errors.reason && <p className={errorClass}>{errors.reason}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="w-full btn-primary w-full py-3 text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap">
            <FontAwesomeIcon icon={faPaperPlane} className="w-3.5 h-3.5" />
            {loading ? "Joining..." : "Join the Movement — It's Free"}
          </button>

          <p className="text-muted-foreground text-xs text-center mt-3">
            Your information is secure.{" "}
            <PrivacyModal>
              <button type="button" className="underline hover:text-primary-foreground/50">Privacy Policy</button>
            </PrivacyModal>
          </p>
        </motion.form>
      </div>
    </section>
  );
};

export default JoinForm;
