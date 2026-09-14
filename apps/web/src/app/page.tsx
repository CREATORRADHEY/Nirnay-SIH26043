import { SiteHeader } from "@/components/SiteHeader";
import { HeroSection } from "@/components/HeroSection";
import { WorkflowSection } from "@/components/WorkflowSection";
import { PlatformCapabilities } from "@/components/PlatformCapabilities";
import { JuryScenariosSection } from "@/components/JuryScenariosSection";
import { EcosystemStrip } from "@/components/EcosystemStrip";
import { CallToActionSection } from "@/components/CallToActionSection";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917] selection:bg-[#EA580C] selection:text-white font-sans">
      <SiteHeader />
      <main className="flex-grow">
        <HeroSection />
        <WorkflowSection />
        <PlatformCapabilities />
        <JuryScenariosSection />
        <EcosystemStrip />
        <CallToActionSection />
      </main>
      <SiteFooter />
    </div>
  );
}
