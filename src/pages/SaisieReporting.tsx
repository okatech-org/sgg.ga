/**
 * SGG Digital — Saisie Mensuelle du Reporting
 * Page de saisie par les SG Ministères — Branchée au Store Zustand
 */

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileEdit,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit,
  Send,
  Lock,
  Building2,
  Shield,
  Users2,
} from "lucide-react";
import { InfoButton } from "@/components/reporting/InfoButton";
import { StatutBadge } from "@/components/reporting/StatutBadge";
import { FormulaireReportingMensuel } from "@/components/reporting/FormulaireReportingMensuel";
import {
  PROGRAMMES,
  GOUVERNANCES,
  PILIERS,
  getProgrammesForMinistere,
  getMinistereById,
} from "@/data/reportingData";
import type { RoleMinistereProgramme } from "@/data/reportingData";
import { useReportingStore } from "@/stores/reportingStore";
import { useMatricePermissions } from "@/hooks/useMatricePermissions";
import { useDemoUser } from "@/hooks/useDemoUser";

const MOIS_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export default function SaisieReporting() {
  const [mois, setMois] = useState("1");
  const [annee, setAnnee] = useState("2026");
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string | null>(null);

  // Store Zustand — lectures réactives
  const rapports = useReportingStore((state) => state.rapports);

  // Permissions
  const permissions = useMatricePermissions();
  const canSaisir = permissions.canWrite('operationnel');

  // Utilisateur démo — rattachement ministère
  const { demoUser } = useDemoUser();
  const userMinistereId = demoUser?.ministereId || null;
  const userMinistere = userMinistereId ? getMinistereById(userMinistereId) : null;

  // Programmes disponibles pour ce ministère (pilote + co-responsable)
  const programmesMinistere = useMemo(() => {
    if (!userMinistereId || !canSaisir) {
      // Admin SGG, directeur, ou rôle non-ministère → tous les programmes
      return null;
    }
    return getProgrammesForMinistere(userMinistereId);
  }, [userMinistereId, canSaisir]);

  // Programmes enrichis avec rapport depuis le store
  const programmesList = useMemo(() => {
    // Déterminer la source de programmes
    const sourceProgrammes = programmesMinistere
      ? programmesMinistere.map((pm) => ({
        ...pm.programme,
        _role: pm.role as RoleMinistereProgramme,
      }))
      : PROGRAMMES.map((p) => ({ ...p, _role: undefined as RoleMinistereProgramme | undefined }));

    return sourceProgrammes.map((programme) => {
      const gouvernance = GOUVERNANCES.find((g) => g.programmeId === programme.id);
      const pilier = PILIERS.find((p) => p.id === programme.pilierId);
      const rapport = rapports.find(
        (r) =>
          r.programmeId === programme.id &&
          r.periodeMois === parseInt(mois) &&
          r.periodeAnnee === parseInt(annee),
      );

      // Calcul de complétude
      let completude = 0;
      if (rapport) {
        let filled = 0;
        const total = 8;
        if (rapport.activitesRealisees) filled++;
        if (rapport.dateDebut) filled++;
        if (rapport.budgetMdFcfa > 0) filled++;
        if (rapport.engageMdFcfa > 0) filled++;
        if (rapport.decaisseMdFcfa > 0) filled++;
        if (rapport.indicateursKpi) filled++;
        if (rapport.pctAvancementPhysique > 0) filled++;
        if (rapport.observationsContraintes) filled++;
        completude = Math.round((filled / total) * 100);
      }

      return {
        programme,
        gouvernance,
        pilier,
        rapport,
        completude,
        roleMinistere: programme._role,
      };
    });
  }, [rapports, mois, annee, programmesMinistere]);

  // Stats rapides
  const stats = useMemo(() => {
    const total = programmesList.length;
    const saisis = programmesList.filter((p) => p.rapport).length;
    const soumis = programmesList.filter((p) => p.rapport?.statutValidation === 'soumis').length;
    const valides = programmesList.filter(
      (p) =>
        p.rapport?.statutValidation === 'valide_sgg' ||
        p.rapport?.statutValidation === 'valide_sgpr',
    ).length;
    const rejetes = programmesList.filter((p) => p.rapport?.statutValidation === 'rejete').length;
    return { total, saisis, soumis, valides, rejetes };
  }, [programmesList]);

  const getButtonConfig = (programme: typeof programmesList[0]) => {
    if (!canSaisir) {
      return {
        label: 'Accès restreint',
        icon: Lock,
        variant: 'outline' as const,
        disabled: true,
      };
    }
    if (!programme.rapport) {
      return {
        label: 'Remplir le rapport',
        icon: Edit,
        variant: 'default' as const,
        disabled: false,
      };
    }
    if (programme.rapport.statutValidation === 'brouillon') {
      return {
        label: 'Continuer la saisie',
        icon: Edit,
        variant: 'default' as const,
        disabled: false,
      };
    }
    if (programme.rapport.statutValidation === 'rejete') {
      return {
        label: 'Corriger et resoumettre',
        icon: AlertTriangle,
        variant: 'destructive' as const,
        disabled: false,
      };
    }
    if (programme.rapport.statutValidation === 'soumis') {
      return {
        label: 'En attente de validation',
        icon: Clock,
        variant: 'outline' as const,
        disabled: true,
      };
    }
    return {
      label: 'Consulter',
      icon: CheckCircle2,
      variant: 'outline' as const,
      disabled: false,
    };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileEdit className="h-6 w-6 text-government-gold" />
              Saisie Mensuelle du Reporting
              <InfoButton pageId="saisie-reporting" />
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {userMinistere
                ? `Rapports mensuels — ${userMinistere.nom}`
                : 'Remplissez les rapports mensuels pour chaque programme PAG'
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={mois} onValueChange={setMois}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOIS_LABELS.map((label, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={annee} onValueChange={setAnnee}>
              <SelectTrigger className="w-[90px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bandeau ministère connecté */}
        {userMinistere && programmesMinistere && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-government-navy/5 dark:bg-government-navy/10 border border-government-navy/10">
            <Building2 className="h-5 w-5 text-government-navy dark:text-government-gold flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{userMinistere.nom}</p>
              <p className="text-xs text-muted-foreground">
                {programmesMinistere.filter((p) => p.role === 'pilote').length} programme(s) pilote
                {programmesMinistere.filter((p) => p.role === 'co-responsable').length > 0 &&
                  ` · ${programmesMinistere.filter((p) => p.role === 'co-responsable').length} en co-responsabilité`
                }
              </p>
            </div>
          </div>
        )}

        {/* Stats rapides */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{stats.total} programmes</Badge>
          <Badge variant="outline">{stats.saisis} saisis</Badge>
          <Badge variant="outline" className="text-status-info border-status-info">
            <Send className="h-3 w-3 mr-1" />
            {stats.soumis} soumis
          </Badge>
          <Badge variant="outline" className="text-status-success border-status-success">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {stats.valides} validés
          </Badge>
          {stats.rejetes > 0 && (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {stats.rejetes} rejeté(s)
            </Badge>
          )}
        </div>

        {/* Grille des programmes */}
        <div className="grid gap-4 md:grid-cols-2">
          {programmesList.map(({ programme, gouvernance, pilier, rapport, completude, roleMinistere }) => {
            const btnConfig = getButtonConfig({ programme, gouvernance, pilier, rapport, completude, roleMinistere });
            const BtnIcon = btnConfig.icon;

            return (
              <Card
                key={programme.id}
                className="transition-all hover:shadow-gov-lg hover:border-government-gold/30"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: pilier?.couleur }}
                      />
                      <CardTitle className="text-sm">{programme.codeProgramme}</CardTitle>
                      {/* Badge rôle du ministère */}
                      {roleMinistere && (
                        <Badge
                          variant="outline"
                          className={roleMinistere === 'pilote'
                            ? 'text-[10px] bg-government-navy/10 text-government-navy border-government-navy/20 dark:bg-government-gold/10 dark:text-government-gold dark:border-government-gold/20'
                            : 'text-[10px] bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800'
                          }
                        >
                          {roleMinistere === 'pilote' ? (
                            <><Shield className="h-2.5 w-2.5 mr-0.5" /> Pilote</>
                          ) : (
                            <><Users2 className="h-2.5 w-2.5 mr-0.5" /> Co-resp.</>
                          )}
                        </Badge>
                      )}
                    </div>
                    {rapport && (
                      <StatutBadge type="validation" statut={rapport.statutValidation} size="sm" />
                    )}
                  </div>
                  <CardDescription className="text-xs line-clamp-2">
                    {programme.libelleProgramme}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {gouvernance && (
                    <p className="text-xs text-muted-foreground">
                      Pilote : {gouvernance.ministerePiloteNom}
                    </p>
                  )}

                  {rapport && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground">Complétude</span>
                        <span className="font-medium">{completude}%</span>
                      </div>
                      <Progress value={completude} className="h-1.5" />
                    </div>
                  )}

                  {rapport?.statutValidation === 'rejete' && rapport.motifRejet && (
                    <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20 text-xs text-red-700 dark:text-red-400">
                      <span className="font-medium">Motif de rejet :</span> {rapport.motifRejet}
                    </div>
                  )}

                  <Button
                    size="sm"
                    variant={btnConfig.variant}
                    className="w-full"
                    disabled={btnConfig.disabled}
                    onClick={() => !btnConfig.disabled && setSelectedProgrammeId(programme.id)}
                  >
                    <BtnIcon className="h-4 w-4 mr-2" />
                    {btnConfig.label}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Dialog Formulaire */}
        <Dialog
          open={!!selectedProgrammeId}
          onOpenChange={(open) => !open && setSelectedProgrammeId(null)}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileEdit className="h-5 w-5 text-government-gold" />
                Rapport Mensuel — {MOIS_LABELS[parseInt(mois) - 1]} {annee}
              </DialogTitle>
            </DialogHeader>
            {selectedProgrammeId && (
              <FormulaireReportingMensuel
                programmeId={selectedProgrammeId}
                mois={parseInt(mois)}
                annee={parseInt(annee)}
                onClose={() => setSelectedProgrammeId(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout >
  );
}
