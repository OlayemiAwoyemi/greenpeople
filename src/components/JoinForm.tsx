import { motion, useInView } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faAward, faShareNodes, faCheck, faDownload, faArrowRight, faBullseye, faUserGroup, faLandmark, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { nigerianStates, nigerianStatesAndLGAs } from "@/data/nigerianLGAs";
import { normalizeName, normalizeSentence, joinName } from "@/lib/textNormalize";
import PrivacyModal from "./PrivacyModal";
import { saveMemberId } from "@/lib/drawMemberId";
import { ScaledMemberIdCard, type MemberIdData } from "@/components/MemberIdCard";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
  return false;
};

const validateNameWord = (word: string, label: string): string | null => {
  if (!word || word.trim().length < 2) return `${label} must be at least 2 letters.`;
  if (!/^[a-zA-ZÀ-ÿ'-]+( [a-zA-ZÀ-ÿ'-]+)*$/.test(word.trim())) return `${label} should only contain letters.`;
  if (hasRepeatingChars(word) || hasOnlyConsonants(word)) return `That doesn't look like a real ${label.toLowerCase()}.`;
  return null;
};

const validatePhone = (phone: string, isNigeriaBased: boolean): string | null => {
  const digits = phone.replace(/\D/g, "");
  if (isNigeriaBased) {
    if (digits.length < 10 || digits.length > 14) return "Please enter a valid Nigerian phone number.";
  } else {
    if (digits.length < 7 || digits.length > 15) return "Please enter a valid phone number with country code.";
  }
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

const JoinForm = ({ isTest = false }: { isTest?: boolean }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [submitted, setSubmitted] = useState(false);
  const [successStep, setSuccessStep] = useState(1);
  const [memberNumber, setMemberNumber] = useState<number | null>(null);
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
    isNigeriaBased: true,
  });

  const lgaOptions = formData.state ? nigerianStatesAndLGAs[formData.state] || [] : [];

  const handleDownloadCard = async () => {
    try {
      await saveMemberId(idData, `GreenPeople-ID-${idData.fullName.replace(/\s+/g, "_")}.png`);
    } catch {
      toast({ title: "Could not download card", description: "Please try again, or take a screenshot of your ID.", variant: "destructive" });
    }
  };

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
    const phoneErr = validatePhone(formData.phone, formData.isNigeriaBased);
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

    if (isTest) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMemberNumber(12345678);
      setLoading(false);
      setSubmitted(true);
      return;
    }

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
      is_nigeria_based: formData.isNigeriaBased,
    };

    const { data: insertedRows, error } = await supabase.rpc("register_member", { p: payload });
    const inserted = insertedRows?.[0];

    if (inserted?.member_number) {
      setMemberNumber(inserted.member_number);
    }

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
    if (inserted?.id && typeof window !== "undefined") {
      try { localStorage.setItem("gp_member_id", inserted.id); } catch { /* ignore */ }
    }
    setSubmitted(true);
  };

  const inputClass = "w-full bg-white/70 border border-pale rounded-2xl px-4 py-3 min-h-11 text-base md:text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-[3px] focus:ring-primary/60 transition-all";
  const selectClass = "w-full bg-white/70 border border-pale rounded-2xl px-3.5 py-2.5 min-h-11 pr-10 text-base md:text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-[3px] focus:ring-primary/60 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%230E3133%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center]";
  const labelClass = "text-foreground text-sm font-semibold mb-1.5 block";
  const errorClass = "text-destructive text-xs font-medium mt-1";
  const inputErrorBorder = "border-destructive";


  const idData: MemberIdData = {
    fullName: joinName({ first: formData.firstName, middle: formData.middleName, surname: formData.surname }) || "Green Member",
    surname: normalizeName(formData.surname),
    givenNames: [normalizeName(formData.firstName), normalizeName(formData.middleName)].filter(Boolean).join(" "),
    gender: formData.gender,
    state: formData.state,
    lga: formData.lga,
    memberNumber,
    issued: new Date(),
  };

  return (
    <>
      <section id="join" className="py-20 md:py-28 relative overflow-hidden" ref={ref}>
        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="text-center max-w-2xl mx-auto mb-10"
          >
            <span className="eyebrow">
              Be part of history
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3 leading-tight">
              Join the movement
            </h2>
            <p className="text-primary-foreground/60 text-sm">
              It's free. It takes 60 seconds. And it could change Nigeria forever.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15 }}
            onSubmit={handleSubmit}
            className="max-w-xl mx-auto glass p-6 md:p-8"
          >
            {/* Residency Selection */}
            <div className="mb-6">
              <label className={labelClass}>Where do you live? *</label>
              <div className="flex gap-3">
                {[
                  { id: true, label: "Nigeria" },
                  { id: false, label: "Outside Nigeria" }
                ].map((opt) => (
                  <button key={opt.label} type="button"
                    onClick={() => { setFormData({ ...formData, isNigeriaBased: opt.id }); setErrors(prev => ({ ...prev, isNigeriaBased: "" })); }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                      formData.isNigeriaBased === opt.id
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : "bg-primary-foreground/10 text-primary-foreground/60 border-primary-foreground/15 hover:border-primary-foreground/30"
                    }`}>{opt.label}</button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label className={labelClass}>First Name *</label>
                <input required type="text" maxLength={50} value={formData.firstName}
                  onChange={(e) => { setFormData({ ...formData, firstName: e.target.value }); setErrors(prev => ({ ...prev, firstName: "" })); }}
                  placeholder="First" className={`${inputClass} ${errors.firstName ? inputErrorBorder : ""}`} />
                {errors.firstName && <p className={errorClass}>{errors.firstName}</p>}
              </div>
              <div>
                <label className={labelClass}>Middle Name</label>
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
              <label className={labelClass}>{formData.isNigeriaBased ? "Phone/WhatsApp *" : "Phone (with country code) *"}</label>
              <input required type="tel" maxLength={20} value={formData.phone}
                onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setErrors(prev => ({ ...prev, phone: "" })); }}
                placeholder={formData.isNigeriaBased ? "080XXXXXXXX" : "+1 234 XXX XXXX"} className={`${inputClass} ${errors.phone ? inputErrorBorder : ""}`} />
              {errors.phone && <p className={errorClass}>{errors.phone}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelClass}>{formData.isNigeriaBased ? "State *" : "State of Origin *"}</label>
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
                <label className={labelClass}>{formData.isNigeriaBased ? "Local Government *" : "LGA of Origin *"}</label>
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
                        : "bg-primary-foreground/10 text-primary-foreground/60 border-primary-foreground/15 hover:border-primary-foreground/30"
                    }`}>{g}</button>
                ))}
              </div>
              {errors.gender && <p className={errorClass}>{errors.gender}</p>}
            </div>

            {/* Age Group */}
            <div className="mb-4">
              <label className={labelClass}>Age Group *</label>
              <div className="flex flex-wrap gap-2">
                {ageGroups.map((ag) => (
                  <button key={ag} type="button"
                    onClick={() => { setFormData({ ...formData, ageGroup: ag }); setErrors(prev => ({ ...prev, ageGroup: "" })); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      formData.ageGroup === ag
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-primary-foreground/10 text-primary-foreground/60 border-primary-foreground/15 hover:border-primary-foreground/30"
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
                        : "bg-primary-foreground/10 text-primary-foreground/60 border-primary-foreground/15 hover:border-primary-foreground/30"
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
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap">
              <FontAwesomeIcon icon={faPaperPlane} className="w-3.5 h-3.5" />
              {loading ? "Joining..." : "Join the Movement — It's Free"}
            </button>

            <p className="text-primary-foreground/30 text-[10px] text-center mt-3">
              Your information is secure.{" "}
              <PrivacyModal>
                <button type="button" className="underline hover:text-primary-foreground/50">Privacy Policy</button>
              </PrivacyModal>
            </p>
          </motion.form>
        </div>
      </section>

      <Dialog open={submitted} onOpenChange={(val) => !val && setSubmitted(false)}>
        <DialogContent className="w-[95vw] sm:max-w-xl p-0 overflow-hidden bg-transparent border-0 shadow-none">
          <div className="bg-deep rounded-[2rem] p-1 shadow-2xl">
            <div className="bg-[#0a2e1a]/95 backdrop-blur-xl rounded-[1.8rem] p-4 sm:p-7 border border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar">
              {successStep === 1 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 border border-primary/30">
                      <FontAwesomeIcon icon={faCheck} className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-black text-white mb-1 leading-tight">
                      Welcome to the Movement! 🎉
                    </h2>
                    <p className="text-white/60 text-xs">Your registration is complete.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative group perspective-1000">
                      <ScaledMemberIdCard data={idData} />
                    </div>
                    <div className="text-center pt-2">
                      <button 
                        onClick={handleDownloadCard} 
                        className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 px-6 py-3 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/5"
                      >
                        <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" /> Download your membership ID
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <h3 className="text-sm font-bold text-white mb-1.5 flex items-center justify-center gap-2">
                      <FontAwesomeIcon icon={faWhatsapp} className="text-[#25D366]" /> Join WhatsApp
                    </h3>
                    <p className="text-white/60 text-[10px] mb-3">Connect with leaders and fellow members immediately.</p>
                    <div className="space-y-3">
                      <a href="https://chat.whatsapp.com/GxMI11muoLyA7s4WtywOYS" target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-xl text-[10px] font-bold hover:bg-[#20bd5a] transition-all w-full justify-center">
                        Join Group Now <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                      </a>
                      <p className="text-[9px] text-primary font-bold leading-tight px-2">
                        ⚠️ PLEASE JOIN WITH THE WHATSAPP ACCOUNT LINKED TO {formData.phone}. 
                        <span className="block mt-1 font-medium text-white/50 italic">If you have multiple WhatsApp apps, choose the right one when prompted after clicking.</span>
                      </p>
                    </div>
                  </div>

                  <button onClick={() => setSuccessStep(2)} className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                    Continue to Mission Briefing <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
                  </button>
                </div>
              )}

              {successStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-4 text-white/80 leading-relaxed text-sm">
                    <div className="space-y-2">
                      <p className="font-bold text-white text-sm border-l-4 border-primary pl-3">Our Mission</p>
                      <p className="text-[11px] leading-snug">We're working to ensure the next elections truly reflect the will of Nigerians. We're non-partisan and focused on making results manipulation impossible.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {[
                        { icon: faBullseye, text: "Every member must get their PVC and be ready to vote." },
                        { icon: faLandmark, text: "We ensure every member can choose leaders without being tricked." },
                        { icon: faUserGroup, text: "Goal: 10 million members ready to vote before 2027." }
                      ].map((step, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <FontAwesomeIcon icon={step.icon} className="text-primary text-[10px]" />
                          </div>
                          <p className="text-[10px] leading-tight font-medium">{step.text}</p>
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-[10px] italic text-white/50">Our formula: Everyone simply does what the group asks. Clear, simple, and rewarded.</p>
                  </div>

                  <button onClick={() => setSuccessStep(3)} className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                    Continue to Your Dashboard <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
                  </button>
                </div>
              )}

              {successStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-4 text-white/80 leading-relaxed text-sm">
                    <div className="space-y-2">
                      <p className="font-bold text-white text-sm border-l-4 border-primary pl-3">Mandate Points & Ranking</p>
                      <p className="text-[11px] leading-snug">Points show your activity. High points lead to higher Ranks — from Ward Leader to President.</p>
                    </div>

                    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5">
                      <h4 className="text-primary font-bold text-[10px] mb-3 uppercase tracking-wider">Your Personal Link</h4>
                      <a href={`/${memberNumber ?? formData.phone.replace(/\D/g, "")}`} className="block bg-white/10 p-3 rounded-xl text-center font-mono text-[11px] text-primary-foreground border border-white/10 mb-4 truncate">
                        greenpeople.ng/{memberNumber ?? formData.phone.replace(/\D/g, "")}
                      </a>

                      <div className="space-y-2 text-[10px]">
                        <p><span className="text-white font-bold">Earn points by:</span> Visiting your page, completing social actions, and sharing with friends. Points decrease over time — <span className="text-primary font-bold">Act Fast!</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <a href={`/${memberNumber ?? formData.phone.replace(/\D/g, "")}`} className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold text-sm text-center shadow-lg transition-transform active:scale-[0.98]">
                      Go to Your Page & Take Action
                    </a>
                    <button onClick={() => setSubmitted(false)} className="w-full bg-white/10 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/20 transition-colors">
                      Done
                    </button>
                  </div>
                  <p className="text-center text-white/40 text-[9px] pt-4">Thank you for taking action immediately. 🙏</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JoinForm;
