/**
 * SGG Digital — Annuaire des Contacts
 *
 * Répertoire complet des acteurs de la plateforme :
 *   - Filtrage par rôle, ministère, statut
 *   - Vue grille et vue liste
 *   - Détail contact avec historique d'activité
 *   - Export CSV des contacts
 *   - Recherche full-text
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Users, Search, Download, Mail, Phone, MapPin,
    Building2, Shield, User as UserIcon,
    LayoutGrid, List, Clock, CheckCircle2,
    X, ExternalLink,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

interface Contact {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    roleLabel: string;
    ministry: string;
    ministryShort: string;
    title: string;
    status: 'active' | 'inactive';
    lastSeen: string;
    avatar?: string;
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
    admin_sgg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    sgpr: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    sg_ministere: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    point_focal: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    directeur: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    citoyen: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

const CONTACTS: Contact[] = [
    { id: 'c1', name: 'Albert NDONG', email: 'albert.ndong@sgg.ga', phone: '+241 077 12 34 56', role: 'admin_sgg', roleLabel: 'Administrateur SGG', ministry: 'Secrétariat Général du Gouvernement', ministryShort: 'SGG', title: 'Secrétaire Général Adjoint', status: 'active', lastSeen: new Date(Date.now() - 30 * 60_000).toISOString() },
    { id: 'c2', name: 'Paul ABIAGA', email: 'paul.abiaga@presidence.ga', phone: '+241 077 22 34 56', role: 'sgpr', roleLabel: 'SGPR', ministry: 'Secrétariat Général de la Présidence', ministryShort: 'SGPR', title: 'Directeur de Cabinet', status: 'active', lastSeen: new Date(Date.now() - 2 * 3600_000).toISOString() },
    { id: 'c3', name: 'Marie OBAME', email: 'marie.obame@sgg.ga', phone: '+241 077 33 45 67', role: 'admin_sgg', roleLabel: 'Administrateur SGG', ministry: 'Secrétariat Général du Gouvernement', ministryShort: 'SGG', title: 'Directrice des Systèmes d\'Information', status: 'active', lastSeen: new Date(Date.now() - 15 * 60_000).toISOString() },
    { id: 'c4', name: 'Jean NZE', email: 'jean.nze@minfi.ga', phone: '+241 077 44 56 78', role: 'sg_ministere', roleLabel: 'SG Ministère', ministry: 'Ministère des Finances', ministryShort: 'MINFI', title: 'Secrétaire Général', status: 'active', lastSeen: new Date(Date.now() - 6 * 3600_000).toISOString() },
    { id: 'c5', name: 'Sylvie MOUSSAVOU', email: 'sylvie.moussavou@minsante.ga', phone: '+241 077 55 67 89', role: 'sg_ministere', roleLabel: 'SG Ministère', ministry: 'Ministère de la Santé', ministryShort: 'MINSANTE', title: 'Secrétaire Générale', status: 'active', lastSeen: new Date(Date.now() - 24 * 3600_000).toISOString() },
    { id: 'c6', name: 'Pierre MBOUMBA', email: 'pierre.mboumba@mineduc.ga', phone: '+241 077 66 78 90', role: 'point_focal', roleLabel: 'Point Focal', ministry: 'Ministère de l\'Éducation Nationale', ministryShort: 'MINEDUC', title: 'Chef du Service Statistique', status: 'active', lastSeen: new Date(Date.now() - 3 * 3600_000).toISOString() },
    { id: 'c7', name: 'Françoise ELLA', email: 'francoise.ella@mintrans.ga', phone: '+241 077 77 89 01', role: 'point_focal', roleLabel: 'Point Focal', ministry: 'Ministère des Transports', ministryShort: 'MINTRANS', title: 'Responsable Suivi-Évaluation', status: 'active', lastSeen: new Date(Date.now() - 48 * 3600_000).toISOString() },
    { id: 'c8', name: 'Jacques NDONG', email: 'jacques.ndong@mindef.ga', phone: '+241 077 88 90 12', role: 'sg_ministere', roleLabel: 'SG Ministère', ministry: 'Ministère de la Défense', ministryShort: 'MINDEF', title: 'Secrétaire Général', status: 'inactive', lastSeen: new Date(Date.now() - 7 * 86400_000).toISOString() },
    { id: 'c9', name: 'Rose MABIKA', email: 'rose.mabika@mines.ga', phone: '+241 077 99 01 23', role: 'point_focal', roleLabel: 'Point Focal', ministry: 'Ministère des Mines', ministryShort: 'MINES', title: 'Point Focal GAR', status: 'active', lastSeen: new Date(Date.now() - 5 * 3600_000).toISOString() },
    { id: 'c10', name: 'Thomas ESSONO', email: 'thomas.essono@agriculture.ga', phone: '+241 077 10 12 34', role: 'directeur', roleLabel: 'Directeur', ministry: 'Ministère de l\'Agriculture', ministryShort: 'MINAGRI', title: 'Directeur de la Planification', status: 'active', lastSeen: new Date(Date.now() - 8 * 3600_000).toISOString() },
    { id: 'c11', name: 'Claire NGOUA', email: 'claire.ngoua@justice.ga', phone: '+241 077 21 23 45', role: 'sg_ministere', roleLabel: 'SG Ministère', ministry: 'Ministère de la Justice', ministryShort: 'MINJUST', title: 'Secrétaire Générale', status: 'active', lastSeen: new Date(Date.now() - 12 * 3600_000).toISOString() },
    { id: 'c12', name: 'Daniel ONDO', email: 'daniel.ondo@dgme.ga', phone: '+241 077 32 34 56', role: 'directeur', roleLabel: 'Directeur', ministry: 'Direction Générale de la Modernisation', ministryShort: 'DGME', title: 'Directeur Général', status: 'active', lastSeen: new Date(Date.now() - 4 * 3600_000).toISOString() },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function ContactsPage() {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

    const filtered = useMemo(() => {
        return CONTACTS.filter(c => {
            if (roleFilter !== 'all' && c.role !== roleFilter) return false;
            if (statusFilter !== 'all' && c.status !== statusFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                return c.name.toLowerCase().includes(q) ||
                    c.email.toLowerCase().includes(q) ||
                    c.ministry.toLowerCase().includes(q) ||
                    c.ministryShort.toLowerCase().includes(q) ||
                    c.title.toLowerCase().includes(q);
            }
            return true;
        });
    }, [search, roleFilter, statusFilter]);

    const formatLastSeen = (iso: string) => {
        const diff = Date.now() - new Date(iso).getTime();
        if (diff < 3600_000) return `${Math.floor(diff / 60_000)} min`;
        if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h`;
        return `${Math.floor(diff / 86400_000)}j`;
    };

    const roles = [...new Set(CONTACTS.map(c => c.role))];

    const handleExportCSV = () => {
        const headers = ['Nom', 'Email', 'Téléphone', 'Rôle', 'Ministère', 'Titre', 'Statut'];
        const rows = filtered.map(c => [c.name, c.email, c.phone, c.roleLabel, c.ministry, c.title, c.status]);
        const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contacts-sgg-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Users className="h-7 w-7 text-indigo-600" />
                            Annuaire des Contacts
                        </h1>
                        <p className="text-muted-foreground">
                            {CONTACTS.length} contacts — {CONTACTS.filter(c => c.status === 'active').length} actifs
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={() => setViewMode('grid')}>
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={() => setViewMode('list')}>
                            <List className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV}>
                            <Download className="h-4 w-4" /> CSV
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher nom, email, ministère..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
                    </div>
                    <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                        <option value="all">Tous les rôles</option>
                        {roles.map(r => (
                            <option key={r} value={r}>{CONTACTS.find(c => c.role === r)?.roleLabel}</option>
                        ))}
                    </select>
                    <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}>
                        <option value="all">Tous les statuts</option>
                        <option value="active">Actifs</option>
                        <option value="inactive">Inactifs</option>
                    </select>
                </div>

                <p className="text-xs text-muted-foreground">{filtered.length} contacts trouvés</p>

                {/* Grid View */}
                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map(contact => (
                            <Card key={contact.id} className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => setSelectedContact(contact)}>
                                <CardContent className="pt-5 pb-4 text-center">
                                    <div className={`w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-lg font-bold ${contact.status === 'active'
                                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                                            : 'bg-gray-300 dark:bg-gray-700 text-gray-500'
                                        }`}>
                                        {getInitials(contact.name)}
                                    </div>

                                    <p className="font-semibold text-sm">{contact.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{contact.title}</p>

                                    <Badge className={`mt-2 text-[10px] ${ROLE_COLORS[contact.role] || ROLE_COLORS.citoyen}`}>
                                        {contact.roleLabel}
                                    </Badge>

                                    <div className="mt-3 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                                        <Building2 className="h-3 w-3" />
                                        {contact.ministryShort}
                                    </div>

                                    <div className="mt-1 flex items-center justify-center gap-1 text-[10px]">
                                        <div className={`w-1.5 h-1.5 rounded-full ${contact.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                        {contact.status === 'active' ? `Vu il y a ${formatLastSeen(contact.lastSeen)}` : 'Inactif'}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <div className="space-y-2">
                        {filtered.map(contact => (
                            <Card key={contact.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedContact(contact)}>
                                <CardContent className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${contact.status === 'active'
                                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                                                : 'bg-gray-300 dark:bg-gray-700 text-gray-500'
                                            }`}>
                                            {getInitials(contact.name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium">{contact.name}</p>
                                                <Badge className={`text-[10px] ${ROLE_COLORS[contact.role] || ROLE_COLORS.citoyen}`}>
                                                    {contact.roleLabel}
                                                </Badge>
                                                <div className={`w-1.5 h-1.5 rounded-full ${contact.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">{contact.title} — {contact.ministryShort}</p>
                                        </div>
                                        <div className="text-right text-[10px] text-muted-foreground hidden sm:block">
                                            <p>{contact.email}</p>
                                            <p>{contact.phone}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {filtered.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <UserIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p>Aucun contact trouvé</p>
                        </CardContent>
                    </Card>
                )}

                {/* Contact Detail Modal */}
                {selectedContact && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedContact(null)}>
                        <Card className="max-w-md w-full" onClick={e => e.stopPropagation()}>
                            <CardHeader className="text-center">
                                <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-8 w-8" onClick={() => setSelectedContact(null)}>
                                    <X className="h-4 w-4" />
                                </Button>
                                <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-xl font-bold ${selectedContact.status === 'active'
                                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500'
                                    }`}>
                                    {getInitials(selectedContact.name)}
                                </div>
                                <CardTitle>{selectedContact.name}</CardTitle>
                                <CardDescription>{selectedContact.title}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Badge className={`${ROLE_COLORS[selectedContact.role]} mx-auto block w-fit`}>
                                    {selectedContact.roleLabel}
                                </Badge>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-mono text-xs">{selectedContact.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-mono text-xs">{selectedContact.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-xs">{selectedContact.ministry}</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-xs">
                                            Dernière connexion : il y a {formatLastSeen(selectedContact.lastSeen)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 justify-center pt-2">
                                    <div className={`w-2 h-2 rounded-full ${selectedContact.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                    <span className="text-xs">{selectedContact.status === 'active' ? 'En ligne' : 'Hors ligne'}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
