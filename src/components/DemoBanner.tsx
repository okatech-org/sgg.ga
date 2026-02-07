/**
 * SGG Digital — Demo Mode Watermark Banner
 * Visible banner indicating the app is running in demo mode.
 * Prevents confusion with production environment.
 */

import { useDemoUser } from '@/hooks/useDemoUser';
import { AlertTriangle, TestTube2 } from 'lucide-react';

export function DemoBanner() {
  const { demoUser } = useDemoUser();

  if (!demoUser) return null;

  return (
    <>
      {/* Fixed top banner */}
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-amber-950 text-center text-xs font-semibold py-1 px-4 flex items-center justify-center gap-2 shadow-md print:hidden">
        <TestTube2 className="h-3.5 w-3.5" />
        <span>MODE DEMONSTRATION</span>
        <span className="hidden sm:inline">—</span>
        <span className="hidden sm:inline">
          Connecte en tant que : <strong>{demoUser.title}</strong> ({demoUser.role})
        </span>
        <span className="hidden sm:inline">—</span>
        <span className="hidden sm:inline text-amber-800">Les donnees affichees sont fictives</span>
        <AlertTriangle className="h-3.5 w-3.5" />
      </div>

      {/* Diagonal watermark overlay */}
      <div
        className="fixed inset-0 z-[9998] pointer-events-none select-none print:hidden"
        aria-hidden="true"
      >
        <div className="absolute inset-0 overflow-hidden opacity-[0.03]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-6xl font-bold text-amber-900 whitespace-nowrap"
              style={{
                transform: 'rotate(-35deg)',
                top: `${i * 200 - 100}px`,
                left: '-100px',
                width: '200%',
              }}
            >
              DEMO &nbsp;&nbsp; DEMO &nbsp;&nbsp; DEMO &nbsp;&nbsp; DEMO &nbsp;&nbsp; DEMO &nbsp;&nbsp; DEMO &nbsp;&nbsp; DEMO
            </div>
          ))}
        </div>
      </div>

      {/* Spacer to push content below the banner */}
      <div className="h-7 print:hidden" />
    </>
  );
}
