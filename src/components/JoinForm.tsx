import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faAward, faShareNodes, faCheck } from "@fortawesome/free-solid-svg-icons";

const nigerianStates = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
  "Yobe","Zamfara"
];

const ageGroups = ["18-24", "25-34", "35-44", "45-54", "55+"];

const JoinForm = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    state: "",
    lga: "",
    ageGroup: "",
    reason: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
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
                {formData.state || "Nigeria"} · Member #{Math.floor(Math.random() * 900000 + 100000)}
              </div>
              <div className="mt-4 flex items-center justify-center gap-1.5">
                <FontAwesomeIcon icon={faAward} className="w-3.5 h-3.5 text-primary" />
                <span className="text-primary font-medium text-xs">Verified Green Member</span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-primary-foreground mb-3">
              Welcome to the Movement! 🎉
            </h2>
            <p className="text-primary-foreground/60 text-sm mb-6">
              You are now part of something bigger. Share and bring others in.
            </p>

            <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity">
              <FontAwesomeIcon icon={faShareNodes} className="w-3.5 h-3.5" />
              Invite Friends
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

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
          className="max-w-xl mx-auto bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10 rounded-xl p-6 md:p-8"
        >
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-primary-foreground/70 text-xs font-medium mb-1.5 block">Full Name *</label>
              <input
                required
                type="text"
                maxLength={100}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Your full name"
                className="w-full bg-primary-foreground/10 border border-primary-foreground/15 rounded-md px-3 py-2.5 text-sm text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-primary-foreground/70 text-xs font-medium mb-1.5 block">Phone/WhatsApp *</label>
              <input
                required
                type="tel"
                maxLength={15}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="080XXXXXXXX"
                className="w-full bg-primary-foreground/10 border border-primary-foreground/15 rounded-md px-3 py-2.5 text-sm text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-primary-foreground/70 text-xs font-medium mb-1.5 block">State *</label>
              <select
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full bg-primary-foreground/10 border border-primary-foreground/15 rounded-md px-3 py-2.5 text-sm text-primary-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                <option value="" className="text-foreground">Select state</option>
                {nigerianStates.map((s) => (
                  <option key={s} value={s} className="text-foreground">{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-primary-foreground/70 text-xs font-medium mb-1.5 block">LGA</label>
              <input
                type="text"
                maxLength={100}
                value={formData.lga}
                onChange={(e) => setFormData({ ...formData, lga: e.target.value })}
                placeholder="Your LGA"
                className="w-full bg-primary-foreground/10 border border-primary-foreground/15 rounded-md px-3 py-2.5 text-sm text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-primary-foreground/70 text-xs font-medium mb-1.5 block">Age Group *</label>
            <div className="flex flex-wrap gap-2">
              {ageGroups.map((ag) => (
                <button
                  key={ag}
                  type="button"
                  onClick={() => setFormData({ ...formData, ageGroup: ag })}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                    formData.ageGroup === ag
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-primary-foreground/10 text-primary-foreground/60 border-primary-foreground/15 hover:border-primary-foreground/30"
                  }`}
                >
                  {ag}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="text-primary-foreground/70 text-xs font-medium mb-1.5 block">
              Why do you believe in Green People?
            </label>
            <textarea
              maxLength={500}
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Tell us your why..."
              className="w-full bg-primary-foreground/10 border border-primary-foreground/15 rounded-md px-3 py-2.5 text-sm text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-3 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faPaperPlane} className="w-3.5 h-3.5" />
            Join the Movement — It's Free
          </button>

          <p className="text-primary-foreground/30 text-[10px] text-center mt-3">
            Your information is secure. We will never share your data.
          </p>
        </motion.form>
      </div>
    </section>
  );
};

export default JoinForm;
