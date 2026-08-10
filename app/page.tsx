import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeatureTicker from "@/components/FeatureTicker";
import WhyMyEdou from "@/components/WhyMyEdou";
import ModulesNavigator from "@/components/ModulesNavigator";
import QuoteSelector from "@/components/QuoteSelector";
import CodeserveAbout from "@/components/CodeserveAbout";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#070B14] text-slate-100 selection:bg-[#5E9A2E]/30 selection:text-[#74B53C]">
      <Header />
      <Hero />
      <FeatureTicker />
      <WhyMyEdou />
      <ModulesNavigator />
      <QuoteSelector />
      <CodeserveAbout />
      <FAQSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
