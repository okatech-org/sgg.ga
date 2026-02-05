import { motion } from "framer-motion";
import { Globe, Award, Users, Building2, History, Target, Shield, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import { FadeInView, StaggerView, StaggerItem, PageTransition } from "@/components/ui/motion";

const timeline = [
  {
    year: "1960",
    title: "Création du SGG",
    description: "Institution du Secrétariat Général du Gouvernement lors de l'indépendance de la République Gabonaise."
  },
  {
    year: "1991",
    title: "Réforme Constitutionnelle",
    description: "Renforcement du rôle du SGG dans la coordination interministérielle et le suivi des textes législatifs."
  },
  {
    year: "2010",
    title: "Modernisation Administrative",
    description: "Début de la transformation numérique avec l'introduction des premiers outils de gestion électronique."
  },
  {
    year: "2023",
    title: "Transition et Renouveau",
    description: "Nouvelle dynamique institutionnelle avec le CTRI et accélération de la modernisation des services publics."
  },
  {
    year: "2024",
    title: "SGG Digital",
    description: "Lancement de la plateforme numérique intégrée pour la gestion des affaires gouvernementales."
  }
];

const leadershipTeam = [
  {
    name: "Mme Marie-Françoise DIKOUMBA",
    role: "Secrétaire Générale du Gouvernement",
    bio: "Magistrate de formation, elle dirige le SGG depuis 2023 et pilote la transformation numérique de l'administration.",
    initials: "MFD"
  },
  {
    name: "M. Jean-Baptiste OBIANG",
    role: "Secrétaire Général Adjoint",
    bio: "Ancien directeur des affaires juridiques, il coordonne le cycle législatif et les relations avec le Parlement.",
    initials: "JBO"
  },
  {
    name: "Mme Pauline NZAMBA",
    role: "Directrice du Journal Officiel",
    bio: "Spécialiste en droit public, elle supervise la publication et l'archivage des textes officiels de la République.",
    initials: "PN"
  },
  {
    name: "M. Aristide MOUSSAVOU",
    role: "Directeur des Nominations",
    bio: "Expert en gestion des ressources humaines de l'État, il pilote le portail de contrôle des nominations.",
    initials: "AM"
  },
  {
    name: "Mme Clémentine NDONG",
    role: "Directrice de la Coordination Interministérielle",
    bio: "Elle assure le suivi du Plan d'Action Gouvernemental et la préparation des Conseils des Ministres.",
    initials: "CN"
  },
  {
    name: "M. Patrick ONDO",
    role: "Directeur des Systèmes d'Information",
    bio: "Ingénieur informatique, il pilote la transformation digitale et le développement de SGG Digital.",
    initials: "PO"
  }
];

const missions = [
  {
    icon: Target,
    title: "Coordination Gouvernementale",
    description: "Assurer la cohérence de l'action gouvernementale et la coordination entre les ministères."
  },
  {
    icon: BookOpen,
    title: "Suivi Législatif",
    description: "Préparer les Conseils des Ministres et suivre l'élaboration des textes législatifs et réglementaires."
  },
  {
    icon: Shield,
    title: "Contrôle des Nominations",
    description: "Vérifier la conformité des nominations aux emplois supérieurs de l'État."
  },
  {
    icon: Building2,
    title: "Publication Officielle",
    description: "Éditer et diffuser le Journal Officiel de la République Gabonaise."
  }
];

export default function About() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <LandingHeader />

        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-an/10 via-transparent to-an-light/5" />
          <div className="container mx-auto px-4 relative z-10">
            <FadeInView className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-an/10 text-an mb-6">
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">République Gabonaise</span>
              </div>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Secrétariat Général du <span className="text-an">Gouvernement</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Pilier de la coordination gouvernementale, le SGG accompagne la transformation
                de l'administration gabonaise depuis plus de 60 ans.
              </p>
            </FadeInView>
          </div>
        </section>

        {/* Missions Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <FadeInView className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                Nos Missions
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Le SGG remplit quatre missions essentielles au fonctionnement de l'État
              </p>
            </FadeInView>

            <StaggerView className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {missions.map((mission, index) => (
                <StaggerItem key={index}>
                  <Card className="h-full border border-border hover:border-primary/50 transition-colors duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 rounded-xl bg-an/10 flex items-center justify-center mx-auto mb-4">
                        <mission.icon className="h-7 w-7 text-an" />
                      </div>
                      <h3 className="font-serif font-semibold text-lg text-foreground mb-2">
                        {mission.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {mission.description}
                      </p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerView>
          </div>
        </section>

        {/* History Timeline */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <FadeInView className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-an/10 text-an mb-4">
                <History className="h-4 w-4" />
                <span className="text-sm font-medium">Notre Histoire</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                Plus de 60 ans au service de l'État
              </h2>
            </FadeInView>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 md:left-1/2 transform md:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-an via-an-light to-an" />

                {timeline.map((item, index) => (
                  <FadeInView key={index} delay={index * 0.1}>
                    <motion.div
                      className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                        }`}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Year bubble */}
                      <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-an flex items-center justify-center border-4 border-background z-10">
                        <span className="text-white font-bold text-sm">{item.year}</span>
                      </div>

                      {/* Content */}
                      <div className={`ml-28 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16 md:text-left'
                        }`}>
                        <Card className="bg-card border border-border">
                          <CardContent className="p-6">
                            <h3 className="font-serif font-semibold text-xl text-foreground mb-2">
                              {item.title}
                            </h3>
                            <p className="text-muted-foreground">
                              {item.description}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                  </FadeInView>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Leadership Team */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <FadeInView className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-an/10 text-an mb-4">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Direction</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                L'Équipe de Direction
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Des experts dévoués au service de l'État gabonais
              </p>
            </FadeInView>

            <StaggerView className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {leadershipTeam.map((member, index) => (
                <StaggerItem key={index}>
                  <motion.div
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-full overflow-hidden group border border-border bg-card">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Avatar className="w-24 h-24 mb-4 border-4 border-border">
                              <AvatarFallback className="bg-gradient-to-br from-an to-an-dark text-white text-xl font-serif">
                                {member.initials}
                              </AvatarFallback>
                            </Avatar>
                          </motion.div>
                          <h3 className="font-serif font-semibold text-lg text-foreground mb-1">
                            {member.name}
                          </h3>
                          <p className="text-sm text-an font-medium mb-3">
                            {member.role}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {member.bio}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerView>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <FadeInView className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-an/10 text-an mb-4">
                  <Award className="h-4 w-4" />
                  <span className="text-sm font-medium">Nos Valeurs</span>
                </div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Excellence, Intégrité, Innovation
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Le Secrétariat Général du Gouvernement s'engage à servir l'État avec excellence
                  et intégrité, tout en embrassant l'innovation pour moderniser l'administration.
                  Notre transformation numérique, incarnée par SGG Digital, témoigne de notre
                  volonté de construire une administration plus efficace, transparente et accessible.
                </p>
              </FadeInView>

              <FadeInView delay={0.2} className="flex flex-wrap justify-center gap-4">
                <Link to="/demo">
                  <Button variant="an" size="lg">
                    Découvrir SGG Digital
                  </Button>
                </Link>
                <Link to="/#features">
                  <Button variant="an-outline" size="lg">
                    Voir les modules
                  </Button>
                </Link>
              </FadeInView>
            </div>
          </div>
        </section>

        <LandingFooter />
      </div>
    </PageTransition>
  );
}
