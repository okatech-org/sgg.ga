/**
 * SGG Digital — Matrice PTM 2026
 * Vue principale de synthèse des initiatives gouvernementales
 * Programme de Travail du Ministère — Consolidated matrix view
 */

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  Filter,
  FileSpreadsheet,
  FileText,
  FileDown,
  Search,
} from "lucide-react";
import { useDemoUser } from "@/hooks/useDemoUser";
import { usePTMPermissions } from "@/hooks/usePTMPermissions";
import { InfoButton } from "@/components/reporting/InfoButton";
import { INITIATIVES_PTM, getPTMStats, MINISTERES_PTM } from "@/data/ptmData";
import {
  RUBRIQUE_SHORT_LABELS,
  STATUT_PTM_LABELS,
  CADRAGE_SHORT_LABELS,
  RUBRIQUE_COLORS,
  STATUT_PTM_COLORS,
} from "@/types/ptm";
import type {
  InitiativePTM,
  RubriquePTM,
  StatutPTM,
  CadrageStrategique,
} from "@/types/ptm";

export default function PTMMatrice() {
  const { demoUser } = useDemoUser();
  const permissions = usePTMPermissions();

  // Filtres
  const [rubrique, setRubrique] = useState<RubriquePTM | "all">("all");
  const [statut, setStatut] = useState<StatutPTM | "all">("all");
  const [cadrage, setCadrage] = useState<CadrageStrategique | "all">("all");
  const [ministereId, setMinistereId] = useState<string>("all");
  const [recherche, setRecherche] = useState("");

  // Données filtrées
  const filteredData = useMemo(() => {
    let data = INITIATIVES_PTM;

    if (rubrique !== "all") {
      data = data.filter((i) => i.rubrique === rubrique);
    }

    if (statut !== "all") {
      data = data.filter((i) => i.statut === statut);
    }

    if (cadrage !== "all") {
      data = data.filter((i) => i.cadrage === cadrage);
    }

    if (ministereId !== "all") {
      data = data.filter((i) => i.ministereId === ministereId);
    }

    if (recherche) {
      const q = recherche.toLowerCase();
      data = data.filter(
        (i) =>
          i.intitule.toLowerCase().includes(q) ||
          i.observations.toLowerCase().includes(q) ||
          i.ministereNom.toLowerCase().includes(q)
      );
    }

    return data;
  }, [rubrique, statut, cadrage, ministereId, recherche]);

  // Statistiques
  const stats = useMemo(() => {
    const globalStats = getPTMStats();
    const totalInitiatives = filteredData.length;
    const textesLegislatifs = filteredData.filter(
      (i) => i.rubrique === "projet_texte_legislatif"
    ).length;
    const transmisesPM = filteredData.filter(
      (i) => ['soumis_pm', 'soumis_sgpr'].includes(i.statut)
    ).length;
    const tauxTransmission =
      totalInitiatives > 0
        ? Math.round((transmisesPM / totalInitiatives) * 100)
        : 0;

    return {
      totalInitiatives,
      textesLegislatifs,
      transmisesPM,
      tauxTransmission,
    };
  }, [filteredData]);

  // Listes uniques pour les filtres
  const rubriques = useMemo(
    () => [
      { id: "projet_texte_legislatif", label: RUBRIQUE_SHORT_LABELS.projet_texte_legislatif },
      { id: "politique_generale", label: RUBRIQUE_SHORT_LABELS.politique_generale },
      { id: "missions_conferences", label: RUBRIQUE_SHORT_LABELS.missions_conferences },
    ] as Array<{ id: RubriquePTM; label: string }>,
    []
  );

  const statuts = useMemo(
    () => [
      { id: "brouillon", label: STATUT_PTM_LABELS.brouillon },
      { id: "soumis_sg", label: STATUT_PTM_LABELS.soumis_sg },
      { id: "consolide_sg", label: STATUT_PTM_LABELS.consolide_sg },
      { id: "soumis_sgg", label: STATUT_PTM_LABELS.soumis_sgg },
      { id: "consolide_sgg", label: STATUT_PTM_LABELS.consolide_sgg },
      { id: "soumis_pm", label: STATUT_PTM_LABELS.soumis_pm },
      { id: "soumis_sgpr", label: STATUT_PTM_LABELS.soumis_sgpr },
      { id: "rejete_sg", label: STATUT_PTM_LABELS.rejete_sg },
      { id: "rejete_sgg", label: STATUT_PTM_LABELS.rejete_sgg },
    ] as Array<{ id: StatutPTM; label: string }>,
    []
  );

  const cadrages = useMemo(
    () => [
      { id: "sept_priorites", label: CADRAGE_SHORT_LABELS.sept_priorites },
      { id: "pag", label: CADRAGE_SHORT_LABELS.pag },
      { id: "pncd", label: CADRAGE_SHORT_LABELS.pncd },
      { id: "pap", label: CADRAGE_SHORT_LABELS.pap },
    ] as Array<{ id: CadrageStrategique; label: string }>,
    []
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-government-gold" />
              Matrice PTM — Programme de Travail Ministériel 2026
              <InfoButton pageId="ptm-matrice" />
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Synthèse consolidée des initiatives gouvernementales 2026
            </p>
          </div>
          <div className="flex items-center gap-2">
            {demoUser && (
              <Badge variant="outline" className="border-government-gold text-government-gold">
                {demoUser.role}
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel complet
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  PDF synthèse
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileDown className="h-4 w-4 mr-2" />
                  CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Initiatives Totales</p>
                  <p className="text-2xl font-bold">{stats.totalInitiatives}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-government-navy flex items-center justify-center">
                  <FileSpreadsheet className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Textes Législatifs</p>
                  <p className="text-2xl font-bold">{stats.textesLegislatifs}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-status-info flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Transmises PM/SGPR</p>
                  <p className="text-2xl font-bold">
                    {stats.transmisesPM}
                    <span className="text-sm font-normal ml-1">/ {stats.totalInitiatives}</span>
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-status-success flex items-center justify-center">
                  <FileSpreadsheet className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Taux Transmission %</p>
                  <p className="text-2xl font-bold">
                    {stats.tauxTransmission}
                    <span className="text-sm font-normal ml-1">%</span>
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-status-warning flex items-center justify-center">
                  <FileSpreadsheet className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={rubrique} onValueChange={(v: any) => setRubrique(v)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Toutes rubriques" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes rubriques</SelectItem>
                  {rubriques.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statut} onValueChange={(v: any) => setStatut(v)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Tous statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  {statuts.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={cadrage} onValueChange={(v: any) => setCadrage(v)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Tous cadrages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous cadrages</SelectItem>
                  {cadrages.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={ministereId} onValueChange={setMinistereId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Tous ministères" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous ministères</SelectItem>
                  {MINISTERES_PTM.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.sigle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="ml-auto text-sm text-muted-foreground">
                {filteredData.length} résultat{filteredData.length > 1 ? "s" : ""}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tableau */}
        <Card className="shadow-gov overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rubrique</TableHead>
                    <TableHead>Intitulé</TableHead>
                    <TableHead>Ministère</TableHead>
                    <TableHead>Cadrage</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-center">Fin. ?</TableHead>
                    <TableHead className="text-center">LF ?</TableHead>
                    <TableHead>Observations</TableHead>
                    <TableHead className="text-right">Date Subm.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Aucune initiative ne correspond aux filtres
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((initiative) => (
                      <TableRow key={initiative.id} className="hover:bg-muted/30">
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {RUBRIQUE_SHORT_LABELS[initiative.rubrique]}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[250px]">
                          <div className="truncate text-sm font-medium">{initiative.intitule}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {initiative.id}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <span className="font-mono">{initiative.ministereSigle}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {CADRAGE_SHORT_LABELS[initiative.cadrage]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${STATUT_PTM_COLORS[initiative.statut]}`}>
                            {STATUT_PTM_LABELS[initiative.statut]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {initiative.incidenceFinanciere ? (
                            <Badge variant="secondary" className="text-xs">Oui</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {initiative.loiFinance ? (
                            <Badge variant="secondary" className="text-xs">Oui</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="text-xs text-muted-foreground truncate">
                            {initiative.observations || "—"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono">
                          {initiative.dateSoumission
                            ? new Date(initiative.dateSoumission).toLocaleDateString("fr-FR")
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
