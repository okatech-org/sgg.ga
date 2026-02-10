import { Bell, User, Menu, LogOut, ChevronDown, Home, Shield, Settings } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useDemoUser } from "@/hooks/useDemoUser";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useReportingStore } from "@/stores/reportingStore";
import { useNotificationsCount, useNotifications, useMarkAllNotificationsRead } from "@/hooks/useNeocortex";
import { GlobalSearch } from "./GlobalSearch";
import { useTranslation } from "@/i18n";

interface HeaderProps {
  onMenuToggle?: () => void;
}

const roleLabels: Record<string, string> = {
  admin_sgg: "Administrateur SGG",
  sg_ministere: "SG Ministère",
  sgpr: "SGPR",
  citoyen: "Citoyen",
};

export function Header({ onMenuToggle }: HeaderProps) {
  const navigate = useNavigate();
  const { demoUser, clearDemoUser } = useDemoUser();
  const { user, profile, role, signOut } = useAuth();
  // NEOCORTEX notification system (primary) with reportingStore fallback
  const { data: neoUnreadCount } = useNotificationsCount();
  const { data: neoNotifData } = useNotifications({ limit: 5, nonLues: true });
  const neoMarkAll = useMarkAllNotificationsRead();

  // Fallback: use reportingStore if NEOCORTEX unavailable
  const storeUnreadCount = useReportingStore((s) => s.getUnreadNotificationsCount());
  const storeNotifications = useReportingStore((s) => s.notifications);
  const storeMarkAllRead = useReportingStore((s) => s.markAllNotificationsRead);

  // Resolve: prefer NEOCORTEX data
  const unreadCount = neoUnreadCount ?? storeUnreadCount;
  const recentNotifs = neoNotifData?.notifications?.slice(0, 3) || storeNotifications.filter(n => !n.lue).slice(0, 3);
  const isNeoConnected = neoUnreadCount !== undefined;

  const handleMarkAllRead = () => {
    if (isNeoConnected) {
      neoMarkAll.mutate();
    } else {
      storeMarkAllRead();
    }
  };
  const { t } = useTranslation();

  const handleLogout = async () => {
    if (demoUser) {
      clearDemoUser();
    }
    if (user) {
      await signOut();
    }
    navigate("/");
  };

  const handleSwitchAccount = () => {
    clearDemoUser();
    navigate("/demo");
  };

  // Determine display name and role
  const displayName = demoUser?.title || profile?.full_name || user?.email || t('header.user');
  const displayInstitution = demoUser?.institution || profile?.institution || (role ? roleLabels[role] : "SGG");
  const displayRole = demoUser?.role || (role ? roleLabels[role] : "");

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

          <div data-tutorial="search">
            <GlobalSearch />
          </div>
        </div>

        {/* Right side - Demo Badge, Theme Toggle, Notifications and User */}
        <div className="flex items-center gap-2">
          {/* Demo Mode - Exit Button */}
          {demoUser && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearDemoUser();
                navigate("/");
              }}
              className="hidden sm:flex gap-2 border-government-gold text-government-gold hover:bg-government-gold/10"
            >
              <Home className="h-4 w-4" />
              {t('header.exitDemo')}
            </Button>
          )}

          {/* Demo Mode Badge */}
          {demoUser && (
            <Badge
              variant="outline"
              className="hidden sm:flex border-government-gold text-government-gold gap-1 cursor-pointer hover:bg-government-gold/10"
              onClick={handleSwitchAccount}
            >
              <span className="text-[10px]">{t('header.demo')}</span>
              <ChevronDown className="h-3 w-3" />
            </Badge>
          )}

          {/* Authenticated User Badge */}
          {user && !demoUser && role && (
            <Badge
              variant="outline"
              className="hidden sm:flex border-government-navy text-government-navy gap-1"
            >
              <span className="text-[10px]">{roleLabels[role]?.toUpperCase()}</span>
            </Badge>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" data-tutorial="notifications">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-status-danger">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>{t('header.notifications')}</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t('header.markAllRead')}
                  </button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {recentNotifs.length > 0 ? (
                recentNotifs.map((notif: any) => (
                  <DropdownMenuItem
                    key={notif.id}
                    className="flex flex-col items-start gap-1 py-3 cursor-pointer"
                    onClick={() => navigate('/notifications')}
                  >
                    <span className="font-medium text-sm">{notif.titre || notif.title}</span>
                    <span className="text-xs text-muted-foreground line-clamp-2">{notif.message}</span>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  {t('header.noNotifications')}
                </div>
              )}
              {unreadCount > 3 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-center text-sm text-primary cursor-pointer justify-center"
                    onClick={() => navigate('/notifications')}
                  >
                    Voir toutes les notifications ({unreadCount})
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2" data-tutorial="profile">
                <div className="h-8 w-8 rounded-full bg-government-navy flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium truncate max-w-[150px]">
                    {displayName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {displayInstitution}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="truncate">{displayName}</span>
                  <span className="text-xs font-normal text-muted-foreground">{displayRole}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {demoUser && (
                <>
                  <DropdownMenuItem onClick={handleSwitchAccount}>
                    {t('header.switchAccount')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => navigate("/profil")}>
                <User className="h-4 w-4 mr-2" />
                {t('header.myProfile')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/profil/securite")}>
                <Shield className="h-4 w-4 mr-2" />
                {t('header.security')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/profil/preferences")}>
                <Settings className="h-4 w-4 mr-2" />
                {t('header.preferences')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                {t('header.disconnect')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
