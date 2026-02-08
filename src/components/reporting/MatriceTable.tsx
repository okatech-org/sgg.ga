/**
 * SGG Digital — Tableau Matrice Compact & Intelligent
 * Design ultra-condensé avec blocs flottants pour les détails
 * Chaque ligne = vision programme en un coup d'œil
 */

import { useState, useRef } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  Users,
  Handshake,
  DollarSign,
  BarChart3,
  Scale,
  Activity,
  ShieldCheck,
  Send,
  CircleDot,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MatriceReportingRow, StatutValidation } from "@/types/reporting";

interface MatriceTableProps {
  data: MatriceReportingRow[];
  loading?: boolean;
  onRowClick?: (programmeId: string) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getExecColor(pct: number): string {
  if (pct >= 70) return "text-emerald-600 dark:text-emerald-400";
  if (pct >= 40) return "text-amber-600 dark:text-amber-400";
  return "text-red-500 dark:text-red-400";
}

function getExecBg(pct: number): string {
  if (pct >= 70) return "bg-emerald-500";
  if (pct >= 40) return "bg-amber-500";
  return "bg-red-500";
}

function getExecIcon(pct: number) {
  if (pct >= 70) return TrendingUp;
  if (pct >= 40) return Minus;
  return TrendingDown;
}

const VALIDATION_CONFIG: Record<
  StatutValidation,
  { icon: typeof CheckCircle2; color: string; bg: string; label: string }
> = {
  brouillon: {
    icon: CircleDot,
    color: "text-slate-500",
    bg: "bg-slate-100 dark:bg-slate-800",
    label: "Brouillon",
  },
  soumis: {
    icon: Send,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    label: "Soumis",
  },
  valide_sgg: {
    icon: ShieldCheck,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    label: "Validé SGG",
  },
  valide_sgpr: {
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    label: "Publié",
  },
  rejete: {
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/40",
    label: "Rejeté",
  },
};

// ─── Mini Gauge ──────────────────────────────────────────────────────────────

function MiniGauge({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="w-10 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", getExecBg(value))}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className={cn("text-[11px] font-semibold tabular-nums w-8 text-right", getExecColor(value))}>
        {value}%
      </span>
    </div>
  );
}

// ─── Validation Dot ──────────────────────────────────────────────────────────

function ValidationDot({ statut }: { statut: StatutValidation }) {
  const config = VALIDATION_CONFIG[statut];
  const Icon = config.icon;
  return (
    <div className={cn("flex items-center gap-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium", config.bg, config.color)}>
      <Icon className="h-3 w-3" />
      <span className="hidden sm:inline">{config.label}</span>
    </div>
  );
}

// ─── Floating Detail Block ───────────────────────────────────────────────────

