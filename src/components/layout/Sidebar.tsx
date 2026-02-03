import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  BookOpen,
  GraduationCap,
  Settings,
  ChevronLeft,
  BarChart3,
  ClipboardCheck,
  FolderOpen,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  {
    title: "Tableau de Bord",
    items: [
      { name: "Vue d'ensemble", href: "/dashboard", icon: LayoutDashboard },
      { name: "Suivi GAR", href: "/dashboard/gar", icon: BarChart3 },
    ],
  },
  {
    title: "Modules",
    items: [
      { name: "Nominations", href: "/nominations", icon: Users },
      { name: "e-Gop", href: "/egop", icon: FolderOpen },
      { name: "Journal Officiel", href: "/journal-officiel", icon: BookOpen },
    ],
  },
  {
    title: "Gestion",
    items: [
      { name: "Documents", href: "/documents", icon: FileText },
      { name: "Rapports", href: "/rapports", icon: ClipboardCheck },
      { name: "Formation", href: "/formation", icon: GraduationCap },
    ],
  },
  {
    title: "Système",
    items: [
      { name: "Paramètres", href: "/parametres", icon: Settings },
    ],
  },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 bg-sidebar text-sidebar-foreground transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo and Header */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
              <Globe className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm">SGG Digital</span>
              <span className="text-[10px] text-sidebar-foreground/60">République Gabonaise</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent md:hidden"
            onClick={onToggle}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navigation.map((section) => (
            <div key={section.title} className="mb-6">
              <h3 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.href || 
                    (item.href !== "/" && location.pathname.startsWith(item.href));
                  
                  return (
                    <li key={item.name}>
                      <NavLink
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span>{item.name}</span>
                        {item.name === "Nominations" && (
                          <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-status-warning text-[10px] font-bold text-white">
                            5
                          </span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-lg bg-sidebar-accent/50 p-3">
            <p className="text-xs text-sidebar-foreground/70">Version 1.0</p>
            <p className="text-[10px] text-sidebar-foreground/50">© 2026 SGG Gabon</p>
          </div>
        </div>
      </aside>
    </>
  );
}
