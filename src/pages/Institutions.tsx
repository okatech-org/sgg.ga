import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Users,
  ArrowLeftRight,
  Star,
  ChevronRight,
  ExternalLink,
  FileText,
  Send,
  Scale,
  Gavel,
  BookOpen,
  LandPlot,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface Institution {
  id: string;
  nom: string;
  nomCourt: string;
  type: "executif" | "legislatif" | "juridictionnel" | "rattache";
  natureRelation: string;
  intensite: 1 | 2 | 3 | 4 | 5;
  baseJuridique: string;
  interactions: string[];
  digitalisation: string[];
  icon: React.ElementType;
}

// Données
const institutions: Institution[] = [
  {
    id: "presidence",
    nom: "Présidence de la République",
    nomCourt: "Présidence",
    type: "executif",
    natureRelation: "Hiérarchique + Fonctionnelle",
    intensite: 5,
    baseJuridique: "Constitution art. 41",
    interactions: [
      "Décisions présidentielles",
      "Arbitrages stratégiques",
      "Promulgation des lois",
      "Conseil des Ministres",
    ],
    digitalisation: [
      "Transmission dossiers CM",
      "Workflow de promulgation",
      "Suivi décisions",
    ],
    icon: LandPlot,
  },
  {
    id: "sgpr",
    nom: "Secrétariat Général de la Présidence de la République",
    nomCourt: "SGPR",
    type: "executif",
    natureRelation: "Coordination étroite",
    intensite: 5,
    baseJuridique: "Décret n°0235/PR",
    interactions: [
      "Transmission dossiers validés",
      "Transmission nominations (J-7)",
      "Coordination stratégique",
      "Relevé des décisions CM",
    ],
    digitalisation: [
      "API sécurisée bidirectionnelle",
      "Portail des Nominations",
      "Tableau de bord partagé",
    ],
    icon: Building2,
  },
  {
    id: "primature",
    nom: "Primature",
    nomCourt: "Primature",
    type: "executif",
    natureRelation: "Coordination",
    intensite: 4,
    baseJuridique: "Constitution",
    interactions: [
      "Coordination des Conseils Interministériels",
      "Arbitrages gouvernementaux",
      "Suivi PAG 2026",
    ],
    digitalisation: [
      "Extension e-Gop",
      "Tableau de bord GAR",
    ],
    icon: Building2,
  },
  {
    id: "ministeres",
    nom: "Ministères Sectoriels",
    nomCourt: "Ministères (35+)",
    type: "executif",
    natureRelation: "Fonctionnelle",
    intensite: 5,
    baseJuridique: "Décret n°0273/PR",
    interactions: [
      "Réception projets de textes",
      "Propositions de nominations",
      "Reporting GAR mensuel",
      "Convocations CI/RIM",
    ],
    digitalisation: [
      "Plateforme e-Légistique",
      "Portail des Nominations",
      "Tableau de bord GAR",
      "Extension e-Gop",
    ],
    icon: Users,
  },
  {
    id: "conseil-etat",
    nom: "Conseil d'État",
    nomCourt: "Conseil d'État",
    type: "juridictionnel",
    natureRelation: "Consultation obligatoire",
    intensite: 4,
    baseJuridique: "Constitution",
    interactions: [
      "Saisine pour avis sur projets de loi",
      "Réception des avis juridiques",
      "Intégration des observations",
    ],
    digitalisation: [
      "Transmission électronique sécurisée",
      "Notification des avis",
      "Workflow de correction",
    ],
    icon: Scale,
  },
  {
    id: "assemblee",
    nom: "Assemblée Nationale",
    nomCourt: "Assemblée Nationale",
    type: "legislatif",
    natureRelation: "Transmission + Suivi",
    intensite: 4,
    baseJuridique: "Constitution",
    interactions: [
      "Dépôt des projets de loi",
      "Suivi calendrier législatif",
      "Coordination venue ministres",
      "Questions parlementaires",
    ],
    digitalisation: [
      "Suivi cycle législatif",
      "Agenda partagé",
      "Workflow questions",
    ],
    icon: Building2,
  },
  {
    id: "senat",
    nom: "Sénat",
    nomCourt: "Sénat",
    type: "legislatif",
    natureRelation: "Transmission + Suivi",
    intensite: 4,
    baseJuridique: "Constitution",
    interactions: [
      "Dépôt des projets de loi",
      "Suivi calendrier législatif",
      "Coordination venue ministres",
    ],
    digitalisation: [
      "Suivi cycle législatif",
      "Agenda partagé",
    ],
    icon: Building2,
  },
  {
    id: "cour-constitutionnelle",
    nom: "Cour Constitutionnelle",
    nomCourt: "Cour Constitutionnelle",
    type: "juridictionnel",
    natureRelation: "Contrôle",
    intensite: 3,
    baseJuridique: "Constitution",
    interactions: [
      "Transmission lois votées",
      "Réception des décisions",
      "Suivi des délais",
    ],
    digitalisation: [
      "Transmission électronique",
      "Notification décisions",
      "Alertes délais",
    ],
    icon: Gavel,
  },
  {
    id: "dgjo",
    nom: "Direction Générale du Journal Officiel",
    nomCourt: "DGJO",
    type: "rattache",
    natureRelation: "Tutelle directe",
    intensite: 5,
    baseJuridique: "Décret n°0273/PR",
    interactions: [
      "Transmission textes à publier",
      "Coordination publication",
      "Validation avant publication",
    ],
    digitalisation: [
      "Workflow de publication",
      "Portail Open Data JO",
      "Tableau de bord consultations",
    ],
    icon: BookOpen,
  },
  {
    id: "archives",
    nom: "Archives Nationales",
    nomCourt: "Archives Nationales",
    type: "rattache",
    natureRelation: "Tutelle directe",
    intensite: 4,
    baseJuridique: "Décret n°0273/PR",
    interactions: [
      "Versement d'archives",
      "Recherche documentaire",
      "Programme de numérisation",
    ],
    digitalisation: [
      "GED + Archivage électronique",
      "Moteur de recherche",
      "OCR et indexation",
    ],
    icon: FileText,
  },
];

