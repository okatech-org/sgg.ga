/**
 * SGG Digital - Page Rapports
 * Génération et consultation des rapports gouvernementaux
 */

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  FileText,
  Download,
  Calendar,
  Filter,
  Plus,
  ClipboardCheck,
  BarChart3,
  TrendingUp,
  PieChart,
  Eye,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  RefreshCw,
  Target,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemoUser } from "@/hooks/useDemoUser";

// Types
interface Rapport {
  id: string;
  titre: string;
  type: "gar" | "activite" | "financier" | "audit" | "performance" | "special";
  periode: string;
  ministere?: string;
  dateGeneration: string;
  auteur: string;
  statut: "genere" | "en_cours" | "planifie" | "erreur";
  format: "pdf" | "excel" | "word";
  taille: string;
  indicateurs?: number;
}

// Données de démo
const rapports: Rapport[] = [
  {
    id: "RAP-001",
    titre: "Rapport GAR - Synthèse Nationale T4 2025",
    type: "gar",
    periode: "T4 2025",
    dateGeneration: "2026-01-15",
    auteur: "Cellule de Suivi GAR",
    statut: "genere",
    format: "pdf",
    taille: "4.2 MB",
    indicateurs: 173,
  },
  {
    id: "RAP-002",
    titre: "Rapport d'activité SGG - Janvier 2026",
    type: "activite",
    periode: "Janvier 2026",
    dateGeneration: "2026-02-01",
    auteur: "Direction Générale",
    statut: "genere",
    format: "pdf",
    taille: "2.8 MB",
  },
  {
    id: "RAP-003",
    titre: "Rapport financier - Exécution budgétaire PAG",
    type: "financier",
    periode: "2025",
    dateGeneration: "2026-01-20",
    auteur: "Direction Financière",
    statut: "genere",
    format: "excel",
    taille: "1.5 MB",
  },
  {
    id: "RAP-004",
    titre: "Rapport de performance - Ministère de la Santé",
    type: "performance",
    ministere: "Santé",
    periode: "T4 2025",
    dateGeneration: "2026-01-25",
    auteur: "Ministère de la Santé",
    statut: "genere",
    format: "pdf",
    taille: "3.1 MB",
    indicateurs: 45,
  },
  {
    id: "RAP-005",
    titre: "Audit des textes législatifs - Session parlementaire",
    type: "audit",
    periode: "Session Oct-Déc 2025",
    dateGeneration: "2026-01-30",
    auteur: "Direction Juridique",
    statut: "en_cours",
    format: "pdf",
    taille: "-",
  },
  {
    id: "RAP-006",
    titre: "Rapport spécial - Impact PAG 2026 sur l'emploi",
    type: "special",
    periode: "2025-2026",
    dateGeneration: "2026-02-05",
    auteur: "Cabinet du Premier Ministre",
    statut: "planifie",
    format: "pdf",
    taille: "-",
  },
  {
    id: "RAP-007",
    titre: "Rapport GAR - Ministère de l'Éducation",
    type: "gar",
    ministere: "Éducation Nationale",
    periode: "T4 2025",
    dateGeneration: "2026-01-28",
    auteur: "Min. Éducation",
    statut: "erreur",
    format: "pdf",
    taille: "-",
    indicateurs: 38,
  },
];

const modeleRapports = [
  { id: "TPL-001", nom: "Synthèse GAR nationale", type: "gar", frequence: "Trimestriel" },
  { id: "TPL-002", nom: "Rapport ministériel GAR", type: "gar", frequence: "Mensuel" },
  { id: "TPL-003", nom: "Bilan d'activité SGG", type: "activite", frequence: "Mensuel" },
  { id: "TPL-004", nom: "Exécution budgétaire", type: "financier", frequence: "Trimestriel" },
  { id: "TPL-005", nom: "Audit législatif", type: "audit", frequence: "Session" },
];

const typeConfig = {
  gar: { label: "GAR", color: "bg-government-gold/20 text-government-gold", icon: Target },
  activite: { label: "Activité", color: "bg-government-navy/20 text-government-navy", icon: ClipboardCheck },
  financier: { label: "Financier", color: "bg-government-green/20 text-government-green", icon: BarChart3 },
  audit: { label: "Audit", color: "bg-status-info/20 text-status-info", icon: FileText },
  performance: { label: "Performance", color: "bg-purple-500/20 text-purple-600", icon: TrendingUp },
  special: { label: "Spécial", color: "bg-status-warning/20 text-status-warning", icon: FileText },
};

