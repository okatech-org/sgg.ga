import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";
import { FadeInView } from "@/components/ui/motion";

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
        <FadeInView>
          <div className="relative rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-an-dark overflow-hidden neu-card">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
            
            {/* Decorative Shapes */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-an/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-success/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-12 p-8 md:p-12 lg:p-16">
              {/* Left Content */}
              <div className="text-white">
                <div className="inline-flex items-center gap-2 rounded-full bg-an/20 px-4 py-2 mb-6">
                  <Sparkles className="h-4 w-4 text-an-light" />
                  <span className="text-sm font-medium text-an-light">
                    Commencez dès aujourd'hui
                  </span>
                </div>
                
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6">
                  Rejoignez la transformation{" "}
                  <span className="text-an-light">digitale</span>
                </h2>
                
                <p className="text-lg text-white/80 mb-8 max-w-lg">
                  Modernisez vos processus administratifs et participez à la construction 
                  d'une gouvernance plus efficace et transparente.
                </p>
                
                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {ctaFeatures.map((feature, index) => (
                    <motion.li 
                      key={index} 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="h-5 w-5 rounded-full bg-an/20 flex items-center justify-center">
                        <CheckCircle2 className="h-3.5 w-3.5 text-an-light" />
                      </div>
                      <span className="text-white/90">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                
                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4">
                  <Link to="/auth">
                    <Button variant="hero" size="xl" className="group bg-an hover:bg-an-dark">
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
                  <motion.div 
                    className="h-40 w-40 rounded-full bg-an/10 border border-an/20 flex items-center justify-center backdrop-blur-sm"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  >
                    <Globe className="h-20 w-20 text-an-light" />
                  </motion.div>
                  
                  {/* Orbiting Elements */}
                  <motion.div 
                    className="absolute -top-8 -right-8 h-20 w-20 rounded-xl glass flex items-center justify-center"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <span className="text-2xl font-bold text-white">35</span>
                  </motion.div>
                  <motion.div 
                    className="absolute -bottom-4 -left-12 h-24 w-24 rounded-xl bg-an/20 backdrop-blur-sm border border-an/30 flex flex-col items-center justify-center"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  >
                    <span className="text-2xl font-bold text-an-light">24/7</span>
                    <span className="text-xs text-white/70">Disponible</span>
                  </motion.div>
                  <motion.div 
                    className="absolute top-1/2 -right-16 h-16 w-16 rounded-full bg-success/20 border border-success/30 flex items-center justify-center"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  >
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
