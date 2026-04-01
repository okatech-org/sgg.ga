/**
 * SGG Digital — Modèles & Templates
 * Grille de cartes avec templates téléchargeables pour les SG
 */

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Table2,
  Scale,
  FolderOpen,
  Mail,
  ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';
import { InfoButton } from '@/components/reporting/InfoButton';

interface TemplateItem {
  id: string;
  title: string;
  description: string;
  format: string;
  icon: typeof FileText;
  category: 'reporting' | 'ptm' | 'officiel' | 'autre';
  size: string;
}

const TEMPLATES: TemplateItem[] = [
  {
    id: 'tpl-reporting-mensuel',
    title: 'Rapport mensuel GAR/PAG',
    description: 'Template Excel pour la saisie mensuelle des indicateurs GAR. Pré-rempli avec les 21 colonnes réglementaires.',
    format: 'Excel (.xlsx)',
    icon: Table2,
    category: 'reporting',
    size: '245 Ko',
  },
  {
    id: 'tpl-reporting-resume',
    title: 'Résumé exécutif mensuel',
    description: 'Document Word résumant les points clés du reporting mensuel. À joindre au rapport Excel.',
    format: 'Word (.docx)',
    icon: FileText,
    category: 'reporting',
    size: '78 Ko',
  },
  {
    id: 'tpl-ptm-initiative',
    title: 'Fiche initiative PTM',
    description: 'Template pour documenter une initiative du Programme de Travail Ministériel (10 colonnes).',
    format: 'Excel (.xlsx)',
    icon: FileSpreadsheet,
    category: 'ptm',
    size: '180 Ko',
  },
  {
    id: 'tpl-ptm-matrice',
    title: 'Matrice PTM/PTG complète',
    description: 'Matrice consolidée du programme de travail avec les 3 rubriques. Pour le SG lors de la consolidation.',
    format: 'Excel (.xlsx)',
    icon: FileSpreadsheet,
    category: 'ptm',
    size: '320 Ko',
  },
  {
    id: 'tpl-note-presentation',
    title: 'Note de présentation',
    description: 'Template pour la note de présentation d\'un projet de texte au Conseil des ministres.',
    format: 'Word (.docx)',
    icon: Scale,
    category: 'officiel',
    size: '95 Ko',
  },
  {
    id: 'tpl-courrier-officiel',
    title: 'Courrier officiel',
    description: 'En-tête officielle pour la correspondance entre institutions. Conforme au protocole gabonais.',
    format: 'Word (.docx)',
    icon: Mail,
    category: 'officiel',
    size: '65 Ko',
  },
  {
    id: 'tpl-expose-motifs',
    title: 'Exposé des motifs',
    description: 'Template pour l\'exposé des motifs accompagnant un projet de loi ou décret.',
    format: 'Word (.docx)',
    icon: FileText,
    category: 'officiel',
    size: '88 Ko',
  },
  {
    id: 'tpl-fiche-suivi',
    title: 'Fiche de suivi d\'exécution',
    description: 'Fiche de suivi mensuel de l\'exécution du budget et des programmes. Pour chaque direction.',
    format: 'Excel (.xlsx)',
    icon: ClipboardList,
    category: 'autre',
    size: '150 Ko',
  },
  {
    id: 'tpl-pv-reunion',
    title: 'Procès-verbal de réunion',
    description: 'Template de PV pour les réunions de coordination et comités de pilotage.',
    format: 'Word (.docx)',
    icon: FolderOpen,
    category: 'autre',
    size: '72 Ko',
  },
];

const CATEGORY_CONFIG = {
  reporting: { label: 'Reporting', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' },
  ptm: { label: 'PTM/PTG', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' },
  officiel: { label: 'Documents officiels', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400' },
  autre: { label: 'Autre', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
};

export default function ModelesPage() {
  const handleDownload = (template: TemplateItem) => {
    // En mode démo, on affiche un toast au lieu de télécharger
    toast.success(`Template "${template.title}" prêt au téléchargement`, {
      description: `Format: ${template.format} — Taille: ${template.size}`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Download className="h-6 w-6 text-government-gold" />
            Modèles & Templates
            <InfoButton pageId="modeles" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Templates officiels pour le reporting, le PTM, les notes de présentation et la correspondance
          </p>
        </div>

        {/* Categories */}
        {(['reporting', 'ptm', 'officiel', 'autre'] as const).map((cat) => {
          const catTemplates = TEMPLATES.filter((t) => t.category === cat);
          if (catTemplates.length === 0) return null;
          const config = CATEGORY_CONFIG[cat];

          return (
            <div key={cat}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                <Badge className={`${config.color} text-[10px]`}>{config.label}</Badge>
                <span className="text-xs font-normal">({catTemplates.length} modèle{catTemplates.length > 1 ? 's' : ''})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {catTemplates.map((tpl) => {
                  const Icon = tpl.icon;
                  return (
                    <Card key={tpl.id} className="hover:border-government-gold/30 transition-all">
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-sm">{tpl.title}</CardTitle>
                            <CardDescription className="text-xs mt-0.5 line-clamp-2">
                              {tpl.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px]">{tpl.format}</Badge>
                            <span className="text-[10px] text-muted-foreground">{tpl.size}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(tpl)}
                            className="text-primary hover:text-primary"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            <span className="text-xs">Télécharger</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
