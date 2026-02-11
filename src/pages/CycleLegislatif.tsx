import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  FileText, Send, Scale, Building2, Gavel, BookOpen, CheckCircle2,
  Clock, AlertTriangle, ChevronRight, Plus, Filter, Search,
  Download, Eye, History, ArrowUpRight, TrendingUp, BarChart3,
  CalendarDays, X, Printer, FileDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// ── Types ────────────────────────────────────────────────────────────────────

interface HistoriqueEntry {
  date: string;
  etape: string;
  acteur: string;
  commentaire?: string;
}

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
  rapporteur?: string;
  description?: string;
  historique: HistoriqueEntry[];
}

// ── Étapes du cycle législatif ───────────────────────────────────────────────

const etapesCycle = [
  { id: 1, nom: "Soumission", icon: FileText, description: "Réception avant-projet", color: "text-blue-500" },
  { id: 2, nom: "Examen SGG", icon: Scale, description: "Contrôle légistique", color: "text-indigo-500" },
  { id: 3, nom: "Conseil d'État", icon: Gavel, description: "Avis obligatoire", color: "text-purple-500" },
  { id: 4, nom: "Conseil Ministres", icon: Building2, description: "Adoption CM", color: "text-amber-500" },
  { id: 5, nom: "Parlement", icon: Building2, description: "Vote AN/Sénat", color: "text-rose-500" },
  { id: 6, nom: "Cour Constit.", icon: Gavel, description: "Contrôle constitutionnalité", color: "text-orange-500" },
  { id: 7, nom: "Promulgation", icon: CheckCircle2, description: "Signature PR", color: "text-emerald-500" },
  { id: 8, nom: "Publication JO", icon: BookOpen, description: "Entrée en vigueur", color: "text-green-600" },
];

