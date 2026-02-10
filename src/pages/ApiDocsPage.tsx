/**
 * SGG Digital — Centre API / Développeur
 *
 * Documentation interactive des endpoints API :
 *   - Catalogue des endpoints par module
 *   - Détail méthode, URL, paramètres, réponse
 *   - Statut santé de chaque API
 *   - Clé API simulée
 *   - Guide rapide d'intégration
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Code2, Search, Copy, CheckCircle2,
    Server, Lock, Zap, Globe,
    FileJson, Shield, Clock, Eye,
    ChevronDown, ChevronRight, BookOpen,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// ── Types ───────────────────────────────────────────────────────────────────

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type ApiStatus = 'operational' | 'degraded' | 'down';

interface ApiEndpoint {
    id: string;
    method: HttpMethod;
    path: string;
    description: string;
    module: string;
    auth: boolean;
    rateLimit: string;
    status: ApiStatus;
    params?: { name: string; type: string; required: boolean; description: string }[];
    responseExample?: string;
}

// ── Config ──────────────────────────────────────────────────────────────────

const METHOD_COLORS: Record<HttpMethod, string> = {
    GET: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    POST: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    PUT: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    PATCH: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

const STATUS_CONFIG: Record<ApiStatus, { label: string; color: string; dot: string }> = {
    operational: { label: 'Opérationnel', color: 'text-green-600', dot: 'bg-green-500' },
    degraded: { label: 'Dégradé', color: 'text-amber-600', dot: 'bg-amber-500' },
    down: { label: 'Hors-ligne', color: 'text-red-600', dot: 'bg-red-500' },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const ENDPOINTS: ApiEndpoint[] = [
    { id: 'e1', method: 'GET', path: '/api/v1/gar/rapports', description: 'Liste tous les rapports GAR avec pagination', module: 'GAR', auth: true, rateLimit: '100/min', status: 'operational', params: [{ name: 'page', type: 'number', required: false, description: 'Numéro de page (défaut: 1)' }, { name: 'ministere_id', type: 'string', required: false, description: 'Filtrer par ministère' }, { name: 'trimestre', type: 'string', required: false, description: 'Ex: T1-2026' }], responseExample: '{\n  "data": [{ "id": "...", "ministere": "MINFI", "score": 92 }],\n  "pagination": { "page": 1, "total": 45 }\n}' },
    { id: 'e2', method: 'POST', path: '/api/v1/gar/rapports', description: 'Soumet un nouveau rapport GAR', module: 'GAR', auth: true, rateLimit: '20/min', status: 'operational', params: [{ name: 'ministere_id', type: 'string', required: true, description: 'ID du ministère' }, { name: 'trimestre', type: 'string', required: true, description: 'Trimestre visé' }, { name: 'data', type: 'object', required: true, description: 'Données du rapport GAR' }] },
    { id: 'e3', method: 'GET', path: '/api/v1/nominations', description: 'Liste les nominations en cours', module: 'Nominations', auth: true, rateLimit: '100/min', status: 'operational', params: [{ name: 'statut', type: 'string', required: false, description: 'en_attente | approuvee | rejetee' }] },
    { id: 'e4', method: 'POST', path: '/api/v1/nominations', description: 'Soumet une nouvelle nomination', module: 'Nominations', auth: true, rateLimit: '10/min', status: 'operational' },
    { id: 'e5', method: 'PUT', path: '/api/v1/nominations/:id/validate', description: 'Valide ou rejette une nomination', module: 'Nominations', auth: true, rateLimit: '30/min', status: 'operational' },
    { id: 'e6', method: 'GET', path: '/api/v1/journal-officiel', description: 'Accède aux publications du Journal Officiel', module: 'Journal Officiel', auth: true, rateLimit: '50/min', status: 'operational', responseExample: '{\n  "publications": [{ "numero": 24, "date": "2026-01-15", "articles": 12 }]\n}' },
    { id: 'e7', method: 'GET', path: '/api/v1/institutions', description: 'Liste des institutions enregistrées', module: 'Institutions', auth: true, rateLimit: '100/min', status: 'operational' },
    { id: 'e8', method: 'GET', path: '/api/v1/ptm/matrices', description: 'Récupère les matrices PTM', module: 'PTM', auth: true, rateLimit: '50/min', status: 'degraded' },
    { id: 'e9', method: 'POST', path: '/api/v1/ptm/saisie', description: 'Saisie de données PTM mensuelle', module: 'PTM', auth: true, rateLimit: '20/min', status: 'degraded' },
    { id: 'e10', method: 'GET', path: '/api/v1/users', description: 'Liste les utilisateurs (admin)', module: 'Admin', auth: true, rateLimit: '30/min', status: 'operational' },
    { id: 'e11', method: 'POST', path: '/api/v1/auth/login', description: 'Authentification et obtention du token JWT', module: 'Auth', auth: false, rateLimit: '5/min', status: 'operational', params: [{ name: 'email', type: 'string', required: true, description: 'Adresse email' }, { name: 'password', type: 'string', required: true, description: 'Mot de passe' }], responseExample: '{\n  "token": "eyJhbGciOiJIUzI1NiIs...",\n  "user": { "id": "...", "role": "admin_sgg" },\n  "expires_in": 3600\n}' },
    { id: 'e12', method: 'DELETE', path: '/api/v1/admin/cache', description: 'Purge le cache serveur', module: 'Admin', auth: true, rateLimit: '2/min', status: 'operational' },
    { id: 'e13', method: 'GET', path: '/api/v1/analytics/dashboard', description: 'Données du tableau de bord analytique', module: 'Analytics', auth: true, rateLimit: '50/min', status: 'operational' },
    { id: 'e14', method: 'PATCH', path: '/api/v1/users/:id/role', description: 'Modifier le rôle d\'un utilisateur', module: 'Admin', auth: true, rateLimit: '10/min', status: 'operational' },
];

const API_KEY = 'sgg_live_k8h3x9m2n7p4q1w6y0z5_2026';

// ── Component ───────────────────────────────────────────────────────────────

export default function ApiDocsPage() {
    const [search, setSearch] = useState('');
    const [moduleFilter, setModuleFilter] = useState<string>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [keyCopied, setKeyCopied] = useState(false);

    const modules = useMemo(() => [...new Set(ENDPOINTS.map(e => e.module))], []);

    const filtered = useMemo(() => {
        return ENDPOINTS.filter(e => {
            if (moduleFilter !== 'all' && e.module !== moduleFilter) return false;
            if (!search) return true;
            const q = search.toLowerCase();
            return e.path.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.module.toLowerCase().includes(q);
        });
    }, [search, moduleFilter]);

    const copyKey = () => {
        navigator.clipboard?.writeText(API_KEY);
        setKeyCopied(true);
        toast({ title: '📋 Clé API copiée' });
        setTimeout(() => setKeyCopied(false), 2000);
    };

    const operational = ENDPOINTS.filter(e => e.status === 'operational').length;
    const degraded = ENDPOINTS.filter(e => e.status === 'degraded').length;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Code2 className="h-7 w-7 text-cyan-600" />
                            Centre API
                        </h1>
                        <p className="text-muted-foreground">
                            {ENDPOINTS.length} endpoints · {operational} opérationnels · {degraded} dégradés
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs gap-1 h-7">
                        <Globe className="h-3 w-3" /> Base URL : https://api.sgg.ga/v1
                    </Badge>
                </div>

                {/* API Key */}
                <Card className="border-2 border-cyan-200 dark:border-cyan-900">
                    <CardContent className="py-3">
                        <div className="flex items-center gap-3 flex-wrap">
                            <Lock className="h-4 w-4 text-cyan-600 shrink-0" />
                            <span className="text-xs font-medium">Votre clé API :</span>
                            <code className="text-xs font-mono bg-muted px-2 py-1 rounded flex-1 min-w-0 truncate">{API_KEY}</code>
                            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={copyKey}>
                                {keyCopied ? <CheckCircle2 className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                                {keyCopied ? 'Copié' : 'Copier'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card>
                        <CardContent className="pt-3 pb-2 text-center">
                            <p className="text-xl font-bold">{ENDPOINTS.length}</p>
                            <p className="text-[10px] text-muted-foreground">Endpoints totaux</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-3 pb-2 text-center">
                            <p className="text-xl font-bold text-green-600">{operational}</p>
                            <p className="text-[10px] text-muted-foreground">Opérationnels</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-3 pb-2 text-center">
                            <p className="text-xl font-bold text-cyan-600">{modules.length}</p>
                            <p className="text-[10px] text-muted-foreground">Modules</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-3 pb-2 text-center">
                            <p className="text-xl font-bold text-amber-600">v1</p>
                            <p className="text-[10px] text-muted-foreground">Version API</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher un endpoint..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        <Button variant={moduleFilter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs" onClick={() => setModuleFilter('all')}>Tous</Button>
                        {modules.map(mod => (
                            <Button key={mod} variant={moduleFilter === mod ? 'default' : 'outline'} size="sm" className="text-xs" onClick={() => setModuleFilter(mod)}>{mod}</Button>
                        ))}
                    </div>
                </div>

                {/* Endpoints List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileJson className="h-4 w-4 text-cyan-600" />
                            Endpoints ({filtered.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {filtered.map(ep => {
                            const isExpanded = expandedId === ep.id;
                            const statusConf = STATUS_CONFIG[ep.status];
                            return (
                                <div key={ep.id} className="border rounded-lg overflow-hidden">
                                    <button
                                        className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors"
                                        onClick={() => setExpandedId(isExpanded ? null : ep.id)}
                                    >
                                        <Badge className={`text-[10px] font-mono px-2 ${METHOD_COLORS[ep.method]}`}>{ep.method}</Badge>
                                        <code className="text-xs font-mono flex-1 min-w-0 truncate">{ep.path}</code>
                                        <div className="hidden sm:flex items-center gap-2 shrink-0">
                                            <div className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                                            {ep.auth && <Lock className="h-3 w-3 text-muted-foreground" />}
                                            <Badge variant="outline" className="text-[9px]">{ep.module}</Badge>
                                        </div>
                                        {isExpanded ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
                                    </button>

                                    {isExpanded && (
                                        <div className="px-4 pb-4 border-t bg-muted/20 space-y-3">
                                            <p className="text-xs text-muted-foreground mt-3">{ep.description}</p>

                                            <div className="flex flex-wrap gap-2 text-[10px]">
                                                <span className="flex items-center gap-1"><Shield className={`h-3 w-3 ${ep.auth ? 'text-green-600' : 'text-gray-400'}`} />{ep.auth ? 'Auth requise' : 'Public'}</span>
                                                <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-amber-500" />Rate limit : {ep.rateLimit}</span>
                                                <span className={`flex items-center gap-1 ${statusConf.color}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} /> {statusConf.label}
                                                </span>
                                            </div>

                                            {ep.params && ep.params.length > 0 && (
                                                <div>
                                                    <p className="text-[10px] font-semibold mb-1 text-muted-foreground">PARAMÈTRES</p>
                                                    <div className="space-y-1">
                                                        {ep.params.map(p => (
                                                            <div key={p.name} className="flex items-start gap-2 text-[10px] bg-muted/30 p-1.5 rounded">
                                                                <code className="font-mono font-semibold shrink-0">{p.name}</code>
                                                                <Badge variant="outline" className="text-[8px] h-3.5">{p.type}</Badge>
                                                                {p.required && <Badge className="text-[8px] h-3.5 bg-red-100 text-red-600 dark:bg-red-900/30">requis</Badge>}
                                                                <span className="text-muted-foreground">{p.description}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {ep.responseExample && (
                                                <div>
                                                    <p className="text-[10px] font-semibold mb-1 text-muted-foreground">RÉPONSE EXEMPLE</p>
                                                    <pre className="text-[10px] font-mono bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">{ep.responseExample}</pre>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Quick Start Guide */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-purple-600" />
                            Guide Rapide
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold">1. Authentification</p>
                            <pre className="text-[10px] font-mono bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">{`curl -X POST https://api.sgg.ga/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "admin@sgg.ga", "password": "***"}'`}</pre>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-semibold">2. Utiliser le token</p>
                            <pre className="text-[10px] font-mono bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">{`curl https://api.sgg.ga/v1/gar/rapports \\
  -H "Authorization: Bearer eyJhbGciOi..." \\
  -H "X-API-Key: ${API_KEY}"`}</pre>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-semibold">3. Gestion des erreurs</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                                <div className="p-2 bg-muted rounded"><code className="font-mono text-green-600">200</code> — Succès</div>
                                <div className="p-2 bg-muted rounded"><code className="font-mono text-amber-600">401</code> — Non authentifié</div>
                                <div className="p-2 bg-muted rounded"><code className="font-mono text-red-600">429</code> — Rate limit</div>
                                <div className="p-2 bg-muted rounded"><code className="font-mono text-red-600">500</code> — Erreur serveur</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
