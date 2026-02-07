/**
 * SGG Digital — Pipeline visuel de validation workflow
 */

import React, { useState } from 'react';
import {
  FileEdit,
  Send,
  CheckCircle2,
  ShieldCheck,
  Check,
  X,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { StatutValidation } from '@/types/reporting';

interface WorkflowValidationProps {
  statutValidation: StatutValidation;
  onValiderSGG?: (commentaire?: string) => void;
  onValiderSGPR?: (commentaire?: string) => void;
  onRejeter?: (motif: string) => void;
  onSoumettre?: () => void;
  showActions?: boolean;
  className?: string;
}

interface StepDef {
  key: StatutValidation;
  label: string;
  icon: React.ElementType;
}

const WORKFLOW_STEPS: StepDef[] = [
  { key: 'brouillon', label: 'Brouillon', icon: FileEdit },
  { key: 'soumis', label: 'Soumis', icon: Send },
  { key: 'valide_sgg', label: 'Validé SGG', icon: CheckCircle2 },
  { key: 'valide_sgpr', label: 'Validé SGPR', icon: ShieldCheck },
];

const STEP_ORDER: Record<StatutValidation, number> = {
  brouillon: 0,
  soumis: 1,
  valide_sgg: 2,
  valide_sgpr: 3,
  rejete: -1,
};

export function WorkflowValidation({
  statutValidation,
  onValiderSGG,
  onValiderSGPR,
  onRejeter,
  onSoumettre,
  showActions = true,
  className,
}: WorkflowValidationProps) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [motifRejet, setMotifRejet] = useState('');
  const [commentaire, setCommentaire] = useState('');

  const currentStep = STEP_ORDER[statutValidation];
  const isRejected = statutValidation === 'rejete';

  const handleReject = () => {
    if (motifRejet.trim() && onRejeter) {
      onRejeter(motifRejet.trim());
      setMotifRejet('');
      setRejectDialogOpen(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stepper */}
      <div className="flex items-center justify-between">
        {WORKFLOW_STEPS.map((step, index) => {
          const stepIndex = index;
          const isCompleted = !isRejected && stepIndex < currentStep;
          const isCurrent = !isRejected && stepIndex === currentStep;
          const isFuture = isRejected || stepIndex > currentStep;
          const StepIcon = step.icon;

          return (
            <React.Fragment key={step.key}>
              {/* Step */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                    isCompleted && 'border-status-success bg-status-success text-white',
                    isCurrent && 'border-primary bg-primary text-primary-foreground shadow-md',
                    isFuture && 'border-muted bg-muted text-muted-foreground',
                    isRejected && isCurrent && 'border-status-danger bg-status-danger text-white'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium',
                    isCompleted && 'text-status-success',
                    isCurrent && 'text-foreground font-semibold',
                    isFuture && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector */}
              {index < WORKFLOW_STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 flex items-center justify-center -mt-5',
                    stepIndex < currentStep ? 'text-status-success' : 'text-muted'
                  )}
                >
                  <div
                    className={cn(
                      'h-0.5 flex-1 mx-2',
                      stepIndex < currentStep ? 'bg-status-success' : 'bg-muted'
                    )}
                  />
                  <ArrowRight className="h-4 w-4 shrink-0 -ml-1" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Rejected banner */}
      {isRejected && (
        <div className="flex items-center gap-2 rounded-lg border border-status-danger/20 bg-status-danger/10 px-4 py-2 text-sm text-status-danger">
          <X className="h-4 w-4 shrink-0" />
          <span className="font-medium">
            Ce rapport a été rejeté. Veuillez corriger et resoumettre.
          </span>
        </div>
      )}

      {/* Action buttons */}
      {showActions && (
        <div className="flex flex-wrap items-center gap-3">
          {(statutValidation === 'brouillon' || statutValidation === 'rejete') && onSoumettre && (
            <Button onClick={onSoumettre} className="gap-2">
              <Send className="h-4 w-4" />
              Soumettre
            </Button>
          )}

          {statutValidation === 'soumis' && onValiderSGG && (
            <Button
              onClick={() => onValiderSGG(commentaire || undefined)}
              variant="default"
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Valider SGG
            </Button>
          )}

          {statutValidation === 'valide_sgg' && onValiderSGPR && (
            <Button
              onClick={() => onValiderSGPR(commentaire || undefined)}
              variant="default"
              className="gap-2 bg-status-success hover:bg-status-success/90"
            >
              <ShieldCheck className="h-4 w-4" />
              Valider SGPR
            </Button>
          )}

          {(statutValidation === 'soumis' || statutValidation === 'valide_sgg') && onRejeter && (
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <X className="h-4 w-4" />
                  Rejeter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rejeter le rapport</DialogTitle>
                  <DialogDescription>
                    Veuillez indiquer le motif du rejet. Ce motif sera communiqué au ministère concerné.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <label htmlFor="motif-rejet" className="mb-2 block text-sm font-medium">
                    Motif du rejet *
                  </label>
                  <textarea
                    id="motif-rejet"
                    value={motifRejet}
                    onChange={(e) => setMotifRejet(e.target.value)}
                    placeholder="Expliquez la raison du rejet..."
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button variant="destructive" onClick={handleReject} disabled={!motifRejet.trim()}>
                    Confirmer le rejet
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {(statutValidation === 'soumis' || statutValidation === 'valide_sgg') && (
            <input
              type="text"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Commentaire (optionnel)..."
              className="h-10 flex-1 min-w-[200px] rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          )}
        </div>
      )}
    </div>
  );
}

export default WorkflowValidation;
