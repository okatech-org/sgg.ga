/**
 * SGG Digital — Tableau Matrice 21 Colonnes
 * Affichage interactif de la matrice de reporting PAG 2026
 * UX amélioré: lignes lisibles, hover détail, synthèse visuelle
 */

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatutBadge } from "./StatutBadge";
import { ProgressGauge } from "./ProgressGauge";
import type { MatriceReportingRow } from "@/types/reporting";
import { BLOC_COLORS } from "@/types/reporting";

interface MatriceTableProps {
  data: MatriceReportingRow[];
  loading?: boolean;
  onRowClick?: (programmeId: string) => void;
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

export function MatriceTable({ data, loading, onRowClick }: MatriceTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculs de synthèse
  const totalBudget = data.reduce((sum, r) => sum + (r.rapport?.budgetMdFcfa ?? 0), 0);
  const totalEngage = data.reduce((sum, r) => sum + (r.rapport?.engageMdFcfa ?? 0), 0);
  const totalDecaisse = data.reduce((sum, r) => sum + (r.rapport?.decaisseMdFcfa ?? 0), 0);
  const rapportsAvecDonnees = data.filter(r => r.rapport);
  const moyenneExecFin = rapportsAvecDonnees.length > 0
    ? Math.round(rapportsAvecDonnees.reduce((sum, r) => sum + (r.rapport?.pctExecutionFinanciere ?? 0), 0) / rapportsAvecDonnees.length)
    : 0;
  const moyennePhysique = rapportsAvecDonnees.length > 0
    ? Math.round(rapportsAvecDonnees.reduce((sum, r) => sum + (r.rapport?.pctAvancementPhysique ?? 0), 0) / rapportsAvecDonnees.length)
    : 0;

  if (loading) {
    return <TableSkeleton />;
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Aucun programme trouvé</p>
        <p className="text-xs text-muted-foreground mt-1">
          Essayez de modifier vos filtres pour élargir la recherche.
        </p>
      </div>
    );
  }

