/**
 * SGG Digital — Cohérence PTM ↔ Reporting PAG
 * Phase 3: unified dashboard — Alignment between PTM initiatives and PAG reporting programmes
 */

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { ArrowLeftRight, Link2, AlertCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { InfoButton } from "@/components/reporting/InfoButton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { INITIATIVES_PTM } from "@/data/ptmData";
import { PROGRAMMES, RAPPORTS_MENSUELS, PILIERS } from "@/data/reportingData";

export default function PTMCoherence() {
  const [annee] = useState(2026);

  // KPI 1: Couverture PAG
  const kpiCouverture = useMemo(() => {
    const programmesAvecPTM = PROGRAMMES.filter((prog) =>
      INITIATIVES_PTM.some(
        (init) => init.statut === 'inscrit_ptg' && init.programmePAGId === prog.id
      )
    );
    const couverture = Math.round((programmesAvecPTM.length / PROGRAMMES.length) * 100);
    return {
      couverture,
      programmesCouverts: programmesAvecPTM.length,
      totalProgrammes: PROGRAMMES.length,
    };
  }, []);

  // KPI 2: Pont de Données
  const kpiPont = useMemo(() => {
    const initiativesAvecRapport = INITIATIVES_PTM.filter((init) =>
      init.statut === 'inscrit_ptg' && init.rapportMensuelId
    );
    return initiativesAvecRapport.length;
  }, []);

  // KPI 3: Écart Planification/Exécution
  const kpiEcart = useMemo(() => {
    const programmesSansCouvrage = PROGRAMMES.filter((prog) =>
      !INITIATIVES_PTM.some((init) => init.programmePAGId === prog.id)
    );
    return programmesSansCouvrage.length;
  }, []);

  // Section 1: Initiatives inscrites au PTG avec lien Reporting
  const initiativesAvecLien = useMemo(() => {
    return INITIATIVES_PTM.filter((init) => init.statut === 'inscrit_ptg' && init.programmePAGId).map(
      (init) => {
        const programme = PROGRAMMES.find((p) => p.id === init.programmePAGId);
        const rapport = RAPPORTS_MENSUELS.find((r) => r.id === init.rapportMensuelId);
        const pilier = programme ? PILIERS.find((p) => p.id === programme.pilierId) : null;

        return {
          id: init.id,
          intitule: init.intitule,
          programmePAG: programme?.libelleProgramme || 'N/A',
          ministere: init.ministereNom,
          statutPTM: init.statut,
          statutReporting: rapport?.statutValidation || 'Non lié',
          pilier: pilier?.nom || 'N/A',
          pctExec: rapport?.pctExecutionFinanciere || 0,
          ecart: rapport
            ? Math.abs(rapport.pctExecutionFinanciere - rapport.pctAvancementPhysique)
            : null,
        };
      }
    );
  }, []);

  // Section 2: Programmes PAG sans couverture PTM
  const programmesSansCouvrage = useMemo(() => {
    return PROGRAMMES.filter((prog) =>
      !INITIATIVES_PTM.some((init) => init.programmePAGId === prog.id)
    ).map((prog) => {
      const pilier = PILIERS.find((p) => p.id === prog.pilierId);
      return {
        id: prog.id,
        code: prog.codeProgramme,
        libelle: prog.libelleProgramme,
        pilier: pilier?.nom || 'N/A',
        couleurPilier: pilier?.couleur,
      };
    });
  }, []);

  // Section 3: Chart data - Par pilier: count programmes PAG vs initiatives PTM inscrites
  const chartData = useMemo(() => {
    return PILIERS.map((pilier) => {
      const progsParPilier = PROGRAMMES.filter((p) => p.pilierId === pilier.id);
      const initiativesInscrites = INITIATIVES_PTM.filter((init) =>
        init.statut === 'inscrit_ptg' && init.programmePAGId &&
        progsParPilier.some((p) => p.id === init.programmePAGId)
      );

      return {
        pilier: pilier.nom.split(' ')[0], // Short name
        pilierComplet: pilier.nom,
        programmes: progsParPilier.length,
        initiativesInscrites: initiativesInscrites.length,
        couverture: progsParPilier.length > 0
          ? Math.round((initiativesInscrites.length / progsParPilier.length) * 100)
          : 0,
      };
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valide_sgpr':
        return 'bg-status-success/10 text-status-success border-status-success/20';
      case 'valide_sgg':
        return 'bg-status-warning/10 text-status-warning border-status-warning/20';
      case 'soumis':
        return 'bg-status-info/10 text-status-info border-status-info/20';
      case 'brouillon':
        return 'bg-muted text-muted-foreground border-muted';
      case 'inscrit_ptg':
        return 'bg-status-success/10 text-status-success border-status-success/20';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ArrowLeftRight className="h-6 w-6 text-government-gold" />
            Cohérence PTM ↔ Reporting PAG
            <InfoButton pageId="ptm-coherence" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Phase 3 — Alignement des initiatives PTM/PTG avec le reporting d'exécution des programmes PAG
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Couverture PAG</p>
                  <p className="text-3xl font-bold">{kpiCouverture.couverture}%</p>
                  <p className="text-xs text-muted-foreground">
                    {kpiCouverture.programmesCouverts}/{kpiCouverture.totalProgrammes} programmes
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-status-success flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Pont de Données</p>
                  <p className="text-3xl font-bold">{kpiPont}</p>
                  <p className="text-xs text-muted-foreground">initiatives avec rapportMensuelId</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-status-info flex items-center justify-center">
                  <Link2 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Écart Planification/Exécution</p>
                  <p className="text-3xl font-bold text-status-danger">{kpiEcart}</p>
                  <p className="text-xs text-muted-foreground">programmes sans couverture PTM</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-status-danger flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 1: Initiatives inscrites au PTG avec lien Reporting */}
        <Card className="shadow-gov">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Initiatives inscrites au PTG avec lien Reporting
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {initiativesAvecLien.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Intitulé PTM</TableHead>
                    <TableHead>Programme PAG lié</TableHead>
                    <TableHead>Pilier</TableHead>
                    <TableHead>Ministère</TableHead>
                    <TableHead>Statut PTM</TableHead>
                    <TableHead>Statut Reporting</TableHead>
                    <TableHead className="text-right">% Exécution</TableHead>
                    <TableHead className="text-right">Écart</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initiativesAvecLien.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="max-w-xs truncate text-sm font-medium">
                        {item.intitule}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm">
                        {item.programmePAG}
                      </TableCell>
                      <TableCell className="text-sm">{item.pilier}</TableCell>
                      <TableCell className="text-sm">{item.ministere}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs bg-status-success/10 text-status-success border-status-success/20">
                          Inscrit PTG
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("text-xs", getStatusColor(item.statutReporting))}
                        >
                          {item.statutReporting === 'valide_sgpr' && 'Validé SGPR'}
                          {item.statutReporting === 'valide_sgg' && 'Validé SGG'}
                          {item.statutReporting === 'soumis' && 'Soumis'}
                          {item.statutReporting === 'brouillon' && 'Brouillon'}
                          {item.statutReporting === 'Non lié' && 'Non lié'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {item.pctExec}%
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {item.ecart !== null ? (
                          <span className={item.ecart > 20 ? 'text-status-danger font-bold' : 'text-muted-foreground'}>
                            {item.ecart.toFixed(0)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                Aucune initiative PTM inscrite au PTG avec lien vers un programme PAG
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Programmes PAG sans couverture PTM */}
        <Card className="shadow-gov border-status-danger/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-status-danger">
              <AlertCircle className="h-4 w-4" />
              Programmes PAG sans couverture PTM
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {programmesSansCouvrage.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code Programme</TableHead>
                    <TableHead>Libellé</TableHead>
                    <TableHead>Pilier</TableHead>
                    <TableHead className="text-right">Couverture</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programmesSansCouvrage.map((prog) => (
                    <TableRow key={prog.id}>
                      <TableCell className="font-mono font-medium text-sm">{prog.code}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm">{prog.libelle}</TableCell>
                      <TableCell className="text-sm">{prog.pilier}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="destructive" className="text-xs">
                          Non couvert
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-status-success">
                Tous les programmes PAG sont couverts par au moins une initiative PTM
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 3: Chart - Couverture par Pilier */}
        <Card className="shadow-gov">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Couverture par Pilier: Programmes PAG vs Initiatives PTM</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="pilier" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `${v}`} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                  formatter={(value, name) => {
                    if (name === 'programmes') return [value, 'Programmes PAG'];
                    if (name === 'initiativesInscrites') return [value, 'Initiatives Inscrites PTG'];
                    return value;
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => {
                    if (value === 'programmes') return 'Programmes PAG';
                    if (value === 'initiativesInscrites') return 'Initiatives Inscrites PTG';
                    return value;
                  }}
                />
                <Bar dataKey="programmes" name="programmes" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="initiativesInscrites" name="initiativesInscrites" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* Detailed table below chart */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-t">
                    <th className="text-left py-2 px-2 font-medium">Pilier</th>
                    <th className="text-center py-2 px-2 font-medium">Programmes PAG</th>
                    <th className="text-center py-2 px-2 font-medium">Initiatives PTM Inscrites</th>
                    <th className="text-center py-2 px-2 font-medium">Taux de Couverture</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row) => (
                    <tr key={row.pilierComplet} className="border-t hover:bg-muted/50">
                      <td className="py-2 px-2">{row.pilierComplet}</td>
                      <td className="text-center py-2 px-2 font-medium">{row.programmes}</td>
                      <td className="text-center py-2 px-2 font-medium">{row.initiativesInscrites}</td>
                      <td className="text-center py-2 px-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className={cn(
                                  row.couverture === 100
                                    ? 'bg-status-success/10 text-status-success border-status-success/20'
                                    : row.couverture >= 50
                                    ? 'bg-status-warning/10 text-status-warning border-status-warning/20'
                                    : 'bg-status-danger/10 text-status-danger border-status-danger/20'
                                )}
                              >
                                {row.couverture}%
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">
                                {row.initiativesInscrites} / {row.programmes} programmes couverts
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
