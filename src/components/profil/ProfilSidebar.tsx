/**
 * SGG Digital — Sidebar Navigation interne Profil
 */

import { NavLink, useLocation } from 'react-router-dom';
import {
  User, Edit, Shield, Bell, Clock, Activity,
  Key, Settings, Download, HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { icon: User, label: 'Mon Profil', to: '/profil' },
  { icon: Edit, label: 'Éditer', to: '/profil/editer' },
  { icon: Shield, label: 'Sécurité', to: '/profil/securite' },
  { icon: Bell, label: 'Notifications', to: '/profil/notifications' },
  { icon: Clock, label: 'Historique', to: '/profil/historique' },
  { icon: Activity, label: 'Activité', to: '/profil/activite' },
  { icon: Key, label: 'Mes Accès', to: '/profil/acces' },
  { icon: Settings, label: 'Préférences', to: '/profil/preferences' },
  { icon: Download, label: 'Export', to: '/profil/export' },
  { icon: HelpCircle, label: 'Aide', to: '/profil/aide' },
];

export function ProfilSidebar() {
  const location = useLocation();

  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const isActive = item.to === '/profil'
          ? location.pathname === '/profil'
          : location.pathname.startsWith(item.to);
        const Icon = item.icon;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              isActive
                ? 'bg-government-navy text-white font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
