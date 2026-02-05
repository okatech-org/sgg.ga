import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle2, Clock, Send, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMinistryStats } from "@/hooks/useGAR";

const statusConfig = {
  submitted: {
    label: "Soumis",
    icon: CheckCircle2,
    className: "bg-status-success/10 text-status-success border-status-success/20",
  },
  pending: {
    label: "En attente",
    icon: Clock,
    className: "bg-status-warning/10 text-status-warning border-status-warning/20",
  },
  late: {
    label: "En retard",
    icon: AlertTriangle,
    className: "bg-status-danger/10 text-status-danger border-status-danger/20",
  },
};

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-6 w-[80px]" />
          <Skeleton className="h-2 w-[80px]" />
          <Skeleton className="h-8 w-[70px]" />
        </div>
      ))}
    </div>
  );
}

export function MinistryReportingTable() {
  const { ministries, loading, error, refetch } = useMinistryStats();

  const handleRelanceAll = () => {
    // TODO: Implémenter la relance de tous les ministères en retard
    console.log("Relancer tous les ministères en retard");
  };

  const handleRelance = (ministryId: string) => {
    // TODO: Implémenter la relance d'un ministère spécifique
    console.log("Relancer ministère:", ministryId);
  };

  return (
    <Card className="shadow-gov">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle>Suivi Reporting Ministères</CardTitle>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={refetch} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button variant="outline" size="sm" onClick={handleRelanceAll}>
            <Send className="h-4 w-4 mr-2" />
            Relancer tout
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <div className="text-center py-8 text-status-danger">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={refetch} className="mt-4">
              Réessayer
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ministère</TableHead>
                <TableHead>Dernier Rapport</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Complétude</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ministries.map((ministry) => {
                const status = statusConfig[ministry.status];
                const StatusIcon = status.icon;

                return (
                  <TableRow key={ministry.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium max-w-[250px] truncate">
                      {ministry.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {ministry.lastReport}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("gap-1", status.className)}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                        {ministry.daysOverdue && (
                          <span className="ml-1">J+{ministry.daysOverdue}</span>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              ministry.completeness >= 90 ? "bg-status-success" :
                              ministry.completeness >= 60 ? "bg-status-warning" :
                              "bg-status-danger"
                            )}
                            style={{ width: `${ministry.completeness}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{ministry.completeness}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {ministry.status !== "submitted" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-government-gold hover:text-government-gold-light"
                          onClick={() => handleRelance(ministry.id)}
                        >
                          Relancer
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
