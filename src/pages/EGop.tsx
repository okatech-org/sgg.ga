import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Users,
  FileText,
  Mail,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ChevronRight,
  Building2,
  Send,
  Inbox,
  Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface ConseilInterministeriel {
  id: string;
  titre: string;
  date: string;
  heure: string;
  lieu: string;
  president: string;
  statut: "programme" | "en_cours" | "termine";
  participantsConfirmes: number;
  totalParticipants: number;
  dossiers: number;
}

interface ReunionInterministerielle {
  id: string;
  objet: string;
  date: string;
  heure: string;
  convocateur: string;
  ministeresConvoques: string[];
  statut: "planifiee" | "confirmee" | "terminee" | "reportee";
}

interface Courrier {
  id: string;
  objet: string;
  expediteur: string;
  dateReception: string;
  type: "entrant" | "sortant";
  priorite: "haute" | "normale" | "basse";
  statut: "nouveau" | "en_traitement" | "traite" | "archive";
  destinataire?: string;
}

// Données de démo
const conseilsInterministeriels: ConseilInterministeriel[] = [
  {
    id: "CI-2026-005",
    titre: "Conseil Interministériel sur la Transition Énergétique",
    date: "2026-02-10",
    heure: "09:00",
    lieu: "Salle du Conseil, Cité de la Démocratie",
    president: "Premier Ministre",
    statut: "programme",
    participantsConfirmes: 12,
    totalParticipants: 15,
    dossiers: 8,
  },
  {
    id: "CI-2026-006",
    titre: "Conseil Interministériel sur le Numérique",
    date: "2026-02-15",
    heure: "10:00",
    lieu: "Salle du Conseil, Primature",
    president: "Vice-Président du Gouvernement",
    statut: "programme",
    participantsConfirmes: 8,
    totalParticipants: 12,
    dossiers: 5,
  },
  {
    id: "CI-2026-004",
    titre: "Conseil Interministériel sur la Sécurité Alimentaire",
    date: "2026-01-28",
    heure: "09:00",
    lieu: "Salle du Conseil, Cité de la Démocratie",
    president: "Premier Ministre",
    statut: "termine",
    participantsConfirmes: 14,
    totalParticipants: 14,
    dossiers: 10,
  },
];

const reunionsInterministerielles: ReunionInterministerielle[] = [
  {
    id: "RIM-2026-012",
    objet: "Coordination du Programme Gabon Numérique 2026",
    date: "2026-02-05",
    heure: "14:00",
    convocateur: "SGG",
    ministeresConvoques: ["Économie Numérique", "Budget", "Éducation", "Santé"],
    statut: "confirmee",
  },
  {
    id: "RIM-2026-013",
    objet: "Préparation du Sommet Afrique-France",
    date: "2026-02-08",
    heure: "10:00",
    convocateur: "Affaires Étrangères",
    ministeresConvoques: ["Intérieur", "Défense", "Économie", "Culture"],
    statut: "planifiee",
  },
  {
    id: "RIM-2026-011",
    objet: "Arbitrage budgétaire T1 2026",
    date: "2026-01-30",
    heure: "09:00",
    convocateur: "Primature",
    ministeresConvoques: ["Tous ministères"],
    statut: "terminee",
  },
];

const courriers: Courrier[] = [
  {
    id: "C-2026-0234",
    objet: "Demande d'avis sur projet de décret",
    expediteur: "Ministère de la Justice",
    dateReception: "2026-02-03",
    type: "entrant",
    priorite: "haute",
    statut: "nouveau",
  },
  {
    id: "C-2026-0233",
    objet: "Transmission des propositions de nomination",
    expediteur: "Ministère de l'Intérieur",
    dateReception: "2026-02-02",
    type: "entrant",
    priorite: "normale",
    statut: "en_traitement",
  },
  {
    id: "C-2026-0232",
    objet: "Convocation CI Transition Énergétique",
    expediteur: "SGG",
    dateReception: "2026-02-01",
    type: "sortant",
    priorite: "haute",
    statut: "traite",
    destinataire: "15 Ministères",
  },
  {
    id: "C-2026-0230",
    objet: "Rapport mensuel GAR - Janvier 2026",
    expediteur: "Direction du Suivi",
    dateReception: "2026-01-31",
    type: "entrant",
    priorite: "normale",
    statut: "archive",
  },
];

