/**
 * SGG Digital - Page Journal Officiel (Application)
 * Version protégée avec layout Dashboard pour utilisateurs authentifiés
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
  Eye,
  Filter,
  BookOpen,
  Scale,
  Gavel,
  Building2,
  Plus,
  Upload,
  Printer,
  Archive,
  Clock,
  CheckCircle2,
  ExternalLink,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemoUser } from "@/hooks/useDemoUser";

// Types
interface TexteJO {
  id: string;
  numero: string;
  titre: string;
  type: "loi" | "decret" | "arrete" | "ordonnance" | "decision";
  statut: "publie" | "a_publier" | "en_revision" | "archive";
  datePublication: string | null;
  dateSignature: string;
  signataire: string;
  ministere?: string;
  numeroJO?: string;
  vues: number;
  telechargements: number;
}

// Données de démo
const textesJO: TexteJO[] = [
  {
    id: "L-2026-001",
    numero: "N°001/2026",
    titre: "Loi de Finances pour l'exercice 2026",
    type: "loi",
    statut: "publie",
    datePublication: "2026-01-02",
    dateSignature: "2025-12-28",
    signataire: "Président de la République",
    numeroJO: "JO n°01/2026",
    vues: 15420,
    telechargements: 3250,
  },
  {
    id: "D-2026-0273",
    numero: "N°0273/PR",
    titre: "Décret portant attributions et organisation du SGG",
    type: "decret",
    statut: "publie",
    datePublication: "2025-05-31",
    dateSignature: "2025-05-30",
    signataire: "Président de la République",
    numeroJO: "JO n°12/2025",
    vues: 8730,
    telechargements: 1890,
  },
  {
    id: "D-2026-0045",
    numero: "N°0045/PR",
    titre: "Décret portant nomination de membres du Gouvernement",
    type: "decret",
    statut: "publie",
    datePublication: "2026-01-15",
    dateSignature: "2026-01-14",
    signataire: "Président de la République",
    numeroJO: "JO n°02/2026",
    vues: 25600,
    telechargements: 4120,
  },
  {
    id: "O-2026-002",
    numero: "N°002/PR",
    titre: "Ordonnance relative à la modernisation de l'administration",
    type: "ordonnance",
    statut: "a_publier",
    datePublication: null,
    dateSignature: "2026-01-18",
    signataire: "Président de la République",
    ministere: "Fonction Publique",
    vues: 0,
    telechargements: 0,
  },
  {
    id: "A-2026-0012",
    numero: "N°0012/MEF",
    titre: "Arrêté fixant les modalités de déclaration fiscale en ligne",
    type: "arrete",
    statut: "en_revision",
    datePublication: null,
    dateSignature: "2026-01-22",
    signataire: "Ministre de l'Économie",
    ministere: "Économie et Finances",
    vues: 0,
    telechargements: 0,
  },
  {
    id: "D-2026-0078",
    numero: "N°0078/PR",
    titre: "Décret portant création de l'Agence Nationale de Cybersécurité",
    type: "decret",
    statut: "a_publier",
    datePublication: null,
    dateSignature: "2026-01-28",
    signataire: "Président de la République",
    ministere: "Numérique",
    vues: 0,
    telechargements: 0,
  },
];

const editionsJO = [
  { numero: "JO n°16/2026", date: "2026-02-05", textes: 12, statut: "preparation" },
  { numero: "JO n°15/2026", date: "2026-01-30", textes: 18, statut: "publie" },
  { numero: "JO n°14/2026", date: "2026-01-25", textes: 15, statut: "publie" },
  { numero: "JO n°13/2026", date: "2026-01-20", textes: 22, statut: "publie" },
];

const typeConfig = {
  loi: { label: "Loi", color: "bg-government-navy/20 text-government-navy", icon: Scale },
  decret: { label: "Décret", color: "bg-government-gold/20 text-government-gold", icon: FileText },
  arrete: { label: "Arrêté", color: "bg-muted text-muted-foreground", icon: FileText },
  ordonnance: { label: "Ordonnance", color: "bg-status-info/20 text-status-info", icon: Gavel },
  decision: { label: "Décision", color: "bg-government-green/20 text-government-green", icon: Building2 },
};

const statutConfig = {
  publie: { label: "Publié", color: "bg-status-success/10 text-status-success border-status-success/20" },
  a_publier: { label: "À publier", color: "bg-status-warning/10 text-status-warning border-status-warning/20" },
  en_revision: { label: "En révision", color: "bg-status-info/10 text-status-info border-status-info/20" },
  archive: { label: "Archivé", color: "bg-muted text-muted-foreground" },
};

export default function JournalOfficielApp() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statutFilter, setStatutFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("textes");
  const { demoUser } = useDemoUser();

  // Vérifier si l'utilisateur a des droits de publication (DGJO, Admin)
  const canPublish = demoUser?.id === "dgjo" || demoUser?.id === "sgg-admin";
  const canEdit = canPublish || demoUser?.id === "sgg-directeur";

  // Filtrer les textes
  const filteredTextes = textesJO.filter((texte) => {
    const matchSearch = texte.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      texte.numero.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === "all" || texte.type === typeFilter;
    const matchStatut = statutFilter === "all" || texte.statut === statutFilter;
    return matchSearch && matchType && matchStatut;
  });

  // Stats
  const textesPublies = textesJO.filter(t => t.statut === "publie").length;
  const textesAPublier = textesJO.filter(t => t.statut === "a_publier").length;
  const textesEnRevision = textesJO.filter(t => t.statut === "en_revision").length;
  const totalVues = textesJO.reduce((acc, t) => acc + t.vues, 0);

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Journal Officiel
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestion et publication des textes officiels de la République Gabonaise
            </p>
          </div>
          {canPublish && (
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Importer
              </Button>
              <Button className="bg-government-gold hover:bg-government-gold-light text-government-navy">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau texte
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Textes Publiés"
          value={String(textesPublies)}
          subtitle="Total au JO"
          icon={CheckCircle2}
          status="success"
        />
        <StatCard
          title="À Publier"
          value={String(textesAPublier)}
          subtitle="En attente"
          icon={Clock}
          status="warning"
        />
        <StatCard
          title="En Révision"
          value={String(textesEnRevision)}
          subtitle="Corrections en cours"
          icon={FileText}
          status="info"
        />
        <StatCard
          title="Consultations"
          value={`${(totalVues / 1000).toFixed(1)}k`}
          subtitle="Vues totales"
          icon={Eye}
          status="success"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="textes" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Textes</span>
          </TabsTrigger>
          <TabsTrigger value="editions" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Éditions JO</span>
          </TabsTrigger>
          <TabsTrigger value="archives" className="gap-2">
            <Archive className="h-4 w-4" />
            <span className="hidden sm:inline">Archives</span>
          </TabsTrigger>
        </TabsList>

        {/* Textes Tab */}
        <TabsContent value="textes" className="space-y-6">
          {/* Filtres */}
          <Card className="shadow-gov">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un texte..."
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
                    <SelectItem value="loi">Lois</SelectItem>
                    <SelectItem value="decret">Décrets</SelectItem>
                    <SelectItem value="arrete">Arrêtés</SelectItem>
                    <SelectItem value="ordonnance">Ordonnances</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statutFilter} onValueChange={setStatutFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="publie">Publiés</SelectItem>
                    <SelectItem value="a_publier">À publier</SelectItem>
                    <SelectItem value="en_revision">En révision</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table des textes */}
          <Card className="shadow-gov">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Numéro / Titre</TableHead>
                    <TableHead>Signataire</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTextes.map((texte) => {
                    const type = typeConfig[texte.type];
                    const statut = statutConfig[texte.statut];
                    return (
                      <TableRow key={texte.id} className="hover:bg-muted/50">
                        <TableCell>
                          <Badge className={cn("text-xs", type.color)}>
                            {type.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{texte.titre}</p>
                            <p className="text-xs text-muted-foreground">{texte.numero}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {texte.signataire}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {texte.datePublication
                            ? new Date(texte.datePublication).toLocaleDateString("fr-FR")
                            : new Date(texte.dateSignature).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(statut.color)}>
                            {statut.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            {canEdit && texte.statut === "a_publier" && (
                              <Button variant="ghost" size="sm" className="text-government-gold">
                                <ExternalLink className="h-4 w-4" />
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

        {/* Éditions Tab */}
        <TabsContent value="editions" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="shadow-gov">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-government-navy" />
                    Éditions du Journal Officiel
                  </CardTitle>
                  {canPublish && (
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Nouvelle édition
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Numéro</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Textes</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editionsJO.map((edition) => (
                        <TableRow key={edition.numero}>
                          <TableCell className="font-medium">{edition.numero}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(edition.date).toLocaleDateString("fr-FR")}
                          </TableCell>
                          <TableCell>{edition.textes} textes</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                edition.statut === "publie"
                                  ? "bg-status-success/10 text-status-success border-status-success/20"
                                  : "bg-status-warning/10 text-status-warning border-status-warning/20"
                              )}
                            >
                              {edition.statut === "publie" ? "Publié" : "En préparation"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Printer className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="shadow-gov">
                <CardHeader>
                  <CardTitle className="text-lg">Actions rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="h-4 w-4 mr-2" />
                    Recherche avancée
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Calendrier des publications
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Archive className="h-4 w-4 mr-2" />
                    Archives consolidées
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-gov">
                <CardHeader>
                  <CardTitle className="text-lg">Statistiques 2026</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Lois publiées</span>
                      <span className="font-bold">24</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Décrets publiés</span>
                      <span className="font-bold">156</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Arrêtés publiés</span>
                      <span className="font-bold">342</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Éditions JO</span>
                      <span className="font-bold">16</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total textes</span>
                        <span className="font-bold text-government-navy">522</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Archives Tab */}
        <TabsContent value="archives" className="space-y-6">
          <Card className="shadow-gov">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-government-navy" />
                Archives du Journal Officiel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map((year) => (
                  <Card
                    key={year}
                    className="cursor-pointer hover:border-government-gold/50 transition-colors"
                  >
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-government-navy">{year}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {Math.floor(Math.random() * 20) + 40} éditions
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.floor(Math.random() * 300) + 400} textes
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
