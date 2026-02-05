/**
 * SGG Digital - Matrice GAR 21 Colonnes
 * Composant de reporting selon le format officiel du PAG 2026
 *
 * Les 21 colonnes du rapport GAR:
 * 1. N° - Numéro de l'objectif
 * 2. Objectif Stratégique - Titre de l'objectif
 * 3. Indicateur - Indicateur de performance
 * 4. Baseline - Valeur de référence
 * 5. Cible Annuelle - Objectif pour l'année
 * 6. Cible T1 - Objectif trimestre 1
 * 7. Réalisé T1 - Valeur réalisée T1
 * 8. Écart T1 - Écart par rapport à la cible T1
 * 9. Cible T2 - Objectif trimestre 2
 * 10. Réalisé T2 - Valeur réalisée T2
 * 11. Écart T2 - Écart par rapport à la cible T2
 * 12. Cible T3 - Objectif trimestre 3
 * 13. Réalisé T3 - Valeur réalisée T3
 * 14. Écart T3 - Écart par rapport à la cible T3
 * 15. Cible T4 - Objectif trimestre 4
 * 16. Réalisé T4 - Valeur réalisée T4
 * 17. Écart T4 - Écart par rapport à la cible T4
 * 18. Réalisé Annuel - Total réalisé
 * 19. Taux d'Exécution - Pourcentage d'atteinte
 * 20. Statut - État de l'objectif
 * 21. Observations - Commentaires et recommandations
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PRIORITE_LABELS, PRIORITE_COLORS, type PrioritePresidentielle } from "@/types";

// Types pour la matrice GAR
interface GARObjectifRow {
  id: string;
  numero: number;
  objectifStrategique: string;
  indicateur: string;
  unite: string;
  baseline: number;
  cibleAnnuelle: number;
  trimestres: {
    t1: { cible: number; realise: number | null };
    t2: { cible: number; realise: number | null };
    t3: { cible: number; realise: number | null };
    t4: { cible: number; realise: number | null };
  };
  priorite: PrioritePresidentielle;
  ministere: string;
  observations: string;
}

interface GARMatrice21ColonnesProps {
  ministereId?: string;
  annee?: number;
  priorite?: PrioritePresidentielle;
  onExport?: () => void;
}

// Données mock pour le développement
const MOCK_DATA: GARObjectifRow[] = [
  {
    id: "1",
    numero: 1,
    objectifStrategique: "Améliorer l'accès aux soins de santé primaires",
    indicateur: "Taux de couverture sanitaire",
    unite: "%",
    baseline: 65,
    cibleAnnuelle: 80,
    trimestres: {
      t1: { cible: 68, realise: 67 },
      t2: { cible: 72, realise: 71 },
      t3: { cible: 76, realise: 74 },
      t4: { cible: 80, realise: null },
    },
    priorite: "sante",
    ministere: "Ministère de la Santé",
    observations: "Retard dû aux difficultés d'approvisionnement en équipements médicaux",
  },
  {
    id: "2",
    numero: 2,
    objectifStrategique: "Réduire la mortalité maternelle",
    indicateur: "Taux de mortalité maternelle pour 100 000 naissances",
    unite: "pour 100k",
    baseline: 252,
    cibleAnnuelle: 200,
    trimestres: {
      t1: { cible: 240, realise: 238 },
      t2: { cible: 228, realise: 225 },
      t3: { cible: 216, realise: 210 },
      t4: { cible: 200, realise: null },
    },
    priorite: "sante",
    ministere: "Ministère de la Santé",
    observations: "Objectif en bonne voie grâce au programme de formation des sages-femmes",
  },
  {
    id: "3",
    numero: 3,
    objectifStrategique: "Augmenter le taux de scolarisation primaire",
    indicateur: "Taux brut de scolarisation",
    unite: "%",
    baseline: 88,
    cibleAnnuelle: 95,
    trimestres: {
      t1: { cible: 89, realise: 89 },
      t2: { cible: 91, realise: 90 },
      t3: { cible: 93, realise: 92 },
      t4: { cible: 95, realise: null },
    },
    priorite: "education",
    ministere: "Ministère de l'Éducation Nationale",
    observations: "Construction de 50 nouvelles écoles en cours",
  },
  {
    id: "4",
    numero: 4,
    objectifStrategique: "Développer le réseau routier national",
    indicateur: "Km de routes bitumées",
    unite: "km",
    baseline: 1200,
    cibleAnnuelle: 1500,
    trimestres: {
      t1: { cible: 1275, realise: 1250 },
      t2: { cible: 1350, realise: 1320 },
      t3: { cible: 1425, realise: 1380 },
      t4: { cible: 1500, realise: null },
    },
    priorite: "infrastructure",
    ministere: "Ministère des Travaux Publics",
    observations: "Retards dus aux conditions climatiques",
  },
  {
    id: "5",
    numero: 5,
    objectifStrategique: "Accélérer la digitalisation des services publics",
    indicateur: "Nombre de services en ligne",
    unite: "services",
    baseline: 45,
    cibleAnnuelle: 120,
    trimestres: {
      t1: { cible: 60, realise: 65 },
      t2: { cible: 80, realise: 88 },
      t3: { cible: 100, realise: 105 },
      t4: { cible: 120, realise: null },
    },
    priorite: "numerique",
    ministere: "Ministère de l'Économie Numérique",
    observations: "Objectif dépassé grâce au partenariat avec le secteur privé",
  },
];

function calculateEcart(cible: number, realise: number | null): number | null {
  if (realise === null) return null;
  return realise - cible;
}

function calculateTauxExecution(baseline: number, cible: number, realise: number): number {
  const progression = realise - baseline;
  const objectif = cible - baseline;
  if (objectif === 0) return realise >= cible ? 100 : 0;
  return Math.round((progression / objectif) * 100);
}

function getStatut(
  tauxExecution: number
): "atteint" | "en_cours" | "en_retard" | "critique" | "non_demarre" {
  if (tauxExecution >= 100) return "atteint";
  if (tauxExecution >= 75) return "en_cours";
  if (tauxExecution >= 50) return "en_retard";
  if (tauxExecution > 0) return "critique";
  return "non_demarre";
}

const statutConfig = {
  atteint: {
    label: "Atteint",
    icon: CheckCircle2,
    className: "bg-status-success/10 text-status-success border-status-success/20",
  },
  en_cours: {
    label: "En cours",
    icon: TrendingUp,
    className: "bg-status-info/10 text-status-info border-status-info/20",
  },
  en_retard: {
    label: "En retard",
    icon: Clock,
    className: "bg-status-warning/10 text-status-warning border-status-warning/20",
  },
  critique: {
    label: "Critique",
    icon: AlertTriangle,
    className: "bg-status-danger/10 text-status-danger border-status-danger/20",
  },
  non_demarre: {
    label: "Non démarré",
    icon: XCircle,
    className: "bg-muted text-muted-foreground border-muted",
  },
};

function EcartCell({ ecart, unite }: { ecart: number | null; unite: string }) {
  if (ecart === null) {
    return <span className="text-muted-foreground">-</span>;
  }

  const isPositive = ecart > 0;
  const isNegative = ecart < 0;

  return (
    <span
      className={cn(
        "flex items-center gap-1 font-medium",
        isPositive && "text-status-success",
        isNegative && "text-status-danger",
        !isPositive && !isNegative && "text-muted-foreground"
      )}
    >
      {isPositive && <TrendingUp className="h-3 w-3" />}
      {isNegative && <TrendingDown className="h-3 w-3" />}
      {!isPositive && !isNegative && <Minus className="h-3 w-3" />}
      {isPositive && "+"}
      {ecart}
    </span>
  );
}

export function GARMatrice21Colonnes({
  ministereId,
  annee = 2026,
  priorite,
  onExport,
}: GARMatrice21ColonnesProps) {
  const [selectedPriorite, setSelectedPriorite] = useState<PrioritePresidentielle | "all">(
    priorite || "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtrer les données
  const filteredData = useMemo(() => {
    let data = MOCK_DATA;

    if (selectedPriorite !== "all") {
      data = data.filter((row) => row.priorite === selectedPriorite);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      data = data.filter(
        (row) =>
          row.objectifStrategique.toLowerCase().includes(query) ||
          row.indicateur.toLowerCase().includes(query) ||
          row.ministere.toLowerCase().includes(query)
      );
    }

    return data;
  }, [selectedPriorite, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculer le dernier trimestre avec des données
  const getLastRealise = (row: GARObjectifRow): number => {
    if (row.trimestres.t4.realise !== null) return row.trimestres.t4.realise;
    if (row.trimestres.t3.realise !== null) return row.trimestres.t3.realise;
    if (row.trimestres.t2.realise !== null) return row.trimestres.t2.realise;
    if (row.trimestres.t1.realise !== null) return row.trimestres.t1.realise;
    return row.baseline;
  };

  return (
    <Card className="shadow-gov">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
        <div>
          <CardTitle className="text-xl">Matrice de Reporting GAR - PAG {annee}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Suivi des 21 colonnes de la Gestion Axée sur les Résultats
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </CardHeader>

      {/* Filtres */}
      <div className="px-6 pb-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={selectedPriorite}
            onValueChange={(value) => setSelectedPriorite(value as PrioritePresidentielle | "all")}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Toutes les priorités" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les priorités</SelectItem>
              {Object.entries(PRIORITE_LABELS).map(([code, label]) => (
                <SelectItem key={code} value={code}>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: PRIORITE_COLORS[code as PrioritePresidentielle] }}
                    />
                    {label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Input
          placeholder="Rechercher un objectif..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[250px]"
        />

        <div className="ml-auto text-sm text-muted-foreground">
          {filteredData.length} objectif{filteredData.length > 1 ? "s" : ""}
        </div>
      </div>

      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <div className="min-w-[1800px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[50px] sticky left-0 bg-muted/50 z-10">N°</TableHead>
                  <TableHead className="w-[200px] sticky left-[50px] bg-muted/50 z-10">
                    Objectif Stratégique
                  </TableHead>
                  <TableHead className="w-[150px]">Indicateur</TableHead>
                  <TableHead className="w-[70px] text-right">Base</TableHead>
                  <TableHead className="w-[70px] text-right">Cible An.</TableHead>

                  {/* T1 */}
                  <TableHead className="w-[60px] text-right bg-blue-50/50 dark:bg-blue-950/20">
                    Cible T1
                  </TableHead>
                  <TableHead className="w-[60px] text-right bg-blue-50/50 dark:bg-blue-950/20">
                    Réal. T1
                  </TableHead>
                  <TableHead className="w-[70px] text-right bg-blue-50/50 dark:bg-blue-950/20">
                    Écart T1
                  </TableHead>

                  {/* T2 */}
                  <TableHead className="w-[60px] text-right bg-green-50/50 dark:bg-green-950/20">
                    Cible T2
                  </TableHead>
                  <TableHead className="w-[60px] text-right bg-green-50/50 dark:bg-green-950/20">
                    Réal. T2
                  </TableHead>
                  <TableHead className="w-[70px] text-right bg-green-50/50 dark:bg-green-950/20">
                    Écart T2
                  </TableHead>

                  {/* T3 */}
                  <TableHead className="w-[60px] text-right bg-amber-50/50 dark:bg-amber-950/20">
                    Cible T3
                  </TableHead>
                  <TableHead className="w-[60px] text-right bg-amber-50/50 dark:bg-amber-950/20">
                    Réal. T3
                  </TableHead>
                  <TableHead className="w-[70px] text-right bg-amber-50/50 dark:bg-amber-950/20">
                    Écart T3
                  </TableHead>

                  {/* T4 */}
                  <TableHead className="w-[60px] text-right bg-purple-50/50 dark:bg-purple-950/20">
                    Cible T4
                  </TableHead>
                  <TableHead className="w-[60px] text-right bg-purple-50/50 dark:bg-purple-950/20">
                    Réal. T4
                  </TableHead>
                  <TableHead className="w-[70px] text-right bg-purple-50/50 dark:bg-purple-950/20">
                    Écart T4
                  </TableHead>

                  {/* Synthèse */}
                  <TableHead className="w-[70px] text-right font-bold">Réal. An.</TableHead>
                  <TableHead className="w-[80px] text-right font-bold">Taux Exec.</TableHead>
                  <TableHead className="w-[100px]">Statut</TableHead>
                  <TableHead className="w-[200px]">Observations</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedData.map((row) => {
                  const lastRealise = getLastRealise(row);
                  const tauxExecution = calculateTauxExecution(
                    row.baseline,
                    row.cibleAnnuelle,
                    lastRealise
                  );
                  const statut = getStatut(tauxExecution);
                  const StatutConfig = statutConfig[statut];
                  const StatutIcon = StatutConfig.icon;

                  return (
                    <TableRow key={row.id} className="hover:bg-muted/30">
                      <TableCell className="sticky left-0 bg-background font-medium">
                        {row.numero}
                      </TableCell>
                      <TableCell className="sticky left-[50px] bg-background">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="max-w-[200px]">
                                <div className="truncate font-medium">
                                  {row.objectifStrategique}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {row.ministere}
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[400px]">
                              <p className="font-medium">{row.objectifStrategique}</p>
                              <p className="text-xs text-muted-foreground mt-1">{row.ministere}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: PRIORITE_COLORS[row.priorite] }}
                          />
                          <span className="text-sm truncate">{row.indicateur}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {row.baseline}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-medium">
                        {row.cibleAnnuelle}
                      </TableCell>

                      {/* T1 */}
                      <TableCell className="text-right font-mono text-sm bg-blue-50/30 dark:bg-blue-950/10">
                        {row.trimestres.t1.cible}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm bg-blue-50/30 dark:bg-blue-950/10">
                        {row.trimestres.t1.realise ?? "-"}
                      </TableCell>
                      <TableCell className="text-right text-sm bg-blue-50/30 dark:bg-blue-950/10">
                        <EcartCell
                          ecart={calculateEcart(
                            row.trimestres.t1.cible,
                            row.trimestres.t1.realise
                          )}
                          unite={row.unite}
                        />
                      </TableCell>

                      {/* T2 */}
                      <TableCell className="text-right font-mono text-sm bg-green-50/30 dark:bg-green-950/10">
                        {row.trimestres.t2.cible}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm bg-green-50/30 dark:bg-green-950/10">
                        {row.trimestres.t2.realise ?? "-"}
                      </TableCell>
                      <TableCell className="text-right text-sm bg-green-50/30 dark:bg-green-950/10">
                        <EcartCell
                          ecart={calculateEcart(
                            row.trimestres.t2.cible,
                            row.trimestres.t2.realise
                          )}
                          unite={row.unite}
                        />
                      </TableCell>

                      {/* T3 */}
                      <TableCell className="text-right font-mono text-sm bg-amber-50/30 dark:bg-amber-950/10">
                        {row.trimestres.t3.cible}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm bg-amber-50/30 dark:bg-amber-950/10">
                        {row.trimestres.t3.realise ?? "-"}
                      </TableCell>
                      <TableCell className="text-right text-sm bg-amber-50/30 dark:bg-amber-950/10">
                        <EcartCell
                          ecart={calculateEcart(
                            row.trimestres.t3.cible,
                            row.trimestres.t3.realise
                          )}
                          unite={row.unite}
                        />
                      </TableCell>

                      {/* T4 */}
                      <TableCell className="text-right font-mono text-sm bg-purple-50/30 dark:bg-purple-950/10">
                        {row.trimestres.t4.cible}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm bg-purple-50/30 dark:bg-purple-950/10">
                        {row.trimestres.t4.realise ?? "-"}
                      </TableCell>
                      <TableCell className="text-right text-sm bg-purple-50/30 dark:bg-purple-950/10">
                        <EcartCell
                          ecart={calculateEcart(
                            row.trimestres.t4.cible,
                            row.trimestres.t4.realise
                          )}
                          unite={row.unite}
                        />
                      </TableCell>

                      {/* Synthèse */}
                      <TableCell className="text-right font-mono text-sm font-bold">
                        {lastRealise}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            "font-bold",
                            tauxExecution >= 100 && "text-status-success",
                            tauxExecution >= 75 && tauxExecution < 100 && "text-status-info",
                            tauxExecution >= 50 && tauxExecution < 75 && "text-status-warning",
                            tauxExecution < 50 && "text-status-danger"
                          )}
                        >
                          {tauxExecution}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("gap-1", StatutConfig.className)}>
                          <StatutIcon className="h-3 w-3" />
                          {StatutConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm text-muted-foreground line-clamp-2 cursor-help">
                                {row.observations}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[300px]">
                              {row.observations}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} sur {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
