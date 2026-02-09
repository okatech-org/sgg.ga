/**
 * SGG Digital — Validation PTM
 * Page de validation SGG et inscription PTG des initiatives
 * Programme de Travail du Ministère — SGG validation interface
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { usePTMPermissions } from "@/hooks/usePTMPermissions";
import { InfoButton } from "@/components/reporting/InfoButton";
import { INITIATIVES_PTM } from "@/data/ptmData";
import {
  RUBRIQUE_SHORT_LABELS,
  STATUT_PTM_LABELS,
  CADRAGE_SHORT_LABELS,
} from "@/types/ptm";
import type { InitiativePTM } from "@/types/ptm";

export default function PTMValidation() {
  const permissions = usePTMPermissions();
  const [selectedSoumisIds, setSelectedSoumisIds] = useState<string[]>([]);
  const [selectedValideIds, setSelectedValideIds] = useState<string[]>([]);
  const [rejectDialogId, setRejectDialogId] = useState<string | null>(null);
  const [rejectMotif, setRejectMotif] = useState("");
  const [validatedIds, setValidatedIds] = useState<string[]>([]);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [inscritIds, setInscritIds] = useState<string[]>([]);

  // Initiatives soumises (soumis_sgg)
  const initiativesSoumises = useMemo(() => {
    return INITIATIVES_PTM.filter(
      (i) =>
        i.statut === "soumis_sgg" &&
        !validatedIds.includes(i.id) &&
        !rejectedIds.includes(i.id)
    ).map((i) => ({
      ...i,
      anomalies: detectAnomalies(i),
    }));
  }, [validatedIds, rejectedIds]);

  // Initiatives consolidées SGG (consolide_sgg) — En attente transmission PM
  const initiativesValideesAttentePTG = useMemo(() => {
    return INITIATIVES_PTM.filter(
      (i) =>
        i.statut === "consolide_sgg" &&
        !inscritIds.includes(i.id)
    ).map((i) => ({
      ...i,
      anomalies: detectAnomalies(i),
    }));
  }, [inscritIds]);

  // Détection d'anomalies
  function detectAnomalies(initiative: InitiativePTM): string[] {
    const anomalies: string[] = [];

    if (!initiative.intitule || initiative.intitule.length < 20) {
      anomalies.push("Intitulé trop court (< 20 caractères)");
    }

    if (!initiative.programmePAGId) {
      anomalies.push("Pas de programme PAG lié");
    }

    if (!initiative.cadrageDetail || initiative.cadrageDetail.length < 10) {
      anomalies.push("Cadrage détail insuffisant");
    }

    if (!initiative.observations || initiative.observations.length < 10) {
      anomalies.push("Observations insuffisantes");
    }

    return anomalies;
  }

  // Gestion sélection Tab 1 (Soumises)
  const toggleSelectSoumis = (id: string) => {
    setSelectedSoumisIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAllSoumis = () => {
    if (selectedSoumisIds.length === initiativesSoumises.length) {
      setSelectedSoumisIds([]);
    } else {
      setSelectedSoumisIds(initiativesSoumises.map((i) => i.id));
    }
  };

  // Gestion sélection Tab 2 (Valides en attente PTG)
  const toggleSelectValide = (id: string) => {
    setSelectedValideIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAllValide = () => {
    if (selectedValideIds.length === initiativesValideesAttentePTG.length) {
      setSelectedValideIds([]);
    } else {
      setSelectedValideIds(initiativesValideesAttentePTG.map((i) => i.id));
    }
  };

  // Actions
  const handleValiderSGG = (initiativeId: string) => {
    setValidatedIds((prev) => [...prev, initiativeId]);
    setSelectedSoumisIds((prev) => prev.filter((x) => x !== initiativeId));
    toast.success("Initiative validée par SGG");
  };

  const handleValiderSelectionSGG = () => {
    setValidatedIds((prev) => [...prev, ...selectedSoumisIds]);
    toast.success(`${selectedSoumisIds.length} initiative(s) validée(s) par SGG`);
    setSelectedSoumisIds([]);
  };

  const handleRejeterSGG = () => {
    if (!rejectDialogId || !rejectMotif.trim()) return;
    setRejectedIds((prev) => [...prev, rejectDialogId]);
    toast.error("Initiative rejetée — Retournée au ministère");
    setRejectDialogId(null);
    setRejectMotif("");
  };

  const handleInscrirePTG = (initiativeId: string) => {
    if (!permissions.canTransmettre()) {
      toast.error("Vous n'avez pas le droit d'inscrire au PTG");
      return;
    }
    setInscritIds((prev) => [...prev, initiativeId]);
    setSelectedValideIds((prev) => prev.filter((x) => x !== initiativeId));
    toast.success("Initiative inscrite au PTG");
  };

  const handleInscrireSelectionPTG = () => {
    if (!permissions.canTransmettre()) {
      toast.error("Vous n'avez pas le droit d'inscrire au PTG");
      return;
    }
    setInscritIds((prev) => [...prev, ...selectedValideIds]);
    toast.success(`${selectedValideIds.length} initiative(s) inscrite(s) au PTG`);
    setSelectedValideIds([]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-government-gold" />
              Validation PTM — SGG
              <InfoButton pageId="ptm-validation" />
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Validation SGG et inscription au PTG des initiatives ministérielles
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="soumises" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="soumises" className="relative">
              Soumises au SGG
              {initiativesSoumises.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {initiativesSoumises.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="attente-ptg" className="relative">
              En attente inscription PTG
              {initiativesValideesAttentePTG.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {initiativesValideesAttentePTG.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: SOUMISES AU SGG */}
          <TabsContent value="soumises" className="space-y-4">
            {initiativesSoumises.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-status-success mb-4" />
                  <h3 className="text-lg font-semibold">Aucune initiative soumise</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tous les rapports soumis ont été traités.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{initiativesSoumises.length} à valider</Badge>
                    {!permissions.canValider() && (
                      <Badge variant="outline" className="text-status-danger border-status-danger">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Accès restreint
                      </Badge>
                    )}
                  </div>
                  {selectedSoumisIds.length > 0 && (
                    <Button
                      size="sm"
                      onClick={handleValiderSelectionSGG}
                      disabled={!permissions.canValider()}
                      className="bg-status-success hover:bg-status-success/90"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Valider ({selectedSoumisIds.length})
                    </Button>
                  )}
                </div>

                <Card className="shadow-gov overflow-hidden">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40px]">
                              <Checkbox
                                checked={
                                  selectedSoumisIds.length === initiativesSoumises.length &&
                                  initiativesSoumises.length > 0
                                }
                                onCheckedChange={toggleAllSoumis}
                                disabled={!permissions.canValider()}
                              />
                            </TableHead>
                            <TableHead>Intitulé</TableHead>
                            <TableHead>Ministère</TableHead>
                            <TableHead>Rubrique</TableHead>
                            <TableHead>Cadrage</TableHead>
                            <TableHead>Anomalies</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {initiativesSoumises.map((initiative) => (
                            <TableRow key={initiative.id} className="hover:bg-muted/30">
                              <TableCell>
                                <Checkbox
                                  checked={selectedSoumisIds.includes(initiative.id)}
                                  onCheckedChange={() => toggleSelectSoumis(initiative.id)}
                                  disabled={!permissions.canValider()}
                                />
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium text-sm line-clamp-2">
                                    {initiative.intitule}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {initiative.id}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                {initiative.ministereSigle}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {RUBRIQUE_SHORT_LABELS[initiative.rubrique]}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {CADRAGE_SHORT_LABELS[initiative.cadrage]}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {initiative.anomalies.length > 0 ? (
                                  <div className="flex flex-col gap-1">
                                    {initiative.anomalies.slice(0, 2).map((a, i) => (
                                      <Badge
                                        key={i}
                                        variant="destructive"
                                        className="text-[9px] w-fit"
                                      >
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        {a}
                                      </Badge>
                                    ))}
                                    {initiative.anomalies.length > 2 && (
                                      <Badge variant="outline" className="text-[9px] text-muted-foreground">
                                        +{initiative.anomalies.length - 2} autre(s)
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-status-success border-status-success text-[9px]"
                                  >
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
                                    onClick={() => handleValiderSGG(initiative.id)}
                                    disabled={!permissions.canValider()}
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-status-danger hover:text-status-danger"
                                    onClick={() => setRejectDialogId(initiative.id)}
                                    disabled={!permissions.canValider()}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* TAB 2: EN ATTENTE INSCRIPTION PTG */}
          <TabsContent value="attente-ptg" className="space-y-4">
            {initiativesValideesAttentePTG.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-status-success mb-4" />
                  <h3 className="text-lg font-semibold">Aucune initiative en attente</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Toutes les initiatives validées ont été inscrites au PTG.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{initiativesValideesAttentePTG.length} à inscrire</Badge>
                    {!permissions.canTransmettre() && (
                      <Badge variant="outline" className="text-status-danger border-status-danger">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Rôle restreint
                      </Badge>
                    )}
                  </div>
                  {selectedValideIds.length > 0 && (
                    <Button
                      size="sm"
                      onClick={handleInscrireSelectionPTG}
                      disabled={!permissions.canTransmettre()}
                      className="bg-status-success hover:bg-status-success/90"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Inscrire au PTG ({selectedValideIds.length})
                    </Button>
                  )}
                </div>

                <Card className="shadow-gov overflow-hidden">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40px]">
                              <Checkbox
                                checked={
                                  selectedValideIds.length === initiativesValideesAttentePTG.length &&
                                  initiativesValideesAttentePTG.length > 0
                                }
                                onCheckedChange={toggleAllValide}
                                disabled={!permissions.canTransmettre()}
                              />
                            </TableHead>
                            <TableHead>Intitulé</TableHead>
                            <TableHead>Ministère</TableHead>
                            <TableHead>Rubrique</TableHead>
                            <TableHead>Cadrage</TableHead>
                            <TableHead>Programme PAG</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {initiativesValideesAttentePTG.map((initiative) => (
                            <TableRow key={initiative.id} className="hover:bg-muted/30">
                              <TableCell>
                                <Checkbox
                                  checked={selectedValideIds.includes(initiative.id)}
                                  onCheckedChange={() => toggleSelectValide(initiative.id)}
                                  disabled={!permissions.canTransmettre()}
                                />
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium text-sm line-clamp-2">
                                    {initiative.intitule}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Validée {initiative.dateValidationSGG
                                      ? new Date(initiative.dateValidationSGG).toLocaleDateString("fr-FR")
                                      : "—"}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                {initiative.ministereSigle}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {RUBRIQUE_SHORT_LABELS[initiative.rubrique]}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {CADRAGE_SHORT_LABELS[initiative.cadrage]}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                {initiative.programmePAGNom ? (
                                  <span className="line-clamp-1">{initiative.programmePAGNom}</span>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-status-success hover:text-status-success"
                                  onClick={() => handleInscrirePTG(initiative.id)}
                                  disabled={!permissions.canTransmettre()}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Dialog rejet */}
        <Dialog open={!!rejectDialogId} onOpenChange={() => setRejectDialogId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejeter l'initiative</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Veuillez indiquer le motif du rejet. L'initiative sera renvoyée au ministère pour correction.
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
                onClick={handleRejeterSGG}
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
