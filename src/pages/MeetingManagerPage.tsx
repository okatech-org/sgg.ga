/**
 * SGG Digital — Gestionnaire de Réunions
 *
 * Pilotage des réunions gouvernementales :
 *   - Conseil des Ministres
 *   - Réunions interministérielles
 *   - Comités de suivi
 *   - Ordre du jour, participants, résolutions
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    CalendarClock, Users, FileText, MapPin,
    CheckCircle2, Clock, AlertTriangle,
    ChevronDown, ChevronRight, Video, Plus,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type MeetingType = 'CM' | 'IM' | 'CS' | 'CT';
type MeetingStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

interface Meeting {
    id: string;
    title: string;
    type: MeetingType;
    status: MeetingStatus;
    date: string;
    time: string;
    location: string;
    chair: string;
    participants: number;
    agendaItems: string[];
    decisions?: string[];
}

// ── Config ──────────────────────────────────────────────────────────────────

const TYPE_CFG: Record<MeetingType, { label: string; color: string; bg: string }> = {
    CM: { label: 'Conseil des Ministres', color: 'text-blue-600', bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    IM: { label: 'Interministérielle', color: 'text-violet-600', bg: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
    CS: { label: 'Comité de Suivi', color: 'text-emerald-600', bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    CT: { label: 'Comité Technique', color: 'text-amber-600', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

const STATUS_CFG: Record<MeetingStatus, { label: string; badge: string }> = {
    scheduled: { label: 'Planifiée', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    'in-progress': { label: 'En cours', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    completed: { label: 'Terminée', badge: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    cancelled: { label: 'Annulée', badge: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const MEETINGS: Meeting[] = [
    {
        id: 'm1', title: 'Conseil des Ministres — Session ordinaire', type: 'CM', status: 'scheduled',
        date: '14 Fév 2026', time: '10:00', location: 'Palais Présidentiel', chair: 'Président de la République',
        participants: 42,
        agendaItems: ['Examen projet de loi finances rectificative 2026', 'Communication sur la réforme foncière', 'Nomination au poste de DG ANPI', 'Point sur la situation sécuritaire'],
    },
    {
        id: 'm2', title: 'Comité de Suivi — Digitalisation SGG', type: 'CS', status: 'in-progress',
        date: '10 Fév 2026', time: '14:30', location: 'SGG — Salle de conférence', chair: 'SG du Gouvernement',
        participants: 18,
        agendaItems: ['Bilan Sprint 22 plateforme digitale', 'Déploiement module GAR v3', 'Formation points focaux T1', 'Budget numérique T1 2026'],
    },
    {
        id: 'm3', title: 'Réunion Interministérielle — Transition Énergétique', type: 'IM', status: 'scheduled',
        date: '12 Fév 2026', time: '09:00', location: 'Primature — Salle Okoumé', chair: 'Premier Ministre',
        participants: 28,
        agendaItems: ['Avancement projet Grand Poubara II', 'Stratégie solaire provinces rurales', 'Partenariat public-privé énergies renouvelables'],
    },
    {
        id: 'm4', title: 'Conseil des Ministres — Session extraordinaire', type: 'CM', status: 'completed',
        date: '7 Fév 2026', time: '10:00', location: 'Palais Présidentiel', chair: 'Président de la République',
        participants: 40,
        agendaItems: ['Adoption du décret portant réforme du code forestier', 'Mesures d\'urgence inondations Ogooué', 'Ratification accord commercial CEMAC'],
        decisions: ['Décret 2026-042 adopté (code forestier)', 'Fonds d\'urgence 5 Mds FCFA débloqué', 'Ratification signée'],
    },
    {
        id: 'm5', title: 'Comité Technique — Réforme Fonction Publique', type: 'CT', status: 'completed',
        date: '5 Fév 2026', time: '15:00', location: 'Ministère Fonction Publique', chair: 'DG Fonction Publique',
        participants: 15,
        agendaItems: ['Grille salariale révisée', 'Digitalisation fiches de paie', 'Évaluation compétences agents'],
        decisions: ['Grille adoptée pour simulation', 'Pilote e-paie 3 ministères Q2', 'Matrice compétences SGG comme référence'],
    },
    {
        id: 'm6', title: 'Réunion Interministérielle — Climat & Environnement', type: 'IM', status: 'completed',
        date: '3 Fév 2026', time: '10:00', location: 'Primature — Salle Moabi', chair: 'Premier Ministre',
        participants: 22,
        agendaItems: ['Rapport ODD Gabon T4 2025', 'Préparation COP31', 'Budget carbone national'],
        decisions: ['Rapport ODD validé', 'Délégation COP31 composée', 'Objectif -20% émissions 2030 confirmé'],
    },
    {
        id: 'm7', title: 'Comité de Suivi — Éducation Nationale', type: 'CS', status: 'cancelled',
        date: '1 Fév 2026', time: '09:00', location: 'MENETP', chair: 'Ministre de l\'Éducation',
        participants: 20,
        agendaItems: ['Rentrée scolaire 2026-2027', 'Construction 15 lycées'],
    },
    {
        id: 'm8', title: 'Comité Technique — Cybersécurité Nationale', type: 'CT', status: 'scheduled',
        date: '17 Fév 2026', time: '11:00', location: 'ANINF — Centre de données', chair: 'DG ANINF',
        participants: 12,
        agendaItems: ['Audit sécurité infrastructure cloud', 'Plan de réponse incidents 2026', 'Formation cybersécurité des cadres', 'Certification ISO 27001'],
    },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function MeetingManagerPage() {
    const [expandedId, setExpandedId] = useState<string | null>('m2');
    const [typeFilter, setTypeFilter] = useState<MeetingType | 'all'>('all');

    const filtered = useMemo(() => {
        if (typeFilter === 'all') return MEETINGS;
        return MEETINGS.filter(m => m.type === typeFilter);
    }, [typeFilter]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <CalendarClock className="h-7 w-7 text-indigo-600" />
                            Gestionnaire de Réunions
                        </h1>
                        <p className="text-muted-foreground">
                            {MEETINGS.length} réunions · {MEETINGS.filter(m => m.status === 'scheduled').length} planifiées · {MEETINGS.filter(m => m.status === 'in-progress').length} en cours
                        </p>
                    </div>
                    <Button size="sm" className="gap-1 text-xs"><Plus className="h-3 w-3" /> Nouvelle réunion</Button>
                </div>

                {/* Stats by Type */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(['CM', 'IM', 'CS', 'CT'] as MeetingType[]).map(type => {
                        const cfg = TYPE_CFG[type];
                        const count = MEETINGS.filter(m => m.type === type).length;
                        return (
                            <Card key={type} className={`cursor-pointer ${typeFilter === type ? 'ring-2 ring-primary' : ''}`} onClick={() => setTypeFilter(typeFilter === type ? 'all' : type)}>
                                <CardContent className="pt-3 pb-2">
                                    <div className="flex items-center justify-between">
                                        <Badge className={`text-[8px] ${cfg.bg}`}>{type}</Badge>
                                        <span className={`text-lg font-bold ${cfg.color}`}>{count}</span>
                                    </div>
                                    <p className="text-[9px] text-muted-foreground mt-0.5">{cfg.label}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Filter */}
                <div className="flex gap-1 flex-wrap">
                    <Button variant={typeFilter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setTypeFilter('all')}>Toutes</Button>
                    {(['CM', 'IM', 'CS', 'CT'] as MeetingType[]).map(t => (
                        <Button key={t} variant={typeFilter === t ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setTypeFilter(t)}>{TYPE_CFG[t].label}</Button>
                    ))}
                </div>

                {/* Meeting List */}
                <div className="space-y-2">
                    {filtered.map(meeting => {
                        const isExpanded = expandedId === meeting.id;
                        const tcfg = TYPE_CFG[meeting.type];
                        const scfg = STATUS_CFG[meeting.status];

                        return (
                            <Card key={meeting.id} className={`${meeting.status === 'in-progress' ? 'border-green-300 dark:border-green-800 shadow-sm' : ''} ${meeting.status === 'cancelled' ? 'opacity-60' : ''}`}>
                                <button className="w-full text-left p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors" onClick={() => setExpandedId(isExpanded ? null : meeting.id)}>
                                    {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                            <Badge className={`text-[7px] h-3.5 ${tcfg.bg}`}>{meeting.type}</Badge>
                                            <p className="text-xs font-bold">{meeting.title}</p>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
                                            <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{meeting.date} à {meeting.time}</span>
                                            <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{meeting.location}</span>
                                            <span className="flex items-center gap-0.5"><Users className="h-2.5 w-2.5" />{meeting.participants} personnes</span>
                                        </div>
                                    </div>
                                    <Badge className={`text-[8px] h-4 ${scfg.badge}`}>{scfg.label}</Badge>
                                </button>

                                {isExpanded && (
                                    <CardContent className="pt-0 pb-4 border-t">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                            <div>
                                                <p className="text-[10px] font-bold mb-1.5 flex items-center gap-1"><FileText className="h-3 w-3" /> Ordre du jour</p>
                                                <div className="space-y-1">
                                                    {meeting.agendaItems.map((item, i) => (
                                                        <div key={i} className="flex items-start gap-1.5 text-xs">
                                                            <span className="text-[9px] font-bold text-muted-foreground w-4">{i + 1}.</span>
                                                            <span>{item}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold mb-1.5">Informations</p>
                                                <div className="space-y-1 text-xs">
                                                    <p><span className="text-muted-foreground">Présidence :</span> {meeting.chair}</p>
                                                    <p><span className="text-muted-foreground">Lieu :</span> {meeting.location}</p>
                                                    <p><span className="text-muted-foreground">Participants :</span> {meeting.participants}</p>
                                                </div>
                                                {meeting.decisions && (
                                                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                                                        <p className="text-[10px] font-bold text-green-700 dark:text-green-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Décisions prises</p>
                                                        {meeting.decisions.map((d, i) => (
                                                            <p key={i} className="text-[9px] text-green-600 dark:text-green-400 mt-0.5">✓ {d}</p>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
}
