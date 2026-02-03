import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ChevronRight,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface TexteJO {
  id: string;
  numero: string;
  titre: string;
  type: "loi" | "decret" | "arrete" | "ordonnance" | "decision";
  datePublication: string;
  dateSignature: string;
  signataire: string;
  ministere?: string;
  resume: string;
  vues: number;
  telechargements: number;
}

// Données de démo
const textesRecents: TexteJO[] = [
  {
    id: "L-2026-001",
    numero: "N°001/2026",
    titre: "Loi de Finances pour l'exercice 2026",
    type: "loi",
    datePublication: "2026-01-02",
    dateSignature: "2025-12-28",
    signataire: "Président de la République",
    resume: "Fixe les recettes et dépenses de l'État pour l'année 2026, avec un budget de 4 500 milliards FCFA.",
    vues: 15420,
    telechargements: 3250,
  },
  {
    id: "D-2026-0273",
    numero: "N°0273/PR",
    titre: "Décret portant attributions et organisation du SGG",
    type: "decret",
    datePublication: "2025-05-31",
    dateSignature: "2025-05-30",
    signataire: "Président de la République",
    resume: "Définit les missions, l'organisation et le fonctionnement du Secrétariat Général du Gouvernement.",
    vues: 8730,
    telechargements: 1890,
  },
  {
    id: "D-2026-0045",
    numero: "N°0045/PR",
    titre: "Décret portant nomination de membres du Gouvernement",
    type: "decret",
    datePublication: "2026-01-15",
    dateSignature: "2026-01-14",
    signataire: "Président de la République",
    resume: "Nomination de nouveaux membres du Gouvernement suite au remaniement ministériel.",
    vues: 25600,
    telechargements: 4120,
  },
  {
    id: "O-2026-002",
    numero: "N°002/PR",
    titre: "Ordonnance relative à la modernisation de l'administration",
    type: "ordonnance",
    datePublication: "2026-01-20",
    dateSignature: "2026-01-18",
    signataire: "Président de la République",
    ministere: "Fonction Publique",
    resume: "Mesures de modernisation de l'administration publique gabonaise dans le cadre du PAG 2026.",
    vues: 6540,
    telechargements: 1230,
  },
  {
    id: "A-2026-0012",
    numero: "N°0012/MEF",
    titre: "Arrêté fixant les modalités de déclaration fiscale en ligne",
    type: "arrete",
    datePublication: "2026-01-25",
    dateSignature: "2026-01-22",
    signataire: "Ministre de l'Économie",
    ministere: "Économie et Finances",
    resume: "Définit les procédures de télédéclaration fiscale pour les entreprises.",
    vues: 4320,
    telechargements: 980,
  },
];

const typeConfig = {
  loi: { label: "Loi", color: "bg-government-navy/20 text-government-navy", icon: Scale },
  decret: { label: "Décret", color: "bg-government-gold/20 text-government-gold", icon: FileText },
  arrete: { label: "Arrêté", color: "bg-muted text-muted-foreground", icon: FileText },
  ordonnance: { label: "Ordonnance", color: "bg-status-info/20 text-status-info", icon: Gavel },
  decision: { label: "Décision", color: "bg-government-green/20 text-government-green", icon: Building2 },
};

const statsJO = {
  textesPublies: 1247,
  consultations: 125000,
  telechargements: 28500,
  textesConsolides: 342,
};

function TexteCard({ texte }: { texte: TexteJO }) {
  const type = typeConfig[texte.type];
  const TypeIcon = type.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className={cn("p-2 rounded-lg flex-shrink-0", type.color.replace("text-", "bg-").split(" ")[0])}>
            <TypeIcon className={cn("h-5 w-5", type.color.split(" ")[1])} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={cn("text-[10px]", type.color)}>
                {type.label}
              </Badge>
              <span className="text-xs text-muted-foreground">{texte.numero}</span>
            </div>
            <h3 className="font-semibold text-sm leading-tight line-clamp-2">
              {texte.titre}
            </h3>
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {texte.resume}
        </p>

        <div className="space-y-1 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>Publié le {new Date(texte.datePublication).toLocaleDateString("fr-FR")}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" />
            <span>Signé par {texte.signataire}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {texte.vues.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3.5 w-3.5" />
              {texte.telechargements.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7">
              <Download className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-government-gold h-7">
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TexteRow({ texte }: { texte: TexteJO }) {
  const type = typeConfig[texte.type];

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors">
      <Badge className={cn("text-xs whitespace-nowrap", type.color)}>
        {type.label}
      </Badge>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{texte.titre}</p>
        <p className="text-xs text-muted-foreground">
          {texte.numero} — {texte.signataire}
        </p>
      </div>

      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {new Date(texte.datePublication).toLocaleDateString("fr-FR")}
      </span>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Eye className="h-3.5 w-3.5" />
        {texte.vues.toLocaleString()}
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function JournalOfficiel() {
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Journal Officiel
            </h1>
            <p className="text-muted-foreground mt-1">
              Portail Open Data — Accès universel au droit gabonais
            </p>
          </div>
          <Button className="bg-government-navy hover:bg-government-navy-light">
            <BookOpen className="h-4 w-4 mr-2" />
            Consulter le JO
          </Button>
        </div>
      </div>

      {/* Recherche */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Rechercher un texte (mots-clés, numéro, date...)" 
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button variant="outline" size="lg" className="md:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filtres avancés
            </Button>
            <Button size="lg" className="bg-government-gold hover:bg-government-gold-light text-government-navy md:w-auto">
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">Lois 2026</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">Décrets présidentiels</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">Nominations</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">PAG 2026</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">Constitution 2024</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-government-navy/10">
                <FileText className="h-5 w-5 text-government-navy" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statsJO.textesPublies.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Textes publiés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-government-gold/10">
                <Eye className="h-5 w-5 text-government-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(statsJO.consultations / 1000).toFixed(0)}k</p>
                <p className="text-xs text-muted-foreground">Consultations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-status-success/10">
                <Download className="h-5 w-5 text-status-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(statsJO.telechargements / 1000).toFixed(1)}k</p>
                <p className="text-xs text-muted-foreground">Téléchargements</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-status-info/10">
                <BookOpen className="h-5 w-5 text-status-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statsJO.textesConsolides}</p>
                <p className="text-xs text-muted-foreground">Textes consolidés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="recents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="recents">Publications récentes</TabsTrigger>
          <TabsTrigger value="populaires">Les plus consultés</TabsTrigger>
          <TabsTrigger value="lois">Lois</TabsTrigger>
          <TabsTrigger value="decrets">Décrets</TabsTrigger>
        </TabsList>

        <TabsContent value="recents">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {textesRecents.map((texte) => (
              <TexteCard key={texte.id} texte={texte} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="populaires">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-government-gold" />
                Textes les plus consultés
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {[...textesRecents].sort((a, b) => b.vues - a.vues).map((texte) => (
                  <TexteRow key={texte.id} texte={texte} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lois">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {textesRecents.filter(t => t.type === "loi").map((texte) => (
              <TexteCard key={texte.id} texte={texte} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="decrets">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {textesRecents.filter(t => t.type === "decret").map((texte) => (
              <TexteCard key={texte.id} texte={texte} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
