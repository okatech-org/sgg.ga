import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { DemoBanner } from "@/components/DemoBanner";
import { Breadcrumbs } from "./Breadcrumbs";
import { InteractiveTutorial } from "@/components/onboarding/InteractiveTutorial";
import { FloatingHelpButton, HelpModeProvider } from "@/components/onboarding/HelpMode";
import { useDemoUser } from "@/hooks/useDemoUser";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { demoUser } = useDemoUser();

  return (
    <HelpModeProvider>
      <div className="min-h-screen bg-background">
        <DemoBanner />
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className="md:ml-64">
          <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <main className="p-4 md:p-6">
            <Breadcrumbs />
            {children}
          </main>
        </div>

        {/* Onboarding: Interactive Tutorial (first visit) */}
        <InteractiveTutorial />

        {/* Floating Help Button (always visible) */}
        <FloatingHelpButton roleId={demoUser?.id} />
      </div>
    </HelpModeProvider>
  );
}
