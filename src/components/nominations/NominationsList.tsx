import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, AlertTriangle, Clock, CheckCircle2, XCircle, Send, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Nomination, NominationStatus } from "@/pages/Nominations";

interface NominationsListProps {
  nominations: Nomination[];
  selectedId?: string;
  onSelect: (nomination: Nomination) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

const statusConfig: Record<NominationStatus, { label: string; color: string; icon: React.ElementType }> = {
  soumis: { label: "Soumis", color: "bg-muted text-muted-foreground", icon: FileText },
  recevabilite: { label: "Recevabilité", color: "bg-status-warning/20 text-status-warning", icon: Clock },
  examen: { label: "Examen SGG", color: "bg-status-info/20 text-status-info", icon: Search },
  transmis_sgpr: { label: "Transmis SGPR", color: "bg-government-navy/20 text-government-navy", icon: Send },
  valide: { label: "Validé CM", color: "bg-status-success/20 text-status-success", icon: CheckCircle2 },
  rejete: { label: "Rejeté", color: "bg-status-danger/20 text-status-danger", icon: XCircle },
  publie: { label: "Publié JO", color: "bg-government-gold/20 text-government-gold", icon: CheckCircle2 },
};

export function NominationsList({ 
  nominations, 
  selectedId, 
  onSelect, 
  statusFilter, 
  onStatusFilterChange 
}: NominationsListProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg">Dossiers de Nomination</CardTitle>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher..." className="pl-9 h-9" />
            </div>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="soumis">Soumis</SelectItem>
                <SelectItem value="recevabilite">Recevabilité</SelectItem>
                <SelectItem value="examen">Examen</SelectItem>
                <SelectItem value="transmis_sgpr">Transmis SGPR</SelectItem>
                <SelectItem value="valide">Validé</SelectItem>
                <SelectItem value="rejete">Rejeté</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {nominations.map((nomination) => {
            const status = statusConfig[nomination.statut];
            const StatusIcon = status.icon;
            const isSelected = selectedId === nomination.id;
            const isUrgent = nomination.joursRestants <= 7 && 
              !["valide", "rejete", "publie"].includes(nomination.statut);

            return (
              <div
                key={nomination.id}
                className={cn(
                  "p-4 cursor-pointer transition-colors hover:bg-muted/50",
                  isSelected && "bg-muted"
                )}
                onClick={() => onSelect(nomination)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">
                        {nomination.candidat.nom} {nomination.candidat.prenom}
                      </span>
                      {isUrgent && (
                        <AlertTriangle className="h-4 w-4 text-status-danger flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-2">
                      {nomination.poste.titre} — {nomination.poste.ministere}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={cn("text-[10px] gap-1", status.color)}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {nomination.id}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-medium">
                      J-{nomination.joursRestants}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(nomination.prochainConseil).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {nominations.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              Aucune nomination trouvée
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
