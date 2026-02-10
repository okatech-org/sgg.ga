/**
 * SGG Digital — Messagerie Interne
 *
 * Système de messagerie entre utilisateurs de la plateforme :
 *   - Liste de conversations avec aperçu
 *   - Vue conversation avec fil de messages
 *   - Envoi de nouveaux messages
 *   - Indicateurs de messages non lus
 *   - Recherche par contact ou contenu
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    MessageSquare, Send, Search, ArrowLeft,
    Paperclip, User, Clock, Check,
    CheckCheck, Circle,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: Date;
    read: boolean;
}

interface Conversation {
    id: string;
    contact: { id: string; name: string; role: string; initials: string; online: boolean };
    messages: Message[];
    unread: number;
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const ME = 'albert'; // Current user

const INITIAL_CONVERSATIONS: Conversation[] = [
    {
        id: 'c1',
        contact: { id: 'marie', name: 'Marie OBAME', role: 'DGME', initials: 'MO', online: true },
        unread: 2,
        messages: [
            { id: 'm1', senderId: 'albert', text: 'Bonjour Marie, avez-vous finalisé le rapport GAR pour le MINFI ?', timestamp: new Date(Date.now() - 3600_000 * 4), read: true },
            { id: 'm2', senderId: 'marie', text: 'Bonjour Albert ! Oui, le rapport est prêt. Je l\'ai soumis ce matin avec un score de 92%.', timestamp: new Date(Date.now() - 3600_000 * 3.5), read: true },
            { id: 'm3', senderId: 'albert', text: 'Excellent ! Et pour le MINTRANS, on a des nouvelles du point focal ?', timestamp: new Date(Date.now() - 3600_000 * 3), read: true },
            { id: 'm4', senderId: 'marie', text: 'Pas encore. J\'ai envoyé une relance hier. Je pense qu\'il faudra escalader si on n\'a pas de réponse d\'ici vendredi.', timestamp: new Date(Date.now() - 3600_000 * 2), read: false },
            { id: 'm5', senderId: 'marie', text: 'Je vous envoie le récapitulatif des ministères en retard dans la journée.', timestamp: new Date(Date.now() - 3600_000), read: false },
        ],
    },
    {
        id: 'c2',
        contact: { id: 'paul', name: 'Paul ABIAGA', role: 'SGPR', initials: 'PA', online: true },
        unread: 1,
        messages: [
            { id: 'm6', senderId: 'paul', text: 'Albert, le Président souhaite un point sur l\'avancement du PAG 2026 lors du prochain Conseil.', timestamp: new Date(Date.now() - 86400_000 * 2), read: true },
            { id: 'm7', senderId: 'albert', text: 'Bien reçu, Paul. Je prépare la synthèse avec les données actuelles. Les axes 1 et 2 sont à 78% d\'avancement.', timestamp: new Date(Date.now() - 86400_000 * 2 + 3600_000), read: true },
            { id: 'm8', senderId: 'paul', text: 'Parfait. N\'oubliez pas d\'inclure les projets phares et les blocages identifiés. Merci.', timestamp: new Date(Date.now() - 86400_000), read: false },
        ],
    },
    {
        id: 'c3',
        contact: { id: 'jean', name: 'Jean NZE', role: 'DAJ', initials: 'JN', online: false },
        unread: 0,
        messages: [
            { id: 'm9', senderId: 'albert', text: 'Jean, le décret n°004/2026 est-il prêt pour signature ?', timestamp: new Date(Date.now() - 86400_000 * 3), read: true },
            { id: 'm10', senderId: 'jean', text: 'Il est en relecture finale à la DAJ. On devrait vous le transmettre demain matin au plus tard.', timestamp: new Date(Date.now() - 86400_000 * 3 + 7200_000), read: true },
            { id: 'm11', senderId: 'albert', text: 'Merci Jean, tenez-moi informé.', timestamp: new Date(Date.now() - 86400_000 * 3 + 10800_000), read: true },
        ],
    },
    {
        id: 'c4',
        contact: { id: 'sylvie', name: 'Sylvie MOUSSAVOU', role: 'Qualité', initials: 'SM', online: false },
        unread: 0,
        messages: [
            { id: 'm12', senderId: 'sylvie', text: 'Monsieur le SG, j\'ai détecté des incohérences dans les données MINSANTE soumises hier.', timestamp: new Date(Date.now() - 86400_000 * 5), read: true },
            { id: 'm13', senderId: 'albert', text: 'Quels types d\'incohérences ?', timestamp: new Date(Date.now() - 86400_000 * 5 + 3600_000), read: true },
            { id: 'm14', senderId: 'sylvie', text: 'Les totaux budgétaires ne correspondent pas aux détails par programme. Écart de 12%. J\'ai ouvert un ticket d\'audit.', timestamp: new Date(Date.now() - 86400_000 * 5 + 7200_000), read: true },
        ],
    },
    {
        id: 'c5',
        contact: { id: 'francoise', name: 'Françoise ELLA', role: 'Point Focal', initials: 'FE', online: true },
        unread: 0,
        messages: [
            { id: 'm15', senderId: 'francoise', text: 'Je voulais confirmer que la session de formation PTM de jeudi est bien maintenue ?', timestamp: new Date(Date.now() - 86400_000 * 7), read: true },
            { id: 'm16', senderId: 'albert', text: 'Oui, confirmé. Salle B, 10h-16h. 15 participants inscrits.', timestamp: new Date(Date.now() - 86400_000 * 7 + 3600_000), read: true },
        ],
    },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(d: Date) {
    const diff = Date.now() - d.getTime();
    if (diff < 60_000) return 'à l\'instant';
    if (diff < 3600_000) return `${Math.floor(diff / 60_000)} min`;
    if (diff < 86400_000) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (diff < 86400_000 * 7) return `${Math.floor(diff / 86400_000)}j`;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function formatMessageTime(d: Date) {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// ── Component ───────────────────────────────────────────────────────────────

export default function MessagingPage() {
    const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
    const [activeConvId, setActiveConvId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeConv = conversations.find(c => c.id === activeConvId) || null;
    const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

    const filtered = useMemo(() => {
        if (!search) return conversations;
        const q = search.toLowerCase();
        return conversations.filter(c =>
            c.contact.name.toLowerCase().includes(q) ||
            c.messages.some(m => m.text.toLowerCase().includes(q))
        );
    }, [conversations, search]);

    const openConversation = (convId: string) => {
        setActiveConvId(convId);
        // Mark as read
        setConversations(prev => prev.map(c =>
            c.id === convId ? { ...c, unread: 0, messages: c.messages.map(m => ({ ...m, read: true })) } : c
        ));
    };

    const sendMessage = () => {
        if (!newMessage.trim() || !activeConvId) return;
        const msg: Message = {
            id: `m${Date.now()}`,
            senderId: ME,
            text: newMessage.trim(),
            timestamp: new Date(),
            read: true,
        };
        setConversations(prev => prev.map(c =>
            c.id === activeConvId ? { ...c, messages: [...c.messages, msg] } : c
        ));
        setNewMessage('');
    };

    // Auto-scroll on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConv?.messages.length]);

    return (
        <DashboardLayout>
            <div className="space-y-4">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <MessageSquare className="h-7 w-7 text-blue-600" />
                        Messagerie
                        {totalUnread > 0 && (
                            <Badge className="bg-red-500 text-white text-[10px]">{totalUnread}</Badge>
                        )}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {conversations.length} conversations · {totalUnread} non lu(s)
                    </p>
                </div>

                {/* Main Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ height: 'calc(100vh - 240px)', minHeight: '500px' }}>
                    {/* Conversation List */}
                    <Card className={`overflow-hidden flex flex-col ${activeConvId ? 'hidden lg:flex' : 'flex'}`}>
                        <CardHeader className="shrink-0 pb-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Rechercher..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-0">
                            {filtered.map(conv => {
                                const lastMsg = conv.messages[conv.messages.length - 1];
                                const isActive = conv.id === activeConvId;
                                return (
                                    <button
                                        key={conv.id}
                                        className={`w-full text-left flex items-center gap-3 px-4 py-3 border-b transition-colors hover:bg-muted/50 ${isActive ? 'bg-primary/5' : ''}`}
                                        onClick={() => openConversation(conv.id)}
                                    >
                                        <div className="relative shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                                {conv.contact.initials}
                                            </div>
                                            {conv.contact.online && (
                                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-1">
                                                <p className="text-xs font-semibold truncate">{conv.contact.name}</p>
                                                <span className="text-[10px] text-muted-foreground shrink-0">{formatTime(lastMsg.timestamp)}</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-1">
                                                <p className="text-[10px] text-muted-foreground truncate">
                                                    {lastMsg.senderId === ME ? 'Vous : ' : ''}{lastMsg.text}
                                                </p>
                                                {conv.unread > 0 && (
                                                    <Badge className="bg-blue-600 text-white text-[9px] h-4 px-1.5 shrink-0">{conv.unread}</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Chat Area */}
                    <Card className={`lg:col-span-2 overflow-hidden flex flex-col ${!activeConvId ? 'hidden lg:flex' : 'flex'}`}>
                        {activeConv ? (
                            <>
                                {/* Chat Header */}
                                <div className="shrink-0 flex items-center gap-3 p-4 border-b">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden" onClick={() => setActiveConvId(null)}>
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                    <div className="relative">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                            {activeConv.contact.initials}
                                        </div>
                                        {activeConv.contact.online && (
                                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{activeConv.contact.name}</p>
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            {activeConv.contact.online ? (
                                                <><Circle className="h-2 w-2 fill-green-500 text-green-500" /> En ligne</>
                                            ) : (
                                                <><Clock className="h-2 w-2" /> Hors-ligne</>
                                            )}
                                            <span className="mx-1">·</span>
                                            {activeConv.contact.role}
                                        </p>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {activeConv.messages.map(msg => {
                                        const isMine = msg.senderId === ME;
                                        return (
                                            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] px-3 py-2 rounded-2xl ${isMine
                                                        ? 'bg-primary text-primary-foreground rounded-br-md'
                                                        : 'bg-muted rounded-bl-md'
                                                    }`}>
                                                    <p className="text-xs leading-relaxed">{msg.text}</p>
                                                    <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : ''}`}>
                                                        <span className={`text-[9px] ${isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                                                            {formatMessageTime(msg.timestamp)}
                                                        </span>
                                                        {isMine && (
                                                            msg.read ? <CheckCheck className="h-2.5 w-2.5 text-blue-300" /> : <Check className="h-2.5 w-2.5 text-primary-foreground/50" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="shrink-0 p-4 border-t">
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" title="Joindre un fichier">
                                            <Paperclip className="h-4 w-4" />
                                        </Button>
                                        <Input
                                            placeholder="Écrire un message..."
                                            className="h-9"
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                        />
                                        <Button size="icon" className="h-9 w-9 shrink-0" onClick={sendMessage} disabled={!newMessage.trim()}>
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm font-medium">Sélectionnez une conversation</p>
                                    <p className="text-xs mt-1">ou recherchez un contact</p>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
