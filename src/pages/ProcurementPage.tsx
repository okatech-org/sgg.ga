/**
 * SGG Digital — Registre des Marchés Publics
 *
 * Suivi des marchés publics et appels d'offres :
 *   - Marchés en cours et attribués
 *   - Montants et adjudicataires
 *   - Catégories (travaux, fournitures, services)
 *   - Transparence et conformité
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Gavel, Search, FileCheck, Clock,
    Building2, DollarSign, TrendingUp,
    CheckCircle2, AlertTriangle, XCircle,
    Filter, Calendar,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type ProcurementStatus = 'open' | 'evaluation' | 'awarded' | 'in-progress' | 'completed' | 'cancelled';
type ProcurementCategory = 'Travaux' | 'Fournitures' | 'Services' | 'Consultance';

interface Procurement {
    id: string;
    ref: string;
    title: string;
    category: ProcurementCategory;
    status: ProcurementStatus;
    entity: string;
    amount: number; // Millions FCFA
    awardee?: string;
    publishDate: string;
    deadline?: string;
    province: string;
}

// ── Config ──────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<ProcurementStatus, { label: string; badge: string }> = {
    open: { label: 'Ouvert', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    evaluation: { label: 'Évaluation', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    awarded: { label: 'Attribué', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    'in-progress': { label: 'Exécution', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
    completed: { label: 'Terminé', badge: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    cancelled: { label: 'Annulé', badge: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const PROCUREMENTS: Procurement[] = [
    { id: 'mp1', ref: 'AO-2026-001', title: 'Construction de 15 lycées dans les provinces (Lot 1 : Estuaire, Haut-Ogooué)', category: 'Travaux', status: 'open', entity: 'MENETP', amount: 45_000, publishDate: '5 fév 2026', deadline: '5 mar 2026', province: 'Multi-provinces' },
    { id: 'mp2', ref: 'AO-2026-002', title: 'Fourniture de 5 000 ordinateurs pour la digitalisation administrative', category: 'Fournitures', status: 'evaluation', entity: 'MTNHDN', amount: 8_500, publishDate: '15 jan 2026', deadline: '15 fév 2026', province: 'Estuaire' },
    { id: 'mp3', ref: 'AO-2025-148', title: 'Réhabilitation route nationale N1 (tronçon Kango-Ntoum)', category: 'Travaux', status: 'awarded', entity: 'MINTRANS', amount: 32_000, publishDate: '10 nov 2025', awardee: 'Colas Gabon', province: 'Estuaire' },
    { id: 'mp4', ref: 'AO-2025-152', title: 'Système de gestion électronique de documents (GED) SGG', category: 'Services', status: 'in-progress', entity: 'SGG', amount: 2_800, publishDate: '20 déc 2025', awardee: 'OKA Tech SARL', province: 'Estuaire' },
    { id: 'mp5', ref: 'AO-2025-145', title: 'Fourniture d\'équipements médicaux CHR Franceville', category: 'Fournitures', status: 'in-progress', entity: 'MINSANTE', amount: 5_200, publishDate: '1 oct 2025', awardee: 'MedEquip Africa', province: 'Haut-Ogooué' },
    { id: 'mp6', ref: 'AO-2026-005', title: 'Audit des comptes publics 2025', category: 'Consultance', status: 'open', entity: 'MINEFI', amount: 1_200, publishDate: '1 fév 2026', deadline: '28 fév 2026', province: 'Estuaire' },
    { id: 'mp7', ref: 'AO-2025-140', title: 'Construction pont Kango sur l\'Estuaire du Komo', category: 'Travaux', status: 'awarded', entity: 'MINTRANS', amount: 85_000, publishDate: '1 sep 2025', awardee: 'China Road & Bridge Corp.', province: 'Estuaire' },
    { id: 'mp8', ref: 'AO-2025-155', title: 'Mise en place du réseau fibre optique provinces Sud', category: 'Travaux', status: 'evaluation', entity: 'MTNHDN', amount: 22_000, publishDate: '1 déc 2025', province: 'Ngounié / Nyanga' },
    { id: 'mp9', ref: 'AO-2025-130', title: 'Consultant international — Réforme de la Fonction Publique', category: 'Consultance', status: 'completed', entity: 'MFPRE', amount: 950, publishDate: '1 juil 2025', awardee: 'PwC Advisory', province: 'Estuaire' },
    { id: 'mp10', ref: 'AO-2025-160', title: 'Fourniture de 200 véhicules administratifs', category: 'Fournitures', status: 'cancelled', entity: 'Budget National', amount: 12_000, publishDate: '15 déc 2025', province: 'National' },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function ProcurementPage() {
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState<ProcurementCategory | 'all'>('all');

    const filtered = useMemo(() => {
        return PROCUREMENTS.filter(p => {
            if (catFilter !== 'all' && p.category !== catFilter) return false;
            if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.ref.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [search, catFilter]);

    const totalAmount = PROCUREMENTS.reduce((s, p) => s + p.amount, 0);
    const categories: ProcurementCategory[] = ['Travaux', 'Fournitures', 'Services', 'Consultance'];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Gavel className="h-7 w-7 text-violet-600" />
                            Marchés Publics
                        </h1>
                        <p className="text-muted-foreground">
                            {PROCUREMENTS.length} marchés · Montant total : {(totalAmount / 1000).toFixed(1)} Mds FCFA
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">Code des Marchés Publics 2023</Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{PROCUREMENTS.filter(p => p.status === 'open').length}</p><p className="text-[10px] text-muted-foreground">Appels ouverts</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{PROCUREMENTS.filter(p => p.status === 'awarded' || p.status === 'in-progress').length}</p><p className="text-[10px] text-muted-foreground">Attribués / En cours</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{(totalAmount / 1000).toFixed(1)}</p><p className="text-[10px] text-muted-foreground">Mds FCFA engagés</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-violet-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-violet-500" />
                            <div><p className="text-lg font-bold text-violet-600">{new Set(PROCUREMENTS.map(p => p.entity)).size}</p><p className="text-[10px] text-muted-foreground">Entités adjudicatrices</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher par titre ou référence..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-1">
                        <Button variant={catFilter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setCatFilter('all')}>Tous</Button>
                        {categories.map(c => (
                            <Button key={c} variant={catFilter === c ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setCatFilter(c)}>{c}</Button>
                        ))}
                    </div>
                </div>

                {/* List */}
                <div className="space-y-2">
                    {filtered.map(p => {
                        const scfg = STATUS_CFG[p.status];
                        return (
                            <Card key={p.id} className={p.status === 'cancelled' ? 'opacity-60' : ''}>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center shrink-0">
                                            <Gavel className="h-4 w-4 text-violet-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                <Badge variant="outline" className="text-[7px] h-3 font-mono">{p.ref}</Badge>
                                                <Badge className={`text-[7px] h-3 ${scfg.badge}`}>{scfg.label}</Badge>
                                                <Badge variant="outline" className="text-[7px] h-3">{p.category}</Badge>
                                            </div>
                                            <p className="text-xs font-bold mb-1">{p.title}</p>
                                            <div className="flex items-center gap-2 text-[9px] text-muted-foreground flex-wrap">
                                                <span className="font-bold text-foreground">{p.amount.toLocaleString()} M FCFA</span>
                                                <span>·</span>
                                                <span>{p.entity}</span>
                                                <span>·</span>
                                                <span>{p.province}</span>
                                                {p.awardee && <><span>→</span><span className="font-bold text-green-600">{p.awardee}</span></>}
                                                {p.deadline && <span className="flex items-center gap-0.5 text-amber-500"><Calendar className="h-2.5 w-2.5" />Limite : {p.deadline}</span>}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground shrink-0">{p.publishDate}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <Gavel className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Aucun marché trouvé</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
