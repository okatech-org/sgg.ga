import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  ArrowRight, 
  BarChart3,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";
import { FadeInView } from "@/components/ui/motion";

const showcaseItems = [
  {
    badge: "Gestion Axée sur les Résultats",
    badgeIcon: BarChart3,
    title: "Pilotez l'exécution du PAG en temps réel",
    description: "Tableau de bord interactif pour le suivi des indicateurs de performance gouvernementaux. Visualisez l'avancement des projets ministériels et recevez des alertes automatiques.",
    features: [
      "Indicateurs de performance en temps réel",
      "Alertes automatiques sur les retards",
      "Rapports consolidés par ministère",
      "Historique et tendances"
    ],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Gabon_government_building.jpg/1280px-Gabon_government_building.jpg",
    href: "/dashboard",
    stats: [
      { value: "35", label: "Ministères" },
      { value: "150+", label: "Indicateurs" }
    ],
    reverse: false
  },
  {
    badge: "Sécurité & Conformité",
    badgeIcon: Shield,
    title: "Protection des données gouvernementales",
    description: "Infrastructure sécurisée conforme aux standards internationaux. Authentification renforcée, traçabilité complète et chiffrement de bout en bout.",
    features: [
      "Authentification multi-facteurs (2FA)",
      "Chiffrement AES-256",
      "Logs d'audit conservés 5 ans",
      "Conformité RGPD"
    ],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Flag_of_Gabon.svg/1280px-Flag_of_Gabon.svg.png",
    href: "/auth",
    stats: [
      { value: "99.9%", label: "Disponibilité" },
      { value: "0", label: "Incidents" }
    ],
    reverse: true
  }
];

export default function ProductShowcaseSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 space-y-20 md:space-y-32">
        {showcaseItems.map((item, index) => (
          <FadeInView key={index} delay={index * 0.2}>
            <div 
              className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${item.reverse ? 'lg:flex-row-reverse' : ''}`}
            >
              {/* Content Column */}
              <div className={`${item.reverse ? 'lg:order-2' : ''}`}>
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full bg-an/10 border border-an/20 px-4 py-2 mb-6">
                  <item.badgeIcon className="h-4 w-4 text-an" />
                  <span className="text-sm font-medium text-an">
                    {item.badge}
                  </span>
                </div>
                
                {/* Title & Description */}
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-foreground mb-4">
                  {item.title}
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  {item.description}
                </p>
                
                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {item.features.map((feature, idx) => (
                    <motion.li 
                      key={idx} 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      </div>
                      <span className="text-foreground">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                
                {/* CTA Button */}
                <Link to={item.href}>
                  <Button variant="an" size="lg" className="group">
                    En savoir plus
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
              
              {/* Visual Column */}
              <div className={`relative ${item.reverse ? 'lg:order-1' : ''}`}>
                {/* Main Image */}
                <motion.div 
                  className="relative rounded-2xl overflow-hidden shadow-2xl neu-card"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <img 
                    src={item.image}
                    alt={item.title}
                    className="w-full h-64 md:h-80 lg:h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
                </motion.div>
                
                {/* Floating Stats Cards */}
                <motion.div 
                  className="absolute -bottom-6 -left-4 md:-left-8 neu-card p-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-4">
                    {item.stats.map((stat, idx) => (
                      <div key={idx} className={idx > 0 ? "border-l border-border pl-4" : ""}>
                        <p className="text-2xl font-bold text-an">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 h-24 w-24 bg-an/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-8 -right-8 h-32 w-32 bg-primary/10 rounded-full blur-3xl" />
              </div>
            </div>
          </FadeInView>
        ))}
      </div>
    </section>
  );
}
