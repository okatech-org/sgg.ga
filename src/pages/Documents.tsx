/**
 * SGG Digital - Page Documents
 * Gestion documentaire centralisée pour le SGG
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
  FolderOpen,
  Plus,
  Upload,
  File,
  FileSpreadsheet,
  FileImage,
  FilePen,
  Eye,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  Users,
  Lock,
  Folder,
  Star,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemoUser } from "@/hooks/useDemoUser";

// Types
interface Document {
  id: string;
  nom: string;
  type: "pdf" | "docx" | "xlsx" | "pptx" | "image" | "autre";
  categorie: "conseil_ministres" | "notes" | "rapports" | "projets_textes" | "correspondance" | "archives";
  taille: string;
  dateCreation: string;
  dateModification: string;
  auteur: string;
  ministere?: string;
  statut: "brouillon" | "valide" | "archive" | "confidentiel";
  partage: boolean;
  favoris: boolean;
}

// Données de démo
const documents: Document[] = [
  {
    id: "DOC-001",
    nom: "Relevé de décisions - Conseil des Ministres 28 janvier 2026",
    type: "pdf",
    categorie: "conseil_ministres",
    taille: "2.4 MB",
    dateCreation: "2026-01-28",
    dateModification: "2026-01-28",
    auteur: "SGG",
    statut: "valide",
    partage: true,
    favoris: true,
  },
  {
    id: "DOC-002",
    nom: "Note de présentation - Projet de loi portant Code du Numérique",
    type: "docx",
    categorie: "notes",
    taille: "856 KB",
    dateCreation: "2026-01-25",
    dateModification: "2026-01-30",
    auteur: "Direction des Études Juridiques",
    ministere: "Numérique",
    statut: "brouillon",
    partage: false,
    favoris: false,
  },
  {
    id: "DOC-003",
    nom: "Rapport trimestriel GAR - T4 2025",
    type: "xlsx",
    categorie: "rapports",
    taille: "1.2 MB",
    dateCreation: "2026-01-15",
    dateModification: "2026-01-20",
    auteur: "Cellule de Suivi",
    statut: "valide",
    partage: true,
    favoris: true,
  },
  {
    id: "DOC-004",
    nom: "Projet de décret - Organisation du Ministère de la Santé",
    type: "docx",
    categorie: "projets_textes",
    taille: "1.8 MB",
    dateCreation: "2026-01-20",
    dateModification: "2026-02-01",
    auteur: "Direction de la Législation",
    ministere: "Santé",
    statut: "brouillon",
    partage: false,
    favoris: false,
  },
  {
    id: "DOC-005",
    nom: "Correspondance Présidence - Transmission projet de loi",
    type: "pdf",
    categorie: "correspondance",
    taille: "425 KB",
    dateCreation: "2026-02-01",
    dateModification: "2026-02-01",
    auteur: "Secrétaire Général",
    statut: "confidentiel",
    partage: false,
    favoris: false,
  },
  {
    id: "DOC-006",
    nom: "Compte-rendu - Réunion interministérielle Éducation",
    type: "pdf",
    categorie: "notes",
    taille: "678 KB",
    dateCreation: "2026-01-22",
    dateModification: "2026-01-23",
    auteur: "Cabinet SGG",
    ministere: "Éducation",
    statut: "valide",
    partage: true,
    favoris: false,
  },
];

const dossiers = [
  { nom: "Conseil des Ministres 2026", documents: 24, taille: "156 MB" },
  { nom: "Projets de Loi en cours", documents: 12, taille: "45 MB" },
  { nom: "Rapports ministériels", documents: 35, taille: "89 MB" },
  { nom: "Archives 2025", documents: 156, taille: "420 MB" },
];

const typeIcons = {
  pdf: FileText,
  docx: FilePen,
  xlsx: FileSpreadsheet,
  pptx: File,
  image: FileImage,
  autre: File,
};

const categorieLabels = {
  conseil_ministres: "Conseil des Ministres",
  notes: "Notes & CR",
  rapports: "Rapports",
  projets_textes: "Projets de textes",
  correspondance: "Correspondance",
  archives: "Archives",
};

const statutConfig = {
  brouillon: { label: "Brouillon", color: "bg-muted text-muted-foreground" },
  valide: { label: "Validé", color: "bg-status-success/10 text-status-success border-status-success/20" },
  archive: { label: "Archivé", color: "bg-status-info/10 text-status-info border-status-info/20" },
  confidentiel: { label: "Confidentiel", color: "bg-status-danger/10 text-status-danger border-status-danger/20" },
};

export default function Documents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categorieFilter, setCategorieFilter] = useState<string>("all");
  const [statutFilter, setStatutFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("tous");
  const { demoUser } = useDemoUser();

  // Droits d'accès
  const canUpload = demoUser?.id !== "citoyen" && demoUser?.id !== "professionnel-droit";
  const canManage = demoUser?.id === "sgg-admin" || demoUser?.id === "sgg-directeur";

  // Filtrer les documents
  const filteredDocuments = documents.filter((doc) => {
    const matchSearch = doc.nom.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategorie = categorieFilter === "all" || doc.categorie === categorieFilter;
    const matchStatut = statutFilter === "all" || doc.statut === statutFilter;

    // Filtre par onglet
    if (activeTab === "favoris") return matchSearch && matchCategorie && matchStatut && doc.favoris;
    if (activeTab === "partages") return matchSearch && matchCategorie && matchStatut && doc.partage;
    if (activeTab === "recents") return matchSearch && matchCategorie && matchStatut;

    return matchSearch && matchCategorie && matchStatut;
  });

  // Stats
  const totalDocuments = documents.length;
  const documentsBrouillon = documents.filter(d => d.statut === "brouillon").length;
  const documentsValides = documents.filter(d => d.statut === "valide").length;
  const documentsPartages = documents.filter(d => d.partage).length;

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Documents
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestion documentaire centralisée du Secrétariat Général du Gouvernement
            </p>
          </div>
          {canUpload && (
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline">
                <FolderOpen className="h-4 w-4 mr-2" />
                Nouveau dossier
              </Button>
              <Button className="bg-government-gold hover:bg-government-gold-light text-government-navy">
                <Upload className="h-4 w-4 mr-2" />
                Téléverser
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Documents"
          value={String(totalDocuments)}
          subtitle="Dans le système"
          icon={FileText}
          status="info"
        />
        <StatCard
          title="Validés"
          value={String(documentsValides)}
          subtitle="Prêts à utiliser"
          icon={CheckCircle2}
          status="success"
        />
        <StatCard
          title="En cours"
          value={String(documentsBrouillon)}
          subtitle="Brouillons"
          icon={Clock}
          status="warning"
        />
        <StatCard
          title="Partagés"
          value={String(documentsPartages)}
          subtitle="Accessibles"
          icon={Share2}
          status="success"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar - Dossiers */}
        <div className="space-y-6">
          <Card className="shadow-gov">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Folder className="h-5 w-5 text-government-gold" />
                Dossiers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dossiers.map((dossier, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FolderOpen className="h-5 w-5 text-government-gold" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{dossier.nom}</p>
                      <p className="text-xs text-muted-foreground">
                        {dossier.documents} documents • {dossier.taille}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-gov">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Catégories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {Object.entries(categorieLabels).map(([key, label]) => (
                <Button
                  key={key}
                  variant={categorieFilter === key ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm"
                  onClick={() => setCategorieFilter(categorieFilter === key ? "all" : key)}
                >
                  {label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <TabsList>
                <TabsTrigger value="tous">Tous</TabsTrigger>
                <TabsTrigger value="recents">Récents</TabsTrigger>
                <TabsTrigger value="favoris">
                  <Star className="h-4 w-4 mr-1" />
                  Favoris
                </TabsTrigger>
                <TabsTrigger value="partages">
                  <Share2 className="h-4 w-4 mr-1" />
                  Partagés
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Filtres */}
            <Card className="shadow-gov mt-4">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un document..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statutFilter} onValueChange={setStatutFilter}>
                    <SelectTrigger className="w-[160px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="brouillon">Brouillons</SelectItem>
                      <SelectItem value="valide">Validés</SelectItem>
                      <SelectItem value="confidentiel">Confidentiels</SelectItem>
                      <SelectItem value="archive">Archivés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Document List */}
            <TabsContent value={activeTab} className="mt-4">
              <Card className="shadow-gov">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]"></TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Auteur</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.map((doc) => {
                        const TypeIcon = typeIcons[doc.type];
                        const statut = statutConfig[doc.statut];
                        return (
                          <TableRow key={doc.id} className="hover:bg-muted/50">
                            <TableCell>
                              <TypeIcon className="h-5 w-5 text-muted-foreground" />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div>
                                  <p className="font-medium text-sm">{doc.nom}</p>
                                  <p className="text-xs text-muted-foreground">{doc.taille}</p>
                                </div>
                                {doc.favoris && <Star className="h-4 w-4 text-government-gold fill-government-gold" />}
                                {doc.statut === "confidentiel" && <Lock className="h-4 w-4 text-status-danger" />}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {categorieLabels[doc.categorie]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {doc.auteur}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(doc.dateModification).toLocaleDateString("fr-FR")}
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
                                {canManage && (
                                  <Button variant="ghost" size="sm">
                                    <Share2 className="h-4 w-4" />
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
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
