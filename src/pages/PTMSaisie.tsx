/**
 * SGG Digital — Saisie PTM
 * Page de saisie des initiatives ministérielles
 * Programme de Travail du Ministère — Data entry interface
 */

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileEdit,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useDemoUser } from "@/hooks/useDemoUser";
import { usePTMPermissions } from "@/hooks/usePTMPermissions";
import { InfoButton } from "@/components/reporting/InfoButton";
import { INITIATIVES_PTM, MINISTERES_PTM } from "@/data/ptmData";
import {
  RUBRIQUE_SHORT_LABELS,
  STATUT_PTM_LABELS,
  CADRAGE_SHORT_LABELS,
} from "@/types/ptm";
import type { InitiativePTM } from "@/types/ptm";

export default function PTMSaisie() {
  const { demoUser } = useDemoUser();
  const permissions = usePTMPermissions();
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<string | null>(null);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);

  // Récupérer les initiatives du ministère courant (ou toutes en mode démo)
  const initiatives = useMemo(() => {
    // En mode démo, afficher toutes les initiatives
    return INITIATIVES_PTM.map((init) => {
      const completude = calculateCompletude(init);
      return { ...init, completude };
    });
  }, []);

  // Statistiques
  const stats = useMemo(() => {
    const total = initiatives.length;
    const brouillons = initiatives.filter((i) => i.statut === "brouillon").length;
    const soumis = initiatives.filter((i) => i.statut === "soumis_sgg").length;
    const valides = initiatives.filter((i) => i.statut === "valide_sgg").length;
    const inscritsPTG = initiatives.filter((i) => i.statut === "inscrit_ptg").length;

    return { total, brouillons, soumis, valides, inscritsPTG };
  }, [initiatives]);

  // Ministère courant (pour affichage)
  const ministereActuel = useMemo(() => {
    if (!demoUser) return MINISTERES_PTM[0];
    // En mode démo, on peut afficher tout
    return MINISTERES_PTM[0];
  }, [demoUser]);

  const handleSelectInitiative = (initiativeId: string) => {
    setSelectedInitiativeId(initiativeId);
  };

  const handleCloseDialog = () => {
    setSelectedInitiativeId(null);
    setIsNewDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileEdit className="h-6 w-6 text-government-gold" />
              Saisie PTM — Initiatives Ministérielles
              <InfoButton pageId="ptm-saisie" />
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Créez et complétez les initiatives du programme de travail ministériel 2026
            </p>
          </div>
          <Button
            onClick={() => setIsNewDialogOpen(true)}
            disabled={!permissions.canSaisir()}
            className="bg-government-gold hover:bg-government-gold/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Initiative
          </Button>
        </div>

        {/* Statistiques */}
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            {stats.total} initiatives
          </Badge>
          {stats.brouillons > 0 && (
            <Badge variant="outline" className="text-muted-foreground text-sm">
              <Clock className="h-3 w-3 mr-1" />
              {stats.brouillons} brouillons
            </Badge>
          )}
          {stats.soumis > 0 && (
            <Badge variant="outline" className="text-status-info border-status-info text-sm">
              {stats.soumis} soumis
            </Badge>
          )}
          {stats.valides > 0 && (
            <Badge variant="outline" className="text-status-warning border-status-warning text-sm">
              {stats.valides} validés SGG
            </Badge>
          )}
          {stats.inscritsPTG > 0 && (
            <Badge variant="outline" className="text-status-success border-status-success text-sm">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {stats.inscritsPTG} inscrits PTG
            </Badge>
          )}
        </div>

        {/* Grille des initiatives */}
        {initiatives.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileEdit className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Aucune initiative</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Commencez par créer votre première initiative
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {initiatives.map((initiative) => (
              <Card
                key={initiative.id}
                className={`transition-all hover:shadow-gov-lg ${
                  initiative.statut === "inscrit_ptg"
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:border-government-gold/30 cursor-pointer"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <Badge variant="outline" className="text-[10px] mb-2">
                        {RUBRIQUE_SHORT_LABELS[initiative.rubrique]}
                      </Badge>
                      <CardTitle className="text-base line-clamp-2">{initiative.intitule}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {initiative.ministereSigle}
                      </CardDescription>
                    </div>
                    <div>
                      <Badge
                        variant={
                          initiative.statut === "brouillon"
                            ? "outline"
                            : initiative.statut === "soumis_sgg"
                            ? "secondary"
                            : initiative.statut === "valide_sgg"
                            ? "default"
                            : "default"
                        }
                        className={`text-[10px] ${
                          initiative.statut === "inscrit_ptg"
                            ? "bg-status-success/10 text-status-success border-status-success/20"
                            : ""
                        }`}
                      >
                        {STATUT_PTM_LABELS[initiative.statut]}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    <span className="font-semibold">Cadrage:</span> {CADRAGE_SHORT_LABELS[initiative.cadrage]}
                  </div>

                  {initiative.cadrageDetail && (
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      <span className="font-semibold">Détail:</span> {initiative.cadrageDetail}
                    </div>
                  )}

                  {/* Barre de complétude */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Complétude</span>
                      <span className="font-medium">{initiative.completude}%</span>
                    </div>
                    <Progress value={initiative.completude} className="h-1.5" />
                  </div>

                  {/* Indicateurs */}
                  <div className="flex gap-2 flex-wrap">
                    {initiative.incidenceFinanciere && (
                      <Badge variant="secondary" className="text-[9px]">
                        Fin. Incidence
                      </Badge>
                    )}
                    {initiative.loiFinance && (
                      <Badge variant="secondary" className="text-[9px]">
                        Loi Finance
                      </Badge>
                    )}
                    {!initiative.cadrageDetail && (
                      <Badge
                        variant="destructive"
                        className="text-[9px] bg-status-danger/20 text-status-danger border-status-danger/20"
                      >
                        <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                        No detail
                      </Badge>
                    )}
                  </div>

                  {/* Bouton action */}
                  <Button
                    variant={
                      initiative.statut === "brouillon" || !initiative.dateSoumission
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    className="w-full"
                    disabled={initiative.statut === "inscrit_ptg"}
                    onClick={() => handleSelectInitiative(initiative.id)}
                  >
                    {!initiative.dateSoumission ? (
                      <>
                        <FileEdit className="h-4 w-4 mr-2" />
                        Créer/Compléter
                      </>
                    ) : initiative.statut === "brouillon" ? (
                      <>
                        <FileEdit className="h-4 w-4 mr-2" />
                        Continuer
                      </>
                    ) : initiative.statut === "soumis_sgg" ? (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        En attente SGG
                      </>
                    ) : initiative.statut === "inscrit_ptg" ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Inscrit PTG
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Consulter
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog formulaire */}
        <Dialog open={!!selectedInitiativeId || isNewDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedInitiativeId
                  ? "Éditer Initiative PTM"
                  : "Nouvelle Initiative PTM"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                [Formulaire de saisie PTM — À intégrer avec composant FormulairePTM]
              </p>
              <p className="text-sm">
                {selectedInitiativeId
                  ? `Initiative ID: ${selectedInitiativeId}`
                  : "Créer une nouvelle initiative"}
              </p>
              <Button
                variant="outline"
                onClick={handleCloseDialog}
                className="w-full"
              >
                Fermer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

/**
 * Calcule le taux de complétude d'une initiative
 */
function calculateCompletude(initiative: InitiativePTM): number {
  let filled = 0;
  let total = 8;

  if (initiative.intitule && initiative.intitule.length > 5) filled++;
  if (initiative.cadrageDetail && initiative.cadrageDetail.length > 0) filled++;
  if (initiative.observations && initiative.observations.length > 5) filled++;
  if (initiative.servicesPorteurs && initiative.servicesPorteurs.length > 0) filled++;
  if (initiative.incidenceFinanciere !== undefined) filled++;
  if (initiative.loiFinance !== undefined) filled++;
  if (initiative.programmePAGId) filled++;
  if (initiative.dateSoumission) filled++;

  return Math.round((filled / total) * 100);
}
