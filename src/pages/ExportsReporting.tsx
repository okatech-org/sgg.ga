/**
 * SGG Digital — Exports Reporting
 * Page d'export de la matrice en différents formats
 */

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { PILIERS, PROGRAMMES } from "@/data/reportingData";

const MOIS_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const FORMATS = [
  {
    id: 'excel',
    label: 'Excel (.xlsx)',
    description: 'Matrice complète avec mise en forme, groupes de colonnes et formules',
    icon: FileSpreadsheet,
    color: 'text-green-600',
  },
  {
    id: 'pdf',
    label: 'PDF Synthèse',
    description: 'Rapport formaté en A4 paysage avec en-tête République Gabonaise',
    icon: FileText,
    color: 'text-red-600',
  },
  {
    id: 'csv',
    label: 'CSV',
    description: 'Format plat UTF-8, séparateur point-virgule (compatible SIGFIP)',
    icon: FileDown,
    color: 'text-blue-600',
  },
];

export default function ExportsReporting() {
  const [mois, setMois] = useState("1");
  const [annee, setAnnee] = useState("2026");
  const [scope, setScope] = useState("all");
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (formatId: string) => {
    setLoading(formatId);

    // Simulation export
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const format = FORMATS.find(f => f.id === formatId)!;
    toast.success(`Export ${format.label} généré avec succès`);
    setLoading(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Download className="h-6 w-6 text-government-gold" />
            Exports Reporting
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Générer et télécharger la matrice de reporting dans différents formats
          </p>
        </div>

        {/* Paramètres */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Paramètres d'export</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Période</label>
                <div className="flex gap-2">
                  <Select value={mois} onValueChange={setMois}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MOIS_LABELS.map((label, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={annee} onValueChange={setAnnee}>
                    <SelectTrigger className="w-[90px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Périmètre</label>
                <Select value={scope} onValueChange={setScope}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les programmes ({PROGRAMMES.length})</SelectItem>
                    {PILIERS.map((p) => (
                      <SelectItem key={p.id} value={`pilier-${p.id}`}>
                        Pilier {p.id}: {p.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Badge variant="secondary">
                  {MOIS_LABELS[parseInt(mois) - 1]} {annee} — {scope === 'all' ? `${PROGRAMMES.length} programmes` : ''}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formats d'export */}
        <div className="grid gap-4 md:grid-cols-3">
          {FORMATS.map((format) => {
            const Icon = format.icon;
            const isLoading = loading === format.id;

            return (
              <Card
                key={format.id}
                className="transition-all hover:shadow-gov-lg hover:border-government-gold/30"
              >
                <CardHeader>
                  <div className={`${format.color}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-base mt-2">{format.label}</CardTitle>
                  <CardDescription className="text-xs">
                    {format.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => handleExport(format.id)}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> Les exports contiennent uniquement les données publiées (validées SGPR).
              Les rapports en brouillon ou en cours de validation ne sont pas inclus dans les exports publics.
              Source: SGG Digital — Secrétariat Général du Gouvernement.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
