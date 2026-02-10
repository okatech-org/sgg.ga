/**
 * SGG Digital - Section Dashboard Juridictionnel
 * Pour: Conseil d'État, Cour Constitutionnelle
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  FileText,
  Clock,
  ArrowRight,
  Scale,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Gavel,
  FileSearch,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { juridictionnelData, statutLabels, statutColors } from "@/data/demoData";

interface JudicialDashboardSectionProps {
  roleId?: string;
}

export function JudicialDashboardSection({ roleId }: JudicialDashboardSectionProps) {
  const isConseilEtat = roleId === "conseil-etat";
  const data = isConseilEtat
    ? juridictionnelData.conseilEtat
    : juridictionnelData.courConstitutionnelle;

  return (
    <div className="space-y-6">
      {isConseilEtat ? (
        <ConseilEtatView data={juridictionnelData.conseilEtat} />
      ) : (
        <CourConstitutionnelleView data={juridictionnelData.courConstitutionnelle} />
      )}
    </div>
  );
}

// Vue Conseil d'État
function ConseilEtatView({ data }: { data: typeof juridictionnelData.conseilEtat }) {
  const { stats, avis } = data;

  return (
    <>
      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Avis à Rendre (Urgent)"
          value={String(stats.avisARendreUrgent)}
          subtitle="Priorité haute"
          icon={AlertTriangle}
          status="danger"
        />
        <StatCard
          title="Avis en Cours"
          value={String(stats.avisEnCours)}
          subtitle="En examen"
          icon={Clock}
          status="warning"
        />
        <StatCard
          title="Avis Rendus ce Mois"
          value={String(stats.avisRendusMois)}
          subtitle="Dossiers clôturés"
          icon={CheckCircle2}
          status="success"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Avis à rendre */}
          <Card className="shadow-gov">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-government-navy" />
                Textes en Consultation
              </CardTitle>
              <Badge variant="outline" className="bg-status-danger/10 text-status-danger border-status-danger/20">
                {avis.filter(a => a.statut === "a_examiner").length} à examiner
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {avis.map((item) => {
                  const isUrgent = new Date(item.deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "p-4 rounded-lg border transition-colors",
                        isUrgent && item.statut !== "rendu" && "border-status-danger/50 bg-status-danger/5"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs capitalize">
                              {item.type.replace("_", " ")}
                            </Badge>
                            <h4 className="font-medium">{item.titre}</h4>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Demandeur: {item.demandeur}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>Reçu le {new Date(item.dateReception).toLocaleDateString("fr-FR")}</span>
                            <span className={cn(isUrgent && item.statut !== "rendu" && "text-status-danger font-medium")}>
                              Deadline: {new Date(item.deadline).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn(statutColors[item.statut])}>
                            {statutLabels[item.statut]}
                          </Badge>
                          {item.statut !== "rendu" && (
                            <Button size="sm" variant="outline">
                              Examiner
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Types d'avis */}
          <Card className="shadow-gov">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileSearch className="h-5 w-5 text-government-navy" />
                Types de Consultation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <span className="text-sm">Projets de loi</span>
                  <Badge variant="secondary">Obligatoire</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <span className="text-sm">Décrets réglementaires</span>
                  <Badge variant="secondary">Obligatoire</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <span className="text-sm">Ordonnances</span>
                  <Badge variant="outline">Facultatif</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="shadow-gov">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Rédiger un avis
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <History className="h-4 w-4 mr-2" />
                  Historique des avis
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Journal Officiel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

// Vue Cour Constitutionnelle
function CourConstitutionnelleView({ data }: { data: typeof juridictionnelData.courConstitutionnelle }) {
  const { stats, controles, decisionsRecentes } = data;

  return (
    <>
      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Contrôles en Cours"
          value={String(stats.controlesEnCours)}
          subtitle="Constitutionnalité"
          icon={Scale}
          status="warning"
        />
        <StatCard
          title="Décisions Rendues"
          value={String(stats.decisionsRendues)}
          subtitle="Cette année"
          icon={Gavel}
          status="success"
        />
        <StatCard
          title="Saisines Annuelles"
          value={String(stats.saisinesAnnee)}
          subtitle="Total 2026"
          icon={FileText}
          status="info"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contrôles en cours */}
          <Card className="shadow-gov">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-government-navy" />
                Contrôles de Constitutionnalité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {controles.map((controle) => (
                  <div
                    key={controle.id}
                    className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs capitalize">
                            {controle.type}
                          </Badge>
                          <h4 className="font-medium">{controle.titre}</h4>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Saisissant: {controle.saisissant}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Saisine du {new Date(controle.dateSaisine).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-status-warning/10 text-status-warning border-status-warning/20">
                          En cours
                        </Badge>
                        <Button size="sm" variant="outline">
                          Examiner
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Décisions récentes */}
          <Card className="shadow-gov">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2">
                <Gavel className="h-5 w-5 text-government-green" />
                Décisions Récentes
              </CardTitle>
              <Button variant="outline" size="sm">
                Voir tout
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {decisionsRecentes.map((decision) => (
                  <div
                    key={decision.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{decision.titre}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(decision.date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        decision.sens === "conforme"
                          ? "bg-status-success/10 text-status-success border-status-success/20"
                          : "bg-status-warning/10 text-status-warning border-status-warning/20"
                      )}
                    >
                      {decision.sens === "conforme" ? "Conforme" : "Conforme avec réserves"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Types de saisine */}
          <Card className="shadow-gov">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileSearch className="h-5 w-5 text-government-navy" />
                Modes de Saisine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-2 rounded bg-muted/30">
                  <p className="text-sm font-medium">Président de la République</p>
                  <p className="text-xs text-muted-foreground">Contrôle de conformité</p>
                </div>
                <div className="p-2 rounded bg-muted/30">
                  <p className="text-sm font-medium">Vice-Président du Gouvernement</p>
                  <p className="text-xs text-muted-foreground">Contrôle de conformité</p>
                </div>
                <div className="p-2 rounded bg-muted/30">
                  <p className="text-sm font-medium">Présidents des Chambres</p>
                  <p className="text-xs text-muted-foreground">Règlements intérieurs</p>
                </div>
                <div className="p-2 rounded bg-muted/30">
                  <p className="text-sm font-medium">Parlementaires (1/10)</p>
                  <p className="text-xs text-muted-foreground">Lois votées</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="shadow-gov">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Gavel className="h-4 w-4 mr-2" />
                  Rédiger une décision
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <History className="h-4 w-4 mr-2" />
                  Jurisprudence
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Journal Officiel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
