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
  RubriquePTM,
  CadrageStrategique,
} from '@/types/ptm';
import {
  RUBRIQUE_LABELS,
  CADRAGE_LABELS,
} from '@/types/ptm';
import { MINISTERES_PTM } from '@/data/ptmData';
import { PROGRAMMES } from '@/data/reportingData';
import { usePTMStore } from '@/stores/ptmStore';
import type { FormDataPTM } from '@/stores/ptmStore';
import { useDemoUser } from '@/hooks/useDemoUser';

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
  { id: 0, label: 'Cadrage', icon: Settings, description: 'Col. 1-4 : Rubrique, intitulé, cadrage stratégique' },
  { id: 1, label: 'Opérationnel', icon: FileText, description: 'Col. 5-9 : Finance, services, date, observations' },
];

const STORAGE_KEY = (id?: string) => `ptm-form-${id || 'new'}`;

export function FormulairePTM({
  initiativeId: initialInitiativeId,
  onClose,
  onSave,
}: FormulairePTMProps) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Track current initiative ID (may change from null → real ID after first save)
  const [currentInitiativeId, setCurrentInitiativeId] = useState<string | undefined>(initialInitiativeId);

  // Store PTM
  const { saveDraft: storeSaveDraft, submitToSG, getInitiative } = usePTMStore();
  const { demoUser } = useDemoUser();

  // Charger initiative existante depuis le STORE (pas depuis les mock statiques)
  const existingInitiative = useMemo(() => {
    if (!currentInitiativeId) return null;
    return getInitiative(currentInitiativeId) || null;
  }, [currentInitiativeId, getInitiative]);

  // Initialiser formData
  const [formData, setFormData] = useState<FormData>(() => {
    // Essayer sessionStorage d'abord
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY(currentInitiativeId));
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
      sessionStorage.setItem(STORAGE_KEY(currentInitiativeId), JSON.stringify(formData));
    } catch { /* ignore */ }
  }, [formData, currentInitiativeId]);

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
    try {
      const ministereId = demoUser?.ministereId || 'MIN-ECO';
      const directionId = demoUser?.id || 'direction-default';

      const storeFormData: FormDataPTM = {
        rubrique: formData.rubrique,
        intitule: formData.intitule,
        cadrage: formData.cadrage,
        cadrageDetail: formData.cadrageDetail,
        programmePAGId: formData.programmePAGId,
        incidenceFinanciere: formData.incidenceFinanciere,
        loiFinance: formData.loiFinance,
        servicesPorteurs: formData.servicesPorteurs,
        dateTransmissionSGG: formData.dateTransmissionSGG,
        observations: formData.observations,
      };

      const saved = storeSaveDraft(
        currentInitiativeId || null,
        ministereId,
        directionId,
        storeFormData,
      );

      // Si c'est une création, mémoriser l'ID pour passer en mode édition
      if (!currentInitiativeId) {
        setCurrentInitiativeId(saved.id);
      }

      toast.success('Brouillon enregistré', {
        description: `Initiative ${saved.id} sauvegardée.`,
      });
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (completude < 60) {
      toast.error('Complétude insuffisante (min. 60%)');
      return;
    }

    setSubmitting(true);
    try {
      const ministereId = demoUser?.ministereId || 'MIN-ECO';
      const directionId = demoUser?.id || 'direction-default';
      const userId = demoUser?.id || 'anonymous';
      const userName = demoUser?.title || 'Utilisateur';

      const storeFormData: FormDataPTM = {
        rubrique: formData.rubrique,
        intitule: formData.intitule,
        cadrage: formData.cadrage,
        cadrageDetail: formData.cadrageDetail,
        programmePAGId: formData.programmePAGId,
        incidenceFinanciere: formData.incidenceFinanciere,
        loiFinance: formData.loiFinance,
        servicesPorteurs: formData.servicesPorteurs,
        dateTransmissionSGG: formData.dateTransmissionSGG,
        observations: formData.observations,
      };

      // 1. Sauvegarder d'abord
      const saved = storeSaveDraft(
        currentInitiativeId || null,
        ministereId,
        directionId,
        storeFormData,
      );

      // 2. Soumettre au SG
      submitToSG(saved.id, userId, userName);

      // 3. Nettoyer sessionStorage
      try {
        sessionStorage.removeItem(STORAGE_KEY(currentInitiativeId));
      } catch { /* ignore */ }

      toast.success('Initiative soumise au SG du Ministère', {
        description: 'La matrice a été transmise pour consolidation.',
      });
      onSave?.();
      onClose();
    } catch (err) {
      toast.error('Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
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
              Colonnes 1-4 : Cadrage de l'Initiative
            </h3>

            {/* Col 1 — Rubrique */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                <Badge variant="outline" className="mr-1.5 text-[10px]">Col. 1</Badge>
                Rubrique <span className="text-status-danger">*</span>
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

            {/* Col 3 — Intitulé de l'affaire (Col 2 = N° auto-incrémenté) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                <Badge variant="outline" className="mr-1.5 text-[10px]">Col. 3</Badge>
                Intitulé de l'affaire <span className="text-status-danger">*</span>
              </label>
              <p className="text-[11px] text-muted-foreground -mt-1">
                Le N° d'ordre (Col. 2) est attribué automatiquement par rubrique
              </p>
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

            {/* Col 4 — Cadrage Stratégique (2 sous-colonnes) */}
            <div className="space-y-3 rounded-lg border p-3 bg-muted/30">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                <Badge variant="outline" className="mr-1 text-[10px]">Col. 4</Badge>
                Cadrage Stratégique
                <span className="text-[10px] text-muted-foreground font-normal ml-1">
                  (7 Priorités présidentielles, PAG, PNCD, PAP)
                </span>
              </label>

              {/* Sous-colonne A: Cadrage */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Cadrage <span className="text-status-danger">*</span>
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

              {/* Sous-colonne B: Programme */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Programme / Axe PAG
                </label>
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
                    <SelectItem value="none">Aucun programme lié</SelectItem>
                    {PROGRAMMES.map((prog) => (
                      <SelectItem key={prog.id} value={prog.id}>
                        {prog.codeProgramme} — {prog.libelleProgramme}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Étape 1: Opérationnel (Col. 5-9) */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Colonnes 5-9 : Détails Opérationnels
            </h3>

            {/* Col 5 & 6 — Incidence Financière + Loi de Finance (côte à côte) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Col 5 — Incidence Financière */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  <Badge variant="outline" className="mr-1.5 text-[10px]">Col. 5</Badge>
                  Incidence Financière
                </label>
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

              {/* Col 6 — Loi de Finance */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  <Badge variant="outline" className="mr-1.5 text-[10px]">Col. 6</Badge>
                  Loi de Finance (LF)
                </label>
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
            </div>

            {/* Col 7 — Services Porteurs */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                <Badge variant="outline" className="mr-1.5 text-[10px]">Col. 7</Badge>
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

            {/* Col 8 — Date Transmission SGG */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                <Badge variant="outline" className="mr-1.5 text-[10px]">Col. 8</Badge>
                Date de Transmission au SGG <span className="text-status-danger">*</span>
              </label>
              <Input
                type="date"
                value={formData.dateTransmissionSGG}
                onChange={(e) => updateField('dateTransmissionSGG', e.target.value)}
              />
            </div>

            {/* Col 9 — Observations */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                <Badge variant="outline" className="mr-1.5 text-[10px]">Col. 9</Badge>
                Observations
              </label>
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
