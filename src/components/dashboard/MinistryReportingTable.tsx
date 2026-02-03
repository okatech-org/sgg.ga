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
import { AlertTriangle, CheckCircle2, Clock, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Ministry {
  id: number;
  name: string;
  lastReport: string;
  status: "submitted" | "pending" | "late";
  completeness: number;
  daysOverdue?: number;
}

const ministries: Ministry[] = [
  { id: 1, name: "Ministère de l'Économie et des Finances", lastReport: "01/02/2026", status: "submitted", completeness: 100 },
  { id: 2, name: "Ministère de la Santé", lastReport: "30/01/2026", status: "submitted", completeness: 95 },
  { id: 3, name: "Ministère de l'Éducation Nationale", lastReport: "28/01/2026", status: "pending", completeness: 75, daysOverdue: 3 },
  { id: 4, name: "Ministère des Travaux Publics", lastReport: "20/01/2026", status: "late", completeness: 40, daysOverdue: 11 },
  { id: 5, name: "Ministère de l'Agriculture", lastReport: "25/01/2026", status: "late", completeness: 60, daysOverdue: 6 },
  { id: 6, name: "Ministère de l'Intérieur", lastReport: "02/02/2026", status: "submitted", completeness: 100 },
  { id: 7, name: "Ministère des Affaires Étrangères", lastReport: "01/02/2026", status: "submitted", completeness: 90 },
];

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

export function MinistryReportingTable() {
  return (
    <Card className="shadow-gov">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle>Suivi Reporting Ministères</CardTitle>
        <Button variant="outline" size="sm">
          <Send className="h-4 w-4 mr-2" />
          Relancer tout
        </Button>
      </CardHeader>
      <CardContent>
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
                      <Button variant="ghost" size="sm" className="text-government-gold hover:text-government-gold-light">
                        Relancer
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
