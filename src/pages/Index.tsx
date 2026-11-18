import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhyNow from "@/components/WhyNow";
import OurMission from "@/components/OurMission";
import HowToRegister from "@/components/HowToRegister";
import WhatWeStandFor from "@/components/WhatWeStandFor";
import Momentum from "@/components/Momentum";

import JoinForm from "@/components/JoinForm";
import GreenFooter from "@/components/GreenFooter";
import ElectionMatters from "@/components/ElectionMatters";
import GreenGuide from "@/components/GreenGuide";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <WhyNow />
        <OurMission />
        <HowToRegister />
        <WhatWeStandFor />
        <Momentum />
        <ElectionMatters />
        
        <JoinForm />
      </main>
      <GreenFooter />
      <GreenGuide />
    </div>
  );
};

export default Index;