// ── Données de démo enrichies ────────────────────────────────────────────────

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
    rapporteur: "Min. Raymond NDONG SIMA",
    description: "Ajustement des allocations budgétaires pour le second semestre 2026, incluant le financement des programmes prioritaires du PAG.",
    historique: [
      { date: "2026-01-15", etape: "Soumission", acteur: "Min. Économie", commentaire: "Dépôt de l'avant-projet" },
      { date: "2026-01-18", etape: "Examen SGG", acteur: "Dir. Législation SGG", commentaire: "Conformité légistique validée" },
      { date: "2026-01-22", etape: "Conseil d'État", acteur: "Section des Finances", commentaire: "Avis favorable avec réserves mineures" },
      { date: "2026-01-29", etape: "Conseil des Ministres", acteur: "Gouvernement", commentaire: "Adopté — dépôt autorisé" },
      { date: "2026-02-03", etape: "Parlement", acteur: "Commission des Finances AN", commentaire: "Examen en commission en cours" },
    ],
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
    rapporteur: "Min. Hervé NDOUME ESSINGONE",
    description: "Cadre juridique pour la transformation numérique : protection des données, e-commerce, cybersécurité, identité numérique.",
    historique: [
      { date: "2026-01-20", etape: "Soumission", acteur: "Min. Éco. Numérique", commentaire: "Avant-projet transmis avec étude d'impact" },
      { date: "2026-01-25", etape: "Examen SGG", acteur: "Dir. Législation SGG", commentaire: "Observations mineures transmises, texte corrigé" },
      { date: "2026-02-01", etape: "Conseil d'État", acteur: "Section Administrative", commentaire: "Examen en cours — auditions programmées" },
    ],
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
    rapporteur: "SG Min. Santé",
    description: "Restructuration des directions et services du ministère conformément au nouveau cadre organique.",
    historique: [
      { date: "2026-01-25", etape: "Soumission", acteur: "Min. Santé", commentaire: "Projet de décret transmis au SGG" },
      { date: "2026-01-28", etape: "Examen SGG", acteur: "Dir. Admin. SGG", commentaire: "Vérification de conformité en cours" },
    ],
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
    rapporteur: "Min. Marcel ABÉKÉ",
    description: "Objectifs de réduction des émissions, mix énergétique renouvelable, mécanismes de financement vert.",
    historique: [
      { date: "2026-01-10", etape: "Soumission", acteur: "Min. Énergie" },
      { date: "2026-01-14", etape: "Examen SGG", acteur: "Dir. Législation SGG", commentaire: "Texte harmonisé après 2 RIM" },
      { date: "2026-01-20", etape: "Conseil d'État", acteur: "Section des Travaux Publics", commentaire: "Avis favorable" },
      { date: "2026-02-05", etape: "Conseil des Ministres", acteur: "Gouvernement", commentaire: "Reporté — arbitrages budgétaires en cours" },
    ],
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
    rapporteur: "Dir. Urbanisme",
    description: "Texte d'application précisant les procédures de permis de construire et les normes de sécurité.",
    historique: [
      { date: "2026-02-01", etape: "Soumission", acteur: "Min. Habitat", commentaire: "Avant-projet déposé au SGG" },
    ],
  },
  {
    id: "A-2026-008",
    titre: "Arrêté portant barème des frais d'inscription universitaire",
    type: "arrete",
    ministereOrigine: "Ministère de l'Enseignement Supérieur",
    dateDepot: "2026-02-05",
    etapeActuelle: 2,
    statut: "en_cours",
    urgence: false,
    rapporteur: "Dir. Ens. Supérieur",
    description: "Révision du barème des droits d'inscription pour l'année académique 2026-2027.",
    historique: [
      { date: "2026-02-05", etape: "Soumission", acteur: "Min. Ens. Supérieur" },
      { date: "2026-02-07", etape: "Examen SGG", acteur: "Dir. Législation SGG", commentaire: "Vérification en cours" },
    ],
  },
  {
    id: "O-2026-001",
    titre: "Ordonnance portant ratification de l'accord ZLECAF",
    type: "ordonnance",
    ministereOrigine: "Ministère du Commerce",
    dateDepot: "2026-01-28",
    etapeActuelle: 7,
    statut: "adopte",
    urgence: true,
    rapporteur: "Min. Commerce",
    description: "Ratification de l'accord instituant la Zone de Libre-Échange Continentale Africaine.",
    historique: [
      { date: "2026-01-28", etape: "Soumission", acteur: "Min. Commerce" },
      { date: "2026-01-29", etape: "Examen SGG", acteur: "SGG", commentaire: "Procédure d'urgence activée" },
      { date: "2026-01-30", etape: "Conseil d'État", acteur: "Conseil d'État", commentaire: "Avis favorable — procédure accélérée" },
      { date: "2026-01-31", etape: "Conseil des Ministres", acteur: "Gouvernement", commentaire: "Adopté" },
      { date: "2026-02-01", etape: "Parlement", acteur: "AN + Sénat", commentaire: "Ratifié en séance extraordinaire" },
      { date: "2026-02-03", etape: "Cour Constitutionnelle", acteur: "CC", commentaire: "Conforme" },
      { date: "2026-02-06", etape: "Promulgation", acteur: "Président", commentaire: "Signé par le Chef de l'État" },
    ],
  },
  {
    id: "PL-2026-004",
    titre: "Projet de loi sur la protection des données personnelles",
    type: "loi",
    ministereOrigine: "Ministère de la Justice",
    dateDepot: "2026-02-08",
    etapeActuelle: 1,
    statut: "en_cours",
    urgence: false,
    delaiRestant: 90,
    rapporteur: "Dir. Législation",
    description: "Cadre juridique gabonais pour la protection des données personnelles, inspiré du RGPD et de la Convention 108+ du Conseil de l'Europe.",
    historique: [
      { date: "2026-02-08", etape: "Soumission", acteur: "Min. Justice", commentaire: "Avant-projet avec étude d'impact déposé" },
    ],
  },
];

// ── Configs ──────────────────────────────────────────────────────────────────

const typeConfig = {
  loi: { label: "Projet de Loi", color: "bg-government-navy/20 text-government-navy", short: "PL" },
  decret: { label: "Décret", color: "bg-government-gold/20 text-government-gold", short: "D" },
  arrete: { label: "Arrêté", color: "bg-muted text-muted-foreground", short: "A" },
  ordonnance: { label: "Ordonnance", color: "bg-status-info/20 text-status-info", short: "O" },
};

