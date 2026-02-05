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
import { motion } from "framer-motion";
import { FadeInView, StaggerView, StaggerItem, ScaleOnHover } from "@/components/ui/motion";
import { ImageWithSkeleton } from "./ImageWithSkeleton";
import palaisImage from "@/assets/palais-gouvernement.jpg";
import assembleeImage from "@/assets/assemblee-nationale.jpg";
import senatImage from "@/assets/senat-gabon.jpg";
import courImage from "@/assets/cour-constitutionnelle.jpg";

const features = [
  {
    icon: BarChart3,
    title: "Tableau de Bord GAR",
    description: "Suivi en temps réel de l'exécution du Plan d'Action Gouvernemental avec indicateurs de performance et alertes automatiques.",
    image: palaisImage,
    href: "/dashboard",
    stats: "98% de précision"
  },
  {
    icon: Users,
    title: "Portail Nominations",
    description: "Dématérialisation complète du processus de contrôle des nominations aux hautes fonctions publiques.",
    image: assembleeImage,
    href: "/nominations",
    stats: "Délai réduit de 60%"
  },
  {
    icon: FileText,
    title: "Cycle Législatif",
    description: "Gestion des Conseils Interministériels, suivi des textes et coordination du travail gouvernemental.",
    image: senatImage,
    href: "/cycle-legislatif",
    stats: "500+ textes/an"
  },
  {
    icon: BookOpen,
    title: "Journal Officiel",
    description: "Accès open data aux textes juridiques officiels de la République avec moteur de recherche avancé.",
    image: courImage,
    href: "/journal-officiel",
    stats: "Accès public 24/7"
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <FadeInView className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-an/10 px-4 py-2 mb-4">
            <TrendingUp className="h-4 w-4 text-an" />
            <span className="text-sm font-medium text-an">
              Modules de la Plateforme
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Une solution intégrée pour la{" "}
            <span className="text-an">transformation digitale</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez les outils qui modernisent le Secrétariat Général du Gouvernement
          </p>
        </FadeInView>

        {/* Features Grid */}
        <StaggerView className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <StaggerItem key={index}>
              <ScaleOnHover>
                <div className="group relative neu-card overflow-hidden transition-all duration-300 hover:shadow-an-lg">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithSkeleton
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      skeletonClassName="bg-muted"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Icon Overlay */}
                    <div className="absolute -bottom-6 left-6 z-10">
                      <div className="h-14 w-14 rounded-xl bg-primary shadow-lg flex items-center justify-center border-4 border-card group-hover:bg-an transition-colors duration-300">
                        <feature.icon className="h-7 w-7 text-white" />
                      </div>
                    </div>

                    {/* Stats Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="glass rounded-full px-3 py-1 flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5 text-success" />
                        <span className="text-xs font-medium text-white">{feature.stats}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 pt-10">
                    <h3 className="text-xl font-serif font-bold text-foreground mb-2 group-hover:text-an transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {feature.description}
                    </p>

                    {/* CTA - appears on hover */}
                    <Link to={feature.href} className="inline-block">
                      <Button
                        variant="an-ghost"
                        size="sm"
                        className="opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                      >
                        Découvrir
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </ScaleOnHover>
            </StaggerItem>
          ))}
        </StaggerView>

        {/* View All Button */}
        <FadeInView delay={0.4} className="text-center mt-12">
          <Link to="/demo">
            <Button variant="an-outline" size="lg" className="group">
              <Clock className="h-4 w-4 mr-2" />
              Explorer tous les modules
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </FadeInView>
      </div>
    </section>
  );
}
