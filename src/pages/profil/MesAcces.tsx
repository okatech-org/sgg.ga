/**
 * SGG Digital — Mes Acces & Permissions
 * Vue en grille des modules avec niveaux de permissions basee sur le role utilisateur.
 */

import { useDemoUser } from '@/hooks/useDemoUser';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Key,
  BarChart3,
  FileText,
  Users,
  BookOpen,
  Building2,
  Scale,
  Briefcase,
  Shield,
  Settings,
  Download,
  Monitor,
  Lock,
  Unlock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModulePermission, PermissionLevel } from '@/types/user-profile';
import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

// ─── Module Definitions ─────────────────────────────────────────────────────

interface ModuleDefinition {
  key: string;
  label: string;
  icon: LucideIcon;
  route: string;
  accessKey: string;
}

const MODULE_DEFINITIONS: ModuleDefinition[] = [
  { key: 'dashboard', label: 'Dashboard', icon: Monitor, route: '/dashboard', accessKey: 'dashboard' },
  { key: 'matriceReporting', label: 'Matrice Reporting', icon: BarChart3, route: '/matrice-reporting', accessKey: 'matriceReporting' },
  { key: 'ptmptg', label: 'PTM / PTG', icon: FileText, route: '/ptm-matrice', accessKey: 'ptmptg' },
  { key: 'nominations', label: 'Nominations', icon: Users, route: '/nominations/app', accessKey: 'nominations' },
  { key: 'cycleLegislatif', label: 'Cycle Legislatif', icon: BookOpen, route: '/cycle-legislatif/app', accessKey: 'cycleLegislatif' },
  { key: 'egop', label: 'e-GOP', icon: Briefcase, route: '/egop/app', accessKey: 'egop' },
  { key: 'journalOfficiel', label: 'Journal Officiel', icon: Scale, route: '/journal-officiel/app', accessKey: 'journalOfficiel' },
  { key: 'documents', label: 'Documents', icon: FileText, route: '/documents/app', accessKey: 'documents' },
  { key: 'institutions', label: 'Institutions', icon: Building2, route: '/institutions/app', accessKey: 'institutions' },
  { key: 'adminUsers', label: 'Administration', icon: Settings, route: '/admin/users', accessKey: 'adminUsers' },
];

// ─── Permission Helpers ─────────────────────────────────────────────────────

const PERMISSION_CONFIG: Record<PermissionLevel, { label: string; color: string; description: string }> = {
  W: {
    label: 'Ecriture',
    color: 'bg-green-100 text-green-700 border-green-200',
    description: 'Lecture, modification et creation',
  },
  V: {
    label: 'Validation',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    description: 'Lecture et validation',
  },
  R: {
    label: 'Lecture',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    description: 'Consultation uniquement',
  },
  none: {
    label: 'Non autorise',
    color: 'bg-gray-100 text-gray-500 border-gray-200',
    description: 'Acces non autorise',
  },
};

/** Derive permission level from role and module accessibility */
function getModulePermissions(
  role: string,
  moduleAccess: Record<string, boolean>,
): ModulePermission[] {
  const adminRoles = ['sgg-admin'];
  const validatorRoles = ['sgg-directeur', 'sgpr', 'ministre', 'premier-ministre', 'president', 'vice-president'];

  return MODULE_DEFINITIONS.map((mod) => {
    const accessible = moduleAccess[mod.accessKey] ?? false;

    let permission: PermissionLevel = 'none';
    if (accessible) {
      if (adminRoles.includes(role)) {
        permission = 'W';
      } else if (validatorRoles.includes(role)) {
        permission = 'V';
      } else {
        permission = 'R';
      }
    }

    const config = PERMISSION_CONFIG[permission];

    return {
      moduleKey: mod.key,
      moduleLabel: mod.label,
      moduleIcon: mod.key,
      permission,
      description: config.description,
      route: mod.route,
    };
  });
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function MesAcces() {
  const { demoUser, getModuleAccess } = useDemoUser();
  const navigate = useNavigate();

  const role = demoUser?.id ?? 'sgg-admin';
  const moduleAccess = getModuleAccess();
  const permissions = getModulePermissions(role, moduleAccess);

  const accessibleCount = permissions.filter((p) => p.permission !== 'none').length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-government-navy">
          <Key className="h-6 w-6 text-government-gold" />
          Mes Acces & Permissions
        </h1>
        <p className="text-muted-foreground mt-1">
          Vue d'ensemble de vos droits d'acces aux modules de la plateforme
        </p>
      </div>

      {/* Legend */}
      <Card className="mb-6 border-government-navy/10">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground mr-1">Legende :</span>
            {(Object.entries(PERMISSION_CONFIG) as [PermissionLevel, typeof PERMISSION_CONFIG[PermissionLevel]][]).map(
              ([level, config]) => (
                <Badge
                  key={level}
                  variant="outline"
                  className={cn('text-xs px-2.5 py-1 border', config.color)}
                >
                  {level !== 'none' ? level : '—'} = {config.label}
                </Badge>
              ),
            )}
          </div>
          <Separator className="my-3" />
          <p className="text-xs text-muted-foreground">
            {accessibleCount} module{accessibleCount > 1 ? 's' : ''} accessible{accessibleCount > 1 ? 's' : ''} sur {permissions.length} — Role :{' '}
            <span className="font-medium text-foreground">{demoUser?.title ?? 'Administrateur SGG'}</span>
          </p>
        </CardContent>
      </Card>

      {/* Module Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {permissions.map((perm) => {
          const modDef = MODULE_DEFINITIONS.find((m) => m.key === perm.moduleKey);
          const Icon = modDef?.icon ?? FileText;
          const config = PERMISSION_CONFIG[perm.permission];
          const isAccessible = perm.permission !== 'none';

          return (
            <Card
              key={perm.moduleKey}
              className={cn(
                'border transition-shadow',
                isAccessible
                  ? 'border-government-navy/10 hover:shadow-md cursor-pointer'
                  : 'border-gray-200 opacity-60',
              )}
              onClick={() => {
                if (isAccessible && perm.route) {
                  navigate(perm.route);
                }
              }}
            >
              <CardContent className="py-5">
                <div className="flex items-start justify-between gap-3">
                  {/* Icon + Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                        isAccessible
                          ? 'bg-government-gold/10'
                          : 'bg-gray-100',
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5',
                          isAccessible ? 'text-government-gold' : 'text-gray-400',
                        )}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {perm.moduleLabel}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {config.description}
                      </p>
                    </div>
                  </div>

                  {/* Permission badge */}
                  <Badge
                    variant="outline"
                    className={cn('text-xs px-2 py-0.5 shrink-0 border', config.color)}
                  >
                    {perm.permission !== 'none' ? perm.permission : '—'}
                  </Badge>
                </div>

                <Separator className="my-3" />

                {/* Footer */}
                <div className="flex items-center justify-between">
                  {isAccessible ? (
                    <>
                      <div className="flex items-center gap-1.5 text-xs text-green-600">
                        <Unlock className="h-3.5 w-3.5" />
                        <span>Autorise</span>
                      </div>
                      <button
                        type="button"
                        className="text-xs font-medium text-government-navy hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (perm.route) navigate(perm.route);
                        }}
                      >
                        Ouvrir
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Lock className="h-3.5 w-3.5" />
                      <span>Non autorise</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
