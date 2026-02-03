import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FileText, Users, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: number;
  type: "nomination" | "report" | "decision" | "alert" | "document";
  title: string;
  description: string;
  time: string;
  user?: string;
}

const activities: Activity[] = [
  {
    id: 1,
    type: "nomination",
    title: "Nouvelle nomination soumise",
    description: "Directeur Technique - Ministère de la Santé",
    time: "Il y a 15 min",
    user: "Min. Santé",
  },
  {
    id: 2,
    type: "report",
    title: "Rapport GAR validé",
    description: "Ministère de l'Économie - Janvier 2026",
    time: "Il y a 1h",
    user: "SGG",
  },
  {
    id: 3,
    type: "alert",
    title: "Alerte retard J+10",
    description: "Ministère des Travaux Publics - Rapport en attente",
    time: "Il y a 2h",
  },
  {
    id: 4,
    type: "decision",
    title: "Décision Conseil des Ministres",
    description: "Projet de loi adopté - Réforme fiscale",
    time: "Il y a 3h",
  },
  {
    id: 5,
    type: "document",
    title: "Publication JO",
    description: "Décret n°2026-045 publié",
    time: "Il y a 5h",
  },
];

const typeConfig = {
  nomination: {
    icon: Users,
    color: "bg-government-gold text-government-navy",
  },
  report: {
    icon: FileText,
    color: "bg-status-success text-white",
  },
  decision: {
    icon: CheckCircle,
    color: "bg-government-green text-white",
  },
  alert: {
    icon: AlertCircle,
    color: "bg-status-danger text-white",
  },
  document: {
    icon: Clock,
    color: "bg-status-info text-white",
  },
};

export function RecentActivity() {
  return (
    <Card className="shadow-gov">
      <CardHeader className="pb-4">
        <CardTitle>Activité Récente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const config = typeConfig[activity.type];
            const Icon = config.icon;

            return (
              <div
                key={activity.id}
                className={cn(
                  "flex items-start gap-4 animate-fade-in",
                  index !== activities.length - 1 && "pb-4 border-b border-border"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={cn("p-2 rounded-lg", config.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                    {activity.user && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs font-medium text-government-navy">{activity.user}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
