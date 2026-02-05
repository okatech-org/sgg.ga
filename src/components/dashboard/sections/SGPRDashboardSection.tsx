/**
 * SGG Digital - Section Dashboard SGPR
 * Pour: Secrétaire Général de la Présidence de la République
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  FileText,
  AlertTriangle,
  Clock,
  ArrowRight,
  Building2,
  Send,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Inbox,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sgprData, statutLabels, statutColors } from "@/data/demoData";

export function SGPRDashboardSection() {
  const { stats, arbitrages, dossiersSignature, transmissions } = sgprData;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Dossiers en Attente"
          value={String(stats.dossiersEnAttente)}
          subtitle="Pour signature présidentielle"
          icon={FileText}
          status="warning"
        />
        <StatCard
          title="Arbitrages Pendants"
          value={String(stats.arbitragesPendants)}
          subtitle="Conflits interministériels"
          icon={Scale}
          status={stats.arbitragesPendants > 2 ? "danger" : "warning"}
        />
        <StatCard
          title="Transmissions Aujourd'hui"
          value={String(stats.transmissionsJour)}
          subtitle="Entrants et sortants"
          icon={Send}
          status="info"
        />
        <StatCard
          title="Urgences"
          value={String(stats.urgences)}
          subtitle="À traiter en priorité"
          icon={AlertTriangle}
          status="danger"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Arbitrages en cours */}
          <Card className="shadow-gov">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-government-navy" />
                Arbitrages Interministériels
              </CardTitle>
              <Badge variant="outline" className="bg-status-danger/10 text-status-danger border-status-danger/20">
                {arbitrages.filter(a => a.statut === "urgent").length} urgent(s)
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {arbitrages.map((arbitrage) => (
                  <div
                    key={arbitrage.id}
                    className={cn(
                      "p-4 rounded-lg border transition-colors",
                      arbitrage.statut === "urgent" && "border-status-danger/50 bg-status-danger/5"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{arbitrage.sujet}</h4>
                          <Badge variant="outline" className={cn(statutColors[arbitrage.statut])}>
                            {statutLabels[arbitrage.statut]}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {arbitrage.ministeres.map((ministere) => (
                            <Badge key={ministere} variant="secondary" className="text-xs">
                              {ministere}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Reçu le {new Date(arbitrage.dateReception).toLocaleDateString("fr-FR")}</span>
                          {arbitrage.deadline && (
                            <span className="text-status-danger">
                              Deadline: {new Date(arbitrage.deadline).toLocaleDateString("fr-FR")}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Examiner
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dossiers pour signature présidentielle */}
          <Card className="shadow-gov">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-government-gold" />
                Dossiers pour Signature Présidentielle
              </CardTitle>
              <Button variant="outline" size="sm">
                Voir tout
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dossiersSignature.map((dossier) => (
                  <div
                    key={dossier.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {dossier.type}
                        </Badge>
                        <h4 className="font-medium truncate">{dossier.titre}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        De: {dossier.emetteur} • Reçu le {new Date(dossier.dateReception).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn(statutColors[dossier.statut])}>
                        {statutLabels[dossier.statut]}
                      </Badge>
                      <Button size="sm" variant="ghost">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Suivi des transmissions */}
          <Card className="shadow-gov">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Inbox className="h-5 w-5 text-government-navy" />
                Flux de Transmission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transmissions.slice(0, 5).map((jour, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <span className="text-sm">
                      {new Date(jour.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-sm text-status-success">
                        <ArrowDownLeft className="h-3 w-3" />
                        {jour.entrant}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-status-info">
                        <ArrowUpRight className="h-3 w-3" />
                        {jour.sortant}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total semaine</span>
                  <div className="flex gap-4">
                    <span className="text-status-success">
                      ↓ {transmissions.reduce((acc, t) => acc + t.entrant, 0)}
                    </span>
                    <span className="text-status-info">
                      ↑ {transmissions.reduce((acc, t) => acc + t.sortant, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions rapides SGPR */}
          <Card className="shadow-gov">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Send className="h-4 w-4 mr-2" />
                  Transmettre un dossier
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Scale className="h-4 w-4 mr-2" />
                  Créer un arbitrage
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Voir l'agenda présidentiel
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Accès lecture complète
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Légende des statuts */}
          <Card className="shadow-gov">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Légende</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-status-danger/10 text-status-danger border-status-danger/20">
                    Urgent
                  </Badge>
                  <span className="text-muted-foreground">Traitement prioritaire</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-status-warning/10 text-status-warning border-status-warning/20">
                    En attente
                  </Badge>
                  <span className="text-muted-foreground">À examiner</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-status-success/10 text-status-success border-status-success/20">
                    Traité
                  </Badge>
                  <span className="text-muted-foreground">Dossier clôturé</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
