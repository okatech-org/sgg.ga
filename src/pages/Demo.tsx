import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Building2,
  Users,
  Scale,
  BookOpen,
  Globe,
  Briefcase,
  GraduationCap,
  FileText,
  ArrowLeft,
} from "lucide-react";

interface DemoAccount {
  id: string;
  title: string;
  role: string;
  institution: string;
  email?: string;
  description: string;
  icon: React.ElementType;
  category: "executif" | "presidence" | "legislatif" | "juridictionnel" | "administratif" | "public";
  intensity: number;
  access: string[];
}

const demoAccounts: DemoAccount[] = [
  // Exécutif
  {
    id: "president",
    title: "Président de la République",
    role: "Autorité Suprême",
    institution: "Présidence de la République",
    description: "Destinataire des dossiers, autorité suprême",
    icon: Crown,
    category: "executif",
    intensity: 5,
    access: ["Tableau de Bord Exécutif", "Nominations", "Décisions"],
  },
  {
    id: "vice-president",
    title: "Vice-Président de la République",
    role: "Vice-Présidence",
    institution: "Présidence de la République",
    description: "Peut présider le Conseil des Ministres",
    icon: Crown,
    category: "executif",
    intensity: 5,
    access: ["Conseil des Ministres", "Tableau de Bord"],
  },
  {
    id: "premier-ministre",
    title: "Premier Ministre",
    role: "Chef du Gouvernement",
    institution: "Primature",
    description: "Coordonne l'action des ministres, préside les CI",
    icon: Building2,
    category: "executif",
    intensity: 4,
    access: ["Conseils Interministériels", "Coordination", "Reporting"],
  },
  {
    id: "ministre",
    title: "Ministre Sectoriel",
    role: "Membre du Gouvernement",
    institution: "Ministère (exemple: Économie)",
    description: "Propose les textes et nominations",
    icon: Briefcase,
    category: "executif",
    intensity: 4,
    access: ["Propositions", "Nominations", "Reporting GAR"],
  },
  {
    id: "sg-ministere",
    title: "Secrétaire Général de Ministère",
    role: "Interface Opérationnelle",
    institution: "Ministère (35+ utilisateurs)",
    description: "Saisie des rapports GAR, suivi des dossiers",
    icon: Users,
    category: "executif",
    intensity: 4,
    access: ["Saisie GAR", "Suivi Nominations", "Documents"],
  },
  // Présidence
  {
    id: "sgpr",
    title: "SGPR",
    role: "Secrétariat Général Présidence",
    institution: "Présidence de la République",
    description: "Coordination stratégique, transmission des dossiers",
    icon: Building2,
    category: "presidence",
    intensity: 5,
    access: ["Lecture Complète", "Arbitrages", "Décisions Présidentielles"],
  },
  // Législatif
  {
    id: "assemblee",
    title: "Assemblée Nationale",
    role: "Chambre Législative",
    institution: "Parlement",
    description: "Réception des projets de loi",
    icon: Scale,
    category: "legislatif",
    intensity: 4,
    access: ["Projets de Loi", "Suivi Législatif"],
  },
  {
    id: "senat",
    title: "Sénat",
    role: "Chambre Haute",
    institution: "Parlement",
    description: "Réception des projets de loi",
    icon: Scale,
    category: "legislatif",
    intensity: 4,
    access: ["Projets de Loi", "Suivi Législatif"],
  },
  // Juridictionnel
  {
    id: "conseil-etat",
    title: "Conseil d'État",
    role: "Juridiction Administrative",
    institution: "Conseil d'État",
    description: "Avis sur les projets de textes",
    icon: Scale,
    category: "juridictionnel",
    intensity: 4,
    access: ["Consultation Textes", "Avis Juridiques"],
  },
  {
    id: "cour-constitutionnelle",
    title: "Cour Constitutionnelle",
    role: "Contrôle Constitutionnel",
    institution: "Cour Constitutionnelle",
    description: "Contrôle de constitutionnalité",
    icon: Scale,
    category: "juridictionnel",
    intensity: 3,
    access: ["Contrôle Constitutionnel", "Textes"],
  },
  // Administratif SGG
  {
    id: "sgg-admin",
    title: "Administrateur SGG",
    role: "Admin Système",
    institution: "SGG - DCSI",
    email: "admin.systeme@sgg.ga",
    description: "Configuration, tous droits système",
    icon: GraduationCap,
    category: "administratif",
    intensity: 5,
    access: ["Configuration", "Tous Modules", "Administration"],
  },
  {
    id: "sgg-directeur",
    title: "Directeur SGG",
    role: "Direction",
    institution: "SGG",
    email: "jp.nzoghe@sgg.ga",
    description: "Lecture et édition sur périmètre",
    icon: Users,
    category: "administratif",
    intensity: 4,
    access: ["Lecture", "Édition Périmètre", "Validation"],
  },
  {
    id: "dgjo",
    title: "Direction Journal Officiel",
    role: "Publication",
    institution: "DGJO (rattachée SGG)",
    email: "direction@jo.ga",
    description: "Publication et gestion du Journal Officiel",
    icon: BookOpen,
    category: "administratif",
    intensity: 5,
    access: ["Publication JO", "Consolidation Textes", "Archives"],
  },
  // Public
  {
    id: "citoyen",
    title: "Citoyen",
    role: "Accès Public",
    institution: "Grand Public",
    description: "Accès au Journal Officiel",
    icon: Globe,
    category: "public",
    intensity: 2,
    access: ["Journal Officiel", "Recherche Textes"],
  },
  {
    id: "professionnel-droit",
    title: "Professionnel du Droit",
    role: "Accès Public",
    institution: "Avocats, Notaires, Juristes",
    description: "Consultation des textes juridiques",
    icon: FileText,
    category: "public",
    intensity: 2,
    access: ["Journal Officiel", "Recherche Avancée", "API"],
  },
];

