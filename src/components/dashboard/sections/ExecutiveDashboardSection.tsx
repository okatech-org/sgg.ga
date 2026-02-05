/**
 * SGG Digital - Section Dashboard Exécutif
 * Pour: Président, Vice-Président, Premier Ministre, Ministre, SG Ministère
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { GARProgressChart } from "@/components/dashboard/GARProgressChart";
import { MinistryReportingTable } from "@/components/dashboard/MinistryReportingTable";
import {
  TrendingUp,
  Users,
  FileCheck,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Crown,
  Briefcase,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { executifData, statutLabels, statutColors } from "@/data/demoData";
import { useDemoUser } from "@/hooks/useDemoUser";

interface ExecutiveDashboardSectionProps {
  roleId?: string;
}

export function ExecutiveDashboardSection({ roleId }: ExecutiveDashboardSectionProps) {
  const { getRoleCapabilities, isHighLevelExecutive } = useDemoUser();
  const capabilities = getRoleCapabilities();
  const isHighLevel = isHighLevelExecutive();

  const { stats, nominationsAValider, conseilsMinistres, decisionsRecentes } = executifData;

  // Déterminer quelles sections afficher selon le rôle
  const showNominations = capabilities.canValidateNominations || roleId === "ministre" || roleId === "sg-ministere";
  const showDecisions = isHighLevel;
  const showConseilsMinistres = isHighLevel || roleId === "premier-ministre";

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Taux d'Exécution Global"
          value={`${stats.tauxExecutionGAR}%`}
          subtitle="PAG 2026"
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
          status="success"
        />
        <StatCard
          title={showNominations ? "Nominations à Valider" : "Rapports Reçus"}
          value={showNominations ? String(stats.nominationsEnCours) : "28/35"}
          subtitle={showNominations ? "En attente de décision" : "Ministères ce mois"}
          icon={showNominations ? Users : FileCheck}
          status={showNominations ? "warning" : "success"}
        />
        <StatCard
          title={showConseilsMinistres ? "Conseils Ministres" : "Nominations en Cours"}
          value={showConseilsMinistres ? String(stats.conseilsMinistresAVenir) : "12"}
          subtitle={showConseilsMinistres ? "À venir ce mois" : "En attente de validation"}
          icon={showConseilsMinistres ? Calendar : Users}
          status="info"
        />
        <StatCard
          title="Alertes Actives"
          value={String(stats.alertesActives)}
          subtitle="Retards signalés"
          icon={AlertTriangle}
          status="danger"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Charts and Tables */}
        <div className="lg:col-span-2 space-y-6">
          <GARProgressChart />

          {/* Nominations à valider (pour hauts responsables) */}
          {showNominations && capabilities.canValidateNominations && (
            <Card className="shadow-gov">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-government-gold" />
                  Nominations en Attente de Validation
                </CardTitle>
                <Button variant="outline" size="sm">
                  Voir tout
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nominationsAValider.map((nomination) => (
                    <div
                      key={nomination.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium truncate">{nomination.poste}</h4>
                          {nomination.priorite === "haute" && (
                            <Badge variant="outline" className="bg-status-danger/10 text-status-danger border-status-danger/20 text-xs">
                              Prioritaire
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {nomination.candidat} • {nomination.ministere}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Proposé le {new Date(nomination.dateProposition).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn(statutColors[nomination.statut])}>
                          {statutLabels[nomination.statut]}
                        </Badge>
                        {capabilities.canValidateNominations && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="text-status-success hover:bg-status-success/10">
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-status-danger hover:bg-status-danger/10">
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Table reporting pour SG Ministère et Ministre */}
          {(roleId === "ministre" || roleId === "sg-ministere") && (
            <MinistryReportingTable />
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Conseils des Ministres */}
          {showConseilsMinistres && (
            <Card className="shadow-gov">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-government-navy" />
                  Conseils des Ministres
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {conseilsMinistres.map((conseil) => (
                    <div
                      key={conseil.id}
                      className="p-3 rounded-lg border bg-muted/30"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {new Date(conseil.date).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </span>
                        <Badge variant="outline">{conseil.heure}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {conseil.pointsOrdreJour} points à l'ordre du jour
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {conseil.lieu}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Décisions récentes */}
          {showDecisions && (
            <Card className="shadow-gov">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-government-green" />
                  Décisions Récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {decisionsRecentes.map((decision) => (
                    <div
                      key={decision.id}
                      className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium line-clamp-2">
                          {decision.titre}
                        </p>
                        <Badge
                          variant="outline"
                          className="bg-status-success/10 text-status-success border-status-success/20 flex-shrink-0"
                        >
                          Signé
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(decision.date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4" size="sm">
                  Voir l'historique
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Actions rapides pour Ministre/SG */}
          {(roleId === "ministre" || roleId === "sg-ministere") && (
            <Card className="shadow-gov">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="h-5 w-5 text-government-navy" />
                  Actions Rapides
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {roleId === "sg-ministere" && (
                    <>
                      <Button variant="outline" className="w-full justify-start">
                        <FileCheck className="h-4 w-4 mr-2" />
                        Saisir un rapport GAR
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="h-4 w-4 mr-2" />
                        Soumettre une nomination
                      </Button>
                    </>
                  )}
                  {roleId === "ministre" && (
                    <>
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Proposer un texte
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="h-4 w-4 mr-2" />
                        Proposer une nomination
                      </Button>
                    </>
                  )}
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    Voir mes dossiers en cours
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
