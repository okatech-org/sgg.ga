/**
 * SGG Digital — Agriculture & Sécurité Alimentaire
 *
 * Suivi de la production agricole et sécurité alimentaire :
 *   - Production par filière
 *   - Surfaces cultivées
 *   - Importations alimentaires
 *   - Autosuffisance et projets agricoles
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Wheat, Leaf, TrendingUp, TrendingDown,
    MapPin, Droplets, Sun, ShoppingCart,
    Factory, BarChart3,
} from 'lucide-react';

// ── Data ────────────────────────────────────────────────────────────────────

interface Crop {
    name: string;
    production: number; // tonnes
    area: number; // hectares
    yield: number; // T/ha
    trend: 'up' | 'down' | 'stable';
    selfSufficiency: number; // %
    importDependency: number; // %
}

interface AgroProject {
    name: string;
    location: string;
    budget: number; // Mds FCFA
    type: string;
    hectares: number;
    operator: string;
    status: string;
}

const GLOBAL = {
    cultivatedArea: 325_000, // ha
    arableLand: 5_200_000, // ha
    exploitationRate: 6.3, // %
    agriGDP: 4.8, // %
    foodImports: 680, // Mds FCFA
    ruralPop: 780_000,
    cooperatives: 420,
    budgetAgri: 85, // Mds FCFA
};

const CROPS: Crop[] = [
    { name: 'Manioc', production: 330_000, area: 85_000, yield: 3.9, trend: 'up', selfSufficiency: 85, importDependency: 15 },
    { name: 'Banane plantain', production: 280_000, area: 62_000, yield: 4.5, trend: 'stable', selfSufficiency: 78, importDependency: 22 },
    { name: 'Huile de palme', production: 42_000, area: 45_000, yield: 0.9, trend: 'up', selfSufficiency: 35, importDependency: 65 },
    { name: 'Cacao', production: 2_800, area: 8_500, yield: 0.33, trend: 'down', selfSufficiency: 100, importDependency: 0 },
    { name: 'Café', production: 800, area: 3_200, yield: 0.25, trend: 'down', selfSufficiency: 100, importDependency: 0 },
    { name: 'Riz', production: 3_500, area: 4_800, yield: 0.73, trend: 'up', selfSufficiency: 8, importDependency: 92 },
    { name: 'Igname', production: 45_000, area: 12_000, yield: 3.75, trend: 'stable', selfSufficiency: 70, importDependency: 30 },
    { name: 'Arachide', production: 18_000, area: 8_000, yield: 2.25, trend: 'stable', selfSufficiency: 90, importDependency: 10 },
    { name: 'Canne à sucre', production: 250_000, area: 7_500, yield: 33.3, trend: 'up', selfSufficiency: 40, importDependency: 60 },
    { name: 'Hévéa', production: 15_000, area: 12_000, yield: 1.25, trend: 'up', selfSufficiency: 100, importDependency: 0 },
];

const PROJECTS: AgroProject[] = [
    { name: 'GRAINE (Gabonaise de Réalisations Agricoles)', location: 'Multi-provinces', budget: 65, type: 'Vivrier', hectares: 200_000, operator: 'Olam / État', status: '45% réalisé' },
    { name: 'Projet rizicole de la Ngounié', location: 'Ngounié', budget: 12, type: 'Riz', hectares: 5_000, operator: 'Coopératives locales', status: 'Phase pilote' },
    { name: 'Palmeraie SIAT Gabon', location: 'Moyen-Ogooué', budget: 35, type: 'Palmier à huile', hectares: 38_000, operator: 'SIAT', status: 'Exploitation' },
    { name: 'SUCAF — Canne à sucre Franceville', location: 'Haut-Ogooué', budget: 18, type: 'Sucre', hectares: 7_500, operator: 'SUCAF / Somdiaa', status: 'Production' },
    { name: 'Projet avicole Nkok', location: 'Estuaire', budget: 8, type: 'Élevage', hectares: 50, operator: 'SOGAPEL', status: 'En construction' },
    { name: 'Ferme aquacole de Lambaréné', location: 'Moyen-Ogooué', budget: 5, type: 'Pisciculture', hectares: 200, operator: 'Privé / BAD', status: 'Opérationnel' },
];

const FOOD_IMPORTS = [
    { category: 'Céréales (riz, blé)', value: 195, pct: 29 },
    { category: 'Viandes & volailles', value: 142, pct: 21 },
    { category: 'Produits laitiers', value: 85, pct: 13 },
    { category: 'Huiles alimentaires', value: 78, pct: 11 },
    { category: 'Sucre & confiseries', value: 62, pct: 9 },
    { category: 'Fruits & légumes', value: 55, pct: 8 },
    { category: 'Boissons', value: 42, pct: 6 },
    { category: 'Autres', value: 21, pct: 3 },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function AgricultureDashboardPage() {
    const [view, setView] = useState<'crops' | 'imports' | 'projects'>('crops');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Wheat className="h-7 w-7 text-lime-600" />
                            Agriculture & Sécurité Alimentaire
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.cultivatedArea.toLocaleString()} ha cultivés · Importations : {GLOBAL.foodImports} Mds FCFA · Budget : {GLOBAL.budgetAgri} Mds
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">Plan GRAINE 2024-2028</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-lime-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Leaf className="h-5 w-5 text-lime-500" />
                            <div><p className="text-lg font-bold text-lime-600">{GLOBAL.exploitationRate}%</p><p className="text-[10px] text-muted-foreground">Terres exploitées</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-red-500" />
                            <div><p className="text-lg font-bold text-red-600">{GLOBAL.foodImports} Mds</p><p className="text-[10px] text-muted-foreground">Import alimentaire</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Factory className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{GLOBAL.cooperatives}</p><p className="text-[10px] text-muted-foreground">Coopératives</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{GLOBAL.agriGDP}%</p><p className="text-[10px] text-muted-foreground">PIB agricole</p></div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex gap-1">
                    <Button variant={view === 'crops' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('crops')}>Filières</Button>
                    <Button variant={view === 'imports' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('imports')}>Importations</Button>
                    <Button variant={view === 'projects' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('projects')}>Projets</Button>
                </div>

                {view === 'crops' && (
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-xs">
                                <thead><tr className="border-b bg-muted/30 text-[9px] text-muted-foreground">
                                    <th className="text-left py-2 px-3">Filière</th>
                                    <th className="text-center py-2 px-2">Production</th>
                                    <th className="text-center py-2 px-2">Surface</th>
                                    <th className="text-center py-2 px-2">Rdt</th>
                                    <th className="text-center py-2 px-2">Autosuffisance</th>
                                    <th className="text-center py-2 px-2">Tend.</th>
                                </tr></thead>
                                <tbody>{CROPS.map((c, i) => (
                                    <tr key={i} className={`border-b hover:bg-muted/20 ${c.importDependency > 50 ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                                        <td className="py-2 px-3 font-bold flex items-center gap-1">{c.name}</td>
                                        <td className="text-center py-2 px-2 font-mono">{c.production.toLocaleString()}</td>
                                        <td className="text-center py-2 px-2">{c.area.toLocaleString()} ha</td>
                                        <td className="text-center py-2 px-2">{c.yield} T/ha</td>
                                        <td className="text-center py-2 px-2">
                                            <div className="flex items-center justify-center gap-1">
                                                <div className="w-10 h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${c.selfSufficiency >= 70 ? 'bg-green-500' : c.selfSufficiency >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${c.selfSufficiency}%` }} />
                                                </div>
                                                <span className={`text-[9px] ${c.selfSufficiency < 40 ? 'text-red-600 font-bold' : ''}`}>{c.selfSufficiency}%</span>
                                            </div>
                                        </td>
                                        <td className="text-center py-2 px-2">
                                            {c.trend === 'up' ? <TrendingUp className="h-3 w-3 text-green-500 mx-auto" /> :
                                                c.trend === 'down' ? <TrendingDown className="h-3 w-3 text-red-500 mx-auto" /> :
                                                    <span className="text-gray-400">—</span>}
                                        </td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}

                {view === 'imports' && (
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Importations alimentaires — {GLOBAL.foodImports} Mds FCFA / an</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {FOOD_IMPORTS.map((fi, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-[10px] mb-0.5">
                                        <span className="font-bold">{fi.category}</span>
                                        <span>{fi.value} Mds ({fi.pct}%)</span>
                                    </div>
                                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full rounded-full bg-red-400" style={{ width: `${fi.pct}%` }} />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {view === 'projects' && (
                    <div className="space-y-2">
                        {PROJECTS.map((p, i) => (
                            <Card key={i}>
                                <CardContent className="p-3 flex items-center gap-3">
                                    <div className="w-7 h-7 rounded bg-lime-50 dark:bg-lime-900/20 flex items-center justify-center shrink-0">
                                        <Sun className="h-3.5 w-3.5 text-lime-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold">{p.name}</p>
                                        <div className="flex items-center gap-2 text-[9px] text-muted-foreground flex-wrap">
                                            <Badge variant="outline" className="text-[7px] h-3">{p.type}</Badge>
                                            <span className="font-bold text-foreground">{p.budget} Mds FCFA</span>
                                            <span>{p.hectares.toLocaleString()} ha</span>
                                            <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{p.location}</span>
                                            <span>→ {p.operator}</span>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-[7px] h-3.5 shrink-0">{p.status}</Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