const typeConfig = {
  executif: { label: "Pouvoir Exécutif", color: "bg-government-navy/20 text-government-navy" },
  legislatif: { label: "Pouvoir Législatif", color: "bg-government-gold/20 text-government-gold" },
  juridictionnel: { label: "Juridictionnel", color: "bg-government-green/20 text-government-green" },
  rattache: { label: "Rattaché SGG", color: "bg-status-info/20 text-status-info" },
};

function IntensityStars({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i <= level ? "fill-government-gold text-government-gold" : "text-muted"
          )}
        />
      ))}
    </div>
  );
}

function InstitutionCard({ institution }: { institution: Institution }) {
  const type = typeConfig[institution.type];
  const InstitutionIcon = institution.icon;

  return (
    <Card className="hover:shadow-md transition-shadow h-full">
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex items-start gap-3 mb-4">
          <div className={cn("p-3 rounded-lg", type.color.replace("text-", "bg-").split(" ")[0])}>
            <InstitutionIcon className={cn("h-6 w-6", type.color.split(" ")[1])} />
          </div>
          <div className="flex-1 min-w-0">
            <Badge className={cn("text-[10px] mb-1", type.color)}>
              {type.label}
            </Badge>
            <h3 className="font-semibold text-sm leading-tight">{institution.nomCourt}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{institution.natureRelation}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-muted-foreground">Intensité :</span>
          <IntensityStars level={institution.intensite} />
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <p className="text-xs font-medium mb-1">Interactions principales</p>
            <ul className="space-y-1">
              {institution.interactions.slice(0, 3).map((interaction, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <ArrowLeftRight className="h-3 w-3 mt-0.5 flex-shrink-0 text-government-gold" />
                  <span>{interaction}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium mb-1">Digitalisation</p>
            <div className="flex flex-wrap gap-1">
              {institution.digitalisation.map((item, i) => (
                <Badge key={i} variant="outline" className="text-[10px]">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 mt-4 border-t">
          <span className="text-[10px] text-muted-foreground truncate max-w-[60%]">
            {institution.baseJuridique}
          </span>
          <Button variant="ghost" size="sm" className="text-government-gold h-7">
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function InteractionFlow() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg">Cartographie des Interactions SGG</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto">
          <div className="min-w-[800px] py-8">
            {/* Central SGG */}
            <div className="flex justify-center mb-8">
              <div className="bg-government-navy text-white px-6 py-4 rounded-xl shadow-lg text-center">
                <Building2 className="h-8 w-8 mx-auto mb-2" />
                <p className="font-bold">SGG</p>
                <p className="text-xs opacity-80">Cité de la Démocratie</p>
              </div>
            </div>

            {/* Three columns */}
            <div className="grid grid-cols-3 gap-8">
              {/* Exécutif */}
              <div className="space-y-4">
                <h4 className="text-center font-semibold text-sm text-government-navy">
                  Pouvoir Exécutif
                </h4>
                <div className="space-y-2">
                  {institutions.filter(i => i.type === "executif").map(inst => (
                    <div key={inst.id} className="bg-government-navy/10 rounded-lg p-3 text-center">
                      <p className="font-medium text-xs">{inst.nomCourt}</p>
                      <IntensityStars level={inst.intensite} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Législatif + Juridictionnel */}
              <div className="space-y-4">
                <h4 className="text-center font-semibold text-sm text-government-gold">
                  Législatif & Juridictionnel
                </h4>
                <div className="space-y-2">
                  {institutions.filter(i => i.type === "legislatif" || i.type === "juridictionnel").map(inst => (
                    <div 
                      key={inst.id} 
                      className={cn(
                        "rounded-lg p-3 text-center",
                        inst.type === "legislatif" ? "bg-government-gold/10" : "bg-government-green/10"
                      )}
                    >
                      <p className="font-medium text-xs">{inst.nomCourt}</p>
                      <IntensityStars level={inst.intensite} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Rattachés */}
              <div className="space-y-4">
                <h4 className="text-center font-semibold text-sm text-status-info">
                  Organes Rattachés
                </h4>
                <div className="space-y-2">
                  {institutions.filter(i => i.type === "rattache").map(inst => (
                    <div key={inst.id} className="bg-status-info/10 rounded-lg p-3 text-center">
                      <p className="font-medium text-xs">{inst.nomCourt}</p>
                      <IntensityStars level={inst.intensite} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Institutions() {
  const stats = {
    total: institutions.length,
    executif: institutions.filter(i => i.type === "executif").length,
    legislatif: institutions.filter(i => i.type === "legislatif").length,
    rattaches: institutions.filter(i => i.type === "rattache").length,
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Institutions Partenaires
            </h1>
            <p className="text-muted-foreground mt-1">
              Cartographie des relations institutionnelles du SGG
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Building2 className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Institutions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-government-navy/10">
                <LandPlot className="h-5 w-5 text-government-navy" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.executif}</p>
                <p className="text-xs text-muted-foreground">Pouvoir Exécutif</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-government-gold/10">
                <Building2 className="h-5 w-5 text-government-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.legislatif}</p>
                <p className="text-xs text-muted-foreground">Pouvoir Législatif</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-status-info/10">
                <Users className="h-5 w-5 text-status-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rattaches}</p>
                <p className="text-xs text-muted-foreground">Organes rattachés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cartographie visuelle */}
      <InteractionFlow />

      {/* Tabs par type */}
      <Tabs defaultValue="tous" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tous">Tous ({stats.total})</TabsTrigger>
          <TabsTrigger value="executif">Exécutif</TabsTrigger>
          <TabsTrigger value="legislatif">Législatif</TabsTrigger>
          <TabsTrigger value="juridictionnel">Juridictionnel</TabsTrigger>
          <TabsTrigger value="rattache">Rattachés</TabsTrigger>
        </TabsList>

        <TabsContent value="tous">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {institutions.map((institution) => (
              <InstitutionCard key={institution.id} institution={institution} />
            ))}
          </div>
        </TabsContent>

        {["executif", "legislatif", "juridictionnel", "rattache"].map((type) => (
          <TabsContent key={type} value={type}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {institutions.filter(i => i.type === type).map((institution) => (
                <InstitutionCard key={institution.id} institution={institution} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </DashboardLayout>
  );
}
