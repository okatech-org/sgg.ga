import { Plus, Users, Clock, CheckCircle2, XCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface NominationsHeaderProps {
  stats: {
    total: number;
    enCours: number;
    transmis: number;
    valides: number;
    rejetes: number;
  };
  canSubmit: boolean;
  onNewNomination: () => void;
}

export function NominationsHeader({ stats, canSubmit, onNewNomination }: NominationsHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Portail des Nominations
          </h1>
          <p className="text-muted-foreground">
            Contrôle des nominations aux hautes fonctions de l'État (Visa SGG)
          </p>
        </div>
        {canSubmit && (
          <Button variant="government" onClick={onNewNomination}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Nomination
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-government-navy/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-government-navy" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-status-warning/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-status-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.enCours}</p>
                <p className="text-xs text-muted-foreground">En cours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-status-info/10 flex items-center justify-center">
                <Send className="h-5 w-5 text-status-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.transmis}</p>
                <p className="text-xs text-muted-foreground">Transmis SGPR</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-status-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-status-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.valides}</p>
                <p className="text-xs text-muted-foreground">Validés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-status-danger/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-status-danger" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rejetes}</p>
                <p className="text-xs text-muted-foreground">Rejetés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Legend */}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3">WORKFLOW DE NOMINATION</p>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-muted">1. Soumission</span>
            <span className="text-muted-foreground">→</span>
            <span className="px-2 py-1 rounded bg-status-warning/20 text-status-warning">2. Recevabilité</span>
            <span className="text-muted-foreground">→</span>
            <span className="px-2 py-1 rounded bg-status-info/20 text-status-info">3. Examen SGG</span>
            <span className="text-muted-foreground">→</span>
            <span className="px-2 py-1 rounded bg-government-navy/20 text-government-navy">4. Transmission SGPR</span>
            <span className="text-muted-foreground">→</span>
            <span className="px-2 py-1 rounded bg-status-success/20 text-status-success">5. Conseil des Ministres</span>
            <span className="text-muted-foreground">→</span>
            <span className="px-2 py-1 rounded bg-government-gold/20 text-government-gold">6. Publication JO</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
