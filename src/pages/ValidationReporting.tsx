/**
 * SGG Digital — Validation SGG (CTCO)
 * Validation technique des rapports soumis par les ministères
 * Branchée au Store Zustand — Mutations réelles
 */

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  Search,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { InfoButton } from "@/components/reporting/InfoButton";
import { StatutBadge } from "@/components/reporting/StatutBadge";
import { ProgressGauge } from "@/components/reporting/ProgressGauge";
import {
  PROGRAMMES,
  GOUVERNANCES,
  PILIERS,
} from "@/data/reportingData";
import { useReportingStore } from "@/stores/reportingStore";
import { useMatricePermissions } from "@/hooks/useMatricePermissions";

interface Anomalie {
  type: 'warning' | 'error';
  message: string;
}

function detectAnomalies(rapport: {
  pctExecutionFinanciere: number;
  pctAvancementPhysique: number;
  decaisseMdFcfa: number;
  engageMdFcfa: number;
  activitesRealisees: string;
  budgetMdFcfa: number;
}): Anomalie[] {
  const anomalies: Anomalie[] = [];
  if (rapport.decaisseMdFcfa > rapport.engageMdFcfa) {
    anomalies.push({
      type: 'error',
      message: `Décaissé (${rapport.decaisseMdFcfa} Md) > Engagé (${rapport.engageMdFcfa} Md)`,
    });
  }
  if (rapport.pctExecutionFinanciere > 95 && rapport.pctAvancementPhysique < 50) {
    anomalies.push({
      type: 'warning',
      message: `Exécution financière (${rapport.pctExecutionFinanciere}%) élevée vs avancement physique (${rapport.pctAvancementPhysique}%) faible`,
    });
  }
  if (rapport.activitesRealisees.length < 20) {
    anomalies.push({
      type: 'warning',
      message: 'Activités réalisées insuffisamment détaillées',
    });
  }
  if (rapport.budgetMdFcfa > 0 && rapport.engageMdFcfa === 0) {
    anomalies.push({
      type: 'warning',
      message: 'Budget renseigné mais aucun engagement',
    });
  }
  return anomalies;
}

