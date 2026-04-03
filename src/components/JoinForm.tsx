import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Send, Award, Share2, Check } from "lucide-react";

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
      <section id="join" className="py-24 md:py-32 gradient-green" ref={ref}>
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center"
          >
            {/* Digital Membership Card */}
            <div className="bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-3xl p-8 mb-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 flex">
                <div className="flex-1 bg-primary-foreground/30" />
                <div className="flex-1 bg-primary-foreground" />
                <div className="flex-1 bg-primary-foreground/30" />
              </div>
              <div className="mt-4">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-display text-2xl font-bold text-primary-foreground mb-1">
                  GREEN PEOPLE MOVEMENT
                </h3>
                <p className="text-primary-foreground/60 text-sm mb-6">Digital Membership Card</p>
                <div className="text-primary-foreground font-bold text-xl mb-1">
                  {formData.fullName || "Green Member"}
                </div>
                <div className="text-primary-foreground/60 text-sm">
                  {formData.state || "Nigeria"} • Member #{Math.floor(Math.random() * 900000 + 100000)}
                </div>
                <div className="mt-6 flex items-center justify-center gap-2">
                  <Award className="w-5 h-5 text-accent" />
                  <span className="text-accent font-semibold text-sm">Verified Green Member</span>
                </div>
              </div>
            </div>

            <h2 className="font-display text-3xl font-black text-primary-foreground mb-4">
              Welcome to the Movement! 🎉
            </h2>
            <p className="text-primary-foreground/70 mb-8">
              You are now part of something bigger than any one person. Share your membership and bring others in.
            </p>

            <button className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-4 rounded-full font-bold hover:opacity-90 transition-opacity">
              <Share2 className="w-5 h-5" />
              Invite Friends & Become a Green Ambassador
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="join" className="py-24 md:py-32 gradient-green relative overflow-hidden" ref={ref}>
      <div className="absolute top-20 right-20 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-widest mb-4 block">
            Be Part of History
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-primary-foreground mb-6 leading-tight">
            Join the movement
          </h2>
          <p className="text-primary-foreground/70 text-lg">
            It's free. It takes 60 seconds. And it could change Nigeria forever.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10 rounded-3xl p-8 md:p-10"
        >
          <div className="grid sm:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="text-primary-foreground/80 text-sm font-medium mb-2 block">Full Name *</label>
              <input
                required
                type="text"
                maxLength={100}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Your full name"
                className="w-full bg-primary-foreground/10 border border-primary-foreground/20 rounded-xl px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label className="text-primary-foreground/80 text-sm font-medium mb-2 block">Phone/WhatsApp *</label>
              <input
                required
                type="tel"
                maxLength={15}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="080XXXXXXXX"
                className="w-full bg-primary-foreground/10 border border-primary-foreground/20 rounded-xl px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="text-primary-foreground/80 text-sm font-medium mb-2 block">State *</label>
              <select
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full bg-primary-foreground/10 border border-primary-foreground/20 rounded-xl px-4 py-3 text-primary-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="" className="text-foreground">Select state</option>
                {nigerianStates.map((s) => (
                  <option key={s} value={s} className="text-foreground">{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-primary-foreground/80 text-sm font-medium mb-2 block">LGA</label>
              <input
                type="text"
                maxLength={100}
                value={formData.lga}
                onChange={(e) => setFormData({ ...formData, lga: e.target.value })}
                placeholder="Your LGA"
                className="w-full bg-primary-foreground/10 border border-primary-foreground/20 rounded-xl px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="text-primary-foreground/80 text-sm font-medium mb-2 block">Age Group *</label>
            <div className="flex flex-wrap gap-3">
              {ageGroups.map((ag) => (
                <button
                  key={ag}
                  type="button"
                  onClick={() => setFormData({ ...formData, ageGroup: ag })}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    formData.ageGroup === ag
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-primary-foreground/10 text-primary-foreground/70 border-primary-foreground/20 hover:border-primary-foreground/40"
                  }`}
                >
                  {ag}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="text-primary-foreground/80 text-sm font-medium mb-2 block">
              Why do you believe in Green People?
            </label>
            <textarea
              maxLength={500}
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Tell us your why..."
              className="w-full bg-primary-foreground/10 border border-primary-foreground/20 rounded-xl px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-accent text-accent-foreground py-4 rounded-full text-lg font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-xl"
          >
            <Send className="w-5 h-5" />
            Join the Movement — It's Free
          </button>

          <p className="text-primary-foreground/40 text-xs text-center mt-4">
            Your information is secure. We will never share your data.
          </p>
        </motion.form>
      </div>
    </section>
  );
};

export default JoinForm;
