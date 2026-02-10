/**
 * SGG Digital — Gestion Documentaire Avancée
 *
 * Centre de documents avec catégorisation, versioning, et métadonnées :
 *   - Vue grille/liste
 *   - Filtrage par type/catégorie/statut
 *   - Aperçu des métadonnées
 *   - Historique des versions
 *   - Actions : télécharger, partager, archiver
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    FileText, Search, Grid3X3, List,
    Download, Share2, Archive, Clock,
    User, Filter, File, FileSpreadsheet,
    FileImage, FolderOpen, Eye, Lock,
    Globe, ChevronDown, ChevronRight,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// ── Types ───────────────────────────────────────────────────────────────────

type DocType = 'pdf' | 'xlsx' | 'docx' | 'image' | 'other';
type DocStatus = 'publié' | 'brouillon' | 'validé' | 'archivé';
type DocVisibility = 'public' | 'restreint' | 'confidentiel';

interface Document {
    id: string;
    title: string;
    description: string;
    type: DocType;
    category: string;
    status: DocStatus;
    visibility: DocVisibility;
    size: string;
    version: string;
    author: string;
    createdAt: string;
    updatedAt: string;
    downloads: number;
}

// ── Config ──────────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<DocType, { icon: typeof FileText; color: string }> = {
    pdf: { icon: FileText, color: 'text-red-500' },
    xlsx: { icon: FileSpreadsheet, color: 'text-green-500' },
    docx: { icon: File, color: 'text-blue-500' },
    image: { icon: FileImage, color: 'text-purple-500' },
    other: { icon: FolderOpen, color: 'text-gray-500' },
};

const STATUS_COLORS: Record<DocStatus, string> = {
    'publié': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'brouillon': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    'validé': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'archivé': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const VISIBILITY_CONFIG: Record<DocVisibility, { icon: typeof Globe; label: string }> = {
    public: { icon: Globe, label: 'Public' },
    restreint: { icon: Eye, label: 'Restreint' },
    confidentiel: { icon: Lock, label: 'Confidentiel' },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const DOCUMENTS: Document[] = [
    {
        id: 'd1', title: 'Rapport GAR T4 2025 — Consolidé', description: 'Synthèse des résultats de tous les ministères pour le T4 2025',
        type: 'pdf', category: 'Rapports', status: 'publié', visibility: 'restreint',
        size: '4.2 MB', version: '3.1', author: 'Marie OBAME', createdAt: '2025-12-15', updatedAt: '2026-02-08', downloads: 234,
    },
    {
        id: 'd2', title: 'Matrice de suivi PAG 2026', description: 'Tableau de suivi des projets du Plan d\'Accélération de la Transformation',
        type: 'xlsx', category: 'Planification', status: 'validé', visibility: 'restreint',
        size: '1.8 MB', version: '5.0', author: 'Paul ABIAGA', createdAt: '2026-01-05', updatedAt: '2026-02-10', downloads: 156,
    },
    {
        id: 'd3', title: 'Décret n°004/2026 — Organisation MINSANTE', description: 'Projet de décret portant réorganisation du Ministère de la Santé',
        type: 'docx', category: 'Textes Juridiques', status: 'brouillon', visibility: 'confidentiel',
        size: '890 KB', version: '2.3', author: 'Jean NZE', createdAt: '2026-02-01', updatedAt: '2026-02-09', downloads: 12,
    },
    {
        id: 'd4', title: 'Guide utilisateur plateforme SGG v15', description: 'Manuel complet d\'utilisation de la plateforme SGG Digital',
        type: 'pdf', category: 'Documentation', status: 'publié', visibility: 'public',
        size: '12.5 MB', version: '15.0', author: 'Équipe Tech', createdAt: '2026-02-10', updatedAt: '2026-02-10', downloads: 89,
    },
    {
        id: 'd5', title: 'Budget de fonctionnement SGG 2026', description: 'Détail du budget de fonctionnement avec ventilation par poste',
        type: 'xlsx', category: 'Budget', status: 'validé', visibility: 'confidentiel',
        size: '2.1 MB', version: '1.0', author: 'Paul ABIAGA', createdAt: '2026-01-20', updatedAt: '2026-01-25', downloads: 45,
    },
    {
        id: 'd6', title: 'Organigramme officiel SGG 2026', description: 'Organigramme à jour avec la nouvelle organisation',
        type: 'image', category: 'Institutionnel', status: 'publié', visibility: 'public',
        size: '3.4 MB', version: '2.0', author: 'Rose MABIKA', createdAt: '2026-02-05', updatedAt: '2026-02-05', downloads: 310,
    },
    {
        id: 'd7', title: 'Procès-verbal Conseil interministériel', description: 'PV de la réunion du Conseil interministériel du 3 février 2026',
        type: 'pdf', category: 'Comptes Rendus', status: 'publié', visibility: 'restreint',
        size: '1.5 MB', version: '1.0', author: 'Albert NDONG', createdAt: '2026-02-03', updatedAt: '2026-02-04', downloads: 178,
    },
    {
        id: 'd8', title: 'Fiche de poste — Directeur Général ANPI', description: 'Description de poste pour la nomination du DG ANPI',
        type: 'docx', category: 'Nominations', status: 'brouillon', visibility: 'confidentiel',
        size: '450 KB', version: '1.2', author: 'Françoise ELLA', createdAt: '2026-02-07', updatedAt: '2026-02-09', downloads: 5,
    },
    {
        id: 'd9', title: 'Rapport d\'audit sécurité plateforme', description: 'Audit de sécurité de la plateforme SGG Digital',
        type: 'pdf', category: 'Sécurité', status: 'validé', visibility: 'confidentiel',
        size: '2.8 MB', version: '1.0', author: 'Équipe Tech', createdAt: '2026-02-06', updatedAt: '2026-02-08', downloads: 8,
    },
    {
        id: 'd10', title: 'Statistiques de connexion — Janvier 2026', description: 'Données analytiques de fréquentation de la plateforme',
        type: 'xlsx', category: 'Analytics', status: 'publié', visibility: 'restreint',
        size: '980 KB', version: '1.0', author: 'Sylvie MOUSSAVOU', createdAt: '2026-02-01', updatedAt: '2026-02-01', downloads: 67,
    },
];

const CATEGORIES = [...new Set(DOCUMENTS.map(d => d.category))];
const STATUSES: DocStatus[] = ['publié', 'validé', 'brouillon', 'archivé'];

// ── Component ───────────────────────────────────────────────────────────────

export default function DocManagerPage() {
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

    const filtered = useMemo(() => {
        return DOCUMENTS.filter(d => {
            if (catFilter !== 'all' && d.category !== catFilter) return false;
            if (statusFilter !== 'all' && d.status !== statusFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                if (!d.title.toLowerCase().includes(q) && !d.description.toLowerCase().includes(q)) return false;
            }
            return true;
        });
    }, [search, catFilter, statusFilter]);

    const totalSize = DOCUMENTS.reduce((s, d) => {
        const num = parseFloat(d.size);
        return s + (d.size.includes('MB') ? num : num / 1000);
    }, 0);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <FolderOpen className="h-7 w-7 text-indigo-600" />
                        Gestion Documentaire
                    </h1>
                    <p className="text-muted-foreground">
                        {DOCUMENTS.length} documents · {totalSize.toFixed(1)} MB · {DOCUMENTS.reduce((s, d) => s + d.downloads, 0)} téléchargements
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {STATUSES.map(st => {
                        const count = DOCUMENTS.filter(d => d.status === st).length;
                        return (
                            <Card key={st}><CardContent className="pt-3 pb-2 text-center">
                                <p className="text-xl font-bold">{count}</p>
                                <p className="text-[10px] text-muted-foreground capitalize">{st}</p>
                            </CardContent></Card>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="h-9 rounded-md border px-3 text-xs bg-background" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                        <option value="all">Toutes cat.</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select className="h-9 rounded-md border px-3 text-xs bg-background" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="all">Tous statuts</option>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="flex border rounded-md">
                        <Button variant={view === 'grid' ? 'default' : 'ghost'} size="icon" className="h-9 w-9 rounded-r-none" onClick={() => setView('grid')}><Grid3X3 className="h-4 w-4" /></Button>
                        <Button variant={view === 'list' ? 'default' : 'ghost'} size="icon" className="h-9 w-9 rounded-l-none" onClick={() => setView('list')}><List className="h-4 w-4" /></Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Documents */}
                    <div className={`${selectedDoc ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                        {view === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                {filtered.map(doc => {
                                    const typeConf = TYPE_ICONS[doc.type];
                                    const TypeIcon = typeConf.icon;
                                    const VisIcon = VISIBILITY_CONFIG[doc.visibility].icon;
                                    return (
                                        <Card key={doc.id} className={`cursor-pointer hover:shadow-md transition-shadow ${selectedDoc?.id === doc.id ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedDoc(doc)}>
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                        <TypeIcon className={`h-5 w-5 ${typeConf.color}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold truncate">{doc.title}</p>
                                                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{doc.description}</p>
                                                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                                            <Badge className={`text-[9px] h-3.5 ${STATUS_COLORS[doc.status]}`}>{doc.status}</Badge>
                                                            <VisIcon className="h-2.5 w-2.5 text-muted-foreground" />
                                                            <span className="text-[9px] text-muted-foreground">{doc.size}</span>
                                                            <span className="text-[9px] text-muted-foreground">v{doc.version}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="p-0">
                                    {filtered.map(doc => {
                                        const typeConf = TYPE_ICONS[doc.type];
                                        const TypeIcon = typeConf.icon;
                                        return (
                                            <button
                                                key={doc.id}
                                                className={`w-full text-left flex items-center gap-3 p-3 border-b hover:bg-muted/30 transition-colors ${selectedDoc?.id === doc.id ? 'bg-primary/5' : ''}`}
                                                onClick={() => setSelectedDoc(doc)}
                                            >
                                                <TypeIcon className={`h-4 w-4 ${typeConf.color} shrink-0`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold truncate">{doc.title}</p>
                                                    <p className="text-[10px] text-muted-foreground">{doc.category} · {doc.author}</p>
                                                </div>
                                                <Badge className={`text-[9px] h-3.5 ${STATUS_COLORS[doc.status]}`}>{doc.status}</Badge>
                                                <span className="text-[10px] text-muted-foreground hidden sm:block">{doc.size}</span>
                                                <span className="text-[10px] text-muted-foreground hidden md:block">{doc.updatedAt}</span>
                                            </button>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Detail Panel */}
                    {selectedDoc && (
                        <Card className="lg:col-span-1 h-fit">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    {(() => { const t = TYPE_ICONS[selectedDoc.type]; const I = t.icon; return <I className={`h-5 w-5 ${t.color}`} />; })()}
                                    <CardTitle className="text-sm">{selectedDoc.title}</CardTitle>
                                </div>
                                <CardDescription className="text-[10px]">{selectedDoc.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                    <div className="p-2 bg-muted/50 rounded">
                                        <p className="text-muted-foreground">Type</p>
                                        <p className="font-semibold uppercase">{selectedDoc.type}</p>
                                    </div>
                                    <div className="p-2 bg-muted/50 rounded">
                                        <p className="text-muted-foreground">Taille</p>
                                        <p className="font-semibold">{selectedDoc.size}</p>
                                    </div>
                                    <div className="p-2 bg-muted/50 rounded">
                                        <p className="text-muted-foreground">Version</p>
                                        <p className="font-semibold">v{selectedDoc.version}</p>
                                    </div>
                                    <div className="p-2 bg-muted/50 rounded">
                                        <p className="text-muted-foreground">Téléch.</p>
                                        <p className="font-semibold">{selectedDoc.downloads}</p>
                                    </div>
                                    <div className="p-2 bg-muted/50 rounded">
                                        <p className="text-muted-foreground">Auteur</p>
                                        <p className="font-semibold">{selectedDoc.author}</p>
                                    </div>
                                    <div className="p-2 bg-muted/50 rounded">
                                        <p className="text-muted-foreground">Catégorie</p>
                                        <p className="font-semibold">{selectedDoc.category}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge className={`text-[9px] ${STATUS_COLORS[selectedDoc.status]}`}>{selectedDoc.status}</Badge>
                                    <Badge variant="outline" className="text-[9px] gap-1">
                                        {(() => { const v = VISIBILITY_CONFIG[selectedDoc.visibility]; const I = v.icon; return <><I className="h-2.5 w-2.5" />{v.label}</>; })()}
                                    </Badge>
                                </div>

                                <div className="text-[10px] text-muted-foreground space-y-0.5">
                                    <p>Créé le {selectedDoc.createdAt}</p>
                                    <p>Modifié le {selectedDoc.updatedAt}</p>
                                </div>

                                <div className="flex gap-2">
                                    <Button size="sm" className="flex-1 gap-1 text-xs" onClick={() => toast({ title: '📥 Téléchargement lancé' })}>
                                        <Download className="h-3 w-3" /> Télécharger
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => toast({ title: '🔗 Lien copié' })}>
                                        <Share2 className="h-3 w-3" />
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => toast({ title: '📦 Document archivé' })}>
                                        <Archive className="h-3 w-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Aucun document trouvé</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
