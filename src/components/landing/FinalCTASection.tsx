import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Globe
} from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";

const ctaFeatures = [
  "Accès à tous les modules",
  "Formation incluse",
  "Support prioritaire 24/7",
  "Mises à jour automatiques"
];

export default function FinalCTASection() {
  return (
    <section className="py-16 md:py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <AnimatedSection delay={0}>
          <div className="relative rounded-3xl bg-gradient-to-br from-government-navy via-government-navy-light to-government-navy overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
            
            {/* Decorative Shapes */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-government-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-government-green/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-12 p-8 md:p-12 lg:p-16">
              {/* Left Content */}
              <div className="text-white">
                <div className="inline-flex items-center gap-2 rounded-full bg-government-gold/20 px-4 py-2 mb-6">
                  <Sparkles className="h-4 w-4 text-government-gold" />
                  <span className="text-sm font-medium text-government-gold">
                    Commencez dès aujourd'hui
                  </span>
                </div>
                
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                  Rejoignez la transformation{" "}
                  <span className="text-government-gold">digitale</span>
                </h2>
                
                <p className="text-lg text-white/80 mb-8 max-w-lg">
                  Modernisez vos processus administratifs et participez à la construction 
                  d'une gouvernance plus efficace et transparente.
                </p>
                
                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {ctaFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-government-gold/20 flex items-center justify-center">
                        <CheckCircle2 className="h-3.5 w-3.5 text-government-gold" />
                      </div>
                      <span className="text-white/90">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4">
                  <Link to="/auth">
                    <Button variant="hero" size="xl" className="group">
                      Se connecter
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/demo">
                    <Button variant="hero-outline" size="xl">
                      Essayer la démo
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Right Content - Decorative */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative">
                  {/* Central Globe Icon */}
                  <div className="h-40 w-40 rounded-full bg-government-gold/10 border border-government-gold/20 flex items-center justify-center backdrop-blur-sm">
                    <Globe className="h-20 w-20 text-government-gold" />
                  </div>
                  
                  {/* Orbiting Elements */}
                  <div className="absolute -top-8 -right-8 h-20 w-20 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center animate-float">
                    <span className="text-2xl font-bold text-white">35</span>
                  </div>
                  <div className="absolute -bottom-4 -left-12 h-24 w-24 rounded-xl bg-government-gold/20 backdrop-blur-sm border border-government-gold/30 flex flex-col items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
                    <span className="text-2xl font-bold text-government-gold">24/7</span>
                    <span className="text-xs text-white/70">Disponible</span>
                  </div>
                  <div className="absolute top-1/2 -right-16 h-16 w-16 rounded-full bg-government-green/20 border border-government-green/30 flex items-center justify-center animate-float" style={{ animationDelay: '2s' }}>
                    <CheckCircle2 className="h-8 w-8 text-government-green" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
