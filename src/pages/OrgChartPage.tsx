/**
 * SGG Digital — Organigramme Institutionnel
 *
 * Visualisation hiérarchique de la structure gouvernementale :
 *   - Présidence → SGG → Ministères → Directions → Services
 *   - Vue arbre avec expand/collapse
 *   - Détails par nœud (responsable, effectif, contact)
 *   - Recherche rapide
 */

import { useState, useMemo, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Network, ChevronDown, ChevronRight, User,
    Building2, Users, Phone, Mail,
    Search, Expand, Shrink, X,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

interface OrgNode {
    id: string;
    name: string;
    title: string;
    head: string;
    headTitle: string;
    email?: string;
    phone?: string;
    staff: number;
    children?: OrgNode[];
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const ORG_TREE: OrgNode = {
    id: 'pdr', name: 'Présidence de la République', title: 'Chef de l\'État', head: 'S.E. le Président', headTitle: 'Président de la République', email: 'presidence@presidence.ga', staff: 120, children: [
        {
            id: 'sgpr', name: 'Secrétariat Général de la Présidence', title: 'SGPR', head: 'Paul ABIAGA', headTitle: 'Secrétaire Général', email: 'sgpr@presidence.ga', phone: '+241 01 72 xx xx', staff: 45, children: [
                { id: 'cab-pdr', name: 'Cabinet du Président', title: 'Cabinet', head: 'Marc NDONG', headTitle: 'Directeur de Cabinet', staff: 25 },
                { id: 'proto', name: 'Protocole d\'État', title: 'Protocole', head: 'Claire OBAME', headTitle: 'Chef du Protocole', staff: 18 },
            ]
        },
        {
            id: 'sgg', name: 'Secrétariat Général du Gouvernement', title: 'SGG', head: 'Albert NDONG', headTitle: 'Secrétaire Général', email: 'sg@sgg.ga', phone: '+241 01 74 xx xx', staff: 85, children: [
                {
                    id: 'daj', name: 'Direction des Affaires Juridiques', title: 'DAJ', head: 'Jean NZE', headTitle: 'Directeur', email: 'daj@sgg.ga', staff: 15, children: [
                        { id: 'daj-leg', name: 'Service Législatif', title: 'Législatif', head: 'Anne MBOUMBA', headTitle: 'Chef de Service', staff: 8 },
                        { id: 'daj-reg', name: 'Service Réglementaire', title: 'Réglementaire', head: 'Pierre ELLA', headTitle: 'Chef de Service', staff: 7 },
                    ]
                },
                {
                    id: 'dgme', name: 'Direction de la Modernisation de l\'État', title: 'DGME', head: 'Marie OBAME', headTitle: 'Directrice', email: 'dgme@sgg.ga', staff: 22, children: [
                        { id: 'dgme-num', name: 'Service Transformation Numérique', title: 'Numérique', head: 'Rose MABIKA', headTitle: 'Chef de Service', staff: 12 },
                        { id: 'dgme-qual', name: 'Service Qualité & Performance', title: 'Qualité', head: 'Sylvie MOUSSAVOU', headTitle: 'Chef de Service', staff: 10 },
                    ]
                },
                { id: 'dcrp', name: 'Direction de la Communication', title: 'DCRP', head: 'Françoise ELLA', headTitle: 'Directrice', email: 'com@sgg.ga', staff: 12 },
                { id: 'daf', name: 'Direction Admin. et Financière', title: 'DAF', head: 'Patrick NGUEMA', headTitle: 'Directeur', staff: 18 },
                { id: 'jo', name: 'Imprimerie du Journal Officiel', title: 'JO', head: 'Robert ONDO', headTitle: 'Directeur', email: 'jo@sgg.ga', staff: 10 },
            ]
        },
        {
            id: 'pm', name: 'Primature', title: 'Premier Ministre', head: 'S.E. le Premier Ministre', headTitle: 'Premier Ministre', staff: 65, children: [
                { id: 'cab-pm', name: 'Cabinet du Premier Ministre', title: 'Cabinet PM', head: 'Gaston BITEGHE', headTitle: 'Directeur de Cabinet', staff: 30 },
                { id: 'sgpm', name: 'Secrétariat Général Primature', title: 'SG Primature', head: 'Louis MOUBAMBA', headTitle: 'Secrétaire Général', staff: 20 },
            ]
        },
    ],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function getAllNodeIds(node: OrgNode): string[] {
    const ids = [node.id];
    node.children?.forEach(c => ids.push(...getAllNodeIds(c)));
    return ids;
}

function searchNodes(node: OrgNode, query: string): string[] {
    const q = query.toLowerCase();
    const matches: string[] = [];
    if (node.name.toLowerCase().includes(q) || node.head.toLowerCase().includes(q) || node.title.toLowerCase().includes(q)) {
        matches.push(node.id);
    }
    node.children?.forEach(c => matches.push(...searchNodes(c, q)));
    return matches;
}

function getParentIds(node: OrgNode, targetId: string, path: string[] = []): string[] | null {
    if (node.id === targetId) return path;
    if (!node.children) return null;
    for (const child of node.children) {
        const result = getParentIds(child, targetId, [...path, node.id]);
        if (result) return result;
    }
    return null;
}

function countDescendants(node: OrgNode): number {
    if (!node.children) return 0;
    return node.children.reduce((sum, c) => sum + 1 + countDescendants(c), 0);
}

function totalStaff(node: OrgNode): number {
    return node.staff + (node.children?.reduce((sum, c) => sum + totalStaff(c), 0) ?? 0);
}

// ── Tree Node Component ─────────────────────────────────────────────────────

function OrgTreeNode({ node, expanded, onToggle, onSelect, selectedId, depth = 0, highlights }: {
    node: OrgNode; expanded: Set<string>; onToggle: (id: string) => void; onSelect: (node: OrgNode) => void;
    selectedId: string | null; depth?: number; highlights: Set<string>;
}) {
    const isExpanded = expanded.has(node.id);
    const hasChildren = !!node.children?.length;
    const isSelected = selectedId === node.id;
    const isHighlighted = highlights.has(node.id);

    return (
        <div>
            <div
                className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-all hover:bg-muted/50
          ${isSelected ? 'bg-primary/10 border border-primary/30' : ''}
          ${isHighlighted && !isSelected ? 'bg-amber-50 dark:bg-amber-950/20' : ''}
        `}
                style={{ paddingLeft: `${depth * 20 + 8}px` }}
                onClick={() => onSelect(node)}
            >
                {hasChildren ? (
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
                        className="shrink-0 p-0.5 rounded hover:bg-muted"
                    >
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                ) : (
                    <span className="w-4" />
                )}

                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0
          ${depth === 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        depth === 1 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            depth === 2 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                >
                    {node.title.slice(0, 3)}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{node.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{node.head} — {node.headTitle}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <Badge variant="outline" className="text-[9px] h-4">
                        <Users className="h-2 w-2 mr-0.5" />{node.staff}
                    </Badge>
                    {hasChildren && (
                        <Badge variant="secondary" className="text-[9px] h-4">{node.children!.length}</Badge>
                    )}
                </div>
            </div>

            {isExpanded && node.children?.map(child => (
                <OrgTreeNode
                    key={child.id}
                    node={child}
                    expanded={expanded}
                    onToggle={onToggle}
                    onSelect={onSelect}
                    selectedId={selectedId}
                    depth={depth + 1}
                    highlights={highlights}
                />
            ))}
        </div>
    );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function OrgChartPage() {
    const allIds = useMemo(() => getAllNodeIds(ORG_TREE), []);
    const [expanded, setExpanded] = useState<Set<string>>(new Set(['pdr', 'sgg']));
    const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);
    const [search, setSearch] = useState('');

    const highlights = useMemo(() => {
        if (!search.trim()) return new Set<string>();
        const matches = searchNodes(ORG_TREE, search);
        // Also expand parents of matches
        const parentsToExpand = new Set<string>();
        matches.forEach(id => {
            const parents = getParentIds(ORG_TREE, id) || [];
            parents.forEach(p => parentsToExpand.add(p));
        });
        return new Set([...matches]);
    }, [search]);

    // Auto-expand when searching
    useMemo(() => {
        if (!search.trim()) return;
        const matches = searchNodes(ORG_TREE, search);
        const toExpand = new Set(expanded);
        matches.forEach(id => {
            const parents = getParentIds(ORG_TREE, id) || [];
            parents.forEach(p => toExpand.add(p));
        });
        if (toExpand.size !== expanded.size) setExpanded(toExpand);
    }, [search]);

    const toggleNode = useCallback((id: string) => {
        setExpanded(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }, []);

    const expandAll = () => setExpanded(new Set(allIds));
    const collapseAll = () => setExpanded(new Set());

    const totalNodes = allIds.length;
    const staff = totalStaff(ORG_TREE);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Network className="h-7 w-7 text-indigo-600" />
                            Organigramme Institutionnel
                        </h1>
                        <p className="text-muted-foreground">
                            {totalNodes} entités · {staff} agents
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={expandAll}>
                            <Expand className="h-3 w-3" /> Tout ouvrir
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={collapseAll}>
                            <Shrink className="h-3 w-3" /> Tout fermer
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-red-600">1</p>
                        <p className="text-[10px] text-muted-foreground">Présidence</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-blue-600">{ORG_TREE.children?.length || 0}</p>
                        <p className="text-[10px] text-muted-foreground">Structures principales</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-green-600">{totalNodes}</p>
                        <p className="text-[10px] text-muted-foreground">Entités totales</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-3 pb-2 text-center">
                        <p className="text-xl font-bold text-indigo-600">{staff}</p>
                        <p className="text-[10px] text-muted-foreground">Effectif total</p>
                    </CardContent></Card>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher une entité, un responsable..."
                        className="pl-9"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearch('')}>
                            <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                    )}
                </div>
                {search && highlights.size > 0 && (
                    <p className="text-[11px] text-muted-foreground">{highlights.size} résultat(s) trouvé(s)</p>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Tree */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-indigo-600" />
                                Hiérarchie
                            </CardTitle>
                            <CardDescription>Cliquez sur une entité pour voir ses détails</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <OrgTreeNode
                                node={ORG_TREE}
                                expanded={expanded}
                                onToggle={toggleNode}
                                onSelect={setSelectedNode}
                                selectedId={selectedNode?.id ?? null}
                                highlights={highlights}
                            />
                        </CardContent>
                    </Card>

                    {/* Detail Panel */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <User className="h-4 w-4 text-indigo-600" />
                                Détails
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedNode ? (
                                <div className="space-y-4">
                                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
                                            {selectedNode.title.slice(0, 2)}
                                        </div>
                                        <p className="font-bold text-sm">{selectedNode.name}</p>
                                        <p className="text-xs text-muted-foreground">{selectedNode.title}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs font-semibold">{selectedNode.head}</p>
                                                <p className="text-[10px] text-muted-foreground">{selectedNode.headTitle}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs font-semibold">{selectedNode.staff} agents</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {selectedNode.children ? `+ ${totalStaff(selectedNode) - selectedNode.staff} (sous-entités)` : 'Effectif direct'}
                                                </p>
                                            </div>
                                        </div>
                                        {selectedNode.email && (
                                            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                                <p className="text-xs">{selectedNode.email}</p>
                                            </div>
                                        )}
                                        {selectedNode.phone && (
                                            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                                <p className="text-xs">{selectedNode.phone}</p>
                                            </div>
                                        )}
                                        {selectedNode.children && (
                                            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                                                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs font-semibold">{selectedNode.children.length} sous-entités</p>
                                                    <p className="text-[10px] text-muted-foreground">{countDescendants(selectedNode)} au total</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {selectedNode.children && (
                                        <div>
                                            <p className="text-[10px] font-semibold text-muted-foreground mb-1">RATTACHEMENTS</p>
                                            <div className="space-y-1">
                                                {selectedNode.children.map(c => (
                                                    <button
                                                        key={c.id}
                                                        className="w-full text-left flex items-center gap-2 p-1.5 rounded hover:bg-muted text-[10px] transition-colors"
                                                        onClick={() => setSelectedNode(c)}
                                                    >
                                                        <Building2 className="h-2.5 w-2.5 text-muted-foreground" />
                                                        <span className="font-medium">{c.title}</span>
                                                        <span className="text-muted-foreground truncate">— {c.head}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Network className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                    <p className="text-xs">Sélectionnez une entité pour afficher ses détails</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
