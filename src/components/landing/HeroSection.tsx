import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Globe, 
  Sparkles, 
  BarChart3, 
  Users, 
  FileText, 
  Shield 
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const miniFeatures = [
  {
    icon: BarChart3,
    title: "Suivi GAR",
    description: "Indicateurs temps réel"
  },
  {
    icon: Users,
    title: "Nominations",
    description: "Processus dématérialisé"
  },
  {
    icon: FileText,
    title: "Cycle Législatif",
    description: "Gestion des textes"
  },
  {
    icon: Shield,
    title: "Sécurité",
    description: "Chiffrement AES-256"
  }
];

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        if (rect.bottom > 0) {
          setScrollY(window.scrollY);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative min-h-[85vh] overflow-hidden flex items-center"
    >
      {/* Background Image with Parallax */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
      />
      
      {/* Gradient Overlay - Light mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-900/40 dark:from-black/85 dark:via-black/70 dark:to-black/50" />
      
      {/* Decorative Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
      
      <div className="container relative mx-auto px-4 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-government-gold/20 backdrop-blur-sm border border-government-gold/30 px-4 py-2 mb-6 animate-fade-in">
              <Globe className="h-4 w-4 text-government-gold" />
              <span className="text-sm font-medium text-government-gold">
                Secrétariat Général du Gouvernement — Ve République
              </span>
            </div>
            
            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 animate-slide-up">
              <span className="text-government-gold">SGG Digital</span>
            </h1>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white/90 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Moderniser la Gouvernance Gabonaise
            </h2>
            
            {/* Description */}
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Plateforme intégrée de coordination gouvernementale pour le suivi du PAG 2026 
              et la transformation digitale de l'État.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link to="/auth">
                <Button variant="hero" size="xl" className="group">
                  Se connecter
                  <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="hero-outline" size="xl" className="animate-pulse-gold">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Essayer la démo
                </Button>
              </Link>
              <Link to="/journal-officiel">
                <Button variant="hero-outline" size="lg">
                  Journal Officiel
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Right Content - Mini Features Grid */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {miniFeatures.map((feature, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5 transition-all duration-300 hover:bg-white/15 hover:scale-105 hover:shadow-xl animate-fade-in"
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-government-gold/20 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-government-gold" />
                  </div>
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                </div>
                <p className="text-sm text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/60 rounded-full" />
        </div>
      </div>
    </section>
  );
}
