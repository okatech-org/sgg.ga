import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  FileText,
  BookOpen,
  Shield,
  Globe,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Tableau de Bord GAR",
    description: "Suivi en temps réel de l'exécution du Plan d'Action Gouvernemental",
  },
  {
    icon: Users,
    title: "Portail Nominations",
    description: "Dématérialisation du processus de contrôle des nominations",
  },
  {
    icon: FileText,
    title: "Extension e-Gop",
    description: "Gestion des Conseils Interministériels et du courrier",
  },
  {
    icon: BookOpen,
    title: "Journal Officiel",
    description: "Accès open data aux textes juridiques de la République",
  },
];

const stats = [
  { value: "35", label: "Ministères connectés" },
  { value: "100%", label: "Dématérialisation cible" },
  { value: "60%", label: "Réduction des délais" },
  { value: "24/7", label: "Disponibilité" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-government-navy">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-government-navy">SGG Digital</span>
              <span className="hidden md:inline text-sm text-muted-foreground ml-2">
                République Gabonaise
              </span>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/demo">
              <Button variant="outline" size="default">
                Accès Démo
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="hero" size="default">
                Accéder à la plateforme
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden gov-header text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-government-gold/20 px-4 py-1.5 mb-6">
              <span className="h-2 w-2 rounded-full bg-government-gold animate-pulse"></span>
              <span className="text-sm font-medium text-government-gold">
                Plateforme Officielle — Ve République
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Secrétariat Général
              <br />
              <span className="text-government-gold">du Gouvernement</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl">
              Plateforme de digitalisation pour la coordination du travail gouvernemental,
              le suivi de l'exécution du PAG 2026 et la modernisation de l'État.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/dashboard">
                <Button variant="hero" size="xl">
                  Accéder au Tableau de Bord
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Button variant="hero-outline" size="xl">
                Consulter le Journal Officiel
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="border-t border-white/10 bg-government-navy-light/50 backdrop-blur">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-government-gold mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-white/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Modules de la Plateforme
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une solution intégrée pour la transformation digitale du Secrétariat Général du Gouvernement
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative rounded-xl border bg-card p-6 shadow-gov transition-all duration-300 hover:shadow-gov-lg hover:border-government-gold/30 hover:-translate-y-1"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-government-navy text-white group-hover:bg-government-gold group-hover:text-government-navy transition-colors duration-300">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-government-navy p-8 md:p-12 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
            <div className="relative">
              <Shield className="h-12 w-12 mx-auto mb-6 text-government-gold" />
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Plateforme Sécurisée
              </h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8">
                Authentification renforcée, traçabilité complète et conformité aux standards
                de sécurité pour les données gouvernementales.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <CheckCircle2 className="h-4 w-4 text-government-gold" />
                  <span className="text-sm">Authentification 2FA</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <CheckCircle2 className="h-4 w-4 text-government-gold" />
                  <span className="text-sm">Chiffrement AES-256</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <CheckCircle2 className="h-4 w-4 text-government-gold" />
                  <span className="text-sm">Logs d'audit 5 ans</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-government-navy">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-government-navy">SGG Digital</p>
                <p className="text-xs text-muted-foreground">
                  République Gabonaise — Ve République
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Secrétariat Général du Gouvernement. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