const statutCIConfig = {
  programme: { label: "Programmé", color: "bg-status-info/20 text-status-info", icon: Calendar },
  en_cours: { label: "En cours", color: "bg-government-gold/20 text-government-gold", icon: Clock },
  termine: { label: "Terminé", color: "bg-status-success/20 text-status-success", icon: CheckCircle2 },
};

const statutRIMConfig = {
  planifiee: { label: "Planifiée", color: "bg-muted text-muted-foreground", icon: Calendar },
  confirmee: { label: "Confirmée", color: "bg-status-info/20 text-status-info", icon: CheckCircle2 },
  terminee: { label: "Terminée", color: "bg-status-success/20 text-status-success", icon: CheckCircle2 },
  reportee: { label: "Reportée", color: "bg-status-warning/20 text-status-warning", icon: AlertTriangle },
};

const prioriteConfig = {
  haute: { label: "Haute", color: "bg-status-danger/20 text-status-danger" },
  normale: { label: "Normale", color: "bg-muted text-muted-foreground" },
  basse: { label: "Basse", color: "bg-status-info/20 text-status-info" },
};

const statutCourrierConfig = {
  nouveau: { label: "Nouveau", color: "bg-status-danger/20 text-status-danger", icon: Inbox },
  en_traitement: { label: "En traitement", color: "bg-status-warning/20 text-status-warning", icon: Clock },
  traite: { label: "Traité", color: "bg-status-success/20 text-status-success", icon: CheckCircle2 },
  archive: { label: "Archivé", color: "bg-muted text-muted-foreground", icon: Archive },
};

