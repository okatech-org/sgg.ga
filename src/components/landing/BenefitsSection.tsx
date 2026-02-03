import { 
  Zap, 
  Shield, 
  Clock, 
  TrendingUp,
  Users,
  BarChart
} from "lucide-react";
import { motion } from "framer-motion";
import { FadeInView, StaggerView, StaggerItem, NeuCard } from "@/components/ui/motion";

const benefits = [
  {
    icon: Zap,
    title: "Performance Accrue",
    description: "Accélérez les processus administratifs grâce à la dématérialisation complète des flux de travail.",
    stat: "60%",
    statLabel: "de gain de temps",
    gradient: "from-an/20 to-an/5"
  },
  {
    icon: Shield,
    title: "Sécurité Maximale",
    description: "Protection des données sensibles avec chiffrement de niveau bancaire et authentification renforcée.",
    stat: "100%",
    statLabel: "conformité",
    gradient: "from-success/20 to-success/5"
  },
  {
    icon: Clock,
    title: "Disponibilité 24/7",
    description: "Accédez à la plateforme à tout moment, depuis n'importe quel appareil connecté.",
    stat: "99.9%",
    statLabel: "uptime",
    gradient: "from-info/20 to-info/5"
  },
  {
    icon: TrendingUp,
    title: "Suivi en Temps Réel",
    description: "Tableaux de bord dynamiques pour piloter l'exécution du Plan d'Action Gouvernemental.",
    stat: "150+",
    statLabel: "indicateurs",
    gradient: "from-primary/20 to-primary/5"
  },
  {
    icon: Users,
    title: "Collaboration Simplifiée",
    description: "Workflow intégré pour coordonner le travail entre ministères et institutions.",
    stat: "35",
    statLabel: "ministères",
    gradient: "from-an-light/20 to-an-light/5"
  },
  {
    icon: BarChart,
    title: "Rapports Automatisés",
    description: "Génération automatique de rapports consolidés pour la prise de décision éclairée.",
    stat: "500+",
    statLabel: "rapports/an",
    gradient: "from-warning/20 to-warning/5"
  }
];

export default function BenefitsSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <FadeInView className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Pourquoi choisir <span className="text-an">SGG Digital</span> ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Des avantages concrets pour la modernisation de l'administration gabonaise
          </p>
        </FadeInView>

        {/* Benefits Grid */}
        <StaggerView className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <StaggerItem key={index}>
              <motion.div 
                className={`relative bg-gradient-to-br ${benefit.gradient} neu-card p-6 h-full group`}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                {/* Icon */}
                <div className="h-14 w-14 rounded-xl bg-card shadow-elegant flex items-center justify-center mb-4 group-hover:shadow-an transition-shadow">
                  <benefit.icon className="h-7 w-7 text-an group-hover:text-an-dark transition-colors" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-serif font-bold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {benefit.description}
                </p>
                
                {/* Stat */}
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-an">
                    {benefit.stat}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {benefit.statLabel}
                  </span>
                </div>
                
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-card/80 to-transparent rounded-tr-xl" />
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerView>
      </div>
    </section>
  );
}
