import { Leaf, MessageCircle, Mail, Shield } from "lucide-react";

const GreenFooter = () => {
  return (
    <footer className="bg-foreground py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-foreground to-foreground/95" />

      <div className="section-container relative z-10">
        {/* Final CTA */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-black text-primary-foreground mb-4">
            The future won't wait.
            <br />
            <span className="text-accent">Will you?</span>
          </h2>
          <p className="text-primary-foreground/60 text-lg max-w-xl mx-auto mb-8">
            Every single Nigerian who joins makes us stronger. This is our time. This is our country. This is our movement.
          </p>
          <a
            href="#join"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-4 rounded-full text-lg font-bold hover:opacity-90 transition-opacity"
          >
            Join Green People Now
          </a>
        </div>

        <div className="border-t border-primary-foreground/10 pt-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Leaf className="w-6 h-6 text-accent" />
              <span className="font-bold text-primary-foreground">Green People Movement</span>
            </div>

            <div className="flex items-center gap-6 text-primary-foreground/50 text-sm">
              <a href="#" className="hover:text-accent transition-colors flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" />
                WhatsApp Community
              </a>
              <a href="#" className="hover:text-accent transition-colors flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                Privacy Policy
              </a>
              <a href="#" className="hover:text-accent transition-colors flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                Contact
              </a>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-primary-foreground/30 text-sm">
              © {new Date().getFullYear()} Green People Movement — greenpeople.ng
            </p>
            <p className="text-primary-foreground/20 text-xs mt-2">
              A people movement for Nigeria's future. Not affiliated with any political party.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GreenFooter;
