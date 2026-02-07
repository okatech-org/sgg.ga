/**
 * SGG Digital — Validation SGPR
 * Validation stratégique des rapports déjà validés par le SGG
 */

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Crown,
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

export default function ValidationSGPR() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [publishedIds, setPublishedIds] = useState<string[]>([]);

  // Rapports validés SGG (en attente de validation SGPR)
  const rapportsValidesSGG = useMemo(() => {
    return RAPPORTS_MENSUELS
      .filter((r) => r.statutValidation === 'valide_sgg' && !publishedIds.includes(r.id))
      .map((rapport) => {
        const prog = PROGRAMMES.find((p) => p.id === rapport.programmeId)!;
        const gouv = GOUVERNANCES.find((g) => g.programmeId === rapport.programmeId)!;
        const pilier = PILIERS.find((p) => p.id === prog.pilierId)!;
        return { rapport, programme: prog, gouvernance: gouv, pilier };
      });
  }, [publishedIds]);

  // Déjà publiés dans cette session (pour affichage)
  const rapportsPublies = useMemo(() => {
    return RAPPORTS_MENSUELS
      .filter((r) => r.statutValidation === 'valide_sgpr' || publishedIds.includes(r.id))
      .map((rapport) => {
        const prog = PROGRAMMES.find((p) => p.id === rapport.programmeId)!;
        const pilier = PILIERS.find((p) => p.id === prog.pilierId)!;
        return { rapport, programme: prog, pilier };
      });
  }, [publishedIds]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
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
    setPublishedIds((prev) => [...prev, rapportId]);
    setSelectedIds((prev) => prev.filter((x) => x !== rapportId));
    toast.success("Rapport validé et publié");
  };

  const handlePublierSelection = () => {
    setPublishedIds((prev) => [...prev, ...selectedIds]);
    toast.success(`${selectedIds.length} rapport(s) validé(s) et publié(s)`);
    setSelectedIds([]);
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
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{rapportsValidesSGG.length} en attente</Badge>
            <Badge variant="outline" className="text-status-success border-status-success">
              {rapportsPublies.length} publiés
            </Badge>
            {selectedIds.length > 0 && (
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
                      <Checkbox
                        checked={selectedIds.length === rapportsValidesSGG.length && rapportsValidesSGG.length > 0}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead>Programme</TableHead>
                    <TableHead>Ministère</TableHead>
                    <TableHead>Validé SGG le</TableHead>
                    <TableHead className="text-right">% Exec. Fin.</TableHead>
                    <TableHead className="text-right">% Physique</TableHead>
                    <TableHead>Statut Programme</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rapportsValidesSGG.map(({ rapport, programme, gouvernance, pilier }) => (
                    <TableRow key={rapport.id} className="hover:bg-muted/30">
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(rapport.id)}
                          onCheckedChange={() => toggleSelect(rapport.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: pilier.couleur }} />
                          <div>
                            <div className="font-medium text-sm">{programme.codeProgramme}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {programme.libelleProgramme}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{gouvernance.ministerePiloteNom}</TableCell>
                      <TableCell className="text-xs font-mono">
                        {rapport.dateValidationSGG
                          ? new Date(rapport.dateValidationSGG).toLocaleDateString('fr-FR')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <ProgressGauge value={rapport.pctExecutionFinanciere} size="sm" />
                      </TableCell>
                      <TableCell className="text-right">
                        <ProgressGauge value={rapport.pctAvancementPhysique} size="sm" />
                      </TableCell>
                      <TableCell>
                        <StatutBadge type="programme" statut={rapport.statutProgramme} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-status-success hover:text-status-success"
                          onClick={() => handlePublier(rapport.id)}
                        >
                          <ShieldCheck className="h-4 w-4 mr-1" />
                          Publier
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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
                  <Badge key={programme.id} variant="outline" className="text-status-success border-status-success">
                    <span className="h-1.5 w-1.5 rounded-full mr-1" style={{ backgroundColor: pilier.couleur }} />
                    {programme.codeProgramme}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
