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
  Loader2,
  Send,
  Calendar,
} from "lucide-react";
import { useDemoUser } from "@/hooks/useDemoUser";
import { usePTMPermissions } from "@/hooks/usePTMPermissions";
import { InfoButton } from "@/components/reporting/InfoButton";
import { usePTMInitiatives } from "@/hooks/useApiData";
import { DEADLINES_PTM } from "@/hooks/usePTMWorkflow";
import {
  RUBRIQUE_SHORT_LABELS,
  STATUT_PTM_LABELS,
  CADRAGE_SHORT_LABELS,
} from "@/types/ptm";
import type { InitiativePTM, StatutPTM } from "@/types/ptm";
import { FormulairePTM } from "@/components/ptm/FormulairePTM";
import { toast } from "sonner";

export default function PTMSaisie() {
  const { demoUser } = useDemoUser();
  const permissions = usePTMPermissions();
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<string | null>(null);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);

  // Récupérer les initiatives via l'API backend
  const { data: apiData, isLoading, isError } = usePTMInitiatives();
  const apiInitiatives = apiData?.data || [];

  // Mapper les initiatives API vers le format UI et calculer la complétude
  const initiatives = useMemo(() => {
    return apiInitiatives.map((init) => {
      const completude = calculateCompletude(init);
      return { ...init, completude };
    });
  }, [apiInitiatives]);

  // Statistiques
  const stats = useMemo(() => {
    const total = initiatives.length;
    const brouillons = initiatives.filter((i) => i.statut === "brouillon").length;
    const soumis = initiatives.filter((i) => ['soumis_sg', 'consolide_sg', 'soumis_sgg'].includes(i.statut)).length;
    const transmis = initiatives.filter((i) => ['consolide_sgg', 'soumis_pm', 'soumis_sgpr'].includes(i.statut)).length;
    const rejetes = initiatives.filter((i) => i.statut.startsWith('rejete')).length;

    return { total, brouillons, soumis, transmis, rejetes };
  }, [initiatives]);

  const handleSelectInitiative = (initiativeId: string) => {
    setSelectedInitiativeId(initiativeId);
  };

  const handleCloseDialog = () => {
    setSelectedInitiativeId(null);
    setIsNewDialogOpen(false);
  };

  // Deadline alert
  const deadlineDay = DEADLINES_PTM[permissions.niveau];
  const today = new Date();
  const currentDay = today.getDate();
  const joursRestants = deadlineDay - currentDay;
  const showDeadlineAlert = permissions.niveau === 'direction' && joursRestants > 0 && joursRestants <= 7;
  const deadlinePassed = permissions.niveau === 'direction' && currentDay > deadlineDay;

  // Handle "Transmettre au SG" for a single initiative
  const handleTransmettre = (initiativeId: string, intitule: string) => {
    toast.success(
      `Initiative "${intitule.substring(0, 40)}..." transmise au Secrétaire Général du Ministère`,
      { description: 'La matrice a été poussée au niveau SG pour consolidation.' }
    );
  };

  // Count brouillons ready to transmit (completude >= 70%)
  const brouillonsReady = initiatives.filter(
    (i) => i.statut === 'brouillon' && (i.completude ?? 0) >= 70
  );

  // Handle bulk "Transmettre tout au SG"
  const handleTransmettreTout = () => {
    toast.success(
      `${brouillonsReady.length} initiative(s) transmise(s) au SG du Ministère`,
      { description: 'Les matrices ont été poussées au niveau SG pour consolidation.' }
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Deadline alert banner */}
        {(showDeadlineAlert || deadlinePassed) && (
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${deadlinePassed
              ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800'
              : 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'
            }`}>
            <Calendar className={`h-5 w-5 flex-shrink-0 ${deadlinePassed ? 'text-red-600' : 'text-amber-600'
              }`} />
            <div className="flex-1">
              <p className={`text-sm font-semibold ${deadlinePassed ? 'text-red-800 dark:text-red-200' : 'text-amber-800 dark:text-amber-200'
                }`}>
                {deadlinePassed
                  ? `⚠️ Deadline dépassée — La transmission au SG devait être faite avant le ${deadlineDay} du mois`
                  : `📅 Il vous reste ${joursRestants} jour${joursRestants > 1 ? 's' : ''} pour transmettre votre matrice au SG`
                }
              </p>
              <p className={`text-xs mt-0.5 ${deadlinePassed ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                }`}>
                Les directions doivent transmettre avant le {deadlineDay} de chaque mois
              </p>
            </div>
          </div>
        )}

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
          <div className="flex gap-2">
            {brouillonsReady.length > 0 && permissions.canTransmettre() && (
              <Button
                onClick={handleTransmettreTout}
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                Transmettre tout au SG ({brouillonsReady.length})
              </Button>
            )}
            <Button
              onClick={() => setIsNewDialogOpen(true)}
              disabled={!permissions.canSaisir()}
              className="bg-government-gold hover:bg-government-gold/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Initiative
            </Button>
          </div>
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
          {stats.transmis > 0 && (
            <Badge variant="outline" className="text-status-warning border-status-warning text-sm">
              {stats.transmis} transmis PM
            </Badge>
          )}
          {stats.rejetes > 0 && (
            <Badge variant="outline" className="text-status-danger border-status-danger text-sm">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {stats.rejetes} rejetés
            </Badge>
          )}
        </div>

        {/* Grille des initiatives */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin" />
              <h3 className="text-lg font-semibold">Chargement des initiatives...</h3>
            </CardContent>
          </Card>
        ) : isError ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-status-danger mb-4" />
              <h3 className="text-lg font-semibold">Erreur de chargement</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Impossible de récupérer les initiatives. Vérifiez la connexion au serveur.
              </p>
            </CardContent>
          </Card>
        ) : initiatives.length === 0 ? (
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
                className={`transition-all hover:shadow-gov-lg ${initiative.statut === "soumis_sgpr"
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:border-government-gold/30 cursor-pointer"
                  }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <Badge variant="outline" className="text-[10px] mb-2">
                        {RUBRIQUE_SHORT_LABELS[initiative.rubrique] || initiative.rubrique}
                      </Badge>
                      <CardTitle className="text-base line-clamp-2">{initiative.intitule}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {initiative.ministere_sigle || ''}
                      </CardDescription>
                    </div>
                    <div>
                      <Badge
                        variant={
                          initiative.statut === "brouillon"
                            ? "outline"
                            : initiative.statut === "soumis_sgg"
                              ? "secondary"
                              : initiative.statut === "consolide_sgg"
                                ? "default"
                                : "default"
                        }
                        className={`text-[10px] ${initiative.statut === "soumis_sgpr"
                          ? "bg-status-success/10 text-status-success border-status-success/20"
                          : ""
                          }`}
                      >
                        {STATUT_PTM_LABELS[initiative.statut as StatutPTM] || initiative.statut}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    <span className="font-semibold">Cadrage:</span> {CADRAGE_SHORT_LABELS[initiative.cadrage] || initiative.cadrage}
                  </div>

                  {initiative.cadrage_detail && (
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      <span className="font-semibold">Détail:</span> {initiative.cadrage_detail}
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
                    {initiative.incidence_financiere && (
                      <Badge variant="secondary" className="text-[9px]">
                        Fin. Incidence
                      </Badge>
                    )}
                    {initiative.loi_finance && (
                      <Badge variant="secondary" className="text-[9px]">
                        Loi Finance
                      </Badge>
                    )}
                    {!initiative.cadrage_detail && (
                      <Badge
                        variant="destructive"
                        className="text-[9px] bg-status-danger/20 text-status-danger border-status-danger/20"
                      >
                        <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                        No detail
                      </Badge>
                    )}
                  </div>

                  {/* Boutons action */}
                  <div className="space-y-2">
                    <Button
                      variant={
                        initiative.statut === "brouillon" || !initiative.date_soumission
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      className="w-full"
                      disabled={initiative.statut === "soumis_sgpr"}
                      onClick={() => handleSelectInitiative(initiative.id)}
                    >
                      {!initiative.date_soumission ? (
                        <>
                          <FileEdit className="h-4 w-4 mr-2" />
                          Créer/Compléter
                        </>
                      ) : initiative.statut === "brouillon" ? (
                        <>
                          <FileEdit className="h-4 w-4 mr-2" />
                          Continuer
                        </>
                      ) : initiative.statut === "soumis_sg" ? (
                        <>
                          <Clock className="h-4 w-4 mr-2" />
                          En attente SG
                        </>
                      ) : initiative.statut === "soumis_sgg" ? (
                        <>
                          <Clock className="h-4 w-4 mr-2" />
                          En attente SGG
                        </>
                      ) : initiative.statut === "soumis_sgpr" ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Transmis SGPR
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Consulter
                        </>
                      )}
                    </Button>

                    {/* Bouton "Transmettre au SG" — visible uniquement sur brouillon complétés */}
                    {initiative.statut === "brouillon" && (initiative.completude ?? 0) >= 70 && permissions.canTransmettre() && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTransmettre(initiative.id, initiative.intitule);
                        }}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        📤 Transmettre au SG
                      </Button>
                    )}
                  </div>
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
            <FormulairePTM
              initiativeId={selectedInitiativeId || undefined}
              onClose={handleCloseDialog}
              onSave={handleCloseDialog}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

/**
 * Calcule le taux de complétude d'une initiative (API format)
 */
function calculateCompletude(initiative: any): number {
  let filled = 0;
  const total = 8;

  if (initiative.intitule && initiative.intitule.length > 5) filled++;
  if (initiative.cadrage_detail && initiative.cadrage_detail.length > 0) filled++;
  if (initiative.observations && initiative.observations.length > 5) filled++;
  if (initiative.services_porteurs && initiative.services_porteurs.length > 0) filled++;
  if (initiative.incidence_financiere !== undefined) filled++;
  if (initiative.loi_finance !== undefined) filled++;
  if (initiative.programme_pag_id) filled++;
  if (initiative.date_soumission) filled++;

  return Math.round((filled / total) * 100);
}
