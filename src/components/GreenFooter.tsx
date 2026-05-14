import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp, faXTwitter, faInstagram, faFacebook, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faShieldHalved, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import greenLogo from "@/assets/green-logo.png";
import PrivacyModal from "./PrivacyModal";

const socialLinks = [
  { icon: faXTwitter, href: "https://x.com/greenpeopleng", label: "X" },
  { icon: faInstagram, href: "https://instagram.com/greenpeopleng", label: "Instagram" },
  { icon: faFacebook, href: "https://facebook.com/greenpeopleng", label: "Facebook" },
  { icon: faYoutube, href: "https://youtube.com/@greenpeopleng", label: "YouTube" },
];

const GreenFooter = () => {
  return (
    <footer className="bg-white py-20 border-t border-gray-100">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-black text-foreground mb-4 tracking-tight">
            The future won't wait. <span className="text-primary italic">Will you?</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8 font-medium">
            Every Nigerian who joins makes us stronger. This is our time.
          </p>
          <a
            href="#join"
            className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-10 py-4 rounded-full text-base font-bold hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
          >
            Join Green People Now
          </a>
        </div>

        <div className="pt-12 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <img src={greenLogo} alt="Green People" className="w-8 h-8 rounded-full shadow-sm" />
              <span className="font-bold text-lg text-foreground tracking-tight">Green People</span>
            </div>

            <div className="flex items-center justify-center gap-4">
              {socialLinks.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/5 transition-all border border-gray-100"
                  aria-label={s.label}>
                  <FontAwesomeIcon icon={s.icon} className="w-4 h-4" />
                </a>
              ))}
            </div>

            <div className="flex items-center justify-center md:justify-end gap-6 text-gray-400 text-sm font-medium">
              <a href="https://wa.me/2348141894696" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">
                <FontAwesomeIcon icon={faWhatsapp} className="w-4 h-4" />
                WhatsApp
              </a>
              <PrivacyModal>
                <button className="hover:text-primary transition-colors flex items-center gap-2">
                  <FontAwesomeIcon icon={faShieldHalved} className="w-4 h-4" />
                  Privacy
                </button>
              </PrivacyModal>
            </div>
          </div>

          <div className="mt-12 text-center border-t border-gray-50 pt-8">
            <p className="text-gray-400 text-sm font-medium">
              © {new Date().getFullYear()} Green People Movement — greenpeople.ng
            </p>
            <p className="text-gray-300 text-xs mt-2 max-w-lg mx-auto leading-relaxed">
              A people-powered movement for Nigeria's future. Not affiliated with any political party. Registered as a non-profit initiative dedicated to civic engagement.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GreenFooter;
