/**
 * SGG Digital — Mon Secteur Dashboard
 * Page dynamique qui s'adapte au ministère du SG connecté
 * Affiche les KPI et liens vers les pages sectorielles pertinentes
 */

import { useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  ArrowRight,
  TrendingUp,
  Users,
  Wallet,
  BarChart3,
  Shield,
  Briefcase,
  HeartPulse,
  Zap,
  Scale,
  TreePine,
  GraduationCap,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useDemoUser } from '@/hooks/useDemoUser';
import { MINISTERES_REGISTRY, type MinistereEntry } from '@/config/ministeresRegistry';
import { InfoButton } from '@/components/reporting/InfoButton';

// Mapping catégorie → pages sectorielles pertinentes
const SECTOR_LINKS: Record<string, Array<{ label: string; href: string; icon: typeof BarChart3; description: string }>> = {
  souverainete: [
    { label: 'Registre électoral', href: '/elections', icon: Shield, description: 'Listes électorales et résultats' },
    { label: 'État civil', href: '/etat-civil', icon: Users, description: 'Naissances, mariages, décès' },
    { label: 'Budget de l\'État', href: '/budget', icon: Wallet, description: 'Exécution budgétaire' },
    { label: 'Effectifs publics', href: '/effectifs', icon: Users, description: 'Agents de la fonction publique' },
  ],
  economique: [
    { label: 'Budget de l\'État', href: '/budget', icon: Wallet, description: 'Exécution budgétaire' },
    { label: 'Commerce & Entreprises', href: '/entreprises', icon: Briefcase, description: 'Registre du commerce' },
    { label: 'Marchés publics', href: '/marches-publics', icon: Scale, description: 'Appels d\'offres et contrats' },
    { label: 'Énergie', href: '/energie', icon: Zap, description: 'Production électrique et pétrole' },
    { label: 'Dette publique', href: '/dette-publique', icon: Wallet, description: 'Soutenabilité de la dette' },
  ],
  social: [
    { label: 'Santé publique', href: '/sante', icon: HeartPulse, description: 'Indicateurs de santé' },
    { label: 'Éducation nationale', href: '/education', icon: GraduationCap, description: 'Taux de scolarisation' },
    { label: 'Emploi & Formation', href: '/emploi', icon: Briefcase, description: 'Marché du travail' },
    { label: 'Démographie', href: '/demographie', icon: Users, description: 'Population et tendances' },
    { label: 'Protection sociale', href: '/protection-sociale', icon: HeartPulse, description: 'CNAMGS et aides sociales' },
  ],
  technique: [
    { label: 'Eaux & Forêts', href: '/eaux-forets', icon: TreePine, description: 'Gestion forestière' },
    { label: 'Agriculture', href: '/agriculture', icon: TreePine, description: 'Production agricole' },
    { label: 'Transports', href: '/transports', icon: BarChart3, description: 'Réseau de transport' },
    { label: 'Habitat & Urbanisme', href: '/habitat', icon: Building2, description: 'Permis de construire' },
    { label: 'Budget de l\'État', href: '/budget', icon: Wallet, description: 'Exécution budgétaire' },
  ],
};

