import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  User,
  FileText,
  BookOpen,
  GraduationCap,
  Settings,
  ChevronLeft,
  BarChart3,
  ClipboardCheck,
  ClipboardList,
  FolderOpen,
  Globe,
  LucideIcon,
  Scale,
  Building2,
  Calendar,
  Mail,
  Table2,
  FileEdit,
  CheckCircle2,
  ShieldCheck,
  Download,
  FileSpreadsheet,
  Layers,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDemoUser } from "@/hooks/useDemoUser";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  moduleKey: string;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: "Tableau de Bord",
    items: [
      { name: "Vue d'ensemble", href: "/dashboard", icon: LayoutDashboard, moduleKey: "dashboard" },
      { name: "Suivi GAR", href: "/gar/app", icon: BarChart3, moduleKey: "gar" },
    ],
  },
  {
    title: "Matrice Reporting",
    items: [
      { name: "Matrice GAR/PAG", href: "/matrice-reporting", icon: Table2, moduleKey: "matriceReporting" },
      { name: "Saisie Mensuelle", href: "/matrice-reporting/saisie", icon: FileEdit, moduleKey: "matriceReporting" },
      { name: "Validation SGG", href: "/matrice-reporting/validation", icon: CheckCircle2, moduleKey: "matriceReporting" },
      { name: "Validation SGPR", href: "/matrice-reporting/validation-sgpr", icon: ShieldCheck, moduleKey: "matriceReporting" },
      { name: "Suivi Remplissage", href: "/matrice-reporting/suivi", icon: ClipboardList, moduleKey: "matriceReporting" },
      { name: "Exports", href: "/matrice-reporting/exports", icon: Download, moduleKey: "matriceReporting" },
    ],
  },
  {
    title: "Programmation",
    items: [
      { name: "Matrice PTM", href: "/ptm/matrice", icon: FileSpreadsheet, moduleKey: "ptmptg" },
      { name: "Saisie PTM", href: "/ptm/saisie", icon: FileEdit, moduleKey: "ptmptg" },
      { name: "Consolidation PTM", href: "/ptm/consolidation", icon: Layers, moduleKey: "ptmptg" },
      { name: "Validation SGG", href: "/ptm/validation", icon: CheckCircle2, moduleKey: "ptmptg" },
      { name: "Suivi Programmation", href: "/ptm/suivi", icon: ClipboardList, moduleKey: "ptmptg" },
    ],
  },
  {
    title: "Processus Normatif",
    items: [
      { name: "Cycle Législatif", href: "/cycle-legislatif/app", icon: Scale, moduleKey: "cycleLegislatif" },
      { name: "Nominations", href: "/nominations/app", icon: Users, moduleKey: "nominations", badge: 5 },
    ],
  },
  {
    title: "Coordination",
    items: [
      { name: "e-Gop", href: "/egop/app", icon: FolderOpen, moduleKey: "egop" },
      { name: "Institutions", href: "/institutions/app", icon: Building2, moduleKey: "institutions" },
    ],
  },
  {
    title: "Publications",
    items: [
      { name: "Journal Officiel", href: "/journal-officiel/app", icon: BookOpen, moduleKey: "journalOfficiel" },
      { name: "Documents", href: "/documents/app", icon: FileText, moduleKey: "documents" },
      { name: "Rapports", href: "/rapports/app", icon: ClipboardCheck, moduleKey: "rapports" },
    ],
  },
  {
    title: "Mon Compte",
    items: [
      { name: "Mon Profil", href: "/profil", icon: User, moduleKey: "dashboard" },
    ],
  },
  {
    title: "Système",
    items: [
      { name: "Formation", href: "/formation", icon: GraduationCap, moduleKey: "formation" },
      { name: "Paramètres", href: "/parametres", icon: Settings, moduleKey: "parametres" },
    ],
  },
  {
    title: "Administration",
    items: [
      { name: "Gestion Utilisateurs", href: "/admin/users", icon: Users, moduleKey: "adminUsers" },
    ],
  },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();
  const { demoUser, getModuleAccess } = useDemoUser();
  const moduleAccess = getModuleAccess();

  // Filter navigation based on user access
  const filteredNavigation = navigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        const key = item.moduleKey as keyof typeof moduleAccess;
        return moduleAccess[key] !== false;
      }),
    }))
    .filter((section) => section.items.length > 0);

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
          "fixed left-0 z-50 w-64 flex flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 md:translate-x-0",
          demoUser ? "top-7 h-[calc(100vh-1.75rem)]" : "top-0 h-screen",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo and Header */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <div className="flex items-center gap-3">
            <img src="/emblem_gabon.png" alt="Emblème du Gabon" className="h-10 w-10 object-contain" />
            <div className="flex flex-col">
              <span className="text-[8px] uppercase font-semibold tracking-wider text-sidebar-foreground/60 leading-tight">Présidence de la République</span>
              <span className="font-serif font-black text-[10px] uppercase leading-none tracking-normal text-sidebar-foreground">Secrétariat Général</span>
              <span className="font-serif font-black text-[9px] uppercase leading-none tracking-[0.1em] text-sidebar-foreground">du Gouvernement</span>
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

        {/* Demo User Badge */}
        {demoUser && (
          <div className="px-3 py-2 border-b border-sidebar-border">
            <div className="rounded-lg bg-government-gold/20 px-3 py-2">
              <p className="text-[10px] font-semibold text-government-gold uppercase tracking-wider">
                Mode Démo
              </p>
              <p className="text-xs text-sidebar-foreground/80 truncate">
                {demoUser.role}
              </p>
            </div>
          </div>
        )}

        {/* Navigation — scrollable zone */}
        <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 sidebar-scroll">
          {filteredNavigation.map((section) => (
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
                        {item.badge && (
                          <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-status-warning text-[10px] font-bold text-white">
                            {item.badge}
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

        {/* Footer — fixed at bottom */}
        <div className="flex-shrink-0 border-t border-sidebar-border p-4">
          <div className="rounded-lg bg-sidebar-accent/50 p-3">
            <p className="text-xs text-sidebar-foreground/70">Version 1.0</p>
            <p className="text-[10px] text-sidebar-foreground/50">© 2026 SGG Gabon</p>
          </div>
        </div>
      </aside>
    </>
  );
}
