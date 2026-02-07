/**
 * SGG Digital — Formulaire de Reporting Mensuel
 * Formulaire 4 étapes: Opérationnel → Financier → Performance → Récapitulatif
 * Auto-calcul taux exécution financière, auto-save sessionStorage
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import {
  ClipboardList,
  Banknote,
  TrendingUp,
  CheckCircle2,
  Save,
  Send,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ProgressGauge } from './ProgressGauge';
import { StatutBadge } from './StatutBadge';
import {
  PROGRAMMES,
  GOUVERNANCES,
  PILIERS,
  RAPPORTS_MENSUELS,
} from '@/data/reportingData';
import type { StatutProgramme } from '@/types/reporting';

interface FormulaireReportingMensuelProps {
  programmeId: string;
  mois: number;
  annee: number;
  onClose: () => void;
}

interface FormData {
  // Bloc Opérationnel (cols 10-12)
  dateDebut: string;
  dateFin: string;
  activitesRealisees: string;
  // Bloc Financier (cols 13-16)
  budgetMdFcfa: number;
  engageMdFcfa: number;
  decaisseMdFcfa: number;
  pctExecutionFinanciere: number;
  // Bloc Juridique (col 17)
  encadrementJuridique: string;
  // Bloc Performance (cols 18-21)
  indicateursKpi: string;
  pctAvancementPhysique: number;
  statutProgramme: StatutProgramme;
  observationsContraintes: string;
}

const STEPS = [
  { id: 0, label: 'Opérationnel', icon: ClipboardList, description: 'Activités et calendrier' },
  { id: 1, label: 'Financier', icon: Banknote, description: 'Budget, engagements, décaissements' },
  { id: 2, label: 'Performance', icon: TrendingUp, description: 'KPI, avancement, statut' },
  { id: 3, label: 'Récapitulatif', icon: CheckCircle2, description: 'Vérification et soumission' },
];

const STORAGE_KEY = (progId: string, mois: number, annee: number) =>
  `sgg_form_${progId}_${mois}_${annee}`;

export function FormulaireReportingMensuel({
  programmeId,
  mois,
  annee,
  onClose,
}: FormulaireReportingMensuelProps) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const programme = useMemo(
    () => PROGRAMMES.find((p) => p.id === programmeId),
    [programmeId]
  );
  const gouvernance = useMemo(
    () => GOUVERNANCES.find((g) => g.programmeId === programmeId),
    [programmeId]
  );
  const pilier = useMemo(
    () => programme ? PILIERS.find((p) => p.id === programme.pilierId) : null,
    [programme]
  );
  const existingRapport = useMemo(
    () => RAPPORTS_MENSUELS.find(
      (r) => r.programmeId === programmeId && r.periodeMois === mois && r.periodeAnnee === annee
    ),
    [programmeId, mois, annee]
  );

  // Initialize form from existing rapport or sessionStorage
  const [formData, setFormData] = useState<FormData>(() => {
    // Try sessionStorage first
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY(programmeId, mois, annee));
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }

    // Then from existing rapport
    if (existingRapport) {
      return {
        dateDebut: existingRapport.dateDebut || '',
        dateFin: existingRapport.dateFin || '',
        activitesRealisees: existingRapport.activitesRealisees,
        budgetMdFcfa: existingRapport.budgetMdFcfa,
        engageMdFcfa: existingRapport.engageMdFcfa,
        decaisseMdFcfa: existingRapport.decaisseMdFcfa,
        pctExecutionFinanciere: existingRapport.pctExecutionFinanciere,
        encadrementJuridique: existingRapport.encadrementJuridique,
        indicateursKpi: existingRapport.indicateursKpi,
        pctAvancementPhysique: existingRapport.pctAvancementPhysique,
        statutProgramme: existingRapport.statutProgramme,
        observationsContraintes: existingRapport.observationsContraintes,
      };
    }

    // Empty form
    return {
      dateDebut: '',
      dateFin: '',
      activitesRealisees: '',
      budgetMdFcfa: 0,
      engageMdFcfa: 0,
      decaisseMdFcfa: 0,
      pctExecutionFinanciere: 0,
      encadrementJuridique: '',
      indicateursKpi: '',
      pctAvancementPhysique: 0,
      statutProgramme: 'en_cours' as StatutProgramme,
      observationsContraintes: '',
    };
  });

  // Auto-calculate % execution financière
  useEffect(() => {
    if (formData.budgetMdFcfa > 0) {
      const pct = Math.round((formData.decaisseMdFcfa / formData.budgetMdFcfa) * 1000) / 10;
      setFormData((prev) => ({ ...prev, pctExecutionFinanciere: Math.min(pct, 100) }));
    }
  }, [formData.decaisseMdFcfa, formData.budgetMdFcfa]);

  // Auto-save to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY(programmeId, mois, annee),
        JSON.stringify(formData)
      );
    } catch { /* ignore */ }
  }, [formData, programmeId, mois, annee]);

  const updateField = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const completude = useMemo(() => {
    let filled = 0;
    const total = 8;
    if (formData.activitesRealisees) filled++;
    if (formData.dateDebut) filled++;
    if (formData.budgetMdFcfa > 0) filled++;
    if (formData.engageMdFcfa > 0) filled++;
    if (formData.decaisseMdFcfa > 0) filled++;
    if (formData.indicateursKpi) filled++;
    if (formData.pctAvancementPhysique > 0) filled++;
    if (formData.observationsContraintes) filled++;
    return Math.round((filled / total) * 100);
  }, [formData]);

  const handleSaveDraft = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success('Brouillon enregistré');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    // Clear sessionStorage
    try {
      sessionStorage.removeItem(STORAGE_KEY(programmeId, mois, annee));
    } catch { /* ignore */ }
    toast.success('Rapport soumis pour validation');
    onClose();
  };

  if (!programme || !gouvernance || !pilier) {
    return <div className="p-4 text-sm text-muted-foreground">Programme non trouvé</div>;
  }

  const isReadOnly =
    existingRapport?.statutValidation === 'valide_sgpr' ||
    existingRapport?.statutValidation === 'valide_sgg';

  return (
    <div className="space-y-6">
      {/* Header info */}
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className="h-3 w-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: pilier.couleur }}
        />
        <Badge variant="outline">{programme.codeProgramme}</Badge>
        <span className="text-sm font-medium">{programme.libelleProgramme}</span>
        {existingRapport && (
          <StatutBadge type="validation" statut={existingRapport.statutValidation} size="md" />
        )}
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 border-b pb-4">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isCurrent = i === step;
          const isCompleted = i < step;

          return (
            <button
              key={s.id}
              onClick={() => setStep(i)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                isCurrent && 'bg-primary text-primary-foreground',
                isCompleted && 'bg-status-success/10 text-status-success',
                !isCurrent && !isCompleted && 'text-muted-foreground hover:bg-muted'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden md:inline">{s.label}</span>
              <span className="md:hidden">{i + 1}</span>
            </button>
          );
        })}
        <div className="ml-auto">
          <ProgressGauge value={completude} size="sm" className="w-24" />
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[300px]">
        {/* Step 0: Opérationnel */}
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Suivi Opérationnel</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Début</label>
                <Input
                  type="date"
                  value={formData.dateDebut}
                  onChange={(e) => updateField('dateDebut', e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Fin</label>
                <Input
                  type="date"
                  value={formData.dateFin}
                  onChange={(e) => updateField('dateFin', e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Activités Réalisées (Période)</label>
              <Textarea
                value={formData.activitesRealisees}
                onChange={(e) => updateField('activitesRealisees', e.target.value)}
                placeholder="Décrivez les activités réalisées au cours de cette période..."
                rows={5}
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Encadrement Législatif / Réglementaire</label>
              <Textarea
                value={formData.encadrementJuridique}
                onChange={(e) => updateField('encadrementJuridique', e.target.value)}
                placeholder="Textes juridiques, décrets, arrêtés..."
                rows={3}
                disabled={isReadOnly}
              />
            </div>
          </div>
        )}

        {/* Step 1: Financier */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Suivi Financier</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Budget (Md FCFA)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.budgetMdFcfa || ''}
                  onChange={(e) => updateField('budgetMdFcfa', parseFloat(e.target.value) || 0)}
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Engagé (Md FCFA)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.engageMdFcfa || ''}
                  onChange={(e) => updateField('engageMdFcfa', parseFloat(e.target.value) || 0)}
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Décaissé (Md FCFA)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.decaisseMdFcfa || ''}
                  onChange={(e) => updateField('decaisseMdFcfa', parseFloat(e.target.value) || 0)}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {/* Auto-calculated gauge */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">% Exécution Financière (auto-calculé)</span>
                  <span className="text-lg font-bold tabular-nums">
                    {formData.pctExecutionFinanciere}%
                  </span>
                </div>
                <ProgressGauge value={formData.pctExecutionFinanciere} showLabel={false} size="lg" />
                {formData.decaisseMdFcfa > formData.engageMdFcfa && (
                  <p className="text-xs text-status-danger mt-2">
                    Anomalie: le décaissé est supérieur à l'engagé
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Performance */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Performance & Évaluation</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Indicateurs de Performance (KPI)</label>
              <Textarea
                value={formData.indicateursKpi}
                onChange={(e) => updateField('indicateursKpi', e.target.value)}
                placeholder="Listez les indicateurs clés et leurs valeurs..."
                rows={4}
                disabled={isReadOnly}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">% Avancement Physique</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.pctAvancementPhysique || ''}
                  onChange={(e) =>
                    updateField('pctAvancementPhysique', Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))
                  }
                  disabled={isReadOnly}
                />
                <ProgressGauge value={formData.pctAvancementPhysique} size="sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Statut du Programme</label>
                <Select
                  value={formData.statutProgramme}
                  onValueChange={(v) => updateField('statutProgramme', v as StatutProgramme)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="en_preparation">En préparation</SelectItem>
                    <SelectItem value="retard">En retard</SelectItem>
                    <SelectItem value="termine">Terminé</SelectItem>
                    <SelectItem value="bloque">Bloqué</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Observations / Contraintes</label>
              <Textarea
                value={formData.observationsContraintes}
                onChange={(e) => updateField('observationsContraintes', e.target.value)}
                placeholder="Difficultés, risques, recommandations..."
                rows={4}
                disabled={isReadOnly}
              />
            </div>
          </div>
        )}

        {/* Step 3: Récapitulatif */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Récapitulatif</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Card>
                <CardContent className="p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground">Opérationnel</h4>
                  <p className="text-xs">Période: {formData.dateDebut || '—'} → {formData.dateFin || '—'}</p>
                  <p className="text-xs line-clamp-3">{formData.activitesRealisees || 'Non renseigné'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground">Financier</h4>
                  <p className="text-xs">Budget: {formData.budgetMdFcfa} Md FCFA</p>
                  <p className="text-xs">Engagé: {formData.engageMdFcfa} Md | Décaissé: {formData.decaisseMdFcfa} Md</p>
                  <p className="text-xs font-medium">Exéc. Financière: {formData.pctExecutionFinanciere}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground">Performance</h4>
                  <p className="text-xs">Avancement: {formData.pctAvancementPhysique}%</p>
                  <p className="text-xs">Statut: {formData.statutProgramme}</p>
                  <p className="text-xs line-clamp-2">{formData.indicateursKpi || 'Non renseigné'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground">Complétude</h4>
                  <ProgressGauge value={completude} size="lg" label="Remplissage global" />
                </CardContent>
              </Card>
            </div>

            {formData.observationsContraintes && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Observations</h4>
                  <p className="text-xs">{formData.observationsContraintes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Navigation & Actions */}
      <div className="flex items-center justify-between border-t pt-4">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Précédent
        </Button>

        <div className="flex items-center gap-2">
          {!isReadOnly && (
            <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Enregistrement...' : 'Brouillon'}
            </Button>
          )}

          {step < 3 ? (
            <Button onClick={() => setStep((s) => Math.min(3, s + 1))}>
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : !isReadOnly ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting || completude < 50}
              className="bg-status-success hover:bg-status-success/90"
            >
              <Send className="h-4 w-4 mr-2" />
              {submitting ? 'Soumission...' : 'Soumettre le rapport'}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default FormulaireReportingMensuel;
