import { motion, useInView } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faAward, faShareNodes, faCheck, faDownload, faArrowRight, faBullseye, faUserGroup, faChartLine, faLandmark } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
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
    isNigeriaBased: true,
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
      <section id="join" className="py-12 md:py-24 gradient-green min-h-screen" ref={ref}>
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 border border-primary/30">
                <FontAwesomeIcon icon={faCheck} className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2 leading-tight">
                Welcome to the Movement! 🎉
              </h2>
              <p className="text-white/60 text-base">You've successfully joined Green People.</p>
            </div>

            {/* WhatsApp CTA */}
            <div className="glass-card p-6 md:p-8 mb-8 bg-white/10 border-primary/30 text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <FontAwesomeIcon icon={faWhatsapp} className="w-20 h-20 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faWhatsapp} className="text-[#25D366]" />
                Join the WhatsApp Group
              </h3>
              <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
                Connect with leaders and fellow members immediately to start your journey.
              </p>
              <a
                href="https://chat.whatsapp.com/GxMI11muoLyA7s4WtywOYS"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-8 py-4 rounded-2xl text-base font-bold hover:bg-[#20bd5a] transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:scale-[1.02] active:scale-[0.98]"
              >
                Join WhatsApp Group Now <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
              </a>
            </div>

            {/* Membership Card Section */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FontAwesomeIcon icon={faAward} className="text-primary" />
                  Your Membership Card
                </h3>
                <button
                  onClick={handleDownloadCard}
                  className="text-primary text-sm font-bold flex items-center gap-1.5 hover:underline"
                >
                  <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>

              {/* Responsive ID Card */}
              <div className="relative group perspective-1000">
                <div
                  ref={cardRef}
                  className="w-full aspect-[1.58/1] max-w-[450px] mx-auto bg-gradient-to-br from-[#0a2e1a] via-[#0d3d23] to-[#0a2e1a] border border-white/20 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between"
                >
                  {/* Card background elements */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />

                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <h4 className="text-primary font-black text-sm md:text-base tracking-tighter leading-none mb-1">
                        GREEN PEOPLE
                      </h4>
                      <div className="text-white/40 text-[9px] uppercase tracking-[0.2em]">Movement</div>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
                      <FontAwesomeIcon icon={faAward} className="text-primary w-5 h-5 md:w-6 md:h-6" />
                    </div>
                  </div>

                  <div className="relative z-10">
                    <div className="text-white font-bold text-lg md:text-2xl leading-tight mb-1 truncate">
                      {joinName({ first: formData.firstName, middle: formData.middleName, surname: formData.surname }) || "Green Member"}
                    </div>
                    <div className="flex items-center gap-3 text-white/60 text-xs md:text-sm font-medium">
                      <span>{formData.state} · {formData.lga}</span>
                      <span className="w-1 h-1 bg-white/20 rounded-full" />
                      <span className="text-primary uppercase tracking-widest font-bold text-[10px]">Verified Member</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end relative z-10 pt-4 border-t border-white/5">
                    <div className="text-[10px] text-white/30 font-mono">
                      GP-{formData.phone.slice(-6)}-{Math.floor(Math.random() * 10000)}
                    </div>
                    <div className="text-[10px] text-white/50 font-bold tracking-widest">
                      GREENPEOPLE.NG
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Long Explanatory Text */}
            <div className="glass-card p-6 md:p-10 mb-8 bg-white/5 border-white/10 space-y-8 text-white/80 leading-relaxed">
              <div className="space-y-4">
                <p className="font-bold text-white text-lg border-l-4 border-primary pl-4">Our Mission & Work</p>
                <p>
                  We are here to work very hard. We want to make a big and positive change in the results of the next elections — from the President down to the smallest elective position.
                </p>
                <p>
                  We are not supporting any political party. We are here to make sure that the results of the next elections truly show the will of the people of Nigeria.
                </p>
                <p>
                  People who follow politics know that bad politicians have clever ways to change election results against what the people really want. Our goal is to make it completely impossible for them to do this. And we will succeed.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-6 pt-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <FontAwesomeIcon icon={faBullseye} className="text-primary mb-3 text-xl" />
                  <h4 className="text-white font-bold text-xs mb-2">Step 1</h4>
                  <p className="text-[11px] leading-normal">Every member must get their PVC and be fully ready to vote.</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <FontAwesomeIcon icon={faLandmark} className="text-primary mb-3 text-xl" />
                  <h4 className="text-white font-bold text-xs mb-2">Step 2</h4>
                  <p className="text-[11px] leading-normal">We will ensure every member knows how to choose the right leaders.</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <FontAwesomeIcon icon={faUserGroup} className="text-primary mb-3 text-xl" />
                  <h4 className="text-white font-bold text-xs mb-2">Step 3</h4>
                  <p className="text-[11px] leading-normal">Get at least 10 million members ready to vote before 2027.</p>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <p className="font-bold text-white text-lg border-l-4 border-primary pl-4">Mandate Points & Rankings</p>
                <p>
                  Our formula is very simple: Everyone should simply do everything the group asks them to do. Everything we ask will be very simple and clear. And there will be rewards for everyone who does their part quickly and faithfully.
                </p>
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 mt-4">
                  <h4 className="text-primary font-bold text-sm mb-3">How the System Works</h4>
                  <p className="text-sm mb-4">
                    Every member has a personal page. Open it with this link:
                  </p>
                  <a
                    href={`/${formData.phone.replace(/\D/g, "")}`}
                    className="block bg-white/10 p-3 rounded-xl text-center font-mono text-sm text-primary-foreground border border-white/10 hover:bg-white/20 transition-colors mb-6"
                  >
                    greenpeople.ng/{formData.phone.replace(/\D/g, "")}
                  </a>

                  <div className="space-y-4 text-sm">
                    <p><span className="font-bold text-white">What are Mandate Points?</span> Mandate Points show how active you are. The more points you have, the higher your Rank — from Ward Leader up to President.</p>
                    <p><span className="font-bold text-white">How to earn points:</span></p>
                    <ul className="list-disc pl-5 space-y-2 text-xs">
                      <li>Visit your own page daily.</li>
                      <li>Click the links and Subscribe, Like, Comment, and Share posts.</li>
                      <li>Share your page with friends. When they take action, your points increase.</li>
                      <li>When people join from your page, you get a massive boost.</li>
                    </ul>
                    <p className="text-[11px] text-primary font-bold italic mt-2 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faChartLine} className="w-3 h-3" />
                      Important: Act fast! Points for each action become smaller as time passes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center pt-10">
                <p className="text-white font-bold mb-6">Just do this now:</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={`/${formData.phone.replace(/\D/g, "")}`}
                    className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold text-base hover:opacity-90 shadow-lg"
                  >
                    Go to Your Page & Earn Points
                  </a>
                  <button
                    className="bg-white/10 text-white px-8 py-4 rounded-2xl font-bold text-base hover:bg-white/20"
                  >
                    <FontAwesomeIcon icon={faShareNodes} className="mr-2" /> Share with Friends
                  </button>
                </div>
                <p className="text-white/40 text-xs mt-8">Thank you very much as you take action immediately. 🙏</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  const inputClass = "w-full bg-primary-foreground/10 border border-primary-foreground/15 rounded-xl px-3.5 py-2.5 text-sm text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none";
  const selectClass = "w-full bg-primary-foreground/10 border border-primary-foreground/15 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center]";
  const labelClass = "text-primary-foreground/70 text-xs font-medium mb-1.5 block";
  const errorClass = "text-red-400 text-[11px] mt-1";
  const inputErrorBorder = "border-red-400/60";

  return (
    <section id="join" className="py-20 md:py-28 gradient-green relative overflow-hidden" ref={ref}>
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <span className="text-primary font-semibold text-xs uppercase tracking-widest mb-3 block">
            Be Part of History
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3 leading-tight">
            Join the Movement
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
          className="max-w-xl mx-auto bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10 rounded-2xl p-6 md:p-8"
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
  );
};

export default JoinForm;
