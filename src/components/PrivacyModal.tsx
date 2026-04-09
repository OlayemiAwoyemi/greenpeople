import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const PrivacyModal = ({ children }: { children: React.ReactNode }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Privacy Policy</DialogTitle>
        </DialogHeader>
        <div className="prose prose-sm text-muted-foreground space-y-4 mt-4">
          <p className="text-sm leading-relaxed">
            <strong className="text-foreground">Last updated:</strong> {new Date().toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <h3 className="text-base font-semibold text-foreground">1. Information We Collect</h3>
          <p className="text-sm leading-relaxed">
            When you join the Green People Movement, we collect your full name, phone number, state, local government area, age group, gender, PVC status, and your reason for joining. This information helps us organise the movement effectively across all 36 states + FCT.
          </p>

          <h3 className="text-base font-semibold text-foreground">2. How We Use Your Information</h3>
          <p className="text-sm leading-relaxed">
            Your information is used solely for movement coordination, voter registration support, community engagement, and to connect you with other Green People members in your area. We may send updates about the movement via WhatsApp or SMS.
          </p>

          <h3 className="text-base font-semibold text-foreground">3. Data Protection</h3>
          <p className="text-sm leading-relaxed">
            We take the security of your data seriously. Your personal information is stored securely and encrypted. We implement industry-standard security measures to protect against unauthorised access, alteration, or destruction of your data.
          </p>

          <h3 className="text-base font-semibold text-foreground">4. Data Sharing</h3>
          <p className="text-sm leading-relaxed">
            We do not sell, trade, or rent your personal information to third parties. Your data will never be shared with any political party, government agency, or commercial entity without your explicit consent.
          </p>

          <h3 className="text-base font-semibold text-foreground">5. Your Rights</h3>
          <p className="text-sm leading-relaxed">
            You have the right to access, correct, or request deletion of your personal data at any time. Contact us at hello@greenpeople.ng to exercise any of these rights.
          </p>

          <h3 className="text-base font-semibold text-foreground">6. Contact Us</h3>
          <p className="text-sm leading-relaxed">
            If you have any questions about this privacy policy, please contact us at{" "}
            <a href="mailto:hello@greenpeople.ng" className="text-primary hover:underline">hello@greenpeople.ng</a>{" "}
            or via WhatsApp at{" "}
            <a href="https://wa.me/2348141894696" className="text-primary hover:underline">+234 814 189 4696</a>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyModal;
