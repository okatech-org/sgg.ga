/**
 * SGG Digital — Archives & Corbeille
 *
 * Gestion des éléments archivés et supprimés :
 *   - Deux onglets : Archives (conservés) et Corbeille (supprimés)
 *   - Restauration et suppression définitive
 *   - Filtrage par type, module et date
 *   - Purge automatique après 30 jours
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Archive, Trash2, RotateCcw, XCircle,
    FileText, BarChart3, Users, Building2,
    Search, AlertTriangle, Clock, Folder,
    CheckCircle2, Shield, Filter,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// ── Types ───────────────────────────────────────────────────────────────────

type ItemType = 'rapport' | 'document' | 'nomination' | 'institution' | 'utilisateur';
type ItemStatus = 'archived' | 'trashed';

interface ArchivedItem {
    id: string;
    name: string;
    type: ItemType;
    module: string;
    archivedBy: string;
    archivedAt: string;
    originalPath: string;
    size: string;
    status: ItemStatus;
    deleteIn?: number; // days until auto-delete for trashed items
}

// ── Config ──────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<ItemType, { label: string; icon: typeof FileText; color: string; bg: string }> = {
    rapport: { label: 'Rapport', icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    document: { label: 'Document', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    nomination: { label: 'Nomination', icon: Users, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    institution: { label: 'Institution', icon: Building2, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    utilisateur: { label: 'Utilisateur', icon: Shield, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const INITIAL_ITEMS: ArchivedItem[] = [
    { id: 'a1', name: 'Rapport GAR T2 2025 — MINFI', type: 'rapport', module: 'GAR', archivedBy: 'Albert NDONG', archivedAt: '2025-12-15', originalPath: '/gar/rapports/t2-2025-minfi', size: '3.2 MB', status: 'archived' },
    { id: 'a2', name: 'Décret n°089/2025 — Organisation DGME', type: 'document', module: 'Journal Officiel', archivedBy: 'Jean NZE', archivedAt: '2025-11-20', originalPath: '/journal-officiel/decrets/089-2025', size: '1.5 MB', status: 'archived' },
    { id: 'a3', name: 'Nomination DG — Ministère des Mines (brouillon)', type: 'nomination', module: 'Nominations', archivedBy: 'Marie OBAME', archivedAt: '2025-10-05', originalPath: '/nominations/brouillons/dg-mines', size: '450 KB', status: 'archived' },
    { id: 'a4', name: 'Fiche Institution — ANPI (ancienne)', type: 'institution', module: 'Institutions', archivedBy: 'Sylvie MOUSSAVOU', archivedAt: '2025-09-12', originalPath: '/institutions/anpi-v1', size: '780 KB', status: 'archived' },
    { id: 'a5', name: 'Rapport consolidé Q1 2025', type: 'rapport', module: 'Reporting', archivedBy: 'Albert NDONG', archivedAt: '2025-08-30', originalPath: '/reporting/consolide/q1-2025', size: '8.4 MB', status: 'archived' },
    { id: 'a6', name: 'Matrice PTM Janvier 2025 (erreur)', type: 'rapport', module: 'PTM', archivedBy: 'Pierre MBOUMBA', archivedAt: '2025-08-15', originalPath: '/ptm/matrices/jan-2025-erreur', size: '2.1 MB', status: 'archived' },

    { id: 't1', name: 'Brouillon rapport GAR — MINEDUC', type: 'rapport', module: 'GAR', archivedBy: 'Françoise ELLA', archivedAt: '2026-02-05', originalPath: '/gar/brouillons/mineduc', size: '1.8 MB', status: 'trashed', deleteIn: 25 },
    { id: 't2', name: 'Document test — import CSV échoué', type: 'document', module: 'Import/Export', archivedBy: 'Rose MABIKA', archivedAt: '2026-02-08', originalPath: '/data-exchange/imports/test-failed', size: '340 KB', status: 'trashed', deleteIn: 28 },
    { id: 't3', name: 'Compte utilisateur — Duplicata Pierre M.', type: 'utilisateur', module: 'Admin', archivedBy: 'Marie OBAME', archivedAt: '2026-01-25', originalPath: '/admin/users/duplicata-pm', size: '12 KB', status: 'trashed', deleteIn: 15 },
    { id: 't4', name: 'Nomination annulée — DGA Transport', type: 'nomination', module: 'Nominations', archivedBy: 'Jean NZE', archivedAt: '2026-01-20', originalPath: '/nominations/annulees/dga-transport', size: '620 KB', status: 'trashed', deleteIn: 10 },
    { id: 't5', name: 'Ancienne fiche SEEG', type: 'institution', module: 'Institutions', archivedBy: 'Albert NDONG', archivedAt: '2026-01-15', originalPath: '/institutions/seeg-old', size: '890 KB', status: 'trashed', deleteIn: 5 },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Component ───────────────────────────────────────────────────────────────

export default function ArchivesPage() {
    const [items, setItems] = useState(INITIAL_ITEMS);
    const [tab, setTab] = useState<'archived' | 'trashed'>('archived');
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<ItemType | 'all'>('all');

    const filtered = useMemo(() => {
        return items
            .filter(i => i.status === tab)
            .filter(i => typeFilter === 'all' || i.type === typeFilter)
            .filter(i => {
                if (!search) return true;
                const q = search.toLowerCase();
                return i.name.toLowerCase().includes(q) || i.module.toLowerCase().includes(q) || i.archivedBy.toLowerCase().includes(q);
            });
    }, [items, tab, search, typeFilter]);

    const handleRestore = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
        toast({ title: '✅ Élément restauré', description: 'L\'élément a été remis à son emplacement d\'origine.' });
    };

    const handleDelete = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
        toast({ title: '🗑️ Supprimé définitivement', description: 'L\'élément a été supprimé de façon irréversible.' });
    };

    const handlePurge = () => {
        const trashedCount = items.filter(i => i.status === 'trashed').length;
        setItems(prev => prev.filter(i => i.status !== 'trashed'));
        toast({ title: `🗑️ Corbeille vidée`, description: `${trashedCount} éléments supprimés définitivement.` });
    };

    const archivedCount = items.filter(i => i.status === 'archived').length;
    const trashedCount = items.filter(i => i.status === 'trashed').length;
    const totalSize = items.reduce((s, i) => {
        const num = parseFloat(i.size);
        return s + (i.size.includes('MB') ? num : num / 1000);
    }, 0);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Archive className="h-7 w-7 text-orange-600" />
                            Archives & Corbeille
                        </h1>
                        <p className="text-muted-foreground">
                            {archivedCount} archivés · {trashedCount} en corbeille · {totalSize.toFixed(1)} MB
                        </p>
                    </div>
                    {tab === 'trashed' && trashedCount > 0 && (
                        <Button variant="destructive" size="sm" className="gap-2" onClick={handlePurge}>
                            <Trash2 className="h-4 w-4" /> Vider la corbeille
                        </Button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                    <Button
                        variant={tab === 'archived' ? 'default' : 'outline'}
                        size="sm"
                        className="gap-2"
                        onClick={() => setTab('archived')}
                    >
                        <Archive className="h-4 w-4" /> Archives
                        <Badge variant="secondary" className="text-[10px]">{archivedCount}</Badge>
                    </Button>
                    <Button
                        variant={tab === 'trashed' ? 'default' : 'outline'}
                        size="sm"
                        className="gap-2"
                        onClick={() => setTab('trashed')}
                    >
                        <Trash2 className="h-4 w-4" /> Corbeille
                        <Badge variant="secondary" className="text-[10px]">{trashedCount}</Badge>
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par nom, module..."
                            className="pl-9"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        <Button variant={typeFilter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs" onClick={() => setTypeFilter('all')}>Tous</Button>
                        {(Object.entries(TYPE_CONFIG) as [ItemType, typeof TYPE_CONFIG.rapport][]).map(([key, conf]) => {
                            const Icon = conf.icon;
                            return (
                                <Button key={key} variant={typeFilter === key ? 'default' : 'outline'} size="sm" className="text-xs gap-1" onClick={() => setTypeFilter(key)}>
                                    <Icon className="h-3 w-3" /> {conf.label}
                                </Button>
                            );
                        })}
                    </div>
                </div>

                {/* Items */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            {tab === 'archived' ? <Folder className="h-4 w-4 text-orange-600" /> : <Trash2 className="h-4 w-4 text-red-500" />}
                            {tab === 'archived' ? 'Éléments archivés' : 'Corbeille'}
                        </CardTitle>
                        <CardDescription>{filtered.length} élément(s)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filtered.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Archive className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">Aucun élément trouvé</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filtered.map(item => {
                                    const conf = TYPE_CONFIG[item.type];
                                    const Icon = conf.icon;
                                    return (
                                        <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group">
                                            <div className={`p-2 rounded-lg ${conf.bg} shrink-0`}>
                                                <Icon className={`h-4 w-4 ${conf.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold truncate">{item.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground flex-wrap">
                                                    <Badge variant="outline" className="text-[9px] h-4">{item.module}</Badge>
                                                    <span className="flex items-center gap-0.5"><Users className="h-2.5 w-2.5" />{item.archivedBy}</span>
                                                    <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{formatDate(item.archivedAt)}</span>
                                                    <span>{item.size}</span>
                                                    {item.deleteIn !== undefined && (
                                                        <span className={`flex items-center gap-0.5 font-medium ${item.deleteIn <= 7 ? 'text-red-500' : 'text-amber-500'}`}>
                                                            <AlertTriangle className="h-2.5 w-2.5" /> Suppression dans {item.deleteIn}j
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={() => handleRestore(item.id)}>
                                                    <RotateCcw className="h-3 w-3" /> Restaurer
                                                </Button>
                                                {item.status === 'trashed' && (
                                                    <Button variant="destructive" size="sm" className="h-7 text-[10px] gap-1" onClick={() => handleDelete(item.id)}>
                                                        <XCircle className="h-3 w-3" /> Supprimer
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Info Banner */}
                <div className="text-[11px] text-muted-foreground flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                    Les éléments dans la corbeille sont automatiquement supprimés après 30 jours. Les archives sont conservées indéfiniment.
                </div>
            </div>
        </DashboardLayout>
    );
}
