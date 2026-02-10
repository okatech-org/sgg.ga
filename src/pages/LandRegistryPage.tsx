/**
 * SGG Digital — Registre Foncier Digital
 *
 * Suivi de la gestion foncière nationale :
 *   - Titres fonciers délivrés
 *   - Demandes en cours
 *   - Litiges
 *   - Cadastre numérique par province
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    MapPinned, FileCheck, Clock, AlertTriangle,
    Search, Home, Building2, Landmark,
    TrendingUp, Scale, CheckCircle2, XCircle,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type LandStatus = 'titled' | 'pending' | 'disputed' | 'rejected';
type LandType = 'Résidentiel' | 'Commercial' | 'Agricole' | 'Industriel' | 'Institutionnel';

interface LandRecord {
    id: string;
    ref: string;
    owner: string;
    type: LandType;
    status: LandStatus;
    area: number; // m²
    province: string;
    commune: string;
    requestDate: string;
    deliveryDate?: string;
    daysProcessing: number;
}

// ── Config ──────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<LandStatus, { label: string; badge: string }> = {
    titled: { label: 'Titré', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    pending: { label: 'En attente', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    disputed: { label: 'En litige', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    rejected: { label: 'Rejeté', badge: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const RECORDS: LandRecord[] = [
    { id: 'l1', ref: 'TF-2026-001', owner: 'M. Obiang Ndong', type: 'Résidentiel', status: 'titled', area: 600, province: 'Estuaire', commune: 'Akanda', requestDate: '15 sep 2025', deliveryDate: '28 jan 2026', daysProcessing: 135 },
    { id: 'l2', ref: 'TF-2026-002', owner: 'SCI Les Palmiers', type: 'Commercial', status: 'titled', area: 2500, province: 'Estuaire', commune: 'Libreville 3e', requestDate: '3 oct 2025', deliveryDate: '5 fév 2026', daysProcessing: 125 },
    { id: 'l3', ref: 'TF-2025-485', owner: 'Mme Ondo Ella', type: 'Résidentiel', status: 'pending', area: 450, province: 'Estuaire', commune: 'Owendo', requestDate: '12 juil 2025', daysProcessing: 213 },
    { id: 'l4', ref: 'TF-2025-490', owner: 'Société Agri-Gabon', type: 'Agricole', status: 'pending', area: 50000, province: 'Woleu-Ntem', commune: 'Oyem', requestDate: '1 aoû 2025', daysProcessing: 193 },
    { id: 'l5', ref: 'TF-2025-312', owner: 'Famille Nzoghe', type: 'Résidentiel', status: 'disputed', area: 800, province: 'Estuaire', commune: 'Ntoum', requestDate: '15 avr 2025', daysProcessing: 301 },
    { id: 'l6', ref: 'TF-2025-350', owner: 'État du Gabon (DGI)', type: 'Institutionnel', status: 'titled', area: 15000, province: 'Haut-Ogooué', commune: 'Franceville', requestDate: '1 mai 2025', deliveryDate: '30 nov 2025', daysProcessing: 213 },
    { id: 'l7', ref: 'TF-2025-420', owner: 'ZES Nkok SA', type: 'Industriel', status: 'titled', area: 120000, province: 'Estuaire', commune: 'Nkok', requestDate: '10 jun 2025', deliveryDate: '20 déc 2025', daysProcessing: 193 },
    { id: 'l8', ref: 'TF-2025-380', owner: 'M. Mouanga', type: 'Résidentiel', status: 'rejected', area: 350, province: 'Ogooué-Maritime', commune: 'Port-Gentil', requestDate: '20 mai 2025', daysProcessing: 0 },
    { id: 'l9', ref: 'TF-2026-010', owner: 'Communauté villageoise Medouneu', type: 'Agricole', status: 'pending', area: 85000, province: 'Woleu-Ntem', commune: 'Medouneu', requestDate: '20 jan 2026', daysProcessing: 21 },
    { id: 'l10', ref: 'TF-2025-410', owner: 'Église presbytérienne de Lambaréné', type: 'Institutionnel', status: 'disputed', area: 3200, province: 'Moyen-Ogooué', commune: 'Lambaréné', requestDate: '5 jun 2025', daysProcessing: 250 },
];

const PROVINCE_STATS = [
    { province: 'Estuaire', titles: 4_200, pending: 890, disputes: 145 },
    { province: 'Haut-Ogooué', titles: 1_800, pending: 320, disputes: 42 },
    { province: 'Ogooué-Maritime', titles: 1_200, pending: 280, disputes: 35 },
    { province: 'Woleu-Ntem', titles: 950, pending: 410, disputes: 88 },
    { province: 'Ngounié', titles: 680, pending: 190, disputes: 52 },
    { province: 'Moyen-Ogooué', titles: 520, pending: 140, disputes: 38 },
    { province: 'Ogooué-Ivindo', titles: 280, pending: 95, disputes: 22 },
    { province: 'Ogooué-Lolo', titles: 310, pending: 85, disputes: 18 },
    { province: 'Nyanga', titles: 220, pending: 70, disputes: 15 },
];

const GLOBAL = {
    totalTitles: 10_160,
    pendingDemands: 2_480,
    totalDisputes: 455,
    avgProcessingDays: 180,
};

// ── Component ───────────────────────────────────────────────────────────────

export default function LandRegistryPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<LandStatus | 'all'>('all');

    const filtered = useMemo(() => {
        return RECORDS.filter(r => {
            if (statusFilter !== 'all' && r.status !== statusFilter) return false;
            if (search && !r.owner.toLowerCase().includes(search.toLowerCase()) && !r.ref.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [search, statusFilter]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <MapPinned className="h-7 w-7 text-teal-600" />
                            Registre Foncier Digital
                        </h1>
                        <p className="text-muted-foreground">
                            {GLOBAL.totalTitles.toLocaleString()} titres · {GLOBAL.pendingDemands.toLocaleString()} demandes · {GLOBAL.totalDisputes} litiges
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">Réforme foncière 2024</Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <FileCheck className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{GLOBAL.totalTitles.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Titres délivrés</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{GLOBAL.pendingDemands.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">En attente</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Scale className="h-5 w-5 text-red-500" />
                            <div><p className="text-lg font-bold text-red-600">{GLOBAL.totalDisputes}</p><p className="text-[10px] text-muted-foreground">Litiges en cours</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{GLOBAL.avgProcessingDays}j</p><p className="text-[10px] text-muted-foreground">Délai moyen</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Province overview */}
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Cadastre par province</CardTitle></CardHeader>
                    <CardContent className="space-y-1.5">
                        {PROVINCE_STATS.map((p, i) => {
                            const total = p.titles + p.pending + p.disputes;
                            return (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                    <span className="w-28 truncate font-bold">{p.province}</span>
                                    <div className="flex-1 h-3 rounded-full overflow-hidden flex">
                                        <div className="bg-green-500 h-full" style={{ width: `${(p.titles / total) * 100}%` }} title={`Titrés: ${p.titles}`} />
                                        <div className="bg-amber-400 h-full" style={{ width: `${(p.pending / total) * 100}%` }} title={`Attente: ${p.pending}`} />
                                        <div className="bg-red-400 h-full" style={{ width: `${(p.disputes / total) * 100}%` }} title={`Litiges: ${p.disputes}`} />
                                    </div>
                                    <span className="w-20 text-[9px] text-right">{p.titles} / {p.pending} / {p.disputes}</span>
                                </div>
                            );
                        })}
                        <div className="flex gap-3 text-[8px] text-muted-foreground mt-1">
                            <span className="flex items-center gap-0.5"><span className="w-2 h-2 bg-green-500 rounded-full" />Titrés</span>
                            <span className="flex items-center gap-0.5"><span className="w-2 h-2 bg-amber-400 rounded-full" />En attente</span>
                            <span className="flex items-center gap-0.5"><span className="w-2 h-2 bg-red-400 rounded-full" />Litiges</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Propriétaire ou référence..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-1">
                        {(['all', 'titled', 'pending', 'disputed', 'rejected'] as const).map(s => (
                            <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" className="text-xs h-7"
                                onClick={() => setStatusFilter(s)}>
                                {s === 'all' ? 'Tous' : STATUS_CFG[s as LandStatus]?.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Records */}
                <div className="space-y-2">
                    {filtered.map(r => {
                        const scfg = STATUS_CFG[r.status];
                        return (
                            <Card key={r.id} className={r.status === 'disputed' ? 'border-red-200 dark:border-red-800' : ''}>
                                <CardContent className="p-3 flex items-center gap-3">
                                    <div className="w-7 h-7 rounded bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center shrink-0">
                                        {r.type === 'Résidentiel' ? <Home className="h-3.5 w-3.5 text-teal-500" /> :
                                            r.type === 'Commercial' || r.type === 'Industriel' ? <Building2 className="h-3.5 w-3.5 text-teal-500" /> :
                                                <Landmark className="h-3.5 w-3.5 text-teal-500" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                            <Badge variant="outline" className="text-[7px] h-3 font-mono">{r.ref}</Badge>
                                            <Badge className={`text-[7px] h-3.5 ${scfg.badge}`}>{scfg.label}</Badge>
                                            <Badge variant="outline" className="text-[7px] h-3">{r.type}</Badge>
                                        </div>
                                        <p className="text-xs font-bold">{r.owner}</p>
                                        <p className="text-[9px] text-muted-foreground">{r.area.toLocaleString()} m² · {r.commune}, {r.province} · Déposé {r.requestDate}
                                            {r.daysProcessing > 0 && <span className={r.daysProcessing > 180 ? ' text-red-500 font-bold' : ''}> · {r.daysProcessing}j</span>}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
}
