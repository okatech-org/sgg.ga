import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Heart,
  GraduationCap,
  Building2,
  Wheat,
  Laptop,
  Users,
  TreePine,
  Shield,
  type LucideIcon,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGARPriorities, formatBudget, getProgressStatus } from "@/hooks/useGAR";
import { PRIORITE_COLORS, type PrioritePresidentielle } from "@/types";

// Mapping des icônes par priorité
const PRIORITE_ICONS: Record<PrioritePresidentielle, LucideIcon> = {
  sante: Heart,
  education: GraduationCap,
  infrastructure: Building2,
  agriculture: Wheat,
  numerique: Laptop,
  emploi: Users,
  environnement: TreePine,
  gouvernance: Shield,
};

function ProgressSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-[60px]" />
              <Skeleton className="h-4 w-[40px]" />
            </div>
          </div>
          <Skeleton className="h-2.5 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function GARProgressChart() {
  const { priorities, totalProgress, loading, error, refetch } = useGARPriorities();

  return (
    <Card className="shadow-gov">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-lg">Exécution PAG 2026</span>
            {!loading && !error && (
              <span className="ml-3 text-2xl font-bold text-primary">{totalProgress}%</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-status-success"></span>
                En bonne voie
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-status-warning"></span>
                Attention
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-status-danger"></span>
                En retard
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={refetch} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <ProgressSkeleton />
        ) : error ? (
          <div className="text-center py-8 text-status-danger">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={refetch} className="mt-4">
              Réessayer
            </Button>
          </div>
        ) : (
          priorities.map((priority) => {
            const status = getProgressStatus(priority.progress, priority.target);
            const Icon = PRIORITE_ICONS[priority.code] || Shield;
            const color = PRIORITE_COLORS[priority.code] || priority.color;

            return (
              <div key={priority.code} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="p-1.5 rounded-md flex-shrink-0"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon className="h-4 w-4" style={{ color }} />
                    </div>
                    <span className="font-medium truncate">{priority.name}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {priority.objectifsAtteints}/{priority.objectifsTotal} obj.
                    </span>
                    <span className="text-xs text-muted-foreground hidden md:inline">
                      {formatBudget(priority.budgetConsomme)} / {formatBudget(priority.budgetAlloue)}
                    </span>
                    <span className="font-bold min-w-[3rem] text-right">{priority.progress}%</span>
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full flex-shrink-0",
                        status === "success" && "bg-status-success",
                        status === "warning" && "bg-status-warning",
                        status === "danger" && "bg-status-danger"
                      )}
                    />
                  </div>
                </div>
                <div className="relative h-2.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${priority.progress}%`,
                      backgroundColor: color,
                    }}
                  />
                  {/* Target marker */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-foreground/40"
                    style={{ left: `${priority.target}%` }}
                    title={`Cible: ${priority.target}%`}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
