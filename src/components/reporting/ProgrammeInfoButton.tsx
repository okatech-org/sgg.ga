/**
 * SGG Digital — Bouton Info Programme
 * Affiche les détails complets d'un programme PAG dans un Sheet latéral.
 * Pattern similaire à InfoButton.tsx mais avec données dynamiques par programme.
 */

import { useState, useMemo } from 'react';
import { Info, Target, Crown, Users, Globe2, Handshake, Shield, Users2, Layers, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  PROGRAMMES,
  GOUVERNANCES,
  PILIERS,
} from '@/data/reportingData';
import type { RoleLienProgramme } from '@/data/reportingData';

interface ProgrammeInfoButtonProps {
  programmeId: string;
  /** Rôle du ministère connecté vis-à-vis de ce programme */
  role?: RoleLienProgramme;
  /** Justification du lien (pour les liens indirects) */
  justification?: string;
  className?: string;
}

const ROLE_CONFIG: Record<string, { label: string; icon: React.ElementType; colorClass: string }> = {
  pilote: { label: 'Pilote', icon: Shield, colorClass: 'bg-government-navy/10 text-government-navy dark:bg-government-gold/10 dark:text-government-gold' },
  'co-responsable': { label: 'Co-responsable', icon: Users2, colorClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' },
  meme_pilier: { label: 'Même pilier', icon: Layers, colorClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400' },
  tutelle_directions: { label: 'Tutelle / Directions', icon: Building2, colorClass: 'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400' },
  partenaire_technique: { label: 'Partenaire technique', icon: Handshake, colorClass: 'bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400' },
};

export function ProgrammeInfoButton({ programmeId, role, justification, className }: ProgrammeInfoButtonProps) {
  const [open, setOpen] = useState(false);

  const programme = useMemo(() => PROGRAMMES.find((p) => p.id === programmeId), [programmeId]);
  const gouvernance = useMemo(() => GOUVERNANCES.find((g) => g.programmeId === programmeId), [programmeId]);
  const pilier = useMemo(
    () => (programme ? PILIERS.find((p) => p.id === programme.pilierId) : null),
    [programme],
  );

  if (!programme || !gouvernance || !pilier) return null;

  const roleConfig = role ? ROLE_CONFIG[role] : null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-6 w-6 rounded-full border border-muted-foreground/20 hover:border-government-gold hover:bg-government-gold/10',
          className,
        )}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label={`Informations sur ${programme.codeProgramme}`}
      >
        <Info className="h-3 w-3" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${pilier.couleur}20` }}
              >
                <Target className="h-5 w-5" style={{ color: pilier.couleur }} />
              </div>
              <div>
                <SheetTitle className="text-lg flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{programme.codeProgramme}</Badge>
                  {programme.libelleProgramme}
                </SheetTitle>
                <SheetDescription className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: pilier.couleur }} />
                  Pilier {pilier.id} : {pilier.nom}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            {/* Votre lien avec ce programme */}
            {roleConfig && (
              <>
                <section className={cn('rounded-lg p-3 border', roleConfig.colorClass)}>
                  <div className="flex items-center gap-2 mb-1">
                    <roleConfig.icon className="h-4 w-4" />
                    <span className="text-sm font-semibold">Votre lien : {roleConfig.label}</span>
                  </div>
                  {justification && (
                    <p className="text-xs opacity-80">{justification}</p>
                  )}
                </section>
                <Separator />
              </>
            )}

            {/* Mesure présidentielle */}
            <section>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Crown className="h-4 w-4 text-government-gold" />
                Mesure présidentielle
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {programme.mesurePresidentielle}
              </p>
            </section>

            <Separator />

            {/* Objectif stratégique */}
            <section>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-government-gold" />
                Objectif stratégique
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {programme.objectifStrategique}
              </p>
            </section>

            <Separator />

            {/* Résultats attendus */}
            <section>
              <h3 className="text-sm font-semibold mb-2">Résultats attendus</h3>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {programme.resultatsAttendus}
                </p>
              </div>
            </section>

            {/* Actions / Projets */}
            <section>
              <h3 className="text-sm font-semibold mb-2">Actions & Projets</h3>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {programme.actionsProjets}
                </p>
              </div>
            </section>

            <Separator />

            {/* Gouvernance */}
            <section>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-government-gold" />
                Gouvernance
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm">{gouvernance.ministerePiloteNom}</span>
                  <Badge className="text-xs bg-government-navy text-white">Pilote</Badge>
                </div>
                {gouvernance.ministeresCoResponsables.map((nom, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <span className="text-sm">{nom}</span>
                    <Badge variant="secondary" className="text-xs">Co-responsable</Badge>
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            {/* Partenaires techniques et financiers */}
            {gouvernance.partenairesPTF.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Globe2 className="h-4 w-4 text-government-gold" />
                  Partenaires Techniques & Financiers (PTF)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {gouvernance.partenairesPTF.map((ptf, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {ptf}
                    </Badge>
                  ))}
                </div>
              </section>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
