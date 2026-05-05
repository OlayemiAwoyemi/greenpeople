import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhyNow from "@/components/WhyNow";
import OurMission from "@/components/OurMission";
import HowToRegister from "@/components/HowToRegister";
import WhatWeStandFor from "@/components/WhatWeStandFor";
import Momentum from "@/components/Momentum";

import JoinForm from "@/components/JoinForm";
import GreenFooter from "@/components/GreenFooter";
import FloatingLeaves from "@/components/FloatingLeaves";
import GreenGuide from "@/components/GreenGuide";

const TestPage = () => {
  return (
    <div className="min-h-screen">
      <div className="bg-yellow-500/20 text-yellow-200 text-[10px] font-bold py-1 text-center border-b border-yellow-500/30 sticky top-0 z-[60] backdrop-blur-sm">
        TEST MODE: Registration data will not be saved to the database
      </div>
      <Navbar />
      <FloatingLeaves />
      <main>
        <Hero />
        <WhyNow />
        <OurMission />
        <HowToRegister />
        <WhatWeStandFor />
        <Momentum />
        
        <JoinForm isTest={true} />
      </main>
      <GreenFooter />
      <GreenGuide />
    </div>
  );
};

export default TestPage;
