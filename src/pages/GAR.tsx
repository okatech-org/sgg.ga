/**
 * SGG Digital - Page GAR (Gestion Axée sur les Résultats)
 * Page complète de suivi du Plan d'Action Gouvernemental 2026
 */

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { GARProgressChart } from "@/components/dashboard/GARProgressChart";
import { MinistryReportingTable } from "@/components/dashboard/MinistryReportingTable";
import { GARMatrice21Colonnes } from "@/components/gar/GARMatrice21Colonnes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  FileCheck,
  Target,
  BarChart3,
  Calendar,
  Download,
  Filter,
  PieChart,
  Table2,
  LayoutDashboard,
} from "lucide-react";
import { PRIORITE_LABELS, PRIORITE_COLORS, type PrioritePresidentielle } from "@/types";
import { useGARDashboard } from "@/hooks/useGAR";

export default function GAR() {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMinistere, setSelectedMinistere] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("overview");
  const { data, loading } = useGARDashboard();

  const handleExport = () => {
    // TODO: Implémenter l'export Excel/PDF
    console.log("Exporting GAR data...");
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Gestion Axée sur les Résultats (GAR)
            </h1>
            <p className="text-muted-foreground mt-1">
              Suivi et évaluation du Plan d'Action Gouvernemental {selectedYear}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
              <SelectTrigger className="w-[120px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedMinistere} onValueChange={setSelectedMinistere}>
              <SelectTrigger className="w-[220px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tous les ministères" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les ministères</SelectItem>
                <SelectItem value="sante">Ministère de la Santé</SelectItem>
                <SelectItem value="education">Ministère de l'Éducation</SelectItem>
                <SelectItem value="travaux">Ministère des Travaux Publics</SelectItem>
                <SelectItem value="economie">Ministère de l'Économie</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Taux d'Exécution Global"
          value={loading ? "..." : `${data?.totalProgress || 0}%`}
          subtitle={`PAG ${selectedYear}`}
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
          status="success"
        />
        <StatCard
          title="Objectifs Atteints"
          value="119/173"
          subtitle="Sur l'ensemble des priorités"
          icon={Target}
          status="success"
        />
        <StatCard
          title="Rapports Reçus"
          value="28/35"
          subtitle="Ministères ce trimestre"
          icon={FileCheck}
          status="warning"
        />
        <StatCard
          title="Budget Exécuté"
          value="1.094T"
          subtitle="FCFA sur 1.7T alloués"
          icon={BarChart3}
          status="success"
        />
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Vue d'ensemble</span>
          </TabsTrigger>
          <TabsTrigger value="matrice" className="gap-2">
            <Table2 className="h-4 w-4" />
            <span className="hidden sm:inline">Matrice 21 Colonnes</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Analyses</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <GARProgressChart />
            <MinistryReportingTable />
          </div>

          {/* Priority Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {(data?.priorities || []).slice(0, 4).map((priority) => (
              <Card key={priority.code} className="shadow-gov">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: PRIORITE_COLORS[priority.code] }}
                    />
                    {priority.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{priority.progress}%</div>
                  <p className="text-xs text-muted-foreground">
                    {priority.objectifsAtteints}/{priority.objectifsTotal} objectifs atteints
                  </p>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${priority.progress}%`,
                        backgroundColor: PRIORITE_COLORS[priority.code],
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Matrice 21 Colonnes Tab */}
        <TabsContent value="matrice">
          <GARMatrice21Colonnes
            annee={selectedYear}
            ministereId={selectedMinistere !== "all" ? selectedMinistere : undefined}
            onExport={handleExport}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Budget par priorité */}
            <Card className="shadow-gov">
              <CardHeader>
                <CardTitle className="text-lg">Répartition Budgétaire par Priorité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(data?.priorities || []).map((priority) => {
                    const budgetPct = Math.round(
                      (priority.budgetConsomme / priority.budgetAlloue) * 100
                    );
                    return (
                      <div key={priority.code} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: PRIORITE_COLORS[priority.code] }}
                            />
                            {priority.name}
                          </span>
                          <span className="font-medium">{budgetPct}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${budgetPct}%`,
                              backgroundColor: PRIORITE_COLORS[priority.code],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Performance par trimestre */}
            <Card className="shadow-gov">
              <CardHeader>
                <CardTitle className="text-lg">Performance Trimestrielle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {["T1", "T2", "T3", "T4"].map((trimestre, index) => {
                    const values = [65, 72, 68, null]; // Mock data
                    const value = values[index];
                    return (
                      <div
                        key={trimestre}
                        className="text-center p-4 rounded-lg bg-muted/50"
                      >
                        <div className="text-sm text-muted-foreground">{trimestre}</div>
                        <div className="text-2xl font-bold mt-1">
                          {value !== null ? `${value}%` : "-"}
                        </div>
                        {value !== null && (
                          <div
                            className={`text-xs mt-1 ${value >= 70
                                ? "text-status-success"
                                : value >= 50
                                  ? "text-status-warning"
                                  : "text-status-danger"
                              }`}
                          >
                            {value >= 70 ? "En bonne voie" : value >= 50 ? "Attention" : "En retard"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Moyenne annuelle</span>
                    <span className="text-xl font-bold text-primary">68%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertes et recommandations */}
          <Card className="shadow-gov">
            <CardHeader>
              <CardTitle className="text-lg">Alertes et Recommandations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-status-danger/10 border border-status-danger/20">
                  <div className="h-2 w-2 rounded-full bg-status-danger mt-2" />
                  <div>
                    <p className="font-medium text-status-danger">
                      Agriculture : Retard critique
                    </p>
                    <p className="text-sm text-muted-foreground">
                      45% d'exécution contre 60% attendus. Action urgente requise sur le programme
                      de mécanisation agricole.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-status-warning/10 border border-status-warning/20">
                  <div className="h-2 w-2 rounded-full bg-status-warning mt-2" />
                  <div>
                    <p className="font-medium text-status-warning">
                      Emploi : Attention requise
                    </p>
                    <p className="text-sm text-muted-foreground">
                      55% d'exécution. Le programme de formation professionnelle nécessite une
                      accélération au T4.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-status-success/10 border border-status-success/20">
                  <div className="h-2 w-2 rounded-full bg-status-success mt-2" />
                  <div>
                    <p className="font-medium text-status-success">
                      Gouvernance : Objectif dépassé
                    </p>
                    <p className="text-sm text-muted-foreground">
                      85% d'exécution pour une cible de 80%. Excellente performance sur la
                      digitalisation des services publics.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