  return (
    <div>
      <ScrollArea className="w-full">
        <div className="min-w-[2200px]">
          <Table>
            <TableHeader>
              {/* Groupe headers */}
              <TableRow className="border-b-2">
                <TableHead colSpan={3} className={cn("text-center font-bold text-xs border-r", BLOC_COLORS.cadrage)}>
                  Cadrage Stratégique
                </TableHead>
                <TableHead colSpan={3} className={cn("text-center font-bold text-xs border-r", BLOC_COLORS.gouvernance)}>
                  Gouvernance
                </TableHead>
                <TableHead colSpan={3} className={cn("text-center font-bold text-xs border-r", BLOC_COLORS.operationnel)}>
                  Suivi Opérationnel
                </TableHead>
                <TableHead colSpan={4} className={cn("text-center font-bold text-xs border-r", BLOC_COLORS.financier)}>
                  Suivi Financier
                </TableHead>
                <TableHead colSpan={1} className={cn("text-center font-bold text-xs border-r", BLOC_COLORS.juridique)}>
                  Juridique
                </TableHead>
                <TableHead colSpan={4} className={cn("text-center font-bold text-xs border-r", BLOC_COLORS.performance)}>
                  Performance & Évaluation
                </TableHead>
                <TableHead className="text-center font-bold text-xs w-[60px]">
                </TableHead>
              </TableRow>
              {/* Column headers */}
              <TableRow className="bg-muted/50">
                {/* Cadrage */}
                <TableHead className={cn("w-[60px] sticky left-0 z-10 bg-muted/90", BLOC_COLORS.cadrage)}>
                  Code
                </TableHead>
                <TableHead className={cn("w-[200px] sticky left-[60px] z-10 bg-muted/90", BLOC_COLORS.cadrage)}>
                  Programme
                </TableHead>
                <TableHead className={cn("w-[150px]", BLOC_COLORS.cadrage)}>
                  Objectif
                </TableHead>

                {/* Gouvernance */}
                <TableHead className={cn("w-[150px]", BLOC_COLORS.gouvernance)}>
                  Ministère Pilote
                </TableHead>
                <TableHead className={cn("w-[120px]", BLOC_COLORS.gouvernance)}>
                  Co-responsables
                </TableHead>
                <TableHead className={cn("w-[100px]", BLOC_COLORS.gouvernance)}>
                  PTF
                </TableHead>

                {/* Opérationnel */}
                <TableHead className={cn("w-[90px]", BLOC_COLORS.operationnel)}>
                  Période
                </TableHead>
                <TableHead className={cn("w-[200px]", BLOC_COLORS.operationnel)}>
                  Activités Réalisées
                </TableHead>
                <TableHead className={cn("w-[80px]", BLOC_COLORS.operationnel)}>
                  Validation
                </TableHead>

                {/* Financier */}
                <TableHead className={cn("w-[80px] text-right", BLOC_COLORS.financier)}>
                  Budget
                </TableHead>
                <TableHead className={cn("w-[80px] text-right", BLOC_COLORS.financier)}>
                  Engagé
                </TableHead>
                <TableHead className={cn("w-[80px] text-right", BLOC_COLORS.financier)}>
                  Décaissé
                </TableHead>
                <TableHead className={cn("w-[90px] text-right", BLOC_COLORS.financier)}>
                  % Exec. Fin.
                </TableHead>

                {/* Juridique */}
                <TableHead className={cn("w-[150px]", BLOC_COLORS.juridique)}>
                  Encadrement
                </TableHead>

                {/* Performance */}
                <TableHead className={cn("w-[150px]", BLOC_COLORS.performance)}>
                  KPI
                </TableHead>
                <TableHead className={cn("w-[90px] text-right", BLOC_COLORS.performance)}>
                  % Physique
                </TableHead>
                <TableHead className={cn("w-[100px]", BLOC_COLORS.performance)}>
                  Statut
                </TableHead>
                <TableHead className={cn("w-[180px]", BLOC_COLORS.performance)}>
                  Observations
                </TableHead>

                {/* Action */}
                <TableHead className="w-[60px] text-center">
                  Détail
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedData.map((row, rowIndex) => {
                const r = row.rapport;
                const pilierColor = row.pilier.couleur;

                return (
                  <TableRow
                    key={row.programme.id}
                    className={cn(
                      "group transition-colors",
                      !r && "bg-muted/10",
                      r && "hover:bg-muted/40",
                      rowIndex % 2 === 0 ? "" : "bg-muted/5"
                    )}
                  >
                    {/* Cadrage */}
                    <TableCell className="sticky left-0 bg-background z-10 font-mono text-xs font-bold">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full flex-shrink-0 ring-1 ring-white dark:ring-gray-800"
                          style={{ backgroundColor: pilierColor }}
                        />
                        {row.programme.codeProgramme}
                      </div>
                    </TableCell>
                    <TableCell className="sticky left-[60px] bg-background z-10">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="max-w-[200px] cursor-help">
                              <div className="truncate font-medium text-sm">
                                {row.programme.libelleProgramme}
                              </div>
                              <div className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                                <span
                                  className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: pilierColor }}
                                />
                                {row.pilier.nom}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[400px]" side="right">
                            <p className="font-medium">{row.programme.libelleProgramme}</p>
                            <p className="text-xs mt-1">{row.programme.mesurePresidentielle}</p>
                            <p className="text-xs text-muted-foreground mt-1">{row.programme.resultatsAttendus}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="max-w-[150px] truncate">{row.programme.objectifStrategique}</div>
                    </TableCell>

                    {/* Gouvernance */}
                    <TableCell className="text-xs font-medium">
                      <div className="max-w-[150px] truncate">{row.gouvernance.ministerePiloteNom}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex flex-wrap gap-0.5">
                        {row.gouvernance.ministeresCoResponsables.slice(0, 2).map((m, i) => (
                          <Badge key={i} variant="secondary" className="text-[9px] px-1 py-0">{m}</Badge>
                        ))}
                        {row.gouvernance.ministeresCoResponsables.length > 2 && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0">+{row.gouvernance.ministeresCoResponsables.length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex flex-wrap gap-0.5">
                        {row.gouvernance.partenairesPTF.slice(0, 2).map((p, i) => (
                          <Badge key={i} variant="outline" className="text-[9px] px-1 py-0">{p}</Badge>
                        ))}
                      </div>
                    </TableCell>

                    {/* Opérationnel */}
                    <TableCell className="text-xs font-mono">
                      {r ? (
                        <div>
                          <div>{r.dateDebut ? new Date(r.dateDebut).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : '-'}</div>
                          <div className="text-muted-foreground">{r.dateFin ? new Date(r.dateFin).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : '-'}</div>
                        </div>
                      ) : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="text-xs">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="max-w-[200px] truncate cursor-help">
                              {r?.activitesRealisees || <span className="text-muted-foreground italic">Non renseigné</span>}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[400px]">
                            <p className="text-sm">{r?.activitesRealisees || 'Aucune activité renseignée'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      {r ? (
                        <StatutBadge type="validation" statut={r.statutValidation} />
                      ) : (
                        <Badge variant="outline" className="text-[9px] text-muted-foreground">Aucun</Badge>
                      )}
                    </TableCell>

                    {/* Financier */}
                    <TableCell className="text-right font-mono text-sm font-medium">
                      {r?.budgetMdFcfa ?? '-'}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {r?.engageMdFcfa ?? '-'}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {r?.decaisseMdFcfa ?? '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {r ? (
                        <ProgressGauge value={r.pctExecutionFinanciere} size="sm" />
                      ) : <span className="text-muted-foreground text-xs">-</span>}
                    </TableCell>

                    {/* Juridique */}
                    <TableCell className="text-xs">
                      <div className="max-w-[150px] truncate">
                        {r?.encadrementJuridique || <span className="text-muted-foreground">-</span>}
                      </div>
                    </TableCell>

                    {/* Performance */}
                    <TableCell className="text-xs">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="max-w-[150px] truncate cursor-help">
                              {r?.indicateursKpi || <span className="text-muted-foreground">-</span>}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[400px]">
                            <p className="text-sm whitespace-pre-wrap">{r?.indicateursKpi || 'Non renseigné'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-right">
                      {r ? (
                        <ProgressGauge value={r.pctAvancementPhysique} size="sm" />
                      ) : <span className="text-muted-foreground text-xs">-</span>}
                    </TableCell>
                    <TableCell>
                      {r ? (
                        <StatutBadge type="programme" statut={r.statutProgramme} />
                      ) : <span className="text-muted-foreground text-xs">-</span>}
                    </TableCell>
                    <TableCell className="text-xs">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="max-w-[180px] truncate cursor-help">
                              {r?.observationsContraintes || <span className="text-muted-foreground">-</span>}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[400px]">
                            <p className="text-sm">{r?.observationsContraintes || 'Aucune observation'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>

                    {/* Action : Voir détail */}
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowClick?.(row.programme.id);
                        }}
                      >
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Ligne de synthèse améliorée */}
      <div className="border-t bg-muted/30 px-6 py-3">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Budget total</span>
              <span className="font-bold text-base">{totalBudget.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">Md FCFA</span></span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Engagé</span>
              <span className="font-bold text-base">{totalEngage.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">Md</span></span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Décaissé</span>
              <span className="font-bold text-base">{totalDecaisse.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">Md</span></span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-28">
              <ProgressGauge value={moyenneExecFin} label="Exec. fin." size="sm" />
            </div>
            <div className="w-28">
              <ProgressGauge value={moyennePhysique} label="Avancement" size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Pagination améliorée */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-6 py-3">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{data.length}</span> programme{data.length > 1 ? 's' : ''} — Page <span className="font-medium">{currentPage}</span> sur {totalPages}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Numéros de pages */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                className={cn("h-8 w-8 p-0", page === currentPage && "bg-government-navy")}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
