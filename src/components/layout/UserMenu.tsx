/**
 * SGG Digital — Menu Dropdown Utilisateur (Header)
 */

import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, Shield, LogOut } from 'lucide-react';
import { useDemoUser } from '@/hooks/useDemoUser';
import { Badge } from '@/components/ui/badge';
import { ROLE_DISPLAY_LABELS } from '@/types/user-profile';

export function UserMenu() {
  const navigate = useNavigate();
  const { demoUser, clearDemoUser } = useDemoUser();

  if (!demoUser) return null;

  const initials = demoUser.title
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    clearDemoUser();
    navigate('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full p-1 hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-government-gold">
          <Avatar className="h-8 w-8">
            <AvatarImage src={undefined} alt={demoUser.title} />
            <AvatarFallback className="bg-government-navy text-white text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">{demoUser.title}</p>
            <p className="text-xs text-muted-foreground">{demoUser.email || `${demoUser.id}@sgg.ga`}</p>
            <Badge variant="outline" className="w-fit text-[10px] mt-0.5">
              {ROLE_DISPLAY_LABELS[demoUser.id] || demoUser.role}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profil')}>
          <User className="h-4 w-4 mr-2" />
          Mon Profil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/profil/preferences')}>
          <Settings className="h-4 w-4 mr-2" />
          Préférences
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/profil/securite')}>
          <Shield className="h-4 w-4 mr-2" />
          Sécurité
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
