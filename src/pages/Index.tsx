/**
 * SGG Digital — Landing Page Publique
 * Page d'accueil accessible à tous, sans authentification requise.
 */

import LandingHeader from "@/components/landing/LandingHeader";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import ProductShowcaseSection from "@/components/landing/ProductShowcaseSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import QuickLinksSection from "@/components/landing/QuickLinksSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import ContactPreFooter from "@/components/landing/ContactPreFooter";
import LandingFooter from "@/components/landing/LandingFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <BenefitsSection />
        <ProductShowcaseSection />
        <TestimonialsSection />
        <QuickLinksSection />
        <FinalCTASection />
        <ContactPreFooter />
      </main>
      <LandingFooter />
    </div>
  );
};

export default Index;
