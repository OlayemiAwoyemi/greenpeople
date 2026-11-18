import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp, faXTwitter, faInstagram, faFacebook, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faShieldHalved, faEnvelope, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import greenLogo from "@/assets/green-logo.png";
import PrivacyModal from "./PrivacyModal";
import Skyline from "./sky/Skyline";

const socialLinks = [
  { icon: faXTwitter, href: "https://x.com/greenpeopleng", label: "Green People on X" },
  { icon: faInstagram, href: "https://instagram.com/greenpeopleng", label: "Green People on Instagram" },
  { icon: faFacebook, href: "https://facebook.com/greenpeopleng", label: "Green People on Facebook" },
  { icon: faYoutube, href: "https://youtube.com/@greenpeopleng", label: "Green People on YouTube" },
];

const GreenFooter = () => (
  <footer className="relative">
    <Skyline className="h-36 md:h-52" />
    <div className="bg-white/70 backdrop-blur-md pb-10">
      <div className="section-container -mt-2 pt-12">
        <div className="glass p-8 md:p-10 text-center mb-10 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">The future won't wait. Will you?</h2>
          <p className="text-muted-foreground text-base max-w-md mx-auto mb-6">Every Nigerian who joins makes us stronger. Get updates and be part of the change.</p>
          <a href="/#join" className="btn-primary">Join Green People now <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" /></a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <img src={greenLogo} alt="" width={28} height={28} className="w-7 h-7 rounded-full" />
            <span className="font-bold text-sm text-foreground">Green People</span>
          </div>
          <ul className="flex items-center justify-center gap-2" aria-label="Social media">
            {socialLinks.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="w-11 h-11 rounded-full glass !rounded-full flex items-center justify-center text-foreground hover:-translate-y-0.5 transition-transform">
                  <FontAwesomeIcon icon={s.icon} className="w-4 h-4" />
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-center md:justify-end gap-2 text-muted-foreground text-sm font-semibold">
            <a href="https://wa.me/2348141894696" target="_blank" rel="noopener noreferrer" className="hover:text-foreground flex items-center gap-1.5 whitespace-nowrap min-h-11 px-2">
              <FontAwesomeIcon icon={faWhatsapp} className="w-3.5 h-3.5" /> WhatsApp
            </a>
            <PrivacyModal>
              <button className="hover:text-foreground flex items-center gap-1.5 whitespace-nowrap min-h-11 px-2">
                <FontAwesomeIcon icon={faShieldHalved} className="w-3.5 h-3.5" /> Privacy
              </button>
            </PrivacyModal>
            <a href="mailto:hello@greenpeople.ng" className="hover:text-foreground flex items-center gap-1.5 whitespace-nowrap min-h-11 px-2">
              <FontAwesomeIcon icon={faEnvelope} className="w-3.5 h-3.5" /> Contact
            </a>
          </div>
        </div>
        <div className="mt-8 text-center text-muted-foreground">
          <p className="text-sm">© {new Date().getFullYear()} Green People Movement — greenpeople.ng</p>
          <p className="text-xs mt-1">A people movement for Nigeria's future. Not affiliated with any political party.</p>
        </div>
      </div>
    </div>
  </footer>
);

export default GreenFooter;
