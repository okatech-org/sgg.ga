/**
 * SGG Digital — Sondages & Enquêtes Internes
 *
 * Système de sondages pour recueillir les retours :
 *   - Liste des sondages actifs et passés
 *   - Vote interactif
 *   - Résultats en temps réel avec barres
 *   - Création de nouveau sondage
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ClipboardList, BarChart3, Users, Clock,
    Plus, CheckCircle2, Vote, X,
    ChevronDown, ChevronRight, Send,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// ── Types ───────────────────────────────────────────────────────────────────

interface PollOption {
    id: string;
    text: string;
    votes: number;
}

interface Poll {
    id: string;
    question: string;
    description: string;
    options: PollOption[];
    totalVotes: number;
    status: 'active' | 'closed';
    createdBy: string;
    createdAt: string;
    closesAt?: string;
    category: string;
    myVote?: string; // option id
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const INITIAL_POLLS: Poll[] = [
    {
        id: 'p1',
        question: 'Quel format préférez-vous pour les rapports trimestriels ?',
        description: 'Enquête pour standardiser le format de soumission des rapports GAR.',
        options: [
            { id: 'o1', text: 'PDF avec tableaux intégrés', votes: 28 },
            { id: 'o2', text: 'Excel avec feuilles par indicateur', votes: 45 },
            { id: 'o3', text: 'Formulaire en ligne (plateforme SGG)', votes: 62 },
            { id: 'o4', text: 'Combinaison Excel + PDF', votes: 15 },
        ],
        totalVotes: 150,
        status: 'active',
        createdBy: 'Marie OBAME',
        createdAt: '2026-02-05',
        closesAt: '2026-02-28',
        category: 'Reporting',
    },
    {
        id: 'p2',
        question: 'Satisfaction avec la nouvelle interface de la plateforme SGG ?',
        description: 'Évaluez votre expérience utilisateur après la mise à jour v15.',
        options: [
            { id: 'o5', text: '⭐️⭐️⭐️⭐️⭐️ — Excellente', votes: 85 },
            { id: 'o6', text: '⭐️⭐️⭐️⭐️ — Bonne', votes: 52 },
            { id: 'o7', text: '⭐️⭐️⭐️ — Correcte', votes: 18 },
            { id: 'o8', text: '⭐️⭐️ — À améliorer', votes: 8 },
            { id: 'o9', text: '⭐️ — Insatisfaisante', votes: 2 },
        ],
        totalVotes: 165,
        status: 'active',
        createdBy: 'Albert NDONG',
        createdAt: '2026-02-08',
        closesAt: '2026-03-01',
        category: 'Satisfaction',
    },
    {
        id: 'p3',
        question: 'Quels modules souhaitez-vous voir améliorés en priorité ?',
        description: 'Priorisation du backlog pour le prochain trimestre.',
        options: [
            { id: 'o10', text: 'Module GAR (Gestion Axée sur les Résultats)', votes: 38 },
            { id: 'o11', text: 'Module Nominations', votes: 22 },
            { id: 'o12', text: 'Module PTM (Projets & Travaux)', votes: 45 },
            { id: 'o13', text: 'Module Journal Officiel', votes: 15 },
            { id: 'o14', text: 'Tableau de Bord & Analytics', votes: 55 },
            { id: 'o15', text: 'Messagerie & Collaboration', votes: 30 },
        ],
        totalVotes: 205,
        status: 'active',
        createdBy: 'Rose MABIKA',
        createdAt: '2026-02-01',
        category: 'Planification',
    },
    {
        id: 'p4',
        question: 'Préférence pour la fréquence des formations en ligne ?',
        description: 'Organisation des sessions de formation pour les points focaux.',
        options: [
            { id: 'o16', text: 'Hebdomadaire (1h)', votes: 12 },
            { id: 'o17', text: 'Bimensuelle (2h)', votes: 35 },
            { id: 'o18', text: 'Mensuelle (3h)', votes: 48 },
            { id: 'o19', text: 'À la demande', votes: 25 },
        ],
        totalVotes: 120,
        status: 'closed',
        createdBy: 'Françoise ELLA',
        createdAt: '2026-01-15',
        closesAt: '2026-02-01',
        category: 'Formation',
        myVote: 'o18',
    },
    {
        id: 'p5',
        question: 'Calendrier souhaité pour le prochain Conseil interministériel ?',
        description: 'Détermination de la date du Conseil interministériel de revue.',
        options: [
            { id: 'o20', text: 'Semaine du 17 février', votes: 22 },
            { id: 'o21', text: 'Semaine du 24 février', votes: 38 },
            { id: 'o22', text: 'Première semaine de mars', votes: 15 },
        ],
        totalVotes: 75,
        status: 'closed',
        createdBy: 'Paul ABIAGA',
        createdAt: '2026-01-20',
        closesAt: '2026-01-31',
        category: 'Organisation',
        myVote: 'o21',
    },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function SurveysPage() {
    const [polls, setPolls] = useState(INITIAL_POLLS);
    const [tab, setTab] = useState<'active' | 'closed'>('active');
    const [expandedId, setExpandedId] = useState<string | null>('p1');
    const [showCreate, setShowCreate] = useState(false);
    const [newQuestion, setNewQuestion] = useState('');

    const filtered = useMemo(() => polls.filter(p => p.status === tab), [polls, tab]);

    const handleVote = (pollId: string, optionId: string) => {
        setPolls(prev => prev.map(p => {
            if (p.id !== pollId || p.myVote) return p;
            return {
                ...p,
                myVote: optionId,
                totalVotes: p.totalVotes + 1,
                options: p.options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o),
            };
        }));
        toast({ title: '✅ Vote enregistré !' });
    };

    const createPoll = () => {
        if (!newQuestion.trim()) return;
        const newPoll: Poll = {
            id: `p${Date.now()}`,
            question: newQuestion.trim(),
            description: '',
            options: [
                { id: `no1_${Date.now()}`, text: 'Option 1', votes: 0 },
                { id: `no2_${Date.now()}`, text: 'Option 2', votes: 0 },
            ],
            totalVotes: 0,
            status: 'active',
            createdBy: 'Albert NDONG',
            createdAt: new Date().toISOString().split('T')[0],
            category: 'Général',
        };
        setPolls(prev => [newPoll, ...prev]);
        setNewQuestion('');
        setShowCreate(false);
        toast({ title: '📊 Sondage créé' });
    };

    const activeCount = polls.filter(p => p.status === 'active').length;
    const closedCount = polls.filter(p => p.status === 'closed').length;
    const totalVotes = polls.reduce((s, p) => s + p.totalVotes, 0);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <ClipboardList className="h-7 w-7 text-pink-600" />
                            Sondages & Enquêtes
                        </h1>
                        <p className="text-muted-foreground">
                            {polls.length} sondages · {totalVotes} votes enregistrés
                        </p>
                    </div>
                    <Button size="sm" className="gap-2" onClick={() => setShowCreate(!showCreate)}>
                        <Plus className="h-4 w-4" /> Nouveau sondage
                    </Button>
                </div>

                {/* Quick Create */}
                {showCreate && (
                    <Card className="border-2 border-primary/30">
                        <CardContent className="pt-4 flex items-center gap-3">
                            <Input
                                placeholder="Question du sondage..."
                                value={newQuestion}
                                onChange={e => setNewQuestion(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && createPoll()}
                                autoFocus
                            />
                            <Button size="sm" onClick={createPoll} disabled={!newQuestion.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowCreate(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-pink-600">{activeCount}</p>
                        <p className="text-[10px] text-muted-foreground">En cours</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-gray-600">{closedCount}</p>
                        <p className="text-[10px] text-muted-foreground">Clôturés</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-blue-600">{totalVotes}</p>
                        <p className="text-[10px] text-muted-foreground">Votes total</p>
                    </CardContent></Card>
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                    <Button variant={tab === 'active' ? 'default' : 'outline'} size="sm" className="gap-2" onClick={() => setTab('active')}>
                        <Vote className="h-4 w-4" /> En cours
                        <Badge variant="secondary" className="text-[10px]">{activeCount}</Badge>
                    </Button>
                    <Button variant={tab === 'closed' ? 'default' : 'outline'} size="sm" className="gap-2" onClick={() => setTab('closed')}>
                        <CheckCircle2 className="h-4 w-4" /> Clôturés
                        <Badge variant="secondary" className="text-[10px]">{closedCount}</Badge>
                    </Button>
                </div>

                {/* Polls */}
                <div className="space-y-3">
                    {filtered.map(poll => {
                        const isExpanded = expandedId === poll.id;
                        const maxVotes = Math.max(...poll.options.map(o => o.votes));
                        return (
                            <Card key={poll.id}>
                                <button
                                    className="w-full text-left p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                                    onClick={() => setExpandedId(isExpanded ? null : poll.id)}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${poll.status === 'active' ? 'bg-pink-100 dark:bg-pink-900/30' : 'bg-gray-100 dark:bg-gray-800'
                                        }`}>
                                        <BarChart3 className={`h-4 w-4 ${poll.status === 'active' ? 'text-pink-600' : 'text-gray-500'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold">{poll.question}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5 flex-wrap">
                                            <Badge variant="outline" className="text-[9px] h-4">{poll.category}</Badge>
                                            <span className="flex items-center gap-0.5"><Users className="h-2.5 w-2.5" />{poll.totalVotes} votes</span>
                                            <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{poll.createdAt}</span>
                                            <span>par {poll.createdBy}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {poll.myVote && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                        <Badge className={poll.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{poll.status === 'active' ? 'En cours' : 'Clôturé'}</Badge>
                                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </div>
                                </button>

                                {isExpanded && (
                                    <CardContent className="pt-0 pb-4 border-t">
                                        {poll.description && (
                                            <p className="text-xs text-muted-foreground mt-3 mb-3">{poll.description}</p>
                                        )}
                                        <div className="space-y-2">
                                            {poll.options.map(opt => {
                                                const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                                                const isMyVote = poll.myVote === opt.id;
                                                const isWinning = opt.votes === maxVotes && poll.totalVotes > 0;
                                                const canVote = poll.status === 'active' && !poll.myVote;
                                                return (
                                                    <button
                                                        key={opt.id}
                                                        className={`w-full text-left p-2.5 rounded-lg border transition-all relative overflow-hidden
                              ${isMyVote ? 'border-primary bg-primary/5' : 'hover:bg-muted/30'}
                              ${canVote ? 'cursor-pointer' : 'cursor-default'}
                            `}
                                                        onClick={() => canVote && handleVote(poll.id, opt.id)}
                                                        disabled={!canVote}
                                                    >
                                                        {/* Background bar */}
                                                        <div
                                                            className={`absolute inset-0 h-full opacity-10 ${isWinning ? 'bg-pink-500' : 'bg-primary'}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                        <div className="relative flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                {isMyVote && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
                                                                <span className="text-xs">{opt.text}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                <span className="text-xs font-bold">{pct}%</span>
                                                                <span className="text-[10px] text-muted-foreground">({opt.votes})</span>
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {poll.closesAt && (
                                            <p className="text-[10px] text-muted-foreground mt-2">
                                                {poll.status === 'active' ? `Clôture le ${poll.closesAt}` : `Clôturé le ${poll.closesAt}`}
                                            </p>
                                        )}
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
