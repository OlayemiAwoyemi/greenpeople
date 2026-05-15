import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp, faXTwitter, faInstagram, faFacebook, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faShieldHalved, faEnvelope, faArrowRight } from "@fortawesome/free-solid-svg-icons";
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
    <footer className="gp-frame bg-background pt-20 pb-12">
      <div className="gp-divider" />
      <div className="section-container pt-20">
        {/* Big CTA */}
        <div className="max-w-4xl mb-20">
          <div className="gp-eyebrow mb-5">Join us</div>
          <h2 className="gp-display text-foreground text-[40px] md:text-[56px] lg:text-[64px] mb-8">
            The future won't wait. Will you?
          </h2>
          <a href="#join" className="gp-pill-primary">
            Join Green People
            <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5 ml-2" />
          </a>
        </div>

        <div className="gp-divider mb-10" />

        <div className="grid md:grid-cols-3 items-center gap-6">
          <div className="flex items-center gap-2.5">
            <img src={greenLogo} alt="Green People" className="w-7 h-7 rounded-full" />
            <span className="font-semibold text-[15px] text-foreground">Green People</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            {socialLinks.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/60 hover:text-accent hover:bg-foreground/10 transition-all"
                aria-label={s.label}>
                <FontAwesomeIcon icon={s.icon} className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>

          <div className="flex items-center justify-start md:justify-end gap-5 text-foreground/60 text-[13px]">
            <a href="https://wa.me/2348141894696" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <FontAwesomeIcon icon={faWhatsapp} className="w-3 h-3" />
              WhatsApp
            </a>
            <PrivacyModal>
              <button className="hover:text-foreground transition-colors flex items-center gap-1.5">
                <FontAwesomeIcon icon={faShieldHalved} className="w-3 h-3" />
                Privacy
              </button>
            </PrivacyModal>
            <a href="mailto:hello@greenpeople.ng" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3" />
              Contact
            </a>
          </div>
        </div>

        <div className="mt-10 text-foreground/40 text-[12px]">
          © {new Date().getFullYear()} Green People Movement — greenpeople.ng · A people movement for Nigeria's future. Not affiliated with any political party.
        </div>
      </div>
    </footer>
  );
};

export default GreenFooter;