// Indicateurs clés par catégorie
const SECTOR_KPIS: Record<string, Array<{ label: string; value: string; trend: string; color: string }>> = {
  souverainete: [
    { label: 'Inscrits électoraux', value: '1.2M', trend: '+3.2%', color: 'text-blue-600' },
    { label: 'Actes état civil', value: '45.2K', trend: '+8.1%', color: 'text-emerald-600' },
    { label: 'Agents publics', value: '82.5K', trend: '+1.5%', color: 'text-purple-600' },
    { label: 'Taux couverture ID', value: '78%', trend: '+5pp', color: 'text-amber-600' },
  ],
  economique: [
    { label: 'PIB nominal', value: '11.4T FCFA', trend: '+4.8%', color: 'text-emerald-600' },
    { label: 'Recettes fiscales', value: '2.8T FCFA', trend: '+12%', color: 'text-blue-600' },
    { label: 'Investissements', value: '890Mds', trend: '+15%', color: 'text-purple-600' },
    { label: 'Entreprises créées', value: '3.2K', trend: '+22%', color: 'text-amber-600' },
  ],
  social: [
    { label: 'Espérance de vie', value: '66.5 ans', trend: '+0.8', color: 'text-emerald-600' },
    { label: 'Taux scolarisation', value: '89%', trend: '+2pp', color: 'text-blue-600' },
    { label: 'Couverture CNAMGS', value: '72%', trend: '+5pp', color: 'text-purple-600' },
    { label: 'Taux chômage', value: '20.3%', trend: '-1.2pp', color: 'text-amber-600' },
  ],
  technique: [
    { label: 'Production électrique', value: '2.4 GWh', trend: '+8%', color: 'text-emerald-600' },
    { label: 'Surface forestière', value: '22.8M ha', trend: '-0.3%', color: 'text-blue-600' },
    { label: 'Routes bitumées', value: '1,320 km', trend: '+45km', color: 'text-purple-600' },
    { label: 'Production agricole', value: '385K T', trend: '+6%', color: 'text-amber-600' },
  ],
};

const CATEGORY_LABELS: Record<string, string> = {
  souverainete: 'Souveraineté',
  economique: 'Économie & Finance',
  social: 'Social & Humain',
  technique: 'Technique & Environnement',
};

export default function MonSecteurDashboard() {
  const { demoUser } = useDemoUser();

  // Trouver le ministère du SG
  const ministere: MinistereEntry | undefined = useMemo(() => {
    if (!demoUser?.ministereId) return undefined;
    return MINISTERES_REGISTRY.find(
      (m) => m.id === demoUser.ministereId || m.code === demoUser.ministereId
    );
  }, [demoUser?.ministereId]);

  const categorie = ministere?.categorie || 'economique';
  const sectorLinks = SECTOR_LINKS[categorie] || SECTOR_LINKS.economique;
  const sectorKPIs = SECTOR_KPIS[categorie] || SECTOR_KPIS.economique;
  const categoryLabel = CATEGORY_LABELS[categorie] || 'Économie';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-government-gold" />
            Mon Secteur
            <InfoButton pageId="mon-secteur" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {ministere
              ? `Données et indicateurs pour le secteur ${categoryLabel} — ${ministere.nom}`
              : 'Connectez-vous avec un compte SG pour voir les données de votre secteur'}
          </p>
        </div>

        {/* Ministère info */}
        {ministere && (
          <Card className="bg-gradient-to-r from-government-navy/5 to-government-gold/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-government-gold/20">
                  <Building2 className="h-6 w-6 text-government-gold" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold">{ministere.nom}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{ministere.sigle}</Badge>
                    <Badge variant="secondary">{categoryLabel}</Badge>
                    <Badge variant="outline" className="text-[10px]">Ordre protocolaire: {ministere.ordreProtocole}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {sectorKPIs.map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{kpi.label}</p>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-xl font-bold">{kpi.value}</span>
                  <span className={`text-xs font-medium ${kpi.color}`}>
                    <TrendingUp className="h-3 w-3 inline mr-0.5" />
                    {kpi.trend}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pages sectorielles pertinentes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Données sectorielles disponibles</CardTitle>
            <CardDescription>
              Tableaux de bord liés au secteur {categoryLabel}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sectorLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink key={link.href} to={link.href}>
                    <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 hover:border-government-gold/30 transition-all cursor-pointer">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{link.label}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{link.description}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Directions sous tutelle */}
        {ministere && ministere.directions.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Directions sous tutelle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {ministere.directions.map((dir) => (
                  <Badge key={dir.id} variant="outline" className="py-1.5 px-3">
                    <span className="font-semibold mr-1">{dir.sigle}</span>
                    <span className="text-muted-foreground">{dir.nom}</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
