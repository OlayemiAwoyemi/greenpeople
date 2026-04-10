import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faAward, faShareNodes, faCheck } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { nigerianStates, nigerianStatesAndLGAs } from "@/data/nigerianLGAs";
import PrivacyModal from "./PrivacyModal";

const ageGroups = ["18-24", "25-34", "35-44", "45-54", "55+"];

const JoinForm = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    state: "",
    lga: "",
    ageGroup: "",
    gender: "",
    hasPvc: "",
    reason: "",
  });

  const lgaOptions = formData.state ? nigerianStatesAndLGAs[formData.state] || [] : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ageGroup || !formData.gender || !formData.hasPvc) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("members").insert({
      full_name: formData.fullName.trim(),
      phone: formData.phone.trim(),
      state: formData.state,
      lga: formData.lga,
      age_group: formData.ageGroup,
      gender: formData.gender,
      has_pvc: formData.hasPvc,
      reason: formData.reason.trim() || null,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Something went wrong", description: error.message, variant: "destructive" });
      return;
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
            className="max-w-md mx-auto text-center"
          >
            <div className="bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/15 rounded-xl p-6 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                <FontAwesomeIcon icon={faCheck} className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-primary-foreground mb-1">
                GREEN PEOPLE MOVEMENT
              </h3>
              <p className="text-primary-foreground/50 text-xs mb-4">Digital Membership Card</p>
              <div className="text-primary-foreground font-semibold text-base mb-1">
                {formData.fullName || "Green Member"}
              </div>
              <div className="text-primary-foreground/50 text-xs">
                {formData.state || "Nigeria"} · {formData.lga}
              </div>
              <div className="mt-4 flex items-center justify-center gap-1.5">
                <FontAwesomeIcon icon={faAward} className="w-3.5 h-3.5 text-primary" />
                <span className="text-primary font-medium text-xs">Verified Green Member</span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-primary-foreground mb-3">
              Welcome to the Movement! 🎉
            </h2>

            {needsPvc && (
              <div className="bg-primary/20 border border-primary/30 rounded-lg p-4 mb-4 text-left">
                <p className="text-primary-foreground text-sm font-semibold mb-2">
                  🗳️ Get Your PVC — It's Your Power!
                </p>
                <p className="text-primary-foreground/70 text-xs mb-3">
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

            <p className="text-primary-foreground/60 text-sm mb-6">
              You are now part of something bigger. Share and bring others in.
            </p>

            <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap">
              <FontAwesomeIcon icon={faShareNodes} className="w-3.5 h-3.5" />
              Invite Friends
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  const inputClass = "w-full bg-primary-foreground/10 border border-primary-foreground/15 rounded-xl px-3.5 py-2.5 text-sm text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none";
  const selectClass = "w-full bg-primary-foreground/10 border border-primary-foreground/15 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center]";
  const labelClass = "text-primary-foreground/70 text-xs font-medium mb-1.5 block";

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
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input required type="text" maxLength={100} value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Your full name" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone/WhatsApp *</label>
              <input required type="tel" maxLength={15} value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="080XXXXXXXX" className={inputClass} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>State *</label>
              <select required value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value, lga: "" })}
                className={selectClass}>
                <option value="" className="text-foreground">Select state</option>
                {nigerianStates.map((s) => (
                  <option key={s} value={s} className="text-foreground">{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Local Government *</label>
              <select required value={formData.lga}
                onChange={(e) => setFormData({ ...formData, lga: e.target.value })}
                className={selectClass} disabled={!formData.state}>
                <option value="" className="text-foreground">
                  {formData.state ? "Select LGA" : "Select state first"}
                </option>
                {lgaOptions.map((lga) => (
                  <option key={lga} value={lga} className="text-foreground">{lga}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Gender */}
          <div className="mb-4">
            <label className={labelClass}>Gender *</label>
            <div className="flex gap-3">
              {["Male", "Female"].map((g) => (
                <button key={g} type="button"
                  onClick={() => setFormData({ ...formData, gender: g })}
                  className={`px-5 py-2 rounded-lg text-xs font-medium border transition-all ${
                    formData.gender === g
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-primary-foreground/10 text-primary-foreground/60 border-primary-foreground/15 hover:border-primary-foreground/30"
                  }`}>{g}</button>
              ))}
            </div>
          </div>

          {/* Age Group */}
          <div className="mb-4">
            <label className={labelClass}>Age Group *</label>
            <div className="flex flex-wrap gap-2">
              {ageGroups.map((ag) => (
                <button key={ag} type="button"
                  onClick={() => setFormData({ ...formData, ageGroup: ag })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    formData.ageGroup === ag
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-primary-foreground/10 text-primary-foreground/60 border-primary-foreground/15 hover:border-primary-foreground/30"
                  }`}>{ag}</button>
              ))}
            </div>
          </div>

          {/* PVC Status */}
          <div className="mb-4">
            <label className={labelClass}>Do you have your PVC? *</label>
            <div className="flex flex-wrap gap-2">
              {["Yes", "No", "In Progress"].map((opt) => (
                <button key={opt} type="button"
                  onClick={() => setFormData({ ...formData, hasPvc: opt })}
                  className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${
                    formData.hasPvc === opt
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-primary-foreground/10 text-primary-foreground/60 border-primary-foreground/15 hover:border-primary-foreground/30"
                  }`}>{opt}</button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className={labelClass}>Why do you believe in Green People?</label>
            <textarea maxLength={500} rows={3} value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Tell us your why..."
              className={`${inputClass} resize-none`} />
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
