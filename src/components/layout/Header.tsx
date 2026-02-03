import { Bell, Search, User, Menu, LogOut, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDemoUser } from "@/hooks/useDemoUser";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const navigate = useNavigate();
  const { demoUser, clearDemoUser } = useDemoUser();

  const handleLogout = () => {
    clearDemoUser();
    navigate("/");
  };

  const handleSwitchAccount = () => {
    clearDemoUser();
    navigate("/demo");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left side - Menu toggle and Search */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden md:flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 min-w-[300px]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0"
            />
          </div>
        </div>

        {/* Right side - Demo Badge, Notifications and User */}
        <div className="flex items-center gap-2">
          {/* Demo Mode Badge */}
          {demoUser && (
            <Badge 
              variant="outline" 
              className="hidden sm:flex border-government-gold text-government-gold gap-1 cursor-pointer hover:bg-government-gold/10"
              onClick={handleSwitchAccount}
            >
              <span className="text-[10px]">DÉMO</span>
              <ChevronDown className="h-3 w-3" />
            </Badge>
          )}

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-status-danger">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <span className="font-medium text-sm">Rapport GAR en attente</span>
                <span className="text-xs text-muted-foreground">Ministère de l'Économie - Retard J+5</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <span className="font-medium text-sm">Nouvelle nomination soumise</span>
                <span className="text-xs text-muted-foreground">Directeur Technique - Min. Santé</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <span className="font-medium text-sm">Conseil des Ministres</span>
                <span className="text-xs text-muted-foreground">Rappel : Session du 15 février</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <div className="h-8 w-8 rounded-full bg-government-navy flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {demoUser ? demoUser.title : "Administrateur"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {demoUser ? demoUser.institution : "SGG"}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                {demoUser ? (
                  <div className="flex flex-col">
                    <span>{demoUser.title}</span>
                    <span className="text-xs font-normal text-muted-foreground">{demoUser.role}</span>
                  </div>
                ) : (
                  "Mon Compte"
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {demoUser && (
                <>
                  <DropdownMenuItem onClick={handleSwitchAccount}>
                    Changer de compte démo
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem>Profil</DropdownMenuItem>
              <DropdownMenuItem>Paramètres</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