export default function ValidationReporting() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rejectDialogId, setRejectDialogId] = useState<string | null>(null);
  const [rejectMotif, setRejectMotif] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Store Zustand
  const rapports = useReportingStore((state) => state.rapports);
  const validateSGG = useReportingStore((state) => state.validateSGG);
  const rejectSGG = useReportingStore((state) => state.rejectSGG);
  const batchValidateSGG = useReportingStore((state) => state.batchValidateSGG);

  // Permissions
  const permissions = useMatricePermissions();
  const canValidate = permissions.canValidate('operationnel');

  // Rapports soumis enrichis
  const rapportsSoumis = useMemo(() => {
    return rapports
      .filter((r) => r.statutValidation === 'soumis')
      .map((rapport) => {
        const prog = PROGRAMMES.find((p) => p.id === rapport.programmeId)!;
        const gouv = GOUVERNANCES.find((g) => g.programmeId === rapport.programmeId)!;
        const pilier = PILIERS.find((p) => p.id === prog?.pilierId)!;
        const anomalies = detectAnomalies(rapport);
        return { rapport, programme: prog, gouvernance: gouv, pilier, anomalies };
      })
      .filter((item) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          item.programme?.codeProgramme.toLowerCase().includes(q) ||
          item.programme?.libelleProgramme.toLowerCase().includes(q) ||
          item.gouvernance?.ministerePiloteNom.toLowerCase().includes(q)
        );
      });
  }, [rapports, searchQuery]);

  // Rapports validés SGG (dans cette session pour feedback)
  const rapportsValidesSGG = useMemo(() => {
    return rapports
      .filter((r) => r.statutValidation === 'valide_sgg')
      .map((rapport) => {
        const prog = PROGRAMMES.find((p) => p.id === rapport.programmeId);
        return { rapport, programme: prog };
      });
  }, [rapports]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === rapportsSoumis.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(rapportsSoumis.map((r) => r.rapport.id));
    }
  };

  const handleValider = (rapportId: string) => {
    validateSGG(
      rapportId,
      permissions.currentRole,
      `Validateur ${permissions.currentRole}`,
    );
    setSelectedIds((prev) => prev.filter((x) => x !== rapportId));
    toast.success("Rapport validé SGG");
  };

  const handleValiderSelection = () => {
    batchValidateSGG(
      selectedIds,
      permissions.currentRole,
      `Validateur ${permissions.currentRole}`,
    );
    toast.success(`${selectedIds.length} rapport(s) validé(s) SGG`);
    setSelectedIds([]);
  };

  const handleRejeter = () => {
    if (!rejectDialogId || !rejectMotif.trim()) return;
    rejectSGG(
      rejectDialogId,
      permissions.currentRole,
      `Validateur ${permissions.currentRole}`,
      rejectMotif.trim(),
    );
    toast.success("Rapport rejeté — notification envoyée au ministère");
    setRejectDialogId(null);
    setRejectMotif("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-government-gold" />
              Validation SGG (CTCO)
              <InfoButton pageId="validation-sgg" />
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Validation technique des rapports soumis par les ministères
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">
              {rapportsSoumis.length} en attente
            </Badge>
            <Badge variant="outline" className="text-status-success border-status-success">
              {rapportsValidesSGG.length} validés SGG
            </Badge>
            {!canValidate && (
              <Badge variant="outline" className="text-muted-foreground gap-1">
                <Lock className="h-3 w-3" /> Lecture seule
              </Badge>
            )}
            {selectedIds.length > 0 && canValidate && (
              <Button size="sm" onClick={handleValiderSelection}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Valider ({selectedIds.length})
              </Button>
            )}
          </div>
        </div>

        {/* Recherche */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un programme ou ministère..."
            className="pl-9"
          />
        </div>

        {/* Table */}
        {rapportsSoumis.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto text-status-success mb-4" />
              <h3 className="text-lg font-semibold">Aucun rapport en attente</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tous les rapports soumis ont été traités.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-gov">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      {canValidate && (
                        <Checkbox
                          checked={
                            selectedIds.length === rapportsSoumis.length &&
                            rapportsSoumis.length > 0
                          }
                          onCheckedChange={toggleAll}
                        />
                      )}
                    </TableHead>
                    <TableHead>Programme</TableHead>
                    <TableHead>Ministère</TableHead>
                    <TableHead>Soumis par</TableHead>
                    <TableHead className="text-right">% Exec. Fin.</TableHead>
                    <TableHead className="text-right">% Physique</TableHead>
                    <TableHead>Anomalies</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rapportsSoumis.map(
                    ({ rapport, programme, gouvernance, pilier, anomalies }) => (
                      <TableRow key={rapport.id} className="hover:bg-muted/30">
                        <TableCell>
                          {canValidate && (
                            <Checkbox
                              checked={selectedIds.includes(rapport.id)}
                              onCheckedChange={() => toggleSelect(rapport.id)}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="h-2 w-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: pilier?.couleur }}
                            />
                            <div>
                              <div className="font-medium text-sm">
                                {programme?.codeProgramme}
                              </div>
                              <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {programme?.libelleProgramme}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {gouvernance?.ministerePiloteNom}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {rapport.soumisParNom || '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <ProgressGauge
                            value={rapport.pctExecutionFinanciere}
                            size="sm"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <ProgressGauge
                            value={rapport.pctAvancementPhysique}
                            size="sm"
                          />
                        </TableCell>
                        <TableCell>
                          {anomalies.length > 0 ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant={
                                      anomalies.some((a) => a.type === 'error')
                                        ? 'destructive'
                                        : 'secondary'
                                    }
                                    className="cursor-help"
                                  >
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    {anomalies.length}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm">
                                  <ul className="list-disc list-inside text-xs space-y-1">
                                    {anomalies.map((a, i) => (
                                      <li
                                        key={i}
                                        className={cn(
                                          a.type === 'error'
                                            ? 'text-red-500'
                                            : 'text-amber-500',
                                        )}
                                      >
                                        {a.message}
                                      </li>
                                    ))}
                                  </ul>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-status-success border-status-success"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              OK
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {canValidate ? (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-status-success hover:text-status-success"
                                onClick={() => handleValider(rapport.id)}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Valider
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-status-danger hover:text-status-danger"
                                onClick={() => setRejectDialogId(rapport.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Rejeter
                              </Button>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              Lecture
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Dialog rejet */}
        <Dialog
          open={!!rejectDialogId}
          onOpenChange={(open) => {
            if (!open) {
              setRejectDialogId(null);
              setRejectMotif("");
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-status-danger" />
                Rejeter le rapport
              </DialogTitle>
              <DialogDescription>
                Le ministère recevra une notification avec le motif du rejet et
                devra corriger puis resoumettre.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={rejectMotif}
              onChange={(e) => setRejectMotif(e.target.value)}
              placeholder="Motif du rejet (obligatoire)..."
              rows={4}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogId(null);
                  setRejectMotif("");
                }}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                disabled={!rejectMotif.trim()}
                onClick={handleRejeter}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Confirmer le rejet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
