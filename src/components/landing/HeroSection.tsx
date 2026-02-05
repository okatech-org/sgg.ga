
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FadeInUp } from "@/components/ui/motion";
import { Skeleton } from "@/components/ui/skeleton";
import heroBg from "@/assets/hero-bg.png";
import modulesImg from "@/assets/modules-card.png";
import aboutImg from "@/assets/about-card.png";
import joImg from "@/assets/jo-card.png";

const mainSections = [
  {
    title: "Modules Applicatifs",
    description: "Accédez aux outils de gestion gouvernementale : GAR, Nominations, Cycle Législatif...",
    image: modulesImg,
    link: "/modules",
    color: "from-blue-600 to-indigo-600"
  },
  {
    title: "À Propos",
    description: "Découvrez le Secrétariat Général du Gouvernement et sa mission.",
    image: aboutImg,
    link: "/about",
    color: "from-emerald-600 to-teal-600"
  },
  {
    title: "Journal Officiel",
    description: "Consultez les textes législatifs et réglementaires de la République.",
    image: joImg,
    link: "/journal-officiel",
    color: "from-amber-600 to-orange-600"
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
    img.src = heroBg;
    img.onload = () => setBgLoaded(true);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen overflow-hidden flex flex-col justify-center pt-24 pb-12"
    >
      {/* Skeleton while loading */}
      {!bgLoaded && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
      )}

      {/* Background Image with Parallax */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ${bgLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          backgroundImage: `url(${heroBg})`,
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/80 to-an-dark/90 dark:from-background/95 dark:via-background/90 dark:to-an-dark/95" />

      {/* Content */}
      <div className="container relative mx-auto px-4 z-10">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <FadeInUp delay={0}>
            <div className="inline-flex items-center gap-2 rounded-full glass border-an/30 px-4 py-2 mb-6 mx-auto">
              <img src="/emblem_gabon.png" alt="Gabon" className="h-4 w-4 object-contain" />
              <span className="text-sm font-medium text-an-light">
                République Gabonaise
              </span>
            </div>
          </FadeInUp>

          <FadeInUp delay={0.1}>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold leading-tight mb-6 text-white">
              SGG <span className="text-an-light">Digital</span>
            </h1>
          </FadeInUp>

          <FadeInUp delay={0.2}>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto font-sans leading-relaxed">
              La plateforme centrale de coordination et de modernisation de l'action gouvernementale.
            </p>
          </FadeInUp>

          <FadeInUp delay={0.3}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth">
                <Button variant="hero" size="lg" className="group">
                  Espace Membre
                  <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="hero-outline" size="lg" className="an-glow">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Découvrir la démo
                </Button>
              </Link>
            </div>
          </FadeInUp>
        </div>

        {/* 3 Main Sections Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mt-8">
          {mainSections.map((section, index) => (
            <FadeInUp key={index} delay={0.4 + (index * 0.1)}>
              <Link to={section.link} className="block group h-full">
                <motion.div
                  className="relative h-full overflow-hidden rounded-2xl glass border border-white/10 transition-all duration-300 hover:scale-[1.02]"
                  whileHover={{ y: -5 }}
                >
                  <div className="absolute inset-0">
                    <img
                      src={section.image}
                      alt={section.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${section.color} mix-blend-multiply opacity-80`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>

                  <div className="relative p-8 h-full flex flex-col justify-end">
                    <h3 className="text-2xl font-bold text-white mb-2 font-serif tracking-wide border-l-4 border-an-light pl-3">
                      {section.title}
                    </h3>
                    <p className="text-white/80 text-sm mb-4 line-clamp-3">
                      {section.description}
                    </p>
                    <div className="flex items-center text-an-light font-medium text-sm mt-auto group-hover:underline decoration-an-light underline-offset-4">
                      Accéder <ArrowRight className="h-4 w-4 ml-2" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            </FadeInUp>
          ))}
        </div>

      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-60"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-5 h-8 rounded-full border border-white/40 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white/60 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
