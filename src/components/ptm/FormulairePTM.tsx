/**
 * SGG Digital — Formulaire PTM (2 étapes)
 * Créer/éditer initiatives PTM: Cadrage → Détails
 * Auto-save sessionStorage, calcul complétude, stepper UI
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
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  Settings,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ProgressGauge } from '@/components/reporting/ProgressGauge';
import type {
  InitiativePTM,
  RubriquePTM,
  CadrageStrategique,
} from '@/types/ptm';
import {
  RUBRIQUE_LABELS,
  CADRAGE_LABELS,
} from '@/types/ptm';
import { INITIATIVES_PTM, MINISTERES_PTM } from '@/data/ptmData';
import { PROGRAMMES } from '@/data/reportingData';

interface FormulairePTMProps {
  initiativeId?: string;
  onClose: () => void;
  onSave?: () => void;
}

interface FormData {
  // Étape 1: Cadrage
  rubrique: RubriquePTM;
  intitule: string;
  cadrage: CadrageStrategique;
  cadrageDetail: string;
  programmePAGId: string | null;
  // Étape 2: Détails
  incidenceFinanciere: boolean;
  loiFinance: boolean;
  servicesPorteurs: string[];
  dateTransmissionSGG: string;
  observations: string;
}

const STEPS = [
  { id: 0, label: 'Cadrage', icon: Settings, description: 'Rubrique, intitulé et cadrage' },
  { id: 1, label: 'Détails', icon: FileText, description: 'Financement et services porteurs' },
];

const STORAGE_KEY = (id?: string) => `ptm-form-${id || 'new'}`;

export function FormulairePTM({
  initiativeId,
  onClose,
  onSave,
}: FormulairePTMProps) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Charger initiative existante si applicable
  const existingInitiative = useMemo(() => {
    if (!initiativeId) return null;
    return INITIATIVES_PTM.find((i) => i.id === initiativeId);
  }, [initiativeId]);

  // Initialiser formData
  const [formData, setFormData] = useState<FormData>(() => {
    // Essayer sessionStorage d'abord
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY(initiativeId));
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }

    // Puis depuis initiative existante
    if (existingInitiative) {
      return {
        rubrique: existingInitiative.rubrique,
        intitule: existingInitiative.intitule,
        cadrage: existingInitiative.cadrage,
        cadrageDetail: existingInitiative.cadrageDetail,
        programmePAGId: existingInitiative.programmePAGId,
        incidenceFinanciere: existingInitiative.incidenceFinanciere,
        loiFinance: existingInitiative.loiFinance,
        servicesPorteurs: existingInitiative.servicesPorteurs,
        dateTransmissionSGG: existingInitiative.dateTransmissionSGG || '',
        observations: existingInitiative.observations,
      };
    }

    // Formulaire vide par défaut
    return {
      rubrique: 'projet_texte_legislatif',
      intitule: '',
      cadrage: 'sept_priorites',
      cadrageDetail: '',
      programmePAGId: null,
      incidenceFinanciere: false,
      loiFinance: false,
      servicesPorteurs: [],
      dateTransmissionSGG: '',
      observations: '',
    };
  });

  // Auto-save to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY(initiativeId), JSON.stringify(formData));
    } catch { /* ignore */ }
  }, [formData, initiativeId]);

  const updateField = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Calcul complétude (8 champs)
  const completude = useMemo(() => {
    let filled = 0;
    const total = 8;

    if (formData.rubrique) filled++;
    if (formData.intitule && formData.intitule.length >= 20) filled++;
    if (formData.cadrage) filled++;
    if (formData.cadrageDetail) filled++;
    if (formData.programmePAGId) filled++;
    if (formData.servicesPorteurs.length > 0) filled++;
    if (formData.dateTransmissionSGG) filled++;
    if (formData.observations) filled++;

    return Math.round((filled / total) * 100);
  }, [formData]);

  const handleSaveDraft = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success('Brouillon enregistré');
  };

  const handleSubmit = async () => {
    if (completude < 60) {
      toast.error('Complétude insuffisante (min. 60%)');
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);

    // Effacer sessionStorage
    try {
      sessionStorage.removeItem(STORAGE_KEY(initiativeId));
    } catch { /* ignore */ }

    toast.success('Initiative soumise au SGG');
    onSave?.();
    onClose();
  };

  const canSubmit = completude >= 60 && formData.intitule.length >= 20;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header info */}
      {existingInitiative && (
        <div className="flex items-center gap-2 flex-wrap pb-3 border-b">
          <Badge variant="outline">{existingInitiative.id}</Badge>
          <span className="text-sm font-medium text-muted-foreground">
            Édition initiative PTM
          </span>
        </div>
      )}

      {/* Stepper */}
      <div className="flex items-center gap-2">
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
              <span>{s.label}</span>
            </button>
          );
        })}
        <div className="ml-auto">
          <ProgressGauge value={completude} size="sm" className="w-24" />
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">
        {/* Étape 0: Cadrage */}
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Cadrage de l'Initiative
            </h3>

            {/* Rubrique */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Rubrique PTM <span className="text-status-danger">*</span>
              </label>
              <Select
                value={formData.rubrique}
                onValueChange={(v) => updateField('rubrique', v as RubriquePTM)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="projet_texte_legislatif">
                    {RUBRIQUE_LABELS.projet_texte_legislatif}
                  </SelectItem>
                  <SelectItem value="politique_generale">
                    {RUBRIQUE_LABELS.politique_generale}
                  </SelectItem>
                  <SelectItem value="missions_conferences">
                    {RUBRIQUE_LABELS.missions_conferences}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Intitulé */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Intitulé / Titre <span className="text-status-danger">*</span>
              </label>
              <Textarea
                value={formData.intitule}
                onChange={(e) => updateField('intitule', e.target.value)}
                placeholder="Titre détaillé de l'initiative (minimum 20 caractères)"
                rows={3}
                className={cn(
                  formData.intitule.length < 20 && 'border-status-warning'
                )}
              />
              <div className="text-xs text-muted-foreground">
                {formData.intitule.length}/20 caractères minimum
              </div>
            </div>

            {/* Cadrage Stratégique */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Cadrage Stratégique <span className="text-status-danger">*</span>
              </label>
              <Select
                value={formData.cadrage}
                onValueChange={(v) => updateField('cadrage', v as CadrageStrategique)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sept_priorites">{CADRAGE_LABELS.sept_priorites}</SelectItem>
                  <SelectItem value="pag">{CADRAGE_LABELS.pag}</SelectItem>
                  <SelectItem value="pncd">{CADRAGE_LABELS.pncd}</SelectItem>
                  <SelectItem value="pap">{CADRAGE_LABELS.pap}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cadrage Detail */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Détail du Cadrage <span className="text-status-danger">*</span>
              </label>
              <Input
                value={formData.cadrageDetail}
                onChange={(e) => updateField('cadrageDetail', e.target.value)}
                placeholder="Ex: 'Transformation numérique et modernisation gouvernance'"
              />
            </div>

            {/* Programme PAG */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Programme PAG (optionnel)</label>
              <Select
                value={formData.programmePAGId || 'none'}
                onValueChange={(v) =>
                  updateField('programmePAGId', v === 'none' ? null : v)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  {PROGRAMMES.map((prog) => (
                    <SelectItem key={prog.id} value={prog.id}>
                      {prog.codeProgramme} — {prog.libelleProgramme}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Étape 1: Détails */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Détails de l'Initiative
            </h3>

            {/* Incidence Financière */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Incidence Financière</label>
              <div className="flex gap-2">
                <Button
                  variant={formData.incidenceFinanciere ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateField('incidenceFinanciere', true)}
                >
                  Oui
                </Button>
                <Button
                  variant={!formData.incidenceFinanciere ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateField('incidenceFinanciere', false)}
                >
                  Non
                </Button>
              </div>
            </div>

            {/* Loi de Finance */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Loi de Finance</label>
              <div className="flex gap-2">
                <Button
                  variant={formData.loiFinance ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateField('loiFinance', true)}
                >
                  Oui
                </Button>
                <Button
                  variant={!formData.loiFinance ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateField('loiFinance', false)}
                >
                  Non
                </Button>
              </div>
            </div>

            {/* Services Porteurs */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Services Porteurs <span className="text-status-danger">*</span>
              </label>
              <div className="space-y-2 bg-muted/50 p-3 rounded-lg max-h-[200px] overflow-y-auto">
                {MINISTERES_PTM.map((min) => (
                  <label key={min.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.servicesPorteurs.includes(min.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateField('servicesPorteurs', [
                            ...formData.servicesPorteurs,
                            min.id,
                          ]);
                        } else {
                          updateField(
                            'servicesPorteurs',
                            formData.servicesPorteurs.filter((id) => id !== min.id)
                          );
                        }
                      }}
                    />
                    <span className="text-sm">
                      {min.sigle} — {min.nom}
                    </span>
                  </label>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                {formData.servicesPorteurs.length} service(s) sélectionné(s)
              </div>
            </div>

            {/* Date Transmission SGG */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Date Transmission SGG <span className="text-status-danger">*</span>
              </label>
              <Input
                type="date"
                value={formData.dateTransmissionSGG}
                onChange={(e) => updateField('dateTransmissionSGG', e.target.value)}
              />
            </div>

            {/* Observations */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Observations</label>
              <Textarea
                value={formData.observations}
                onChange={(e) => updateField('observations', e.target.value)}
                placeholder="Remarques supplémentaires, contexte, enjeux spécifiques..."
                rows={4}
              />
            </div>
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
          <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer brouillon'}
          </Button>

          {step < 1 ? (
            <Button onClick={() => setStep((s) => Math.min(1, s + 1))}>
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting || !canSubmit}
              className="bg-status-success hover:bg-status-success/90"
              title={
                !canSubmit ? 'Complétude insuffisante (min. 60%)' : undefined
              }
            >
              <Send className="h-4 w-4 mr-2" />
              {submitting ? 'Soumission...' : 'Soumettre au SGG'}
            </Button>
          )}
        </div>
      </div>

      {/* Completude indicator */}
      <Card className="bg-muted/50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Complétude du formulaire</span>
            <span className="text-sm font-bold tabular-nums">{completude}%</span>
          </div>
          <ProgressGauge value={completude} showLabel={false} size="sm" />
        </CardContent>
      </Card>
    </div>
  );
}

export default FormulairePTM;
