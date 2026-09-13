import { SiteHeader } from "@/components/SiteHeader";
import { HeroSection } from "@/components/HeroSection";
import { WorkflowSection } from "@/components/WorkflowSection";
import { EcosystemStrip } from "@/components/EcosystemStrip";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] selection:bg-[var(--primary)] selection:text-white">
      <SiteHeader />
      <main className="flex-grow">
        <HeroSection />
        <WorkflowSection />
        <EcosystemStrip />
      </main>
      <SiteFooter />
    </div>
  );
}
