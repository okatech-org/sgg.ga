import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Send,
  Scale,
  Building2,
  Gavel,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Plus,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface TexteLegislatif {
  id: string;
  titre: string;
  type: "loi" | "decret" | "arrete" | "ordonnance";
  ministereOrigine: string;
  dateDepot: string;
  etapeActuelle: number;
  statut: "en_cours" | "adopte" | "rejete" | "en_attente";
  urgence: boolean;
  delaiRestant?: number;
}

// Étapes du cycle législatif
const etapesCycle = [
  { id: 1, nom: "Soumission", icon: FileText, description: "Réception avant-projet" },
  { id: 2, nom: "Examen SGG", icon: Scale, description: "Contrôle légistique" },
  { id: 3, nom: "Conseil d'État", icon: Gavel, description: "Avis obligatoire" },
  { id: 4, nom: "Conseil Ministres", icon: Building2, description: "Adoption CM" },
  { id: 5, nom: "Parlement", icon: Building2, description: "Vote AN/Sénat" },
  { id: 6, nom: "Cour Constit.", icon: Gavel, description: "Contrôle constitutionnalité" },
  { id: 7, nom: "Promulgation", icon: CheckCircle2, description: "Signature PR" },
  { id: 8, nom: "Publication JO", icon: BookOpen, description: "Entrée en vigueur" },
];

// Données de démo
const textesEnCours: TexteLegislatif[] = [
  {
    id: "PL-2026-001",
    titre: "Projet de loi de finances rectificative 2026",
    type: "loi",
    ministereOrigine: "Ministère de l'Économie et des Finances",
    dateDepot: "2026-01-15",
    etapeActuelle: 5,
    statut: "en_cours",
    urgence: true,
    delaiRestant: 12,
  },
  {
    id: "PL-2026-002",
    titre: "Projet de loi portant Code du Numérique",
    type: "loi",
    ministereOrigine: "Ministère de l'Économie Numérique",
    dateDepot: "2026-01-20",
    etapeActuelle: 3,
    statut: "en_cours",
    urgence: false,
    delaiRestant: 45,
  },
  {
    id: "D-2026-015",
    titre: "Décret portant organisation du Ministère de la Santé",
    type: "decret",
    ministereOrigine: "Ministère de la Santé",
    dateDepot: "2026-01-25",
    etapeActuelle: 2,
    statut: "en_cours",
    urgence: false,
  },
  {
    id: "PL-2026-003",
    titre: "Projet de loi relatif à la transition énergétique",
    type: "loi",
    ministereOrigine: "Ministère de l'Énergie",
    dateDepot: "2026-01-10",
    etapeActuelle: 4,
    statut: "en_attente",
    urgence: false,
    delaiRestant: 30,
  },
  {
    id: "D-2026-022",
    titre: "Décret fixant les modalités d'application de la loi sur l'urbanisme",
    type: "decret",
    ministereOrigine: "Ministère de l'Habitat",
    dateDepot: "2026-02-01",
    etapeActuelle: 1,
    statut: "en_cours",
    urgence: false,
  },
];

const typeConfig = {
  loi: { label: "Projet de Loi", color: "bg-government-navy/20 text-government-navy" },
  decret: { label: "Décret", color: "bg-government-gold/20 text-government-gold" },
  arrete: { label: "Arrêté", color: "bg-muted text-muted-foreground" },
  ordonnance: { label: "Ordonnance", color: "bg-status-info/20 text-status-info" },
};

const statutConfig = {
  en_cours: { label: "En cours", color: "bg-status-info/20 text-status-info", icon: Clock },
  adopte: { label: "Adopté", color: "bg-status-success/20 text-status-success", icon: CheckCircle2 },
  rejete: { label: "Rejeté", color: "bg-status-danger/20 text-status-danger", icon: AlertTriangle },
  en_attente: { label: "En attente", color: "bg-status-warning/20 text-status-warning", icon: Clock },
};

