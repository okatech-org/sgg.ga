/**
 * SGG Digital — Validation SGG
 * Page de validation des rapports soumis par les ministères
 */

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Send,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { InfoButton } from "@/components/reporting/InfoButton";
import { StatutBadge } from "@/components/reporting/StatutBadge";
import { ProgressGauge } from "@/components/reporting/ProgressGauge";
import {
  PROGRAMMES,
  GOUVERNANCES,
  RAPPORTS_MENSUELS,
  PILIERS,
} from "@/data/reportingData";

export default function ValidationReporting() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rejectDialogId, setRejectDialogId] = useState<string | null>(null);
  const [rejectMotif, setRejectMotif] = useState("");
  const [validatedIds, setValidatedIds] = useState<string[]>([]);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);

  // Rapports soumis (en attente de validation SGG)
  const rapportsSoumis = useMemo(() => {
    return RAPPORTS_MENSUELS
      .filter((r) => r.statutValidation === 'soumis' && !validatedIds.includes(r.id) && !rejectedIds.includes(r.id))
      .map((rapport) => {
        const prog = PROGRAMMES.find((p) => p.id === rapport.programmeId)!;
        const gouv = GOUVERNANCES.find((g) => g.programmeId === rapport.programmeId)!;
        const pilier = PILIERS.find((p) => p.id === prog.pilierId)!;

        // Détection d'anomalies
        const anomalies: string[] = [];
        if (rapport.decaisseMdFcfa > rapport.engageMdFcfa) {
          anomalies.push('Décaissé > Engagé');
        }
        if (Math.abs(rapport.pctExecutionFinanciere - rapport.pctAvancementPhysique) > 30) {
          anomalies.push(`Écart Fin/Phys: ${Math.abs(rapport.pctExecutionFinanciere - rapport.pctAvancementPhysique)} pts`);
        }
        if (!rapport.activitesRealisees || rapport.activitesRealisees.length < 20) {
          anomalies.push('Activités insuffisantes');
        }

        return { rapport, programme: prog, gouvernance: gouv, pilier, anomalies };
      });
  }, [validatedIds, rejectedIds]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
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
    setValidatedIds((prev) => [...prev, rapportId]);
    setSelectedIds((prev) => prev.filter((x) => x !== rapportId));
    toast.success("Rapport validé SGG");
  };

  const handleValiderSelection = () => {
    setValidatedIds((prev) => [...prev, ...selectedIds]);
    toast.success(`${selectedIds.length} rapport(s) validé(s) SGG`);
    setSelectedIds([]);
  };

  const handleRejeter = () => {
    if (!rejectDialogId || !rejectMotif.trim()) return;
    setRejectedIds((prev) => [...prev, rejectDialogId]);
    toast.error("Rapport rejeté — retourné au ministère");
    setRejectDialogId(null);
    setRejectMotif("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-government-gold" />
              Validation SGG (CTCO)
              <InfoButton pageId="validation-sgg" />
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Rapports soumis en attente de validation technique
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{rapportsSoumis.length} en attente</Badge>
            {selectedIds.length > 0 && (
              <Button size="sm" onClick={handleValiderSelection}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Valider ({selectedIds.length})
              </Button>
            )}
          </div>
        </div>

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
                      <Checkbox
                        checked={selectedIds.length === rapportsSoumis.length && rapportsSoumis.length > 0}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead>Programme</TableHead>
                    <TableHead>Ministère</TableHead>
                    <TableHead>Soumis le</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead className="text-right">% Exec. Fin.</TableHead>
                    <TableHead className="text-right">% Physique</TableHead>
                    <TableHead>Anomalies</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rapportsSoumis.map(({ rapport, programme, gouvernance, pilier, anomalies }) => (
                    <TableRow key={rapport.id} className="hover:bg-muted/30">
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(rapport.id)}
                          onCheckedChange={() => toggleSelect(rapport.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: pilier.couleur }} />
                            <span className="font-medium text-sm">{programme.codeProgramme}</span>
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {programme.libelleProgramme}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {gouvernance.ministerePiloteNom}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {rapport.soumisParNom && (
                          <div>{rapport.soumisParNom}</div>
                        )}
                        <div className="text-muted-foreground">
                          {rapport.modifieLe ? new Date(rapport.modifieLe).toLocaleDateString('fr-FR') : '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {rapport.budgetMdFcfa} Md
                      </TableCell>
                      <TableCell className="text-right">
                        <ProgressGauge value={rapport.pctExecutionFinanciere} size="sm" />
                      </TableCell>
                      <TableCell className="text-right">
                        <ProgressGauge value={rapport.pctAvancementPhysique} size="sm" />
                      </TableCell>
                      <TableCell>
                        {anomalies.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {anomalies.map((a, i) => (
                              <Badge key={i} variant="destructive" className="text-[9px] w-fit">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {a}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-status-success border-status-success text-[9px]">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            OK
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-status-success hover:text-status-success"
                            onClick={() => handleValider(rapport.id)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-status-danger hover:text-status-danger"
                            onClick={() => setRejectDialogId(rapport.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Dialog rejet */}
        <Dialog open={!!rejectDialogId} onOpenChange={() => setRejectDialogId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejeter le rapport</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Veuillez indiquer le motif du rejet. Le rapport sera renvoyé au ministère pour correction.
              </p>
              <Textarea
                placeholder="Motif du rejet (obligatoire)..."
                value={rejectMotif}
                onChange={(e) => setRejectMotif(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogId(null)}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejeter}
                disabled={!rejectMotif.trim()}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
