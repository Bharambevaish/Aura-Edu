import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import FeatureTicker from "@/components/landing/FeatureTicker";
import WhyAuraEdu from "@/components/landing/WhyAuraEdu";
import ModulesNavigator from "@/components/landing/ModulesNavigator";
import QuoteSelector from "@/components/landing/QuoteSelector";
import AboutSection from "@/components/landing/AboutSection";
import FAQSection from "@/components/landing/FAQSection";
import ContactSection from "@/components/landing/ContactSection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#070B14] text-slate-100 selection:bg-[#5E9A2E]/30 selection:text-[#74B53C]">
      <Header />
      <Hero />
      <FeatureTicker />
      <WhyAuraEdu />
      <ModulesNavigator />
      <QuoteSelector />
      <AboutSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
