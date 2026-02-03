import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { GARProgressChart } from "@/components/dashboard/GARProgressChart";
import { MinistryReportingTable } from "@/components/dashboard/MinistryReportingTable";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import {
  BarChart3,
  Users,
  FileCheck,
  AlertTriangle,
  TrendingUp,
  Calendar,
} from "lucide-react";

export default function Dashboard() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Tableau de Bord GAR
            </h1>
            <p className="text-muted-foreground mt-1">
              Suivi de l'exécution du Plan d'Action Gouvernemental 2026
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Dernière mise à jour : 03 février 2026, 14:30</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Taux d'Exécution Global"
          value="67%"
          subtitle="PAG 2026"
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
          status="success"
        />
        <StatCard
          title="Rapports Reçus"
          value="28/35"
          subtitle="Ministères ce mois"
          icon={FileCheck}
          status="success"
        />
        <StatCard
          title="Nominations en Cours"
          value="12"
          subtitle="En attente de validation"
          icon={Users}
          status="warning"
        />
        <StatCard
          title="Alertes Actives"
          value="5"
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
          <MinistryReportingTable />
        </div>

        {/* Right Column - Activity and Events */}
        <div className="space-y-6">
          <RecentActivity />
          <UpcomingEvents />
        </div>
      </div>
    </DashboardLayout>
  );
}
