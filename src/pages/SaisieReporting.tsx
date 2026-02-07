/**
 * SGG Digital — Saisie Reporting Mensuel
 * Liste des programmes à remplir pour le SG Ministère courant
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileEdit,
  CheckCircle2,
  Clock,
  Send,
  AlertTriangle,
} from "lucide-react";
import { useDemoUser } from "@/hooks/useDemoUser";
import { InfoButton } from "@/components/reporting/InfoButton";
import { StatutBadge } from "@/components/reporting/StatutBadge";
import { FormulaireReportingMensuel } from "@/components/reporting/FormulaireReportingMensuel";
import {
  PROGRAMMES,
  GOUVERNANCES,
  RAPPORTS_MENSUELS,
  PILIERS,
} from "@/data/reportingData";
import type { StatutValidation } from "@/types/reporting";

const MOIS_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export default function SaisieReporting() {
  const { demoUser } = useDemoUser();
  const [mois, setMois] = useState(1);
  const [annee] = useState(2026);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string | null>(null);

  // Tous les programmes (en mode démo SG Ministère, montrer tous les programmes)
  const programmesList = useMemo(() => {
    return PROGRAMMES.map((prog) => {
      const gouvernance = GOUVERNANCES.find((g) => g.programmeId === prog.id)!;
      const pilier = PILIERS.find((p) => p.id === prog.pilierId)!;
      const rapport = RAPPORTS_MENSUELS.find(
        (r) => r.programmeId === prog.id && r.periodeMois === mois && r.periodeAnnee === annee
      );

      const completude = rapport ? calculateCompletude(rapport) : 0;

      return {
        programme: prog,
        gouvernance,
        pilier,
        rapport,
        completude,
      };
    });
  }, [mois, annee]);

  const stats = useMemo(() => ({
    total: programmesList.length,
    brouillons: programmesList.filter(p => p.rapport?.statutValidation === 'brouillon').length,
    soumis: programmesList.filter(p => p.rapport?.statutValidation === 'soumis').length,
    valides: programmesList.filter(p => p.rapport?.statutValidation === 'valide_sgpr').length,
    nonSaisis: programmesList.filter(p => !p.rapport).length,
  }), [programmesList]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileEdit className="h-6 w-6 text-government-gold" />
            Saisie Mensuelle — {MOIS_LABELS[mois - 1]} {annee}
            <InfoButton pageId="saisie-reporting" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Remplissez les rapports mensuels pour les programmes dont votre ministère est pilote
          </p>
        </div>

        {/* Sélecteur mois */}
        <div className="flex items-center gap-3">
          <Select value={String(mois)} onValueChange={(v) => setMois(parseInt(v))}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MOIS_LABELS.map((label, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="secondary">{stats.total} programmes</Badge>
          <Badge variant="outline" className="text-status-success border-status-success">
            {stats.valides} validés
          </Badge>
          <Badge variant="outline" className="text-status-info border-status-info">
            {stats.soumis} soumis
          </Badge>
          {stats.nonSaisis > 0 && (
            <Badge variant="outline" className="text-status-danger border-status-danger">
              {stats.nonSaisis} non saisis
            </Badge>
          )}
        </div>

        {/* Grille des programmes */}
        <div className="grid gap-4 md:grid-cols-2">
          {programmesList.map(({ programme, gouvernance, pilier, rapport, completude }) => (
            <Card
              key={programme.id}
              className="transition-all hover:shadow-gov-lg hover:border-government-gold/30"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: pilier.couleur }}
                    />
                    <Badge variant="outline" className="text-[10px]">{programme.codeProgramme}</Badge>
                  </div>
                  {rapport ? (
                    <StatutBadge type="validation" statut={rapport.statutValidation} />
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground text-[10px]">
                      <Clock className="h-3 w-3 mr-1" />
                      Non saisi
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-base mt-2">{programme.libelleProgramme}</CardTitle>
                <CardDescription className="text-xs">
                  {gouvernance.ministerePiloteNom}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {programme.objectifStrategique}
                </div>

                {rapport && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Complétude</span>
                      <span className="font-medium">{completude}%</span>
                    </div>
                    <Progress value={completude} className="h-1.5" />
                  </div>
                )}

                <Button
                  variant={rapport?.statutValidation === 'brouillon' || !rapport ? "default" : "outline"}
                  size="sm"
                  className="w-full"
                  disabled={rapport?.statutValidation === 'valide_sgpr' || rapport?.statutValidation === 'valide_sgg'}
                  onClick={() => setSelectedProgrammeId(programme.id)}
                >
                  {!rapport ? (
                    <>
                      <FileEdit className="h-4 w-4 mr-2" />
                      Remplir le rapport
                    </>
                  ) : rapport.statutValidation === 'brouillon' ? (
                    <>
                      <FileEdit className="h-4 w-4 mr-2" />
                      Continuer la saisie
                    </>
                  ) : rapport.statutValidation === 'soumis' ? (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      En attente de validation
                    </>
                  ) : rapport.statutValidation === 'rejete' ? (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Corriger et resoumettre
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Validé
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dialog formulaire */}
        <Dialog open={!!selectedProgrammeId} onOpenChange={() => setSelectedProgrammeId(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Rapport Mensuel — {MOIS_LABELS[mois - 1]} {annee}
              </DialogTitle>
            </DialogHeader>
            {selectedProgrammeId && (
              <FormulaireReportingMensuel
                programmeId={selectedProgrammeId}
                mois={mois}
                annee={annee}
                onClose={() => setSelectedProgrammeId(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function calculateCompletude(rapport: { activitesRealisees: string; engageMdFcfa: number; decaisseMdFcfa: number; indicateursKpi: string; pctAvancementPhysique: number; observationsContraintes: string }): number {
  let filled = 0;
  let total = 6;
  if (rapport.activitesRealisees) filled++;
  if (rapport.engageMdFcfa > 0) filled++;
  if (rapport.decaisseMdFcfa > 0) filled++;
  if (rapport.indicateursKpi) filled++;
  if (rapport.pctAvancementPhysique > 0) filled++;
  if (rapport.observationsContraintes) filled++;
  return Math.round((filled / total) * 100);
}
