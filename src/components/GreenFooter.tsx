import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faShieldHalved, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import greenLogo from "@/assets/green-logo.png";
import PrivacyModal from "./PrivacyModal";

const GreenFooter = () => {
  return (
    <footer className="bg-accent py-14">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-accent-foreground mb-3">
            The future won't wait. <span className="text-primary">Will you?</span>
          </h2>
          <p className="text-accent-foreground/50 text-sm max-w-md mx-auto mb-6">
            Every Nigerian who joins makes us stronger. This is our time.
          </p>
          <a
            href="#join"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Join Green People Now
          </a>
        </div>

        <div className="border-t border-accent-foreground/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={greenLogo} alt="Green People" className="w-6 h-6 rounded-full" />
              <span className="font-semibold text-sm text-accent-foreground">Green People Movement</span>
            </div>

            <div className="flex items-center gap-5 text-accent-foreground/40 text-xs">
              <a href="https://wa.me/2348141894696" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1.5 whitespace-nowrap">
                <FontAwesomeIcon icon={faWhatsapp} className="w-3.5 h-3.5" />
                WhatsApp
              </a>
              <PrivacyModal>
                <button className="hover:text-primary transition-colors flex items-center gap-1.5 whitespace-nowrap">
                  <FontAwesomeIcon icon={faShieldHalved} className="w-3.5 h-3.5" />
                  Privacy
                </button>
              </PrivacyModal>
              <a href="mailto:hello@greenpeople.ng" className="hover:text-primary transition-colors flex items-center gap-1.5 whitespace-nowrap">
                <FontAwesomeIcon icon={faEnvelope} className="w-3.5 h-3.5" />
                Contact
              </a>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-accent-foreground/25 text-xs">
              © {new Date().getFullYear()} Green People Movement — greenpeople.ng
            </p>
            <p className="text-accent-foreground/15 text-[10px] mt-1">
              A people movement for Nigeria's future. Not affiliated with any political party.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GreenFooter;
