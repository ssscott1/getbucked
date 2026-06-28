import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { LoanCalculator } from "@/components/LoanCalculator";
import { ValueCards } from "@/components/ValueCards";
import { VoiceStrip } from "@/components/VoiceStrip";
import { Footer } from "@/components/Footer";
import { MobileBar } from "@/components/MobileBar";

export default function Home() {
  return (
    <main className="flex-1">
      <Nav />
      <Hero />
      <Marquee />
      <LoanCalculator />
      <ValueCards />
      <VoiceStrip />
      <Footer />
      <MobileBar />
    </main>
  );
}
