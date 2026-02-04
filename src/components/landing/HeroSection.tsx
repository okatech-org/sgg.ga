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
import { motion } from "framer-motion";
import { FadeInUp, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { Skeleton } from "@/components/ui/skeleton";
import heroImage from "@/assets/hero-libreville.jpg";

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
  const [bgLoaded, setBgLoaded] = useState(false);
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

  // Preload hero background
  useEffect(() => {
    const img = new Image();
    img.src = heroImage;
    img.onload = () => setBgLoaded(true);
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative min-h-[85vh] overflow-hidden flex items-center"
    >
      {/* Skeleton while loading */}
      {!bgLoaded && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
      )}
      
      {/* Background Image with Parallax - Libreville cityscape */}
      <div 
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ${bgLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          backgroundImage: `url(${heroImage})`,
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/75 to-an-dark/70 dark:from-background/95 dark:via-background/85 dark:to-an-dark/80" />
      
      {/* Decorative Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
      
      <div className="container relative mx-auto px-4 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
            {/* Badge */}
            <FadeInUp delay={0}>
              <div className="inline-flex items-center gap-2 rounded-full glass border-an/30 px-4 py-2 mb-6">
                <Globe className="h-4 w-4 text-an-light" />
                <span className="text-sm font-medium text-an-light">
                  Secrétariat Général du Gouvernement — Ve République
                </span>
              </div>
            </FadeInUp>
            
            {/* Title */}
            <FadeInUp delay={0.1}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-4">
                <span className="text-an-light">SGG Digital</span>
              </h1>
            </FadeInUp>
            
            <FadeInUp delay={0.2}>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-semibold text-white/90 mb-6">
                Moderniser la Gouvernance Gabonaise
              </h2>
            </FadeInUp>
            
            {/* Description */}
            <FadeInUp delay={0.3}>
              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl font-sans">
                Plateforme intégrée de coordination gouvernementale pour le suivi du PAG 2026 
                et la transformation digitale de l'État.
              </p>
            </FadeInUp>
            
            {/* CTA Buttons */}
            <FadeInUp delay={0.4}>
              <div className="flex flex-wrap gap-4 mb-12">
                <Link to="/auth">
                  <Button variant="hero" size="xl" className="group">
                    Se connecter
                    <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/demo">
                  <Button variant="hero-outline" size="xl" className="an-glow">
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
            </FadeInUp>
          </div>
          
          {/* Right Content - Mini Features Grid */}
          <StaggerContainer className="hidden lg:grid grid-cols-2 gap-4" delay={0.5}>
            {miniFeatures.map((feature, index) => (
              <StaggerItem key={index}>
                <motion.div 
                  className="glass rounded-xl p-5 transition-all duration-300 hover:scale-105 hover:shadow-an-lg"
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-an/20 flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-an-light" />
                    </div>
                    <h3 className="font-serif font-semibold text-white">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-white/70">{feature.description}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/60 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
