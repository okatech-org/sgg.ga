/**
 * SGG Digital — Saisie Mensuelle du Reporting
 * Page de saisie par les SG Ministères — Branchée au Store Zustand
 * Affiche les programmes directs (pilote/co-resp.) ET les programmes connexes (indirects).
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
  Layers,
  Handshake,
  Link2,
  Eye,
} from "lucide-react";
import { InfoButton } from "@/components/reporting/InfoButton";
import { ProgrammeInfoButton } from "@/components/reporting/ProgrammeInfoButton";
import { StatutBadge } from "@/components/reporting/StatutBadge";
import { FormulaireReportingMensuel } from "@/components/reporting/FormulaireReportingMensuel";
import {
  PROGRAMMES,
  GOUVERNANCES,
  PILIERS,
  getAllProgrammesForMinistere,
  getMinistereById,
} from "@/data/reportingData";
import type { RoleLienProgramme } from "@/data/reportingData";
import { useReportingStore } from "@/stores/reportingStore";
import { useMatricePermissions } from "@/hooks/useMatricePermissions";
import { useDemoUser } from "@/hooks/useDemoUser";

const MOIS_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

// Configuration visuelle des badges de rôle/lien
const ROLE_BADGE_CONFIG: Record<string, {
  label: string;
  icon: React.ElementType;
  className: string;
}> = {
  pilote: {
    label: 'Pilote',
    icon: Shield,
    className: 'text-[10px] bg-government-navy/10 text-government-navy border-government-navy/20 dark:bg-government-gold/10 dark:text-government-gold dark:border-government-gold/20',
  },
  'co-responsable': {
    label: 'Co-resp.',
    icon: Users2,
    className: 'text-[10px] bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
  },
  meme_pilier: {
    label: 'Même pilier',
    icon: Layers,
    className: 'text-[10px] bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800',
  },
  tutelle_directions: {
    label: 'Tutelle',
    icon: Building2,
    className: 'text-[10px] bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800',
  },
  partenaire_technique: {
    label: 'Partenaire',
    icon: Handshake,
    className: 'text-[10px] bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-800',
  },
};

export default function SaisieReporting() {
  // Mois courant par défaut (ex: Février 2026 → mois="2", annee="2026")
  const today = new Date();
  const [mois, setMois] = useState(String(today.getMonth() + 1));
  const [annee, setAnnee] = useState(String(today.getFullYear()));
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

  // Tous les programmes (directs + indirects) pour ce ministère
  const allProgrammes = useMemo(() => {
    if (!userMinistereId || !canSaisir) {
      // Admin SGG, directeur, ou rôle non-ministère → tous les programmes (mode admin)
      return null;
    }
    return getAllProgrammesForMinistere(userMinistereId);
  }, [userMinistereId, canSaisir]);

  // Enrichir avec rapport depuis le store + séparer directs / indirects
  const { directProgrammes, indirectProgrammes } = useMemo(() => {
    // Déterminer la source de programmes
    type EnrichedProgramme = {
      programme: typeof PROGRAMMES[0];
      gouvernance: typeof GOUVERNANCES[0] | undefined;
      pilier: typeof PILIERS[0] | undefined;
      rapport: ReturnType<typeof rapports.find>;
      completude: number;
      role: RoleLienProgramme | undefined;
      isDirect: boolean;
      justification?: string;
    };

    const sourceProgrammes = allProgrammes
      ? allProgrammes.map((pm) => ({
          ...pm.programme,
          _role: pm.role as RoleLienProgramme,
          _isDirect: pm.isDirect,
          _justification: pm.justification,
        }))
      : PROGRAMMES.map((p) => ({
          ...p,
          _role: undefined as RoleLienProgramme | undefined,
          _isDirect: true,
          _justification: undefined as string | undefined,
        }));

    const enriched: EnrichedProgramme[] = sourceProgrammes.map((programme) => {
      const gouvernance = GOUVERNANCES.find((g) => g.programmeId === programme.id);
      const pilier = PILIERS.find((p) => p.id === programme.pilierId);
      // Chercher le rapport de CE ministère pour ce programme/mois/année
      const rapport = rapports.find(
        (r) =>
          r.programmeId === programme.id &&
          r.periodeMois === parseInt(mois) &&
          r.periodeAnnee === parseInt(annee) &&
          (!userMinistereId || r.ministereId === userMinistereId),
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
        role: programme._role,
        isDirect: programme._isDirect,
        justification: programme._justification,
      };
    });

    return {
      directProgrammes: enriched.filter((p) => p.isDirect),
      indirectProgrammes: enriched.filter((p) => !p.isDirect),
    };
  }, [rapports, mois, annee, allProgrammes, userMinistereId]);

  // Stats rapides (uniquement programmes directs)
  const stats = useMemo(() => {
    const total = directProgrammes.length;
    const saisis = directProgrammes.filter((p) => p.rapport).length;
    const soumis = directProgrammes.filter((p) => p.rapport?.statutValidation === 'soumis').length;
    const valides = directProgrammes.filter(
      (p) =>
        p.rapport?.statutValidation === 'valide_sgg' ||
        p.rapport?.statutValidation === 'valide_sgpr',
    ).length;
    const rejetes = directProgrammes.filter((p) => p.rapport?.statutValidation === 'rejete').length;
    return { total, saisis, soumis, valides, rejetes, connexes: indirectProgrammes.length };
  }, [directProgrammes, indirectProgrammes]);

  const getButtonConfig = (isDirect: boolean, rapport: typeof directProgrammes[0]['rapport']) => {
    if (!isDirect) {
      return {
        label: 'Voir les infos',
        icon: Eye,
        variant: 'ghost' as const,
        disabled: false,
        isInfoOnly: true,
      };
    }
    if (!canSaisir) {
      return {
        label: 'Accès restreint',
        icon: Lock,
        variant: 'outline' as const,
        disabled: true,
        isInfoOnly: false,
      };
    }
    if (!rapport) {
      return {
        label: 'Remplir le rapport',
        icon: Edit,
        variant: 'default' as const,
        disabled: false,
        isInfoOnly: false,
      };
    }
    if (rapport.statutValidation === 'brouillon') {
      return {
        label: 'Continuer la saisie',
        icon: Edit,
        variant: 'default' as const,
        disabled: false,
        isInfoOnly: false,
      };
    }
    if (rapport.statutValidation === 'rejete') {
      return {
        label: 'Corriger et resoumettre',
        icon: AlertTriangle,
        variant: 'destructive' as const,
        disabled: false,
        isInfoOnly: false,
      };
    }
    if (rapport.statutValidation === 'soumis') {
      return {
        label: 'En attente de validation',
        icon: Clock,
        variant: 'outline' as const,
        disabled: true,
        isInfoOnly: false,
      };
    }
    return {
      label: 'Consulter',
      icon: CheckCircle2,
      variant: 'outline' as const,
      disabled: false,
      isInfoOnly: false,
    };
  };

  // Rendu d'une carte programme (réutilisé pour directs ET indirects)
  const renderProgrammeCard = (item: typeof directProgrammes[0]) => {
    const { programme, gouvernance, pilier, rapport, completude, role, isDirect, justification } = item;
    const btnConfig = getButtonConfig(isDirect, rapport);
    const BtnIcon = btnConfig.icon;
    const badgeConfig = role ? ROLE_BADGE_CONFIG[role] : null;
    const BadgeIcon = badgeConfig?.icon;

    return (
      <Card
        key={programme.id}
        className={
          isDirect
            ? 'transition-all hover:shadow-gov-lg hover:border-government-gold/30'
            : 'transition-all border-dashed opacity-75 hover:opacity-100'
        }
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="h-3 w-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: pilier?.couleur }}
              />
              <CardTitle className="text-sm">{programme.codeProgramme}</CardTitle>
              {/* Bouton info programme */}
              <ProgrammeInfoButton
                programmeId={programme.id}
                role={role}
                justification={justification}
              />
              {/* Badge rôle / type de lien */}
              {badgeConfig && BadgeIcon && (
                <Badge variant="outline" className={badgeConfig.className}>
                  <BadgeIcon className="h-2.5 w-2.5 mr-0.5" />
                  {badgeConfig.label}
                </Badge>
              )}
            </div>
            {rapport && isDirect && (
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

          {/* Justification du lien indirect */}
          {!isDirect && justification && (
            <p className="text-[11px] text-muted-foreground italic">
              {justification}
            </p>
          )}

          {rapport && isDirect && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Complétude</span>
                <span className="font-medium">{completude}%</span>
              </div>
              <Progress value={completude} className="h-1.5" />
            </div>
          )}

          {rapport?.statutValidation === 'rejete' && rapport.motifRejet && isDirect && (
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20 text-xs text-red-700 dark:text-red-400">
              <span className="font-medium">Motif de rejet :</span> {rapport.motifRejet}
            </div>
          )}

          {/* Bouton d'action (saisie pour directs, info pour indirects) */}
          {isDirect && (
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
          )}
        </CardContent>
      </Card>
    );
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
        {userMinistere && allProgrammes && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-government-navy/5 dark:bg-government-navy/10 border border-government-navy/10">
            <Building2 className="h-5 w-5 text-government-navy dark:text-government-gold flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{userMinistere.nom}</p>
              <p className="text-xs text-muted-foreground">
                {directProgrammes.filter((p) => p.role === 'pilote').length} programme(s) pilote
                {directProgrammes.filter((p) => p.role === 'co-responsable').length > 0 &&
                  ` · ${directProgrammes.filter((p) => p.role === 'co-responsable').length} en co-responsabilité`
                }
                {stats.connexes > 0 && ` · ${stats.connexes} connexe(s)`}
              </p>
            </div>
          </div>
        )}

        {/* Stats rapides (directs uniquement) */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{stats.total} programme(s) direct(s)</Badge>
          <Badge variant="outline">{stats.saisis} saisi(s)</Badge>
          <Badge variant="outline" className="text-status-info border-status-info">
            <Send className="h-3 w-3 mr-1" />
            {stats.soumis} soumis
          </Badge>
          <Badge variant="outline" className="text-status-success border-status-success">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {stats.valides} validé(s)
          </Badge>
          {stats.rejetes > 0 && (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {stats.rejetes} rejeté(s)
            </Badge>
          )}
        </div>

        {/* Section 1 : Programmes directs (pilote / co-responsable) */}
        {directProgrammes.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold flex items-center gap-2 text-government-navy dark:text-government-gold">
              <FileEdit className="h-4 w-4" />
              Vos programmes (saisie mensuelle)
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {directProgrammes.map(renderProgrammeCard)}
            </div>
          </div>
        )}

        {/* Section 2 : Programmes connexes (indirects) */}
        {indirectProgrammes.length > 0 && (
          <div className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                <Link2 className="h-4 w-4" />
                Programmes connexes (contexte interministériel)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Programmes PAG liés à votre ministère par tutelle, partenariat technique ou même pilier présidentiel
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {indirectProgrammes.map(renderProgrammeCard)}
            </div>
          </div>
        )}

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
    </DashboardLayout>
  );
}
