import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Users, 
  FileText, 
  BookOpen,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Tableau de Bord GAR",
    description: "Suivi en temps réel de l'exécution du Plan d'Action Gouvernemental avec indicateurs de performance et alertes automatiques.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    href: "/dashboard",
    stats: "98% de précision"
  },
  {
    icon: Users,
    title: "Portail Nominations",
    description: "Dématérialisation complète du processus de contrôle des nominations aux hautes fonctions publiques.",
    image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    href: "/nominations",
    stats: "Délai réduit de 60%"
  },
  {
    icon: FileText,
    title: "Cycle Législatif",
    description: "Gestion des Conseils Interministériels, suivi des textes et coordination du travail gouvernemental.",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    href: "/cycle-legislatif",
    stats: "500+ textes/an"
  },
  {
    icon: BookOpen,
    title: "Journal Officiel",
    description: "Accès open data aux textes juridiques officiels de la République avec moteur de recherche avancé.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    href: "/journal-officiel",
    stats: "Accès public 24/7"
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-government-navy/10 px-4 py-2 mb-4">
            <TrendingUp className="h-4 w-4 text-government-navy" />
            <span className="text-sm font-medium text-government-navy">
              Modules de la Plateforme
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Une solution intégrée pour la{" "}
            <span className="text-government-gold">transformation digitale</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez les outils qui modernisent le Secrétariat Général du Gouvernement
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative bg-card border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-gov-xl hover:border-government-gold/30"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={feature.image} 
                  alt={feature.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Icon Overlay */}
                <div className="absolute -bottom-6 left-6 z-10">
                  <div className="h-14 w-14 rounded-xl bg-government-navy shadow-lg flex items-center justify-center border-4 border-card group-hover:bg-government-gold transition-colors duration-300">
                    <feature.icon className="h-7 w-7 text-white group-hover:text-government-navy transition-colors" />
                  </div>
                </div>
                
                {/* Stats Badge */}
                <div className="absolute top-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-government-green" />
                    <span className="text-xs font-medium text-government-navy">{feature.stats}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 pt-10">
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-government-gold transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {feature.description}
                </p>
                
                {/* CTA - appears on hover */}
                <Link to={feature.href} className="inline-block">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 text-government-navy hover:text-government-gold"
                  >
                    Découvrir
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link to="/demo">
            <Button variant="outline" size="lg" className="group">
              <Clock className="h-4 w-4 mr-2" />
              Explorer tous les modules
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