const statutConfig = {
  en_cours: { label: "En cours", color: "bg-status-info/20 text-status-info", icon: Clock },
  adopte: { label: "Adopté", color: "bg-status-success/20 text-status-success", icon: CheckCircle2 },
  rejete: { label: "Rejeté", color: "bg-status-danger/20 text-status-danger", icon: AlertTriangle },
  en_attente: { label: "En attente", color: "bg-status-warning/20 text-status-warning", icon: Clock },
};

// ── Sub-components ───────────────────────────────────────────────────────────

function CycleWorkflow({ etapeActuelle, onStepClick, activeStep }: { etapeActuelle: number; onStepClick?: (id: number) => void; activeStep?: number | null }) {
  return (
    <div className="flex items-center justify-between overflow-x-auto pb-2 gap-0.5">
      {etapesCycle.map((etape, index) => {
        const EtapeIcon = etape.icon;
        const isCompleted = etape.id < etapeActuelle;
        const isCurrent = etape.id === etapeActuelle;
        const isSelected = activeStep === etape.id;

        return (
          <div key={etape.id} className="flex items-center">
            <button
              onClick={() => onStepClick?.(etape.id)}
              className="flex flex-col items-center group"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
                  isCompleted && "bg-status-success text-white",
                  isCurrent && "bg-government-navy text-white ring-4 ring-government-navy/20",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground",
                  isSelected && "ring-4 ring-government-gold/40 scale-110",
                  onStepClick && "cursor-pointer hover:scale-110",
                )}
              >
                {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <EtapeIcon className="h-5 w-5" />}
              </div>
              <span className={cn(
                "text-xs mt-1 text-center max-w-[70px] transition-colors",
                isCurrent ? "font-semibold text-foreground" : "text-muted-foreground",
                isSelected && "font-bold text-government-gold",
              )}>
                {etape.nom}
              </span>
            </button>
            {index < etapesCycle.length - 1 && (
              <div className={cn(
                "w-6 h-0.5 mx-0.5 transition-colors",
                etape.id < etapeActuelle ? "bg-status-success" : "bg-muted"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function TexteCard({ texte, onClick }: { texte: TexteLegislatif; onClick: () => void }) {
  const type = typeConfig[texte.type];
  const statut = statutConfig[texte.statut];
  const StatutIcon = statut.icon;
  const progress = (texte.etapeActuelle / etapesCycle.length) * 100;

  return (
    <Card className="hover:shadow-lg transition-all duration-200 group cursor-pointer border-l-4"
      style={{ borderLeftColor: texte.urgence ? "var(--status-danger, #ef4444)" : texte.statut === "adopte" ? "var(--status-success, #22c55e)" : "var(--government-navy, #1e3a5f)" }}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge className={cn("text-xs", type.color)}>{type.label}</Badge>
              {texte.urgence && (
                <Badge className="bg-status-danger/20 text-status-danger text-xs animate-pulse">
                  <AlertTriangle className="h-3 w-3 mr-1" />Urgent
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2 group-hover:text-government-navy transition-colors">
              {texte.titre}
            </h3>
            <p className="text-xs text-muted-foreground">{texte.ministereOrigine}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <Badge className={cn("text-xs gap-1", statut.color)}>
              <StatutIcon className="h-3 w-3" />{statut.label}
            </Badge>
            {texte.delaiRestant != null && (
              <p className={cn("text-xs mt-1", texte.delaiRestant <= 15 ? "text-status-danger font-semibold" : "text-muted-foreground")}>
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
            Étape : {etapesCycle[texte.etapeActuelle - 1]?.nom}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">{texte.id}</span>
            <span className="text-xs text-muted-foreground">• {new Date(texte.dateDepot).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
          </div>
          <Button variant="ghost" size="sm" className="text-government-gold opacity-0 group-hover:opacity-100 transition-opacity">
            Détails <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsSection({ textes }: { textes: TexteLegislatif[] }) {
  const parType = Object.entries(typeConfig).map(([key, cfg]) => ({
    type: cfg.label,
    count: textes.filter(t => t.type === key).length,
    short: cfg.short,
  }));

  const parEtape = etapesCycle.map(e => ({
    nom: e.nom,
    count: textes.filter(t => t.etapeActuelle === e.id).length,
  }));

  const maxEtape = Math.max(...parEtape.map(e => e.count), 1);

  const delaiMoyen = Math.round(
    textes.filter(t => t.delaiRestant != null).reduce((s, t) => s + (t.delaiRestant || 0), 0) /
    Math.max(textes.filter(t => t.delaiRestant != null).length, 1)
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Répartition par type */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-government-navy" /> Répartition par type
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {parType.map(t => (
            <div key={t.short} className="flex items-center gap-3">
              <span className="text-xs w-24 text-muted-foreground truncate">{t.type}</span>
              <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-government-navy to-government-navy-light rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                  style={{ width: `${Math.max((t.count / textes.length) * 100, 10)}%` }}
                >
                  <span className="text-[10px] font-bold text-white">{t.count}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Distribution par étape */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-government-gold" /> Textes par étape du cycle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-32">
            {parEtape.map((e, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold">{e.count || ""}</span>
                <div
                  className="w-full rounded-t bg-gradient-to-t from-government-gold/80 to-government-gold transition-all duration-500"
                  style={{ height: `${Math.max((e.count / maxEtape) * 100, 4)}%` }}
                />
                <span className="text-[8px] text-muted-foreground text-center leading-tight h-6 overflow-hidden">
                  {e.nom.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KPI supplémentaires */}
      <Card className="md:col-span-2">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-government-navy">{delaiMoyen}j</p>
              <p className="text-xs text-muted-foreground">Délai moyen restant</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-status-success">{textes.filter(t => t.statut === "adopte").length}</p>
              <p className="text-xs text-muted-foreground">Textes adoptés</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-status-danger">{textes.filter(t => t.urgence).length}</p>
              <p className="text-xs text-muted-foreground">Procédures urgentes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-government-gold">
                {new Set(textes.map(t => t.ministereOrigine)).size}
              </p>
              <p className="text-xs text-muted-foreground">Ministères actifs</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Page principale ──────────────────────────────────────────────────────────

export default function CycleLegislatif() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStep, setFilterStep] = useState<number | null>(null);
  const [selectedTexte, setSelectedTexte] = useState<TexteLegislatif | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatut, setFilterStatut] = useState<string>("all");

  const filteredTextes = useMemo(() => {
    return textesEnCours.filter(t => {
      const matchSearch = !searchQuery ||
        t.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.ministereOrigine.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStep = !filterStep || t.etapeActuelle === filterStep;
      const matchType = filterType === "all" || t.type === filterType;
      const matchStatut = filterStatut === "all" || t.statut === filterStatut;
      return matchSearch && matchStep && matchType && matchStatut;
    });
  }, [searchQuery, filterStep, filterType, filterStatut]);

  const stats = useMemo(() => ({
    total: textesEnCours.length,
    enCours: textesEnCours.filter(t => t.statut === "en_cours").length,
    urgents: textesEnCours.filter(t => t.urgence).length,
    parlement: textesEnCours.filter(t => t.etapeActuelle === 5).length,
    adoptes: textesEnCours.filter(t => t.statut === "adopte").length,
  }), []);

  const handleExport = () => {
    toast({ title: "Export en cours", description: `${filteredTextes.length} textes exportés au format CSV.` });
  };

  const handleNewTexte = () => {
    setShowNewDialog(false);
    toast({ title: "Texte créé", description: "Le nouveau texte a été enregistré et soumis au circuit." });
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Cycle Législatif et Réglementaire
            </h1>
            <p className="text-muted-foreground mt-1">
              Suivi des textes de la soumission à la publication au JO
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />Filtrer
              {(filterType !== "all" || filterStatut !== "all" || filterStep) && (
                <Badge className="ml-1 h-4 w-4 p-0 text-[10px] bg-government-gold text-white rounded-full flex items-center justify-center">!</Badge>
              )}
            </Button>
            <Button size="sm" className="bg-government-navy hover:bg-government-navy-light" onClick={() => setShowNewDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />Nouveau texte
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="mt-4 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un texte par titre, référence, ministère…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="mt-3 p-4 border rounded-xl bg-muted/30 flex flex-wrap gap-4 items-end animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-1">
              <Label className="text-xs">Type de texte</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="loi">Projet de Loi</SelectItem>
                  <SelectItem value="decret">Décret</SelectItem>
                  <SelectItem value="arrete">Arrêté</SelectItem>
                  <SelectItem value="ordonnance">Ordonnance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Statut</Label>
              <Select value={filterStatut} onValueChange={setFilterStatut}>
                <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="adopte">Adopté</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="rejete">Rejeté</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setFilterType("all"); setFilterStatut("all"); setFilterStep(null); }}>
              Réinitialiser
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4 mb-6">
        {[
          { icon: FileText, value: stats.total, label: "Textes en cours", bg: "bg-government-navy/10", iconColor: "text-government-navy" },
          { icon: Clock, value: stats.enCours, label: "En traitement", bg: "bg-status-info/10", iconColor: "text-status-info" },
          { icon: AlertTriangle, value: stats.urgents, label: "Urgents", bg: "bg-status-danger/10", iconColor: "text-status-danger" },
          { icon: Building2, value: stats.parlement, label: "Au Parlement", bg: "bg-government-gold/10", iconColor: "text-government-gold" },
        ].map((s, i) => {
          const SIcon = s.icon;
          return (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", s.bg)}><SIcon className={cn("h-5 w-5", s.iconColor)} /></div>
                  <div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Interactive Workflow */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Processus Législatif Type</CardTitle>
            {filterStep && (
              <Button variant="ghost" size="sm" onClick={() => setFilterStep(null)} className="text-xs gap-1">
                <X className="h-3 w-3" /> Voir tous
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Cliquez sur une étape pour filtrer les textes correspondants</p>
        </CardHeader>
        <CardContent>
          <CycleWorkflow etapeActuelle={0} onStepClick={(id) => setFilterStep(prev => prev === id ? null : id)} activeStep={filterStep} />
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="liste" className="space-y-4">
        <TabsList>
          <TabsTrigger value="liste">📋 Liste ({filteredTextes.length})</TabsTrigger>
          <TabsTrigger value="lois">📜 Projets de Loi</TabsTrigger>
          <TabsTrigger value="reglementaire">📑 Réglementaire</TabsTrigger>
          <TabsTrigger value="analytics">📊 Analytique</TabsTrigger>
        </TabsList>

        <TabsContent value="liste" className="space-y-4">
          {filteredTextes.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <Scale className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucun texte trouvé</p>
              <p className="text-sm">Modifiez vos critères de recherche ou de filtrage.</p>
            </CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTextes.map(texte => (
                <TexteCard key={texte.id} texte={texte} onClick={() => setSelectedTexte(texte)} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lois" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTextes.filter(t => t.type === "loi").map(texte => (
              <TexteCard key={texte.id} texte={texte} onClick={() => setSelectedTexte(texte)} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reglementaire" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTextes.filter(t => t.type === "decret" || t.type === "arrete" || t.type === "ordonnance").map(texte => (
              <TexteCard key={texte.id} texte={texte} onClick={() => setSelectedTexte(texte)} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsSection textes={textesEnCours} />
        </TabsContent>
      </Tabs>

      {/* Detail Sheet */}
      <Sheet open={!!selectedTexte} onOpenChange={() => setSelectedTexte(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedTexte && (() => {
            const type = typeConfig[selectedTexte.type];
            const statut = statutConfig[selectedTexte.statut];
            const StatutIcon = statut.icon;
            const progress = (selectedTexte.etapeActuelle / etapesCycle.length) * 100;

            return (
              <>
                <SheetHeader className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={cn("text-xs", type.color)}>{type.label}</Badge>
                    <Badge className={cn("text-xs gap-1", statut.color)}><StatutIcon className="h-3 w-3" />{statut.label}</Badge>
                    {selectedTexte.urgence && <Badge className="bg-status-danger/20 text-status-danger text-xs">Urgent</Badge>}
                  </div>
                  <SheetTitle className="text-lg leading-tight">{selectedTexte.titre}</SheetTitle>
                  <SheetDescription>{selectedTexte.description}</SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  {/* Meta info */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Référence</p>
                      <p className="font-mono font-medium">{selectedTexte.id}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Date de dépôt</p>
                      <p className="font-medium">{new Date(selectedTexte.dateDepot).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Ministère d'origine</p>
                      <p className="font-medium text-xs">{selectedTexte.ministereOrigine}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Rapporteur</p>
                      <p className="font-medium text-xs">{selectedTexte.rapporteur || "—"}</p>
                    </div>
                  </div>

                  {/* Progression */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Progression du cycle</span>
                      <span className="font-bold text-government-navy">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <p className="text-xs text-muted-foreground">Étape actuelle : <strong>{etapesCycle[selectedTexte.etapeActuelle - 1]?.nom}</strong></p>
                    {selectedTexte.delaiRestant != null && (
                      <p className={cn("text-xs font-medium", selectedTexte.delaiRestant <= 15 ? "text-status-danger" : "text-muted-foreground")}>
                        <CalendarDays className="h-3 w-3 inline mr-1" />
                        {selectedTexte.delaiRestant} jours restants
                      </p>
                    )}
                  </div>

                  {/* Mini workflow */}
                  <CycleWorkflow etapeActuelle={selectedTexte.etapeActuelle} />

                  {/* Historique */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <History className="h-4 w-4 text-government-navy" /> Historique du parcours
                    </h4>
                    <div className="space-y-0">
                      {selectedTexte.historique.map((entry, i) => (
                        <div key={i} className="flex gap-3 pb-4 relative">
                          {i < selectedTexte.historique.length - 1 && (
                            <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-muted" />
                          )}
                          <div className={cn(
                            "h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 z-10",
                            i === selectedTexte.historique.length - 1 ? "bg-government-navy text-white" : "bg-status-success text-white"
                          )}>
                            <CheckCircle2 className="h-3 w-3" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium">{entry.etape}</p>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(entry.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{entry.acteur}</p>
                            {entry.commentaire && <p className="text-xs mt-0.5 text-foreground/70">{entry.commentaire}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => { toast({ title: "PDF généré", description: "Fiche de suivi téléchargée." }); }}>
                      <Printer className="h-4 w-4" /> Imprimer
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => { toast({ title: "Export", description: "Historique exporté." }); }}>
                      <FileDown className="h-4 w-4" /> Exporter
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* New Texte Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouveau Texte Législatif</DialogTitle>
            <DialogDescription>Soumettez un avant-projet de loi, décret, arrêté ou ordonnance au circuit du SGG.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Type de texte</Label>
              <Select defaultValue="loi">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="loi">Projet de Loi</SelectItem>
                  <SelectItem value="decret">Décret</SelectItem>
                  <SelectItem value="arrete">Arrêté</SelectItem>
                  <SelectItem value="ordonnance">Ordonnance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Titre du texte</Label>
              <Input placeholder="Ex: Projet de loi portant…" />
            </div>
            <div className="space-y-1">
              <Label>Ministère d'origine</Label>
              <Input placeholder="Ex: Ministère de la Justice" />
            </div>
            <div className="space-y-1">
              <Label>Objet / Exposé des motifs</Label>
              <Textarea placeholder="Résumez l'objet et les motivations du texte…" rows={3} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="urgence" className="rounded" />
              <Label htmlFor="urgence" className="text-sm cursor-pointer">Procédure d'urgence</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Annuler</Button>
            <Button className="bg-government-navy hover:bg-government-navy-light" onClick={handleNewTexte}>
              <Send className="h-4 w-4 mr-2" /> Soumettre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
