/**
 * SGG Digital — Table PTM (10 colonnes)
 * Affiche les initiatives PTM avec pagination, synthèse, et navigation
 * Colonnes: Rubrique, N°, Intitulé, Cadrage, Inc. Fin., LF, Services Porteurs, Date SGG, Statut, Observations
 */

import { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InitiativePTM, RubriquePTM } from '@/types/ptm';
import {
  RUBRIQUE_SHORT_LABELS,
  RUBRIQUE_COLORS,
  CADRAGE_SHORT_LABELS,
} from '@/types/ptm';
import { PTMStatutBadge } from './PTMStatutBadge';

interface PTMTableProps {
  data: InitiativePTM[];
  onRowClick?: (initiative: InitiativePTM) => void;
}

const ITEMS_PER_PAGE = 10;

export function PTMTable({ data, onRowClick }: PTMTableProps) {
  const [page, setPage] = useState(0);

  // Tri par rubrique, puis par numéro
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const rubriquesOrder: Record<RubriquePTM, number> = {
        projet_texte_legislatif: 0,
        politique_generale: 1,
        missions_conferences: 2,
      };
      const rubriqueCompare = rubriquesOrder[a.rubrique] - rubriquesOrder[b.rubrique];
      if (rubriqueCompare !== 0) return rubriqueCompare;
      return a.numero - b.numero;
    });
  }, [data]);

  const paginatedData = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    return sortedData.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedData, page]);

  // Calcul synthèse
  const synthesis = useMemo(() => {
    const byRubrique: Record<RubriquePTM, number> = {
      projet_texte_legislatif: 0,
      politique_generale: 0,
      missions_conferences: 0,
    };
    let inscritePTG = 0;

    sortedData.forEach((init) => {
      byRubrique[init.rubrique]++;
      if (init.statut === 'inscrit_ptg') inscritePTG++;
    });

    return { byRubrique, inscritePTG, total: sortedData.length };
  }, [sortedData]);

  const maxPage = Math.ceil(sortedData.length / ITEMS_PER_PAGE);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '…' : text;
  };

  return (
    <div className="space-y-4">
      <TooltipProvider>
        <ScrollArea className="border rounded-lg" style={{ minWidth: '1400px' }}>
          <Table className="w-full">
            <TableHeader className="sticky top-0 bg-muted/50 z-10">
              <TableRow>
                {/* Col 1: Rubrique */}
                <TableHead className="bg-blue-50 dark:bg-blue-950/30 border-r font-semibold text-xs">
                  Rubrique
                </TableHead>
                {/* Col 2: N° */}
                <TableHead className="bg-blue-50 dark:bg-blue-950/30 border-r font-semibold text-xs w-12 sticky left-0 z-20">
                  N°
                </TableHead>
                {/* Col 3: Intitulé */}
                <TableHead className="bg-green-50 dark:bg-green-950/30 border-r font-semibold text-xs">
                  Intitulé
                </TableHead>
                {/* Col 4: Cadrage */}
                <TableHead className="bg-green-50 dark:bg-green-950/30 border-r font-semibold text-xs">
                  Cadrage
                </TableHead>
                {/* Col 5: Inc. Fin. */}
                <TableHead className="bg-amber-50 dark:bg-amber-950/30 border-r font-semibold text-xs">
                  Inc. Fin.
                </TableHead>
                {/* Col 6: LF */}
                <TableHead className="bg-amber-50 dark:bg-amber-950/30 border-r font-semibold text-xs">
                  LF
                </TableHead>
                {/* Col 7: Services Porteurs */}
                <TableHead className="bg-purple-50 dark:bg-purple-950/30 border-r font-semibold text-xs">
                  Services Porteurs
                </TableHead>
                {/* Col 8: Date SGG */}
                <TableHead className="bg-purple-50 dark:bg-purple-950/30 border-r font-semibold text-xs">
                  Date SGG
                </TableHead>
                {/* Col 9: Statut */}
                <TableHead className="bg-red-50 dark:bg-red-950/30 border-r font-semibold text-xs">
                  Statut
                </TableHead>
                {/* Col 10: Observations */}
                <TableHead className="bg-red-50 dark:bg-red-950/30 font-semibold text-xs">
                  Observations
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((initiative) => (
                <TableRow
                  key={initiative.id}
                  onClick={() => onRowClick?.(initiative)}
                  className={cn(
                    'hover:bg-muted/50 transition-colors cursor-pointer',
                    onRowClick ? 'cursor-pointer' : ''
                  )}
                >
                  {/* Col 1: Rubrique */}
                  <TableCell className="text-xs py-2">
                    <Badge
                      variant="outline"
                      className="text-white border-0 whitespace-nowrap"
                      style={{
                        backgroundColor: RUBRIQUE_COLORS[initiative.rubrique],
                      }}
                    >
                      {RUBRIQUE_SHORT_LABELS[initiative.rubrique]}
                    </Badge>
                  </TableCell>

                  {/* Col 2: N° */}
                  <TableCell className="text-xs py-2 font-mono font-semibold sticky left-0 bg-inherit z-10">
                    {initiative.numero}
                  </TableCell>

                  {/* Col 3: Intitulé */}
                  <TableCell className="text-xs py-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="max-w-[200px] truncate cursor-help">
                          {truncateText(initiative.intitule, 60)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        {initiative.intitule}
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>

                  {/* Col 4: Cadrage */}
                  <TableCell className="text-xs py-2">
                    <Badge variant="outline" className="text-xs">
                      {CADRAGE_SHORT_LABELS[initiative.cadrage]}
                    </Badge>
                  </TableCell>

                  {/* Col 5: Inc. Fin. */}
                  <TableCell className="text-xs py-2">
                    <Badge
                      variant="outline"
                      className={
                        initiative.incidenceFinanciere
                          ? 'bg-status-success/10 text-status-success border-status-success/20'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {initiative.incidenceFinanciere ? 'Oui' : 'Non'}
                    </Badge>
                  </TableCell>

                  {/* Col 6: LF */}
                  <TableCell className="text-xs py-2">
                    <Badge
                      variant="outline"
                      className={
                        initiative.loiFinance
                          ? 'bg-status-success/10 text-status-success border-status-success/20'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {initiative.loiFinance ? 'Oui' : 'Non'}
                    </Badge>
                  </TableCell>

                  {/* Col 7: Services Porteurs */}
                  <TableCell className="text-xs py-2">
                    <div className="flex flex-wrap gap-1">
                      {initiative.servicesPorteurs.length > 0 ? (
                        <>
                          {initiative.servicesPorteurs.slice(0, 2).map((sigle) => {
                            const nom = initiative.servicesPorteursNoms[
                              initiative.servicesPorteurs.indexOf(sigle)
                            ];
                            return (
                              <Tooltip key={sigle}>
                                <TooltipTrigger asChild>
                                  <Badge variant="secondary" className="text-[9px]">
                                    {sigle}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  {nom}
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                          {initiative.servicesPorteurs.length > 2 && (
                            <Badge variant="secondary" className="text-[9px]">
                              +{initiative.servicesPorteurs.length - 2}
                            </Badge>
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Col 8: Date SGG */}
                  <TableCell className="text-xs py-2 font-mono">
                    {formatDate(initiative.dateTransmissionSGG)}
                  </TableCell>

                  {/* Col 9: Statut */}
                  <TableCell className="text-xs py-2">
                    <PTMStatutBadge statut={initiative.statut} size="sm" />
                  </TableCell>

                  {/* Col 10: Observations */}
                  <TableCell className="text-xs py-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="max-w-[150px] truncate cursor-help">
                          {truncateText(initiative.observations, 40)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        {initiative.observations || '(Vide)'}
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Synthèse et pagination */}
        <div className="space-y-3">
          {/* Synthèse */}
          <div className="bg-muted/50 p-3 rounded-lg space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold">Synthèse</span>
              <span className="text-muted-foreground">
                Total: {synthesis.total} initiatives
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded"
                  style={{ backgroundColor: RUBRIQUE_COLORS.projet_texte_legislatif }}
                />
                <span>Textes: {synthesis.byRubrique.projet_texte_legislatif}</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded"
                  style={{ backgroundColor: RUBRIQUE_COLORS.politique_generale }}
                />
                <span>Politiques: {synthesis.byRubrique.politique_generale}</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded"
                  style={{ backgroundColor: RUBRIQUE_COLORS.missions_conferences }}
                />
                <span>Missions: {synthesis.byRubrique.missions_conferences}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-status-success" />
                <span>Inscrites PTG: {synthesis.inscritePTG}</span>
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Page {page + 1} sur {maxPage} • Affichage {paginatedData.length}/{sortedData.length}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(maxPage - 1, p + 1))}
                disabled={page >= maxPage - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}

export default PTMTable;
