import { useEffect } from "react";
import LandingHeader from "@/components/landing/LandingHeader";
import HeroSection from "@/components/landing/HeroSection";
import QuickLinksSection from "@/components/landing/QuickLinksSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ProductShowcaseSection from "@/components/landing/ProductShowcaseSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import ContactPreFooter from "@/components/landing/ContactPreFooter";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Landing() {
  // Smooth scroll for anchor links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      if (anchor) {
        e.preventDefault();
        const id = anchor.getAttribute('href')?.slice(1);
        if (id) {
          const element = document.getElementById(id);
          element?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Intersection Observer for fade-in animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          entry.target.classList.remove('opacity-0', 'translate-y-4');
        }
      });
    }, observerOptions);

    // Observe all sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      
      <main>
        <HeroSection />
        <QuickLinksSection />
        <div id="features">
          <FeaturesSection />
        </div>
        <div id="about">
          <ProductShowcaseSection />
        </div>
        <BenefitsSection />
        <TestimonialsSection />
        <FinalCTASection />
        <ContactPreFooter />
      </main>
      
      <LandingFooter />
    </div>
  );
}