function FloatingDetail({ row }: { row: MatriceReportingRow }) {
  const r = row.rapport;

  return (
    <div className="w-full space-y-3.5 overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-2 overflow-hidden">
        <span
          className="mt-1 h-3.5 w-3.5 rounded-full flex-shrink-0 ring-2 ring-white dark:ring-[#222838]"
          style={{ backgroundColor: row.pilier.couleur }}
        />
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-muted-foreground">{row.programme.codeProgramme}</span>
            {r && <ValidationDot statut={r.statutValidation} />}
          </div>
          <p className="text-sm font-semibold leading-tight mt-0.5 break-words">{row.programme.libelleProgramme}</p>
          <p className="text-[11px] text-muted-foreground mt-1 break-words">{row.programme.mesurePresidentielle}</p>
        </div>
      </div>

      <Separator className="dark:bg-slate-600/50" />

      {/* Gouvernance */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-1 rounded-md -mx-1">
          <Building2 className="h-3 w-3" />
          Gouvernance
        </div>
        <div className="grid grid-cols-[1fr_1fr] gap-2 text-xs">
          <div>
            <span className="text-[10px] text-muted-foreground">Pilote</span>
            <p className="font-medium truncate overflow-hidden">{row.gouvernance.ministerePiloteNom}</p>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground">Co-responsables</span>
            <div className="flex flex-wrap gap-0.5 mt-0.5">
              {row.gouvernance.ministeresCoResponsables.slice(0, 3).map((m, i) => (
                <Badge key={i} variant="secondary" className="text-[9px] px-1 py-0 h-4">{m}</Badge>
              ))}
              {row.gouvernance.ministeresCoResponsables.length > 3 && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                  +{row.gouvernance.ministeresCoResponsables.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </div>
        {row.gouvernance.partenairesPTF.length > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <Handshake className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">PTF:</span>
            <div className="flex flex-wrap gap-0.5">
              {row.gouvernance.partenairesPTF.map((p, i) => (
                <Badge key={i} variant="outline" className="text-[9px] px-1 py-0 h-4 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400">
                  {p}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {r && (
        <>
          <Separator className="dark:bg-slate-600/50" />

          {/* Financier */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md -mx-1">
              <DollarSign className="h-3 w-3" />
              Financier
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: "Budget", value: r.budgetMdFcfa, suffix: "Md" },
                { label: "Engagé", value: r.engageMdFcfa, suffix: "Md" },
                { label: "Décaissé", value: r.decaisseMdFcfa, suffix: "Md" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="text-center p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-600/40"
                >
                  <p className="text-base font-bold tabular-nums">{item.value}</p>
                  <p className="text-[9px] text-muted-foreground">{item.label} ({item.suffix})</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-0.5">
                  <span>Exéc. Financière</span>
                  <span className={cn("font-semibold", getExecColor(r.pctExecutionFinanciere))}>{r.pctExecutionFinanciere}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-700", getExecBg(r.pctExecutionFinanciere))} style={{ width: `${r.pctExecutionFinanciere}%` }} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-0.5">
                  <span>Avanc. Physique</span>
                  <span className={cn("font-semibold", getExecColor(r.pctAvancementPhysique))}>{r.pctAvancementPhysique}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-700", getExecBg(r.pctAvancementPhysique))} style={{ width: `${r.pctAvancementPhysique}%` }} />
                </div>
              </div>
            </div>
          </div>

          <Separator className="dark:bg-slate-600/50" />

          {/* Activités & KPI */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-1 rounded-md -mx-1">
              <Activity className="h-3 w-3" />
              Opérationnel
            </div>
            {r.activitesRealisees && (
              <p className="text-xs leading-relaxed line-clamp-3 break-words overflow-hidden">{r.activitesRealisees}</p>
            )}
            {r.indicateursKpi && (
              <div className="flex items-start gap-1.5 text-xs overflow-hidden">
                <BarChart3 className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="line-clamp-2 text-muted-foreground break-words min-w-0">{r.indicateursKpi}</p>
              </div>
            )}
            {r.encadrementJuridique && (
              <div className="flex items-start gap-1.5 text-xs overflow-hidden">
                <Scale className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="line-clamp-2 text-muted-foreground break-words min-w-0">{r.encadrementJuridique}</p>
              </div>
            )}
            {r.observationsContraintes && (
              <div className="p-2 rounded-md bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-700/40 text-[11px] text-amber-800 dark:text-amber-300 overflow-hidden">
                <p className="line-clamp-2 break-words">⚠️ {r.observationsContraintes}</p>
              </div>
            )}
          </div>

          {/* Rejet */}
          {r.statutValidation === "rejete" && r.motifRejet && (
            <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200/60 dark:border-red-700/40 text-xs text-red-700 dark:text-red-400 overflow-hidden">
              <p className="break-words"><span className="font-semibold">Motif de rejet :</span> {r.motifRejet}</p>
            </div>
          )}
        </>
      )}

      {!r && (
        <>
          <Separator className="dark:bg-slate-600/50" />
          <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-600/40 text-xs text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Aucun rapport soumis pour cette période.</span>
          </div>
        </>
      )}

      {/* Footer action */}
      <div className="pt-1.5 border-t border-dashed dark:border-slate-600/50">
        <p className="text-[10px] text-muted-foreground text-center">
          Cliquer sur la ligne pour ouvrir le détail complet
        </p>
      </div>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-1 p-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex gap-3 items-center h-12 px-3">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 flex-1 max-w-[200px]" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function MatriceTable({ data, loading, onRowClick }: MatriceTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Synthèse
  const rapportsAvecDonnees = data.filter((r) => r.rapport);
  const totalBudget = data.reduce((s, r) => s + (r.rapport?.budgetMdFcfa ?? 0), 0);
  const totalDecaisse = data.reduce((s, r) => s + (r.rapport?.decaisseMdFcfa ?? 0), 0);
  const moyExec =
    rapportsAvecDonnees.length > 0
      ? Math.round(
        rapportsAvecDonnees.reduce((s, r) => s + (r.rapport?.pctExecutionFinanciere ?? 0), 0) /
        rapportsAvecDonnees.length,
      )
      : 0;
  const moyPhysique =
    rapportsAvecDonnees.length > 0
      ? Math.round(
        rapportsAvecDonnees.reduce((s, r) => s + (r.rapport?.pctAvancementPhysique ?? 0), 0) /
        rapportsAvecDonnees.length,
      )
      : 0;

  if (loading) return <TableSkeleton />;

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Aucun programme trouvé</p>
        <p className="text-xs text-muted-foreground mt-1">
          Modifiez vos filtres pour élargir la recherche.
        </p>
      </div>
    );
  }

  // Group by pilier for visual separators
  let lastPilierId = -1;

  return (
    <div>
      {/* ── Table compacte ─────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {/* Header */}
          <thead>
            <tr className="border-b-2 border-border bg-muted/40">
              <th className="text-left py-2 pl-3 pr-1 w-[44px]"></th>
              <th className="text-left py-2 px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Programme
              </th>
              <th className="text-left py-2 px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Ministère Pilote
              </th>
              <th className="text-center py-2 px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                % Fin.
              </th>
              <th className="text-center py-2 px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                % Phys.
              </th>
              <th className="text-right py-2 px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Budget
              </th>
              <th className="text-center py-2 px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Statut
              </th>
              <th className="w-[36px] py-2 px-1"></th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {paginatedData.map((row) => {
              const r = row.rapport;
              const ExecIcon = r ? getExecIcon(r.pctExecutionFinanciere) : Minus;
              const showPilierSep = row.pilier.id !== lastPilierId;
              lastPilierId = row.pilier.id;

              return (
                <HoverCard key={row.programme.id} openDelay={200} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    {/* Wrap in fragment to handle pilier separator + row */}
                    <tr
                      className={cn(
                        "group cursor-pointer transition-all duration-150",
                        "hover:bg-muted/50 dark:hover:bg-muted/20",
                        "border-b border-border/50",
                        showPilierSep && "border-t-2 border-t-border",
                      )}
                      onClick={() => onRowClick?.(row.programme.id)}
                    >
                      {/* Pilier color indicator */}
                      <td className="py-2 pl-3 pr-1">
                        <span
                          className="block h-8 w-1 rounded-full"
                          style={{ backgroundColor: row.pilier.couleur }}
                        />
                      </td>

                      {/* Programme */}
                      <td className="py-2 px-2 max-w-[280px]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-muted-foreground bg-muted/60 dark:bg-muted/30 px-1.5 py-0.5 rounded">
                            {row.programme.codeProgramme}
                          </span>
                          <span className="truncate text-sm font-medium">
                            {row.programme.libelleProgramme}
                          </span>
                        </div>
                      </td>

                      {/* Ministère */}
                      <td className="py-2 px-2 text-xs text-muted-foreground max-w-[200px]">
                        <span className="truncate block">{row.gouvernance.ministerePiloteNom}</span>
                      </td>

                      {/* % Exec Fin. */}
                      <td className="py-2 px-2 text-center">
                        {r ? (
                          <MiniGauge value={r.pctExecutionFinanciere} className="justify-center" />
                        ) : (
                          <span className="text-[11px] text-muted-foreground/50">—</span>
                        )}
                      </td>

                      {/* % Physique */}
                      <td className="py-2 px-2 text-center">
                        {r ? (
                          <MiniGauge value={r.pctAvancementPhysique} className="justify-center" />
                        ) : (
                          <span className="text-[11px] text-muted-foreground/50">—</span>
                        )}
                      </td>

                      {/* Budget */}
                      <td className="py-2 px-2 text-right">
                        {r ? (
                          <span className="font-mono text-xs font-semibold tabular-nums">
                            {r.budgetMdFcfa}
                            <span className="text-[10px] text-muted-foreground ml-0.5">Md</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground/50">—</span>
                        )}
                      </td>

                      {/* Statut validation */}
                      <td className="py-2 px-2 text-center">
                        {r ? (
                          <ValidationDot statut={r.statutValidation} />
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/60 px-1.5 py-0.5 rounded-md bg-muted/40">
                            <FileText className="h-2.5 w-2.5" />
                            <span className="hidden sm:inline">Vide</span>
                          </span>
                        )}
                      </td>

                      {/* Eye action */}
                      <td className="py-2 px-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRowClick?.(row.programme.id);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </td>
                    </tr>
                  </HoverCardTrigger>

                  {/* ── BLOC FLOTTANT ── */}
                  <HoverCardContent
                    side="bottom"
                    align="start"
                    sideOffset={8}
                    avoidCollisions
                    collisionPadding={16}
                    className={cn(
                      "w-[440px] max-h-[70vh] overflow-y-auto overflow-x-hidden",
                      "p-5 rounded-xl z-50",
                      "bg-white dark:bg-[#222838]",
                      "border-2 border-slate-200 dark:border-slate-500/50",
                      "shadow-[0_20px_60px_-10px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)]",
                      "ring-1 ring-black/5 dark:ring-slate-400/15",
                      "animate-in fade-in-0 zoom-in-95 duration-200",
                    )}
                  >
                    <FloatingDetail row={row} />
                  </HoverCardContent>
                </HoverCard>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Synthèse compacte ──────────────────────────────────────────── */}
      <div className="border-t-2 border-border bg-muted/20 px-4 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Budget</span>
              <span className="font-bold text-sm tabular-nums">{totalBudget.toFixed(1)}</span>
              <span className="text-[10px] text-muted-foreground">Md</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Décaissé</span>
              <span className="font-bold text-sm tabular-nums">{totalDecaisse.toFixed(1)}</span>
              <span className="text-[10px] text-muted-foreground">Md</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Exec. Fin.</span>
              <MiniGauge value={moyExec} />
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Physique</span>
              <MiniGauge value={moyPhysique} />
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground mr-1">
                {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, data.length)}/{data.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "ghost"}
                  size="icon"
                  className={cn(
                    "h-6 w-6 text-[10px]",
                    page === currentPage && "bg-government-navy text-white",
                  )}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MatriceTable;