const categoryConfig = {
  executif: { label: "Exécutif", color: "bg-government-navy text-white" },
  presidence: { label: "Présidence", color: "bg-government-gold text-government-navy" },
  legislatif: { label: "Législatif", color: "bg-status-info text-white" },
  juridictionnel: { label: "Juridictionnel", color: "bg-government-green text-white" },
  administratif: { label: "Administratif SGG", color: "bg-primary text-primary-foreground" },
  public: { label: "Accès Public", color: "bg-muted text-muted-foreground" },
};

export default function Demo() {
  const navigate = useNavigate();

  const handleDemoAccess = (account: DemoAccount) => {
    // Store demo user info in sessionStorage for demo purposes
    // Include category for role-based dashboard routing
    sessionStorage.setItem("demoUser", JSON.stringify({
      id: account.id,
      title: account.title,
      role: account.role,
      institution: account.institution,
      email: account.email,
      access: account.access,
      category: account.category,
    }));

    // Navigate based on category
    switch (account.category) {
      case "public":
        // Public users go directly to Journal Officiel
        navigate("/journal-officiel");
        break;
      case "legislatif":
      case "juridictionnel":
        // Legislative and Judicial users have their own dashboard views
        navigate("/dashboard");
        break;
      default:
        // Executive, Presidency, and Admin users go to dashboard
        navigate("/dashboard");
    }
  };

  const renderIntensity = (level: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`text-xs ${i <= level ? "text-government-gold" : "text-muted-foreground/30"}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const groupedAccounts = Object.entries(categoryConfig).map(([key, config]) => ({
    category: key as keyof typeof categoryConfig,
    ...config,
    accounts: demoAccounts.filter((a) => a.category === key),
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-government-navy">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-government-navy">SGG Digital</span>
              <span className="hidden md:inline text-sm text-muted-foreground ml-2">
                Accès Démo
              </span>
            </div>
          </div>
          <Badge variant="outline" className="border-government-gold text-government-gold">
            Mode Démonstration
          </Badge>
        </div>
      </header>

      {/* Hero */}
      <section className="gov-header text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Comptes de Démonstration
          </h1>
          <p className="text-white/80 max-w-2xl">
            Explorez la plateforme SGG Digital selon différents profils d'utilisateurs.
            Cliquez sur un compte pour accéder directement à l'interface correspondante.
          </p>
        </div>
      </section>

      {/* Accounts Grid */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-10">
          {groupedAccounts.map((group) => (
            <section key={group.category}>
              <div className="flex items-center gap-3 mb-4">
                <Badge className={group.color}>{group.label}</Badge>
                <span className="text-sm text-muted-foreground">
                  {group.accounts.length} compte{group.accounts.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.accounts.map((account) => (
                  <Card
                    key={account.id}
                    className="cursor-pointer transition-all duration-200 hover:shadow-gov-lg hover:border-government-gold/50 hover:-translate-y-1"
                    onClick={() => handleDemoAccess(account)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-government-navy/10">
                          <account.icon className="h-5 w-5 text-government-navy" />
                        </div>
                        {renderIntensity(account.intensity)}
                      </div>
                      <CardTitle className="text-base mt-3">{account.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {account.institution}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">
                        {account.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {account.access.map((access) => (
                          <Badge
                            key={access}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {access}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        variant="government"
                        size="sm"
                        className="w-full mt-4"
                      >
                        Accéder en tant que {account.role}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-12 p-6 rounded-xl bg-muted/50 border">
          <h3 className="font-semibold mb-3">Légende — Intensité de Relation</h3>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-government-gold">★★★★★</span>
              <span>Relation très étroite</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-government-gold">★★★★</span>
              <span className="text-muted-foreground/30">★</span>
              <span>Relation fréquente</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-government-gold">★★★</span>
              <span className="text-muted-foreground/30">★★</span>
              <span>Relation régulière</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-government-gold">★★</span>
              <span className="text-muted-foreground/30">★★★</span>
              <span>Relation occasionnelle</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