const statutConfig = {
  genere: { label: "Généré", color: "bg-status-success/10 text-status-success border-status-success/20", icon: CheckCircle2 },
  en_cours: { label: "En cours", color: "bg-status-info/10 text-status-info border-status-info/20", icon: RefreshCw },
  planifie: { label: "Planifié", color: "bg-status-warning/10 text-status-warning border-status-warning/20", icon: Clock },
  erreur: { label: "Erreur", color: "bg-status-danger/10 text-status-danger border-status-danger/20", icon: AlertTriangle },
};

export default function Rapports() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statutFilter, setStatutFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("rapports");
  const { demoUser } = useDemoUser();

  // Droits d'accès
  const canGenerate = demoUser?.id !== "citoyen" && demoUser?.id !== "professionnel-droit";
  const canManageTemplates = demoUser?.id === "sgg-admin" || demoUser?.id === "sgg-directeur";

  // Filtrer les rapports
  const filteredRapports = rapports.filter((rapport) => {
    const matchSearch = rapport.titre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === "all" || rapport.type === typeFilter;
    const matchStatut = statutFilter === "all" || rapport.statut === statutFilter;
    return matchSearch && matchType && matchStatut;
  });

  // Stats
  const totalRapports = rapports.length;
  const rapportsGeneres = rapports.filter(r => r.statut === "genere").length;
  const rapportsEnCours = rapports.filter(r => r.statut === "en_cours" || r.statut === "planifie").length;
  const rapportsGAR = rapports.filter(r => r.type === "gar").length;

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Rapports
            </h1>
            <p className="text-muted-foreground mt-1">
              Génération et consultation des rapports gouvernementaux
            </p>
          </div>
          {canGenerate && (
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Planifier
              </Button>
              <Button className="bg-government-gold hover:bg-government-gold-light text-government-navy">
                <Plus className="h-4 w-4 mr-2" />
                Générer un rapport
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Rapports"
          value={String(totalRapports)}
          subtitle="Dans le système"
          icon={ClipboardCheck}
          status="info"
        />
        <StatCard
          title="Générés"
          value={String(rapportsGeneres)}
          subtitle="Disponibles"
          icon={CheckCircle2}
          status="success"
        />
        <StatCard
          title="En attente"
          value={String(rapportsEnCours)}
          subtitle="En cours / Planifiés"
          icon={Clock}
          status="warning"
        />
        <StatCard
          title="Rapports GAR"
          value={String(rapportsGAR)}
          subtitle="Suivi PAG"
          icon={Target}
          status="success"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="rapports" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Rapports</span>
          </TabsTrigger>
          <TabsTrigger value="modeles" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Modèles</span>
          </TabsTrigger>
          <TabsTrigger value="statistiques" className="gap-2">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Statistiques</span>
          </TabsTrigger>
        </TabsList>

        {/* Rapports Tab */}
        <TabsContent value="rapports" className="space-y-6">
          {/* Filtres */}
          <Card className="shadow-gov">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un rapport..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="gar">GAR</SelectItem>
                    <SelectItem value="activite">Activité</SelectItem>
                    <SelectItem value="financier">Financier</SelectItem>
                    <SelectItem value="audit">Audit</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="special">Spécial</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statutFilter} onValueChange={setStatutFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="genere">Générés</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="planifie">Planifiés</SelectItem>
                    <SelectItem value="erreur">Erreurs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table des rapports */}
          <Card className="shadow-gov">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Rapport</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Auteur</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRapports.map((rapport) => {
                    const type = typeConfig[rapport.type];
                    const statut = statutConfig[rapport.statut];
                    const TypeIcon = type.icon;
                    const StatutIcon = statut.icon;
                    return (
                      <TableRow key={rapport.id} className="hover:bg-muted/50">
                        <TableCell>
                          <Badge className={cn("text-xs", type.color)}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {type.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{rapport.titre}</p>
                            {rapport.ministere && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {rapport.ministere}
                              </p>
                            )}
                            {rapport.indicateurs && (
                              <p className="text-xs text-muted-foreground">
                                {rapport.indicateurs} indicateurs
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {rapport.periode}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {rapport.auteur}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(rapport.dateGeneration).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(statut.color)}>
                            <StatutIcon className="h-3 w-3 mr-1" />
                            {statut.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {rapport.statut === "genere" && (
                              <>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Printer className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {rapport.statut === "erreur" && canGenerate && (
                              <Button variant="ghost" size="sm" className="text-status-warning">
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Modèles Tab */}
        <TabsContent value="modeles" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="shadow-gov">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-government-navy" />
                    Modèles de Rapports
                  </CardTitle>
                  {canManageTemplates && (
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Nouveau modèle
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {modeleRapports.map((modele) => {
                      const type = typeConfig[modele.type as keyof typeof typeConfig];
                      return (
                        <div
                          key={modele.id}
                          className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <Badge className={cn("text-xs", type.color)}>
                              {type.label}
                            </Badge>
                            <div>
                              <p className="font-medium">{modele.nom}</p>
                              <p className="text-sm text-muted-foreground">
                                Fréquence: {modele.frequence}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {canGenerate && (
                              <Button size="sm" variant="outline">
                                Générer
                              </Button>
                            )}
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="shadow-gov">
                <CardHeader>
                  <CardTitle className="text-lg">Génération rapide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2 text-government-gold" />
                    Synthèse GAR nationale
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Rapport d'activité mensuel
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2 text-government-green" />
                    Bilan budgétaire
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-gov">
                <CardHeader>
                  <CardTitle className="text-lg">Planification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium">Prochain rapport GAR</p>
                      <p className="text-xs text-muted-foreground">15 février 2026</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium">Bilan trimestriel</p>
                      <p className="text-xs text-muted-foreground">31 mars 2026</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium">Rapport annuel</p>
                      <p className="text-xs text-muted-foreground">15 janvier 2027</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Statistiques Tab */}
        <TabsContent value="statistiques" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Répartition par type */}
            <Card className="shadow-gov">
              <CardHeader>
                <CardTitle className="text-lg">Répartition par Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(typeConfig).map(([key, config]) => {
                    const count = rapports.filter(r => r.type === key).length;
                    const pct = Math.round((count / totalRapports) * 100);
                    const TypeIcon = config.icon;
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <TypeIcon className="h-4 w-4" />
                            {config.label}
                          </span>
                          <span className="font-medium">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", config.color.split(" ")[0])}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Activité mensuelle */}
            <Card className="shadow-gov">
              <CardHeader>
                <CardTitle className="text-lg">Activité Mensuelle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {["Oct", "Nov", "Déc", "Jan"].map((mois, index) => {
                    const values = [12, 15, 18, 8];
                    return (
                      <div key={mois} className="text-center p-4 rounded-lg bg-muted/50">
                        <div className="text-sm text-muted-foreground">{mois}</div>
                        <div className="text-2xl font-bold mt-1">{values[index]}</div>
                        <div className="text-xs text-muted-foreground">rapports</div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Moyenne mensuelle</span>
                    <span className="text-xl font-bold text-government-navy">13 rapports</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top ministères */}
            <Card className="shadow-gov lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Rapports par Ministère</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { nom: "Santé", rapports: 12, conformite: 95 },
                    { nom: "Éducation Nationale", rapports: 10, conformite: 88 },
                    { nom: "Économie et Finances", rapports: 15, conformite: 100 },
                    { nom: "Travaux Publics", rapports: 8, conformite: 75 },
                    { nom: "Agriculture", rapports: 6, conformite: 67 },
                    { nom: "Numérique", rapports: 9, conformite: 92 },
                  ].map((ministere) => (
                    <div
                      key={ministere.nom}
                      className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <p className="font-medium text-sm">{ministere.nom}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {ministere.rapports} rapports
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            ministere.conformite >= 90
                              ? "bg-status-success/10 text-status-success"
                              : ministere.conformite >= 75
                              ? "bg-status-warning/10 text-status-warning"
                              : "bg-status-danger/10 text-status-danger"
                          )}
                        >
                          {ministere.conformite}% conformité
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
