/**
 * SGG Digital — Calendrier / Planning
 *
 * Vue mensuelle interactive des événements de la plateforme :
 *   - Conseils des Ministres
 *   - Deadlines rapports GAR/PAG
 *   - Sessions législatives
 *   - Réunions institutionnelles
 *   - Navigation mois par mois
 *   - Détail au clic
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Calendar as CalIcon, ChevronLeft, ChevronRight,
    Clock, MapPin, Users, FileText,
    BookOpen, Scale, FolderOpen, AlertTriangle,
    BarChart3, X,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type EventCategory = 'conseil' | 'deadline' | 'session' | 'reunion' | 'publication';

interface CalendarEvent {
    id: string;
    title: string;
    date: string; // ISO
    time?: string;
    endTime?: string;
    category: EventCategory;
    description: string;
    location?: string;
    participants?: string[];
    urgent?: boolean;
}

const CATEGORY_CONFIG: Record<EventCategory, { label: string; color: string; bgColor: string; icon: typeof CalIcon }> = {
    conseil: { label: 'Conseil des Ministres', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30', icon: FolderOpen },
    deadline: { label: 'Deadline', color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30', icon: AlertTriangle },
    session: { label: 'Session législative', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30', icon: Scale },
    reunion: { label: 'Réunion', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30', icon: Users },
    publication: { label: 'Publication', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30', icon: BookOpen },
};

// ── Mock Events ─────────────────────────────────────────────────────────────

const EVENTS: CalendarEvent[] = [
    // February 2026
    { id: 'e1', title: 'Conseil des Ministres', date: '2026-02-15', time: '10:00', endTime: '13:00', category: 'conseil', description: 'Session ordinaire du Conseil des Ministres. Ordre du jour : projets de décrets, nominations, communications gouvernementales.', location: 'Palais Présidentiel, Libreville', participants: ['SGG', 'SGPR', 'Ministres'] },
    { id: 'e2', title: 'Deadline rapports GAR T4 2025', date: '2026-02-18', category: 'deadline', description: 'Date limite de soumission des rapports de performance GAR pour le 4ème trimestre 2025. 10 ministères restants.', urgent: true },
    { id: 'e3', title: 'Commission des Lois', date: '2026-02-12', time: '14:00', endTime: '17:00', category: 'session', description: 'Examen du projet de loi sur la modernisation administrative. 2ème lecture.', location: 'Assemblée Nationale', participants: ['Députés', 'SGG', 'Min. Justice'] },
    { id: 'e4', title: 'Réunion Points Focaux', date: '2026-02-20', time: '09:00', endTime: '11:30', category: 'reunion', description: 'Formation sur la nouvelle matrice de reporting et les procédures de saisie mensuelle.', location: 'SGG — Salle de conférence', participants: ['Points Focaux', 'Équipe SGG', 'DGME'] },
    { id: 'e5', title: 'Publication JO n°24', date: '2026-02-25', category: 'publication', description: 'Publication du Journal Officiel n°24 — 12 décrets, 5 arrêtés, 3 textes législatifs.' },
    { id: 'e6', title: 'Deadline soumission PTM Février', date: '2026-02-28', category: 'deadline', description: 'Date limite de soumission des matrices PTM pour le mois de février 2026.', urgent: true },
    { id: 'e7', title: 'Conseil des Ministres', date: '2026-02-28', time: '10:00', endTime: '13:00', category: 'conseil', description: 'Session extraordinaire. Adoption prévue du budget rectificatif 2026.', location: 'Palais Présidentiel, Libreville' },
    { id: 'e8', title: 'Comité de suivi PAG 2026', date: '2026-02-10', time: '15:00', endTime: '17:00', category: 'reunion', description: 'Revue trimestrielle des indicateurs PAG 2026 avec les SG ministériels.', location: 'Primature, Salle Ogooué', participants: ['SGG', 'SG Ministères', 'DGEPF'] },
    // March 2026
    { id: 'e9', title: 'Conseil des Ministres', date: '2026-03-14', time: '10:00', endTime: '13:00', category: 'conseil', description: 'Session ordinaire du Conseil des Ministres.', location: 'Palais Présidentiel, Libreville' },
    { id: 'e10', title: 'Deadline rapports GAR T1 2026', date: '2026-03-31', category: 'deadline', description: 'Date limite de soumission des rapports de performance GAR pour le 1er trimestre 2026.' },
    { id: 'e11', title: 'Réunion inter-ministérielle Éducation', date: '2026-03-05', time: '10:00', endTime: '12:00', category: 'reunion', description: 'Coordination des politiques éducatives — Plan Gabon 2030.', location: 'Min. Éducation Nationale', participants: ['Min. Édu', 'Min. Enseignement Supérieur', 'SGG'] },
    // January 2026 (past)
    { id: 'e12', title: 'Publication JO n°23', date: '2026-01-28', category: 'publication', description: 'Publication du Journal Officiel n°23.' },
    { id: 'e13', title: 'Conseil des Ministres', date: '2026-01-18', time: '10:00', endTime: '13:00', category: 'conseil', description: 'Session ordinaire de janvier.', location: 'Palais Présidentiel, Libreville' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Monday = 0
}

// ── Component ───────────────────────────────────────────────────────────────

export default function CalendarPage() {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const monthEvents = useMemo(() => {
        return EVENTS.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
    }, [currentMonth, currentYear]);

    const getEventsForDay = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return EVENTS.filter(e => e.date === dateStr);
    };

    const prevMonth = () => {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
        else setCurrentMonth(m => m - 1);
    };

    const nextMonth = () => {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
        else setCurrentMonth(m => m + 1);
    };

    const goToday = () => {
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
    };

    const isToday = (day: number) => {
        return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
    };

    const dateStr = (day: number) =>
        `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Events for right panel
    const panelEvents = selectedDate
        ? EVENTS.filter(e => e.date === selectedDate)
        : monthEvents.sort((a, b) => a.date.localeCompare(b.date));

    // Stats
    const stats = useMemo(() => ({
        total: monthEvents.length,
        conseils: monthEvents.filter(e => e.category === 'conseil').length,
        deadlines: monthEvents.filter(e => e.category === 'deadline').length,
        urgent: monthEvents.filter(e => e.urgent).length,
    }), [monthEvents]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <CalIcon className="h-7 w-7 text-blue-600" />
                            Calendrier
                        </h1>
                        <p className="text-muted-foreground">
                            Planning des événements institutionnels
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={goToday}>Aujourd'hui</Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card>
                        <CardContent className="pt-3 pb-2 text-center">
                            <p className="text-xl font-bold">{stats.total}</p>
                            <p className="text-[10px] text-muted-foreground">Événements ce mois</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-3 pb-2 text-center">
                            <p className="text-xl font-bold text-red-600">{stats.conseils}</p>
                            <p className="text-[10px] text-muted-foreground">Conseils des Ministres</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-3 pb-2 text-center">
                            <p className="text-xl font-bold text-amber-600">{stats.deadlines}</p>
                            <p className="text-[10px] text-muted-foreground">Deadlines</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-3 pb-2 text-center">
                            <p className="text-xl font-bold text-orange-600">{stats.urgent}</p>
                            <p className="text-[10px] text-muted-foreground">Urgents</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar Grid */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <CardTitle className="text-lg min-w-[180px] text-center">
                                    {MONTHS_FR[currentMonth]} {currentYear}
                                </CardTitle>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Day Headers */}
                            <div className="grid grid-cols-7 gap-0.5 mb-1">
                                {DAYS_FR.map(d => (
                                    <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
                                ))}
                            </div>

                            {/* Day Cells */}
                            <div className="grid grid-cols-7 gap-0.5">
                                {/* Empty cells before first day */}
                                {Array.from({ length: firstDay }).map((_, i) => (
                                    <div key={`empty-${i}`} className="h-20 rounded-lg bg-muted/20" />
                                ))}

                                {/* Day cells */}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const dayEvents = getEventsForDay(day);
                                    const ds = dateStr(day);
                                    const isSelected = selectedDate === ds;

                                    return (
                                        <div
                                            key={day}
                                            className={`h-20 rounded-lg border p-1 cursor-pointer transition-all hover:bg-muted/50 ${isToday(day) ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/20' :
                                                    isSelected ? 'border-primary bg-primary/5' : 'border-transparent'
                                                }`}
                                            onClick={() => setSelectedDate(isSelected ? null : ds)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={`text-xs font-medium ${isToday(day) ? 'bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center' : ''}`}>
                                                    {day}
                                                </span>
                                                {dayEvents.some(e => e.urgent) && (
                                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                                )}
                                            </div>
                                            <div className="mt-0.5 space-y-0.5 overflow-hidden">
                                                {dayEvents.slice(0, 2).map(ev => {
                                                    const conf = CATEGORY_CONFIG[ev.category];
                                                    return (
                                                        <div
                                                            key={ev.id}
                                                            className={`text-[9px] px-1 py-0.5 rounded truncate ${conf.bgColor} ${conf.color}`}
                                                            onClick={e => { e.stopPropagation(); setSelectedEvent(ev); }}
                                                        >
                                                            {ev.title}
                                                        </div>
                                                    );
                                                })}
                                                {dayEvents.length > 2 && (
                                                    <p className="text-[9px] text-muted-foreground text-center">+{dayEvents.length - 2}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Category Legend */}
                            <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t">
                                {(Object.entries(CATEGORY_CONFIG) as [EventCategory, typeof CATEGORY_CONFIG.conseil][]).map(([key, conf]) => (
                                    <div key={key} className="flex items-center gap-1 text-[10px]">
                                        <div className={`w-2 h-2 rounded-full ${conf.bgColor.includes('red') ? 'bg-red-500' : conf.bgColor.includes('amber') ? 'bg-amber-500' : conf.bgColor.includes('blue') ? 'bg-blue-500' : conf.bgColor.includes('green') ? 'bg-green-500' : 'bg-purple-500'}`} />
                                        <span className="text-muted-foreground">{conf.label}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Events Panel */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-600" />
                                {selectedDate
                                    ? `${new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}`
                                    : 'Événements du mois'
                                }
                            </CardTitle>
                            {selectedDate && (
                                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setSelectedDate(null)}>
                                    Voir tout le mois
                                </Button>
                            )}
                            <CardDescription>{panelEvents.length} événement(s)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                {panelEvents.map(ev => {
                                    const conf = CATEGORY_CONFIG[ev.category];
                                    const EvIcon = conf.icon;
                                    return (
                                        <div
                                            key={ev.id}
                                            className="p-3 rounded-lg border hover:shadow-md transition-all cursor-pointer"
                                            onClick={() => setSelectedEvent(ev)}
                                        >
                                            <div className="flex items-start gap-2">
                                                <div className={`p-1.5 rounded ${conf.bgColor}`}>
                                                    <EvIcon className={`h-3.5 w-3.5 ${conf.color}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-1">
                                                        <p className="text-sm font-medium truncate">{ev.title}</p>
                                                        {ev.urgent && <Badge className="bg-red-500 text-white text-[8px] px-1">!</Badge>}
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                                        {new Date(ev.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                                        {ev.time && ` · ${ev.time}`}
                                                        {ev.endTime && ` – ${ev.endTime}`}
                                                    </p>
                                                    {ev.location && (
                                                        <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                                                            <MapPin className="h-2.5 w-2.5" />{ev.location}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {panelEvents.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-6">Aucun événement</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Event Detail Dialog */}
                {selectedEvent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedEvent(null)}>
                        <Card className="max-w-lg w-full" onClick={e => e.stopPropagation()}>
                            <CardHeader className="flex flex-row items-start justify-between">
                                <div>
                                    <Badge className={`${CATEGORY_CONFIG[selectedEvent.category].bgColor} ${CATEGORY_CONFIG[selectedEvent.category].color} text-[10px] mb-2`}>
                                        {CATEGORY_CONFIG[selectedEvent.category].label}
                                    </Badge>
                                    <CardTitle className="text-lg">{selectedEvent.title}</CardTitle>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedEvent(null)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <CalIcon className="h-4 w-4" />
                                        {new Date(selectedEvent.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                    {selectedEvent.time && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            {selectedEvent.time}{selectedEvent.endTime && ` – ${selectedEvent.endTime}`}
                                        </div>
                                    )}
                                    {selectedEvent.location && (
                                        <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                                            <MapPin className="h-4 w-4" />
                                            {selectedEvent.location}
                                        </div>
                                    )}
                                </div>

                                {selectedEvent.participants && selectedEvent.participants.length > 0 && (
                                    <div>
                                        <p className="text-xs font-medium mb-1">Participants :</p>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedEvent.participants.map(p => (
                                                <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