function CycleWorkflow({ etapeActuelle }: { etapeActuelle: number }) {
  return (
    <div className="flex items-center justify-between overflow-x-auto pb-2">
      {etapesCycle.map((etape, index) => {
        const EtapeIcon = etape.icon;
        const isCompleted = etape.id < etapeActuelle;
        const isCurrent = etape.id === etapeActuelle;
        
        return (
          <div key={etape.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                  isCompleted && "bg-status-success text-white",
                  isCurrent && "bg-government-navy text-white ring-4 ring-government-navy/20",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <EtapeIcon className="h-5 w-5" />
                )}
              </div>
              <span className={cn(
                "text-xs mt-1 text-center max-w-[70px]",
                isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
              )}>
                {etape.nom}
              </span>
            </div>
            {index < etapesCycle.length - 1 && (
              <div className={cn(
                "w-8 h-0.5 mx-1",
                etape.id < etapeActuelle ? "bg-status-success" : "bg-muted"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function TexteCard({ texte }: { texte: TexteLegislatif }) {
  const type = typeConfig[texte.type];
  const statut = statutConfig[texte.statut];
  const StatutIcon = statut.icon;
  const progress = (texte.etapeActuelle / etapesCycle.length) * 100;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={cn("text-xs", type.color)}>{type.label}</Badge>
              {texte.urgence && (
                <Badge className="bg-status-danger/20 text-status-danger text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Urgent
                </Badge>
              )}
            </div>
            <h3 className="font-medium text-sm leading-tight mb-1 line-clamp-2">
              {texte.titre}
            </h3>
            <p className="text-xs text-muted-foreground">
              {texte.ministereOrigine}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <Badge className={cn("text-xs gap-1", statut.color)}>
              <StatutIcon className="h-3 w-3" />
              {statut.label}
            </Badge>
            {texte.delaiRestant && (
              <p className="text-xs text-muted-foreground mt-1">
                J-{texte.delaiRestant}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Étape actuelle : {etapesCycle[texte.etapeActuelle - 1]?.nom}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <span className="text-xs text-muted-foreground">{texte.id}</span>
          <Button variant="ghost" size="sm" className="text-government-gold">
            Voir détails
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CycleLegislatif() {
  const stats = {
    total: textesEnCours.length,
    enCours: textesEnCours.filter(t => t.statut === "en_cours").length,
    urgents: textesEnCours.filter(t => t.urgence).length,
    parlement: textesEnCours.filter(t => t.etapeActuelle === 5).length,
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Cycle Législatif et Réglementaire
            </h1>
            <p className="text-muted-foreground mt-1">
              Suivi des textes de la soumission à la publication au JO
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
            <Button size="sm" className="bg-government-navy hover:bg-government-navy-light">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau texte
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-government-navy/10">
                <FileText className="h-5 w-5 text-government-navy" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Textes en cours</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-status-info/10">
                <Clock className="h-5 w-5 text-status-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.enCours}</p>
                <p className="text-xs text-muted-foreground">En traitement</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-status-danger/10">
                <AlertTriangle className="h-5 w-5 text-status-danger" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.urgents}</p>
                <p className="text-xs text-muted-foreground">Urgents</p>
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
                <p className="text-2xl font-bold">{stats.parlement}</p>
                <p className="text-xs text-muted-foreground">Au Parlement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow global */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Processus Législatif Type</CardTitle>
        </CardHeader>
        <CardContent>
          <CycleWorkflow etapeActuelle={0} />
        </CardContent>
      </Card>

      {/* Tabs par type */}
      <Tabs defaultValue="tous" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tous">Tous ({stats.total})</TabsTrigger>
          <TabsTrigger value="lois">Projets de Loi</TabsTrigger>
          <TabsTrigger value="decrets">Décrets</TabsTrigger>
          <TabsTrigger value="urgents">Urgents</TabsTrigger>
        </TabsList>

        <TabsContent value="tous" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {textesEnCours.map((texte) => (
              <TexteCard key={texte.id} texte={texte} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lois" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {textesEnCours.filter(t => t.type === "loi").map((texte) => (
              <TexteCard key={texte.id} texte={texte} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="decrets" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {textesEnCours.filter(t => t.type === "decret").map((texte) => (
              <TexteCard key={texte.id} texte={texte} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="urgents" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {textesEnCours.filter(t => t.urgence).map((texte) => (
              <TexteCard key={texte.id} texte={texte} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
