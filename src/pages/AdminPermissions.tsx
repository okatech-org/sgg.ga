/**
 * SGG Digital — Page Gestion des Permissions
 *
 * Interface d'administration pour gérer les rôles et permissions
 * de chaque module du système. Permet aux administrateurs de :
 *   - Voir la matrice des permissions par rôle
 *   - Activer/désactiver l'accès d'un rôle à un module
 *   - Visualiser les détails de chaque rôle
 *   - Rechercher et filtrer les rôles
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import {
    Shield, ShieldCheck, ShieldX, Users, Search,
    Check, X, Minus, Lock, Unlock,
    Eye, Edit, Trash2, Download, Save,
    ChevronDown, ChevronRight, Info,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

interface Permission {
    read: boolean;
    write: boolean;
    delete: boolean;
    approve: boolean;
    export: boolean;
}

interface RolePermissions {
    roleId: string;
    roleName: string;
    roleLabel: string;
    description: string;
    userCount: number;
    color: string;
    modules: Record<string, Permission>;
}

interface Module {
    id: string;
    name: string;
    description: string;
    icon: string;
}

// ── Modules and Roles Data ──────────────────────────────────────────────────

const MODULES: Module[] = [
    { id: 'gar', name: 'GAR', description: 'Gestion Axée sur les Résultats', icon: '📊' },
    { id: 'nominations', name: 'Nominations', description: 'Gestion des nominations', icon: '👤' },
    { id: 'legislatif', name: 'Législatif', description: 'Cycle législatif', icon: '📜' },
    { id: 'egop', name: 'e-GOP', description: 'Conseil des Ministres', icon: '🏛️' },
    { id: 'jo', name: 'Journal Officiel', description: 'Publication JO', icon: '📰' },
    { id: 'reporting', name: 'Reporting', description: 'Tableaux de bord & exports', icon: '📈' },
    { id: 'institutions', name: 'Institutions', description: 'Gestion des institutions', icon: '🏢' },
    { id: 'users', name: 'Utilisateurs', description: 'Gestion des comptes', icon: '👥' },
    { id: 'audit', name: 'Audit', description: 'Journal d\'audit', icon: '🔍' },
    { id: 'workflow', name: 'Workflows', description: 'Circuits d\'approbation', icon: '🔄' },
    { id: 'ptm', name: 'PTM', description: 'Suivi Programme Travail', icon: '📋' },
];

const INITIAL_ROLES: RolePermissions[] = [
    {
        roleId: 'admin_sgg',
        roleName: 'admin_sgg',
        roleLabel: 'Administrateur SGG',
        description: 'Accès complet à tous les modules, gestion système',
        userCount: 3,
        color: 'bg-red-100 text-red-800 border-red-200',
        modules: Object.fromEntries(MODULES.map(m => [m.id, { read: true, write: true, delete: true, approve: true, export: true }])),
    },
    {
        roleId: 'directeur_sgg',
        roleName: 'directeur_sgg',
        roleLabel: 'Directeur SGG',
        description: 'Validation et approbation des processus SGG',
        userCount: 5,
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        modules: Object.fromEntries(MODULES.map(m => [m.id, {
            read: true,
            write: ['gar', 'nominations', 'legislatif', 'egop', 'jo', 'reporting', 'workflow', 'ptm'].includes(m.id),
            delete: ['reporting'].includes(m.id),
            approve: ['gar', 'nominations', 'legislatif', 'egop', 'jo', 'workflow'].includes(m.id),
            export: true,
        }])),
    },
    {
        roleId: 'sgpr',
        roleName: 'sgpr',
        roleLabel: 'SGPR',
        description: 'Secrétaire Général de la Présidence de la République',
        userCount: 2,
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        modules: Object.fromEntries(MODULES.map(m => [m.id, {
            read: true,
            write: ['nominations', 'legislatif', 'egop'].includes(m.id),
            delete: false,
            approve: ['nominations', 'legislatif', 'egop', 'workflow'].includes(m.id),
            export: true,
        }])),
    },
    {
        roleId: 'ministre',
        roleName: 'ministre',
        roleLabel: 'Ministre',
        description: 'Membre du gouvernement avec accès ministériel',
        userCount: 18,
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        modules: Object.fromEntries(MODULES.map(m => [m.id, {
            read: ['gar', 'nominations', 'legislatif', 'egop', 'reporting', 'institutions', 'ptm'].includes(m.id),
            write: ['gar', 'nominations', 'legislatif'].includes(m.id),
            delete: false,
            approve: ['gar', 'nominations'].includes(m.id),
            export: ['gar', 'reporting'].includes(m.id),
        }])),
    },
    {
        roleId: 'sg_ministere',
        roleName: 'sg_ministere',
        roleLabel: 'SG Ministère',
        description: 'Secrétaire Général d\'un ministère',
        userCount: 24,
        color: 'bg-teal-100 text-teal-800 border-teal-200',
        modules: Object.fromEntries(MODULES.map(m => [m.id, {
            read: ['gar', 'nominations', 'legislatif', 'egop', 'reporting', 'institutions', 'workflow', 'ptm'].includes(m.id),
            write: ['gar', 'reporting', 'ptm'].includes(m.id),
            delete: false,
            approve: ['gar', 'reporting'].includes(m.id),
            export: ['gar', 'reporting'].includes(m.id),
        }])),
    },
    {
        roleId: 'point_focal',
        roleName: 'point_focal',
        roleLabel: 'Point Focal',
        description: 'Responsable saisie dans un ministère',
        userCount: 48,
        color: 'bg-green-100 text-green-800 border-green-200',
        modules: Object.fromEntries(MODULES.map(m => [m.id, {
            read: ['gar', 'reporting', 'ptm'].includes(m.id),
            write: ['gar', 'ptm'].includes(m.id),
            delete: false,
            approve: false,
            export: ['gar'].includes(m.id),
        }])),
    },
    {
        roleId: 'citoyen',
        roleName: 'citoyen',
        roleLabel: 'Citoyen',
        description: 'Accès public au portail de transparence',
        userCount: 1250,
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        modules: Object.fromEntries(MODULES.map(m => [m.id, {
            read: ['jo', 'institutions'].includes(m.id),
            write: false,
            delete: false,
            approve: false,
            export: false,
        }])),
    },
];

// ── Permission Icons ────────────────────────────────────────────────────────

const PERM_LABELS: Record<keyof Permission, { label: string; icon: typeof Eye }> = {
    read: { label: 'Lecture', icon: Eye },
    write: { label: 'Écriture', icon: Edit },
    delete: { label: 'Suppression', icon: Trash2 },
    approve: { label: 'Approbation', icon: ShieldCheck },
    export: { label: 'Export', icon: Download },
};

// ── Component ───────────────────────────────────────────────────────────────

export default function AdminPermissions() {
    const [roles, setRoles] = useState<RolePermissions[]>(INITIAL_ROLES);
    const [expandedRole, setExpandedRole] = useState<string | null>('admin_sgg');
    const [search, setSearch] = useState('');
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState<'matrix' | 'roles'>('matrix');

    const filteredRoles = useMemo(() => {
        if (!search) return roles;
        const q = search.toLowerCase();
        return roles.filter(r =>
            r.roleLabel.toLowerCase().includes(q) ||
            r.roleName.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q)
        );
    }, [roles, search]);

    const handleTogglePermission = (roleId: string, moduleId: string, permKey: keyof Permission) => {
        setRoles(prev => prev.map(role => {
            if (role.roleId !== roleId) return role;
            // Don't allow editing admin_sgg permissions
            if (roleId === 'admin_sgg') {
                toast({ title: '⛔ Non autorisé', description: 'Les permissions admin_sgg ne peuvent pas être modifiées', variant: 'destructive' });
                return role;
            }
            return {
                ...role,
                modules: {
                    ...role.modules,
                    [moduleId]: {
                        ...role.modules[moduleId],
                        [permKey]: !role.modules[moduleId][permKey],
                    },
                },
            };
        }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 1000));
        setSaving(false);
        setHasChanges(false);
        toast({ title: '✅ Permissions sauvegardées', description: 'Les modifications ont été appliquées.' });
    };

    const getPermCount = (role: RolePermissions): number => {
        return Object.values(role.modules).reduce((sum, perms) => {
            return sum + Object.values(perms).filter(Boolean).length;
        }, 0);
    };

    const totalPermSlots = MODULES.length * 5;

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Shield className="h-7 w-7 text-purple-600" />
                            Gestion des Permissions
                        </h1>
                        <p className="text-muted-foreground">
                            Matrice des rôles et permissions par module · {roles.length} rôles · {MODULES.length} modules
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex rounded-lg border overflow-hidden">
                            <Button
                                variant={viewMode === 'matrix' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('matrix')}
                                className="rounded-none"
                            >
                                Matrice
                            </Button>
                            <Button
                                variant={viewMode === 'roles' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('roles')}
                                className="rounded-none"
                            >
                                Par Rôle
                            </Button>
                        </div>
                        {hasChanges && (
                            <Button onClick={handleSave} disabled={saving} className="gap-2">
                                <Save className={`h-4 w-4 ${saving ? 'animate-pulse' : ''}`} />
                                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un rôle..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* MATRIX VIEW */}
                {viewMode === 'matrix' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Matrice des Permissions</CardTitle>
                            <CardDescription>Cliquez sur une cellule pour activer/désactiver l'accès</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="py-3 px-4 text-left font-medium text-muted-foreground min-w-[180px]">Module</th>
                                            {filteredRoles.map(role => (
                                                <th key={role.roleId} className="py-3 px-2 text-center min-w-[100px]">
                                                    <Badge className={`${role.color} text-[10px] leading-tight`}>
                                                        {role.roleLabel.split(' ').slice(0, 2).join(' ')}
                                                    </Badge>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {MODULES.map(mod => (
                                            <tr key={mod.id} className="border-b hover:bg-muted/30 transition-colors">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <span>{mod.icon}</span>
                                                        <div>
                                                            <p className="font-medium">{mod.name}</p>
                                                            <p className="text-[10px] text-muted-foreground">{mod.description}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {filteredRoles.map(role => {
                                                    const perms = role.modules[mod.id];
                                                    if (!perms) return <td key={role.roleId} className="py-3 px-2"><Minus className="h-4 w-4 text-muted-foreground mx-auto" /></td>;

                                                    const activeCount = Object.values(perms).filter(Boolean).length;
                                                    const isFullAccess = activeCount === 5;
                                                    const isNoAccess = activeCount === 0;

                                                    return (
                                                        <td key={role.roleId} className="py-3 px-2 text-center">
                                                            <button
                                                                onClick={() => handleTogglePermission(role.roleId, mod.id, 'read')}
                                                                className={`inline-flex items-center justify-center w-10 h-10 rounded-lg transition-all hover:scale-110 ${isFullAccess ? 'bg-green-100 dark:bg-green-900/30 text-green-700' :
                                                                        isNoAccess ? 'bg-red-50 dark:bg-red-900/10 text-red-400' :
                                                                            'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700'
                                                                    }`}
                                                                title={`${role.roleLabel} → ${mod.name}: ${activeCount}/5 permissions`}
                                                            >
                                                                {isFullAccess ? <Check className="h-4 w-4" /> :
                                                                    isNoAccess ? <X className="h-4 w-4" /> :
                                                                        <span className="text-xs font-bold">{activeCount}</span>}
                                                            </button>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ROLES VIEW */}
                {viewMode === 'roles' && (
                    <div className="space-y-4">
                        {filteredRoles.map(role => {
                            const isExpanded = expandedRole === role.roleId;
                            const permCount = getPermCount(role);

                            return (
                                <Card key={role.roleId} className={`transition-all ${isExpanded ? 'ring-2 ring-primary/20' : ''}`}>
                                    <CardHeader
                                        className="cursor-pointer hover:bg-muted/30 transition-colors"
                                        onClick={() => setExpandedRole(isExpanded ? null : role.roleId)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                                                <div>
                                                    <CardTitle className="text-base flex items-center gap-2">
                                                        <Badge className={role.color}>{role.roleLabel}</Badge>
                                                        {role.roleId === 'admin_sgg' && <Lock className="h-3.5 w-3.5 text-red-500" />}
                                                    </CardTitle>
                                                    <CardDescription className="mt-1">{role.description}</CardDescription>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="text-center">
                                                    <p className="font-bold">{role.userCount}</p>
                                                    <p className="text-[10px] text-muted-foreground">utilisateurs</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-bold">{permCount}/{totalPermSlots}</p>
                                                    <p className="text-[10px] text-muted-foreground">permissions</p>
                                                </div>
                                                <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all ${permCount / totalPermSlots > 0.7 ? 'bg-green-500' :
                                                                permCount / totalPermSlots > 0.3 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${(permCount / totalPermSlots) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    {isExpanded && (
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {MODULES.map(mod => {
                                                    const perms = role.modules[mod.id];
                                                    if (!perms) return null;

                                                    return (
                                                        <div key={mod.id} className="p-3 rounded-lg border bg-muted/20">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span>{mod.icon}</span>
                                                                <span className="font-medium text-sm">{mod.name}</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {(Object.entries(PERM_LABELS) as [keyof Permission, typeof PERM_LABELS.read][]).map(([key, { label, icon: Icon }]) => {
                                                                    const isActive = perms[key];
                                                                    return (
                                                                        <button
                                                                            key={key}
                                                                            onClick={() => handleTogglePermission(role.roleId, mod.id, key)}
                                                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] transition-all ${isActive
                                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200'
                                                                                    : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 hover:bg-gray-200'
                                                                                }`}
                                                                            title={`${isActive ? 'Désactiver' : 'Activer'} ${label} pour ${mod.name}`}
                                                                        >
                                                                            <Icon className="h-3 w-3" />
                                                                            {label}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Info card */}
                <Card className="border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Hiérarchie des rôles</p>
                                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                    Les permissions sont hiérarchiques : <strong>admin_sgg</strong> hérite de tous les droits.
                                    Les rôles <em>ministre</em> et <em>sg_ministere</em> ont des accès limités aux modules de leur périmètre.
                                    Le rôle <em>citoyen</em> n'accède qu'au Journal Officiel et aux informations institutionnelles publiques.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
