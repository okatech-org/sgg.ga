/**
 * SGG Digital — Validation SGPR
 * Validation stratégique et publication des rapports déjà validés SGG
 * Branchée au Store Zustand — Ajout du bouton Rejeter
 */

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Crown,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
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

export default function ValidationSGPR() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rejectDialogId, setRejectDialogId] = useState<string | null>(null);
  const [rejectMotif, setRejectMotif] = useState("");

  // Store Zustand
  const rapports = useReportingStore((state) => state.rapports);
  const validateSGPR = useReportingStore((state) => state.validateSGPR);
  const rejectSGPR = useReportingStore((state) => state.rejectSGPR);
  const batchValidateSGPR = useReportingStore((state) => state.batchValidateSGPR);

  // Permissions
  const permissions = useMatricePermissions();
  const canValidate = permissions.canValidate('operationnel');

  // Rapports validés SGG (en attente de validation SGPR)
  const rapportsValidesSGG = useMemo(() => {
    return rapports
      .filter((r) => r.statutValidation === 'valide_sgg')
      .map((rapport) => {
        const prog = PROGRAMMES.find((p) => p.id === rapport.programmeId)!;
        const gouv = GOUVERNANCES.find((g) => g.programmeId === rapport.programmeId)!;
        const pilier = PILIERS.find((p) => p.id === prog?.pilierId)!;
        return { rapport, programme: prog, gouvernance: gouv, pilier };
      });
  }, [rapports]);

  // Rapports publiés (validés SGPR)
  const rapportsPublies = useMemo(() => {
    return rapports
      .filter((r) => r.statutValidation === 'valide_sgpr')
      .map((rapport) => {
        const prog = PROGRAMMES.find((p) => p.id === rapport.programmeId);
        const pilier = prog ? PILIERS.find((p) => p.id === prog.pilierId) : null;
        return { rapport, programme: prog, pilier };
      });
  }, [rapports]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === rapportsValidesSGG.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(rapportsValidesSGG.map((r) => r.rapport.id));
    }
  };

  const handlePublier = (rapportId: string) => {
    validateSGPR(
      rapportId,
      permissions.currentRole,
      `Validateur SGPR`,
    );
    setSelectedIds((prev) => prev.filter((x) => x !== rapportId));
    toast.success("Rapport validé et publié");
  };

  const handlePublierSelection = () => {
    batchValidateSGPR(
      selectedIds,
      permissions.currentRole,
      `Validateur SGPR`,
    );
    toast.success(`${selectedIds.length} rapport(s) validé(s) et publié(s)`);
    setSelectedIds([]);
  };

  const handleRejeter = () => {
    if (!rejectDialogId || !rejectMotif.trim()) return;
    rejectSGPR(
      rejectDialogId,
      permissions.currentRole,
      `Validateur SGPR`,
      rejectMotif.trim(),
    );
    toast.success("Rapport rejeté — renvoyé au circuit de validation SGG");
    setRejectDialogId(null);
    setRejectMotif("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Crown className="h-6 w-6 text-government-gold" />
              Validation SGPR
              <InfoButton pageId="validation-sgpr" />
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Validation stratégique et publication des rapports
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{rapportsValidesSGG.length} en attente</Badge>
            <Badge variant="outline" className="text-status-success border-status-success">
              {rapportsPublies.length} publiés
            </Badge>
            {!canValidate && (
              <Badge variant="outline" className="text-muted-foreground gap-1">
                <Lock className="h-3 w-3" /> Lecture seule
              </Badge>
            )}
            {selectedIds.length > 0 && canValidate && (
              <Button size="sm" onClick={handlePublierSelection}>
                <ShieldCheck className="h-4 w-4 mr-2" />
                Valider & Publier ({selectedIds.length})
              </Button>
            )}
          </div>
        </div>

        {/* Rapports en attente */}
        {rapportsValidesSGG.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShieldCheck className="h-12 w-12 mx-auto text-status-success mb-4" />
              <h3 className="text-lg font-semibold">Aucun rapport en attente</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tous les rapports validés SGG ont été traités par le SGPR.
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
                            selectedIds.length === rapportsValidesSGG.length &&
                            rapportsValidesSGG.length > 0
                          }
                          onCheckedChange={toggleAll}
                        />
                      )}
                    </TableHead>
                    <TableHead>Programme</TableHead>
                    <TableHead>Ministère</TableHead>
                    <TableHead>Validé SGG le</TableHead>
                    <TableHead>Validé SGG par</TableHead>
                    <TableHead className="text-right">% Exec. Fin.</TableHead>
                    <TableHead className="text-right">% Physique</TableHead>
                    <TableHead>Statut Programme</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rapportsValidesSGG.map(
                    ({ rapport, programme, gouvernance, pilier }) => (
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
                              className="h-2 w-2 rounded-full"
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
                        <TableCell className="text-xs font-mono">
                          {rapport.dateValidationSGG
                            ? new Date(rapport.dateValidationSGG).toLocaleDateString(
                              'fr-FR',
                            )
                            : '—'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {rapport.valideSGGParNom || '—'}
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
                          <StatutBadge
                            type="programme"
                            statut={rapport.statutProgramme}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          {canValidate ? (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-status-success hover:text-status-success"
                                onClick={() => handlePublier(rapport.id)}
                              >
                                <ShieldCheck className="h-4 w-4 mr-1" />
                                Publier
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

        {/* Résumé rapports publiés */}
        {rapportsPublies.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-status-success" />
                Rapports publiés ({rapportsPublies.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {rapportsPublies.map(({ programme, pilier }) => (
                  <Badge
                    key={programme?.id}
                    variant="outline"
                    className="text-status-success border-status-success"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full mr-1"
                      style={{ backgroundColor: pilier?.couleur }}
                    />
                    {programme?.codeProgramme}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dialog rejet SGPR */}
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
                Rejeter le rapport (SGPR)
              </DialogTitle>
              <DialogDescription>
                Le rapport sera renvoyé dans le circuit de validation. Le SGG et
                le ministère seront notifiés du rejet.
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