function ConseilCard({ conseil }: { conseil: ConseilInterministeriel }) {
  const statut = statutCIConfig[conseil.statut];
  const StatutIcon = statut.icon;
  const confirmationRate = (conseil.participantsConfirmes / conseil.totalParticipants) * 100;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge className={cn("text-xs gap-1", statut.color)}>
            <StatutIcon className="h-3 w-3" />
            {statut.label}
          </Badge>
          <span className="text-xs text-muted-foreground">{conseil.id}</span>
        </div>

        <h3 className="font-semibold text-sm mb-2 line-clamp-2">{conseil.titre}</h3>
        
        <div className="space-y-2 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(conseil.date).toLocaleDateString("fr-FR", { 
              weekday: "long", 
              day: "numeric", 
              month: "long" 
            })} à {conseil.heure}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5" />
            <span className="truncate">{conseil.lieu}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5" />
            <span>Présidé par {conseil.president}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              {conseil.participantsConfirmes}/{conseil.totalParticipants}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              {conseil.dossiers} dossiers
            </span>
          </div>
          <Button variant="ghost" size="sm" className="text-government-gold h-7">
            Gérer
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ReunionCard({ reunion }: { reunion: ReunionInterministerielle }) {
  const statut = statutRIMConfig[reunion.statut];
  const StatutIcon = statut.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge className={cn("text-xs gap-1", statut.color)}>
            <StatutIcon className="h-3 w-3" />
            {statut.label}
          </Badge>
          <span className="text-xs text-muted-foreground">{reunion.id}</span>
        </div>

        <h3 className="font-semibold text-sm mb-2 line-clamp-2">{reunion.objet}</h3>
        
        <div className="space-y-2 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(reunion.date).toLocaleDateString("fr-FR", { 
              weekday: "short", 
              day: "numeric", 
              month: "short" 
            })} à {reunion.heure}</span>
          </div>
          <div className="flex items-center gap-2">
            <Send className="h-3.5 w-3.5" />
            <span>Convoqué par {reunion.convocateur}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {reunion.ministeresConvoques.slice(0, 3).map((min, i) => (
            <Badge key={i} variant="outline" className="text-[10px]">
              {min}
            </Badge>
          ))}
          {reunion.ministeresConvoques.length > 3 && (
            <Badge variant="outline" className="text-[10px]">
              +{reunion.ministeresConvoques.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t">
          <Button variant="ghost" size="sm" className="text-government-gold h-7">
            Détails
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CourrierRow({ courrier }: { courrier: Courrier }) {
  const priorite = prioriteConfig[courrier.priorite];
  const statut = statutCourrierConfig[courrier.statut];
  const StatutIcon = statut.icon;

  return (
    <div className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-lg transition-colors">
      <div className={cn(
        "p-2 rounded-lg",
        courrier.type === "entrant" ? "bg-status-info/10" : "bg-government-gold/10"
      )}>
        {courrier.type === "entrant" ? (
          <Inbox className={cn("h-4 w-4", courrier.type === "entrant" ? "text-status-info" : "text-government-gold")} />
        ) : (
          <Send className="h-4 w-4 text-government-gold" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{courrier.objet}</p>
        <p className="text-xs text-muted-foreground">
          {courrier.type === "entrant" ? `De: ${courrier.expediteur}` : `À: ${courrier.destinataire}`}
        </p>
      </div>

      <Badge className={cn("text-[10px]", priorite.color)}>
        {priorite.label}
      </Badge>

      <Badge className={cn("text-[10px] gap-1", statut.color)}>
        <StatutIcon className="h-3 w-3" />
        {statut.label}
      </Badge>

      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {new Date(courrier.dateReception).toLocaleDateString("fr-FR")}
      </span>

      <Button variant="ghost" size="icon" className="h-8 w-8">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function EGop() {
  const stats = {
    ciProgrammes: conseilsInterministeriels.filter(c => c.statut === "programme").length,
    rimCetteSemaine: reunionsInterministerielles.filter(r => r.statut !== "terminee").length,
    courriersNouveaux: courriers.filter(c => c.statut === "nouveau").length,
    courriersEnTraitement: courriers.filter(c => c.statut === "en_traitement").length,
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              e-Gop — Coordination Gouvernementale
            </h1>
            <p className="text-muted-foreground mt-1">
              Conseils Interministériels, RIM et Gestion du Courrier
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Agenda
            </Button>
            <Button size="sm" className="bg-government-navy hover:bg-government-navy-light">
              <Plus className="h-4 w-4 mr-2" />
              Programmer
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
                <Building2 className="h-5 w-5 text-government-navy" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.ciProgrammes}</p>
                <p className="text-xs text-muted-foreground">CI programmés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-government-gold/10">
                <Users className="h-5 w-5 text-government-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rimCetteSemaine}</p>
                <p className="text-xs text-muted-foreground">RIM à venir</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-status-danger/10">
                <Inbox className="h-5 w-5 text-status-danger" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.courriersNouveaux}</p>
                <p className="text-xs text-muted-foreground">Nouveaux courriers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-status-warning/10">
                <Clock className="h-5 w-5 text-status-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.courriersEnTraitement}</p>
                <p className="text-xs text-muted-foreground">En traitement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ci" className="space-y-6">
        <TabsList>
          <TabsTrigger value="ci" className="gap-2">
            <Building2 className="h-4 w-4" />
            Conseils Interministériels
          </TabsTrigger>
          <TabsTrigger value="rim" className="gap-2">
            <Users className="h-4 w-4" />
            Réunions (RIM)
          </TabsTrigger>
          <TabsTrigger value="courrier" className="gap-2">
            <Mail className="h-4 w-4" />
            Courrier (GEC)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ci" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {conseilsInterministeriels.map((conseil) => (
              <ConseilCard key={conseil.id} conseil={conseil} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rim" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reunionsInterministerielles.map((reunion) => (
              <ReunionCard key={reunion.id} reunion={reunion} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="courrier" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Gestion Électronique du Courrier</span>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau courrier
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {courriers.map((courrier) => (
                  <CourrierRow key={courrier.id} courrier={courrier} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
