/**
 * SGG Digital — Centre de Réclamations Citoyennes
 *
 * Gestion des doléances et réclamations des citoyens :
 *   - Soumission et suivi des réclamations
 *   - Catégorisation et priorité
 *   - Temps de traitement moyen
 *   - Satisfaction post-résolution
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    MessageCircle, Search, CheckCircle2, Clock,
    AlertTriangle, User, MapPin, Calendar,
    ThumbsUp, ThumbsDown, Filter, ArrowUpDown,
    XCircle, BarChart3,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type GrievanceStatus = 'new' | 'in-progress' | 'resolved' | 'rejected';
type GrievancePriority = 'high' | 'medium' | 'low';
type GrievanceCategory = 'Service Public' | 'Infrastructure' | 'Administration' | 'Santé' | 'Éducation' | 'Sécurité';

interface Grievance {
    id: string;
    ref: string;
    subject: string;
    description: string;
    category: GrievanceCategory;
    status: GrievanceStatus;
    priority: GrievancePriority;
    citizen: string;
    province: string;
    date: string;
    daysOpen: number;
    assignedTo?: string;
    satisfaction?: number;
}

// ── Config ──────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<GrievanceStatus, { label: string; badge: string; icon: typeof Clock }> = {
    new: { label: 'Nouvelle', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Clock },
    'in-progress': { label: 'En traitement', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: AlertTriangle },
    resolved: { label: 'Résolue', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
    rejected: { label: 'Rejetée', badge: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
};

const PRIORITY_CFG: Record<GrievancePriority, { label: string; badge: string }> = {
    high: { label: 'Haute', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    medium: { label: 'Moyenne', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    low: { label: 'Basse', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const GRIEVANCES: Grievance[] = [
    { id: 'g1', ref: 'REC-2026-0142', subject: 'Coupure d\'eau récurrente quartier Nzeng-Ayong', description: 'Depuis 3 semaines, le quartier Nzeng-Ayong subit des coupures d\'eau quotidiennes de 6h à 18h.', category: 'Infrastructure', status: 'in-progress', priority: 'high', citizen: 'M. Obame', province: 'Estuaire', date: '3 fév 2026', daysOpen: 7, assignedTo: 'SEEG' },
    { id: 'g2', ref: 'REC-2026-0141', subject: 'Retard délivrance passeport (6 mois)', description: 'Demande de passeport n°PA-2025-08721 déposée en août 2025, toujours sans réponse.', category: 'Administration', status: 'new', priority: 'high', citizen: 'Mme Mabika', province: 'Estuaire', date: '2 fév 2026', daysOpen: 8 },
    { id: 'g3', ref: 'REC-2026-0140', subject: 'État de la route nationale 1 (Kango-Ntoum)', description: 'Nids de poule dangereux sur 15km. Accident de bus scolaire signalé le 28/01.', category: 'Infrastructure', status: 'in-progress', priority: 'high', citizen: 'Association Parents Kango', province: 'Estuaire', date: '1 fév 2026', daysOpen: 9, assignedTo: 'MINTRANS' },
    { id: 'g4', ref: 'REC-2026-0139', subject: 'Manque de médicaments CHU Libreville', description: 'Rupture de stock de médicaments essentiels (antibiotiques, antihypertenseurs) depuis 2 semaines.', category: 'Santé', status: 'in-progress', priority: 'high', citizen: 'Dr Ella', province: 'Estuaire', date: '30 jan 2026', daysOpen: 11, assignedTo: 'MINSANTE' },
    { id: 'g5', ref: 'REC-2026-0138', subject: 'Mutation non exécutée après décision', description: 'Décision de mutation signée en septembre 2025, toujours pas exécutée. Agent bloqué à son ancien poste.', category: 'Administration', status: 'new', priority: 'medium', citizen: 'M. Nze', province: 'Haut-Ogooué', date: '29 jan 2026', daysOpen: 12 },
    { id: 'g6', ref: 'REC-2026-0137', subject: 'Insécurité quartier PK5-PK8', description: 'Recrudescence de braquages nocturnes. Absence de patrouilles de police depuis 2 mois.', category: 'Sécurité', status: 'in-progress', priority: 'high', citizen: 'Comité de quartier PK6', province: 'Estuaire', date: '28 jan 2026', daysOpen: 13, assignedTo: 'MININTERIEUR' },
    { id: 'g7', ref: 'REC-2026-0136', subject: 'Salaire non versé depuis 3 mois (enseignant)', description: 'Malgré la prise de service en septembre, aucun salaire versé pour les mois d\'oct, nov, déc 2025.', category: 'Éducation', status: 'resolved', priority: 'high', citizen: 'M. Mouele', province: 'Ogooué-Maritime', date: '20 jan 2026', daysOpen: 0, assignedTo: 'MENETP', satisfaction: 4 },
    { id: 'g8', ref: 'REC-2026-0135', subject: 'Refus d\'inscription école publique', description: 'Refus d\'inscrire un enfant au motif de non-paiement. L\'école publique est gratuite.', category: 'Éducation', status: 'resolved', priority: 'medium', citizen: 'Mme Bivigou', province: 'Ngounié', date: '18 jan 2026', daysOpen: 0, assignedTo: 'MENETP', satisfaction: 5 },
    { id: 'g9', ref: 'REC-2026-0134', subject: 'Demande acte de naissance introuvable', description: 'L\'état civil de Lambaréné ne retrouve pas l\'acte de naissance n°1987-4521.', category: 'Service Public', status: 'in-progress', priority: 'low', citizen: 'M. Mboumba', province: 'Moyen-Ogooué', date: '15 jan 2026', daysOpen: 26, assignedTo: 'Mairie Lambaréné' },
    { id: 'g10', ref: 'REC-2026-0133', subject: 'Pollution sonore zone industrielle Owendo', description: 'Nuisances sonores H24 de l\'usine de ciment. Impact santé riverains.', category: 'Infrastructure', status: 'rejected', priority: 'low', citizen: 'M. Ndong', province: 'Estuaire', date: '10 jan 2026', daysOpen: 0 },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function GrievanceCenterPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<GrievanceStatus | 'all'>('all');

    const filtered = useMemo(() => {
        return GRIEVANCES.filter(g => {
            if (statusFilter !== 'all' && g.status !== statusFilter) return false;
            if (search && !g.subject.toLowerCase().includes(search.toLowerCase()) && !g.ref.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [search, statusFilter]);

    const counts = {
        new: GRIEVANCES.filter(g => g.status === 'new').length,
        inProgress: GRIEVANCES.filter(g => g.status === 'in-progress').length,
        resolved: GRIEVANCES.filter(g => g.status === 'resolved').length,
        avgDays: Math.round(GRIEVANCES.filter(g => g.daysOpen > 0).reduce((s, g) => s + g.daysOpen, 0) / GRIEVANCES.filter(g => g.daysOpen > 0).length),
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <MessageCircle className="h-7 w-7 text-orange-500" />
                            Réclamations Citoyennes
                        </h1>
                        <p className="text-muted-foreground">
                            {GRIEVANCES.length} réclamations · {counts.new} nouvelles · {counts.inProgress} en cours
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">{counts.new}</p><p className="text-[10px] text-muted-foreground">Nouvelles</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            <div><p className="text-lg font-bold text-amber-600">{counts.inProgress}</p><p className="text-[10px] text-muted-foreground">En traitement</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <div><p className="text-lg font-bold text-green-600">{counts.resolved}</p><p className="text-[10px] text-muted-foreground">Résolues</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-violet-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-violet-500" />
                            <div><p className="text-lg font-bold text-violet-600">{counts.avgDays}j</p><p className="text-[10px] text-muted-foreground">Durée moyenne</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher par sujet ou référence..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-1">
                        {(['all', 'new', 'in-progress', 'resolved', 'rejected'] as const).map(s => (
                            <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" className="text-xs h-7"
                                onClick={() => setStatusFilter(s)}>
                                {s === 'all' ? 'Toutes' : STATUS_CFG[s as GrievanceStatus]?.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Grievance List */}
                <div className="space-y-2">
                    {filtered.map(g => {
                        const scfg = STATUS_CFG[g.status];
                        const pcfg = PRIORITY_CFG[g.priority];
                        const StatusIcon = scfg.icon;

                        return (
                            <Card key={g.id} className={g.priority === 'high' && g.status !== 'resolved' ? 'border-red-200 dark:border-red-800' : ''}>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${g.status === 'resolved' ? 'bg-green-50 dark:bg-green-900/20' : g.status === 'rejected' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                                            <StatusIcon className={`h-4 w-4 ${g.status === 'resolved' ? 'text-green-500' : g.status === 'rejected' ? 'text-red-500' : 'text-blue-500'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                <Badge variant="outline" className="text-[7px] h-3 font-mono">{g.ref}</Badge>
                                                <p className="text-xs font-bold">{g.subject}</p>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mb-1.5 line-clamp-1">{g.description}</p>
                                            <div className="flex items-center gap-2 text-[9px] text-muted-foreground flex-wrap">
                                                <Badge className={`text-[7px] h-3 ${scfg.badge}`}>{scfg.label}</Badge>
                                                <Badge className={`text-[7px] h-3 ${pcfg.badge}`}>{pcfg.label}</Badge>
                                                <span className="flex items-center gap-0.5"><User className="h-2.5 w-2.5" />{g.citizen}</span>
                                                <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{g.province}</span>
                                                <span className="flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" />{g.date}</span>
                                                <Badge variant="outline" className="text-[7px] h-3">{g.category}</Badge>
                                                {g.assignedTo && <span className="text-[8px]">→ {g.assignedTo}</span>}
                                                {g.daysOpen > 0 && <span className={`font-bold ${g.daysOpen > 14 ? 'text-red-500' : 'text-amber-500'}`}>{g.daysOpen}j ouverts</span>}
                                                {g.satisfaction && (
                                                    <span className="flex items-center gap-0.5">
                                                        {g.satisfaction >= 4 ? <ThumbsUp className="h-2.5 w-2.5 text-green-500" /> : <ThumbsDown className="h-2.5 w-2.5 text-red-500" />}
                                                        {g.satisfaction}/5
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Aucune réclamation trouvée</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
