/**
 * SGG Digital - Section Dashboard Législatif
 * Pour: Assemblée Nationale, Sénat
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Vote,
  Users,
  Calendar,
  ArrowRight,
  Scale,
  Clock,
  CheckCircle2,
  Building2,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { legislatifData } from "@/data/demoData";

interface LegislativeDashboardSectionProps {
  roleId?: string;
}

// Configuration des étapes législatives
const etapeConfig: Record<string, { label: string; color: string; order: number }> = {
  depot: { label: "Dépôt", color: "bg-muted text-muted-foreground", order: 1 },
  commission: { label: "Commission", color: "bg-status-info/10 text-status-info", order: 2 },
  seance: { label: "Séance", color: "bg-status-warning/10 text-status-warning", order: 3 },
  vote: { label: "Vote", color: "bg-government-gold/20 text-government-gold", order: 4 },
  adopte: { label: "Adopté", color: "bg-status-success/10 text-status-success", order: 5 },
  promulgue: { label: "Promulgué", color: "bg-government-green/20 text-government-green", order: 6 },
  navette: { label: "Navette", color: "bg-purple-500/10 text-purple-600", order: 3 },
};

export function LegislativeDashboardSection({ roleId }: LegislativeDashboardSectionProps) {
  const { stats, projetsLoi, calendrierVotes, commissions } = legislatifData;

  const isAssemblee = roleId === "assemblee";
  const chambreName = isAssemblee ? "Assemblée Nationale" : "Sénat";

  // Filtrer les projets selon la chambre
  const projetsFiltres = projetsLoi.filter(
    (p) => p.chambre === roleId || p.chambre === "navette"
  );

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Projets en Instance"
          value={String(projetsFiltres.length)}
          subtitle={`À la ${chambreName}`}
          icon={FileText}
          status="info"
        />
        <StatCard
          title="Votes à Venir"
          value={String(stats.votesAVenir)}
          subtitle="Ce mois"
          icon={Vote}
          status="warning"
        />
        <StatCard
          title="Commissions Actives"
          value={String(stats.commissionsActives)}
          subtitle="En session"
          icon={Users}
          status="success"
        />
        <StatCard
          title="Textes Adoptés"
          value={String(stats.textesAdoptes)}
          subtitle="Cette session"
          icon={CheckCircle2}
          status="success"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Projets de loi en instance */}
          <Card className="shadow-gov">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-government-navy" />
                Projets de Loi en Instance
              </CardTitle>
              <Button variant="outline" size="sm">
                Voir tout
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projet</TableHead>
                    <TableHead>Origine</TableHead>
                    <TableHead>Étape</TableHead>
                    <TableHead>Date Dépôt</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projetsLoi.map((projet) => (
                    <TableRow key={projet.id} className="hover:bg-muted/50">
                      <TableCell className="max-w-[250px]">
                        <div className="font-medium truncate">{projet.titre}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {projet.type}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {projet.ministereOrigine}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(etapeConfig[projet.etape]?.color)}
                        >
                          {etapeConfig[projet.etape]?.label}
                        </Badge>
                        {projet.chambre === "navette" && (
                          <Badge variant="secondary" className="ml-1 text-xs">
                            Navette
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(projet.dateDepot).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Cycle législatif visuel */}
          <Card className="shadow-gov">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-government-navy" />
                Cycle Législatif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="flex justify-between items-center">
                  {["depot", "commission", "seance", "vote", "adopte", "promulgue"].map((etape, index) => (
                    <div key={etape} className="flex flex-col items-center relative z-10">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
                          index < 3
                            ? "bg-status-success text-white"
                            : index === 3
                            ? "bg-status-warning text-white"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {index + 1}
                      </div>
                      <span className="text-xs mt-2 text-center max-w-[60px]">
                        {etapeConfig[etape]?.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-0">
                  <div
                    className="h-full bg-status-success"
                    style={{ width: "50%" }}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center mt-4">
                3 textes en cours d'examen
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Calendrier des votes */}
          <Card className="shadow-gov">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-government-gold" />
                Prochains Votes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {calendrierVotes.map((vote) => (
                  <div
                    key={vote.id}
                    className="p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        {new Date(vote.date).toLocaleDateString("fr-FR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </span>
                      <Badge variant="outline">{vote.heure}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {vote.projetLoi}
                    </p>
                    <Badge variant="secondary" className="mt-2 text-xs capitalize">
                      {vote.chambre === "assemblee" ? "Assemblée" : "Sénat"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Commissions parlementaires */}
          <Card className="shadow-gov">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-government-navy" />
                Commissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {commissions.map((commission, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                  >
                    <span className="text-sm font-medium truncate flex-1">
                      {commission.nom}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{commission.reunions} réunions</span>
                      <span className="text-status-success">
                        {commission.rapportsRendus} rapports
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card className="shadow-gov">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Consulter un texte
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Journal Officiel
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Ordre du jour
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
