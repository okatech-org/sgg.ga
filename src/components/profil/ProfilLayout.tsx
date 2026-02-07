/**
 * SGG Digital — Layout Espace Utilisateur
 * Sidebar navigation interne + contenu (Outlet)
 */

import { Outlet } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { ProfilSidebar } from './ProfilSidebar';

export function ProfilLayout() {
  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar interne */}
        <div className="lg:w-56 flex-shrink-0">
          <Card>
            <CardContent className="p-3">
              <ProfilSidebar />
            </CardContent>
          </Card>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </DashboardLayout>
  );
}
