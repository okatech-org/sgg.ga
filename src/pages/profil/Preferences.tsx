/**
 * SGG Digital — Page Preferences Utilisateur
 * Theme, langue, fuseau horaire, format de date, densite des tableaux.
 */

import { useUserSettings } from '@/hooks/useUserSettings';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Sun, Moon, Globe, Calendar, Table2, Loader2, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

type ThemeOption = 'light' | 'dark' | 'system';
type DensityOption = 'compact' | 'normal' | 'comfortable';

const themeOptions: { value: ThemeOption; label: string; icon: typeof Sun; description: string }[] = [
  { value: 'light', label: 'Clair', icon: Sun, description: 'Interface claire' },
  { value: 'dark', label: 'Sombre', icon: Moon, description: 'Interface sombre' },
  { value: 'system', label: 'Systeme', icon: Monitor, description: 'Suit le systeme' },
];

const densityOptions: { value: DensityOption; label: string; lineCount: number; lineHeight: string }[] = [
  { value: 'compact', label: 'Compact', lineCount: 5, lineHeight: 'h-0.5' },
  { value: 'normal', label: 'Normal', lineCount: 4, lineHeight: 'h-1' },
  { value: 'comfortable', label: 'Confortable', lineCount: 3, lineHeight: 'h-1.5' },
];

export default function Preferences() {
  const { preferences, isLoading, updatePreferences } = useUserSettings();
  const { setTheme } = useTheme();

  const handleThemeChange = (value: ThemeOption) => {
    updatePreferences({ theme: value });

    if (value === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(systemPrefersDark ? 'dark' : 'light');
    } else {
      setTheme(value);
    }
  };

  const handleDensityChange = (value: DensityOption) => {
    updatePreferences({ tableDensity: value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Preferences
          </h2>
          <p className="text-sm text-muted-foreground">
            Personnalisez l'apparence et le comportement de l'application.
          </p>
        </div>
      </div>

      {/* Card: Apparence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sun className="h-4 w-4" />
            Apparence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label className="text-sm text-muted-foreground">
            Choisissez le theme de l'interface
          </Label>

          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = preferences.theme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleThemeChange(option.value)}
                  disabled={isLoading}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:bg-muted/50',
                    isActive
                      ? 'border-[hsl(var(--government-navy))] bg-muted/30'
                      : 'border-transparent bg-muted/10'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">{option.label}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Card: Langue & Region */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" />
            Langue & Region
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">Langue</Label>
            <Select
              value={preferences.language}
              onValueChange={(value: 'fr' | 'en') =>
                updatePreferences({ language: value })
              }
              disabled={isLoading}
            >
              <SelectTrigger id="language" className="w-full sm:w-64">
                <SelectValue placeholder="Choisir une langue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Francais</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone">Fuseau horaire</Label>
            <Select
              value={preferences.timezone}
              onValueChange={(value: string) =>
                updatePreferences({ timezone: value })
              }
              disabled={isLoading}
            >
              <SelectTrigger id="timezone" className="w-full sm:w-64">
                <SelectValue placeholder="Choisir un fuseau horaire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Africa/Libreville">
                  Africa/Libreville (UTC+1)
                </SelectItem>
                <SelectItem value="Africa/Lagos">
                  Africa/Lagos (UTC+1)
                </SelectItem>
                <SelectItem value="Europe/Paris">
                  Europe/Paris (UTC+1/+2)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Date Format */}
          <div className="space-y-2">
            <Label htmlFor="dateFormat">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Format de date
              </span>
            </Label>
            <Select
              value={preferences.dateFormat}
              onValueChange={(value: 'DD/MM/YYYY' | 'YYYY-MM-DD') =>
                updatePreferences({ dateFormat: value })
              }
              disabled={isLoading}
            >
              <SelectTrigger id="dateFormat" className="w-full sm:w-64">
                <SelectValue placeholder="Choisir un format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">JJ/MM/AAAA</SelectItem>
                <SelectItem value="YYYY-MM-DD">AAAA-MM-JJ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Card: Affichage des tableaux */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Table2 className="h-4 w-4" />
            Affichage des tableaux
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label className="text-sm text-muted-foreground">
            Densite des lignes dans les tableaux de donnees
          </Label>

          <div className="grid grid-cols-3 gap-3">
            {densityOptions.map((option) => {
              const isActive = preferences.tableDensity === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleDensityChange(option.value)}
                  disabled={isLoading}
                  className={cn(
                    'flex flex-col items-center gap-3 rounded-lg border-2 p-4 transition-all hover:bg-muted/50',
                    isActive
                      ? 'border-[hsl(var(--government-navy))] bg-muted/30'
                      : 'border-transparent bg-muted/10'
                  )}
                >
                  {/* Visual representation */}
                  <div className="flex w-full flex-col gap-1.5">
                    {Array.from({ length: option.lineCount }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-full rounded-full bg-muted-foreground/30',
                          option.lineHeight
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Enregistrement...
        </div>
      )}

      {/* Footer note */}
      <p className="text-xs text-muted-foreground text-center">
        Les modifications sont enregistrees automatiquement.
      </p>
    </div>
  );
}
