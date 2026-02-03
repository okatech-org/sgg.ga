import { 
  Zap, 
  Shield, 
  Clock, 
  TrendingUp,
  Users,
  BarChart
} from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Performance Accrue",
    description: "Accélérez les processus administratifs grâce à la dématérialisation complète des flux de travail.",
    stat: "60%",
    statLabel: "de gain de temps",
    gradient: "from-government-gold/20 to-government-gold/5"
  },
  {
    icon: Shield,
    title: "Sécurité Maximale",
    description: "Protection des données sensibles avec chiffrement de niveau bancaire et authentification renforcée.",
    stat: "100%",
    statLabel: "conformité",
    gradient: "from-government-green/20 to-government-green/5"
  },
  {
    icon: Clock,
    title: "Disponibilité 24/7",
    description: "Accédez à la plateforme à tout moment, depuis n'importe quel appareil connecté.",
    stat: "99.9%",
    statLabel: "uptime",
    gradient: "from-status-info/20 to-status-info/5"
  },
  {
    icon: TrendingUp,
    title: "Suivi en Temps Réel",
    description: "Tableaux de bord dynamiques pour piloter l'exécution du Plan d'Action Gouvernemental.",
    stat: "150+",
    statLabel: "indicateurs",
    gradient: "from-government-navy/20 to-government-navy/5"
  },
  {
    icon: Users,
    title: "Collaboration Simplifiée",
    description: "Workflow intégré pour coordonner le travail entre ministères et institutions.",
    stat: "35",
    statLabel: "ministères",
    gradient: "from-accent/20 to-accent/5"
  },
  {
    icon: BarChart,
    title: "Rapports Automatisés",
    description: "Génération automatique de rapports consolidés pour la prise de décision éclairée.",
    stat: "500+",
    statLabel: "rapports/an",
    gradient: "from-status-warning/20 to-status-warning/5"
  }
];

export default function BenefitsSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Pourquoi choisir <span className="text-government-gold">SGG Digital</span> ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Des avantages concrets pour la modernisation de l'administration gabonaise
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className={`relative bg-gradient-to-br ${benefit.gradient} rounded-2xl p-6 border border-border/50 transition-all duration-300 hover:shadow-gov-lg hover:scale-[1.02] group`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className="h-14 w-14 rounded-xl bg-card shadow-gov flex items-center justify-center mb-4 group-hover:shadow-gov-lg transition-shadow">
                <benefit.icon className="h-7 w-7 text-government-navy group-hover:text-government-gold transition-colors" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold text-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground mb-4">
                {benefit.description}
              </p>
              
              {/* Stat */}
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-government-gold">
                  {benefit.stat}
                </span>
                <span className="text-sm text-muted-foreground">
                  {benefit.statLabel}
                </span>
              </div>
              
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-card/80 to-transparent rounded-tr-2xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
