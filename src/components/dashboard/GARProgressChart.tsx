import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Priority {
  id: number;
  name: string;
  progress: number;
  target: number;
  status: "success" | "warning" | "danger";
}

const priorities: Priority[] = [
  { id: 1, name: "Gouvernance et État de droit", progress: 78, target: 80, status: "success" },
  { id: 2, name: "Économie et Finances", progress: 65, target: 75, status: "warning" },
  { id: 3, name: "Capital Humain", progress: 82, target: 70, status: "success" },
  { id: 4, name: "Agriculture et Sécurité alimentaire", progress: 45, target: 60, status: "danger" },
  { id: 5, name: "Infrastructures et Numérique", progress: 71, target: 65, status: "success" },
  { id: 6, name: "Environnement et Développement durable", progress: 58, target: 55, status: "success" },
  { id: 7, name: "Protection sociale", progress: 42, target: 50, status: "danger" },
];

const statusColors = {
  success: "bg-status-success",
  warning: "bg-status-warning",
  danger: "bg-status-danger",
};

const statusLabels = {
  success: "En bonne voie",
  warning: "Attention requise",
  danger: "En retard",
};

export function GARProgressChart() {
  return (
    <Card className="shadow-gov">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>Exécution PAG 2026 par Priorité</span>
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
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {priorities.map((priority) => (
          <div key={priority.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium truncate max-w-[60%]">
                P{priority.id}. {priority.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{priority.progress}%</span>
                <span className="text-xs text-muted-foreground">/ {priority.target}%</span>
                <span className={cn(
                  "h-2 w-2 rounded-full",
                  statusColors[priority.status]
                )}></span>
              </div>
            </div>
            <div className="relative h-2 w-full rounded-full bg-muted">
              <div
                className={cn(
                  "absolute left-0 top-0 h-full rounded-full transition-all duration-500",
                  statusColors[priority.status]
                )}
                style={{ width: `${priority.progress}%` }}
              />
              {/* Target marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-foreground/30"
                style={{ left: `${priority.target}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
