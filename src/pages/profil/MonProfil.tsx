/**
 * SGG Digital — Mon Profil (lecture seule)
 */

import { User, Mail, Phone, Building2, Shield, Calendar, Clock, CheckCircle2, AlertCircle, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useDemoUser } from '@/hooks/useDemoUser';
import { ROLE_DISPLAY_LABELS, ROLE_COLORS, CATEGORY_LABELS } from '@/types/user-profile';
import { cn } from '@/lib/utils';
import { AvatarUpload } from '@/components/profil/AvatarUpload';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatFrenchDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function formatRelativeTime(iso?: string): string {
  if (!iso) return '—';
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return "A l'instant";
    if (minutes < 60) return `Il y a ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `Il y a ${days}j`;
    return formatFrenchDate(iso);
  } catch {
    return '—';
  }
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function MonProfil() {
  const { profile, isLoading, uploadAvatar, profileCompleteness } = useUserProfile();
  const { demoUser } = useDemoUser();

  // Empty state
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-muted-foreground">
        <User className="h-12 w-12 mb-4 opacity-40" />
        <p className="text-lg font-medium">Aucun profil disponible</p>
      </div>
    );
  }

  const roleColor = ROLE_COLORS[profile.role] || 'bg-gray-100 text-gray-800 border-gray-200';
  const roleLabel = ROLE_DISPLAY_LABELS[profile.role] || profile.roleLabel;
  const categoryLabel = CATEGORY_LABELS[profile.category] || profile.category;

  const infoItems = [
    { icon: Mail, label: 'Email', value: profile.email },
    { icon: Phone, label: 'Telephone', value: profile.phone || '—' },
    { icon: Building2, label: 'Institution', value: profile.institution },
    { icon: Shield, label: 'Role', value: roleLabel },
    { icon: Calendar, label: 'Inscrit depuis', value: formatFrenchDate(profile.createdAt) },
    { icon: Clock, label: 'Derniere connexion', value: formatRelativeTime(profile.lastLogin) },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-page-enter">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-government-navy/10">
            <User className="h-5 w-5 text-government-navy" />
          </div>
          <h1 className="text-2xl font-bold text-government-navy">Mon Profil</h1>
        </div>

        <div className="flex items-center gap-3 min-w-[200px]">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Completude {profileCompleteness}%
          </span>
          <Progress value={profileCompleteness} className="h-2 flex-1" />
        </div>
      </div>

      {/* ── Top Card: Identity ──────────────────────────────────── */}
      <Card className="mb-6 border-government-navy/10 shadow-gov-sm overflow-hidden">
        <div className="h-28 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-government-navy to-background" />
        <CardContent className="relative -mt-14 flex flex-col items-center text-center pb-6 pt-0">
          <AvatarUpload
            avatarUrl={profile.avatarUrl}
            fullName={profile.fullName}
            onUpload={uploadAvatar}
            disabled
            isLoading={isLoading}
            size="lg"
          />

          <h2 className="mt-4 text-xl font-bold text-foreground">{profile.fullName}</h2>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <Badge variant="outline" className={cn('border px-3 py-1 text-xs font-medium', roleColor)}>
              {roleLabel}
            </Badge>
            <Badge variant="secondary" className="bg-government-navy/5 text-government-navy px-3 py-1 text-xs">
              {categoryLabel}
            </Badge>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">{profile.institution}</p>
        </CardContent>
      </Card>

      {/* ── Info Grid ───────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 mb-6 stagger-children">
        {infoItems.map(({ icon: Icon, label, value }) => (
          <Card key={label} className="border-government-navy/5 card-hover">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-government-gold/10">
                <Icon className="h-5 w-5 text-government-gold" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold text-foreground truncate">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator className="my-6" />

      {/* ── Stats Row ───────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3 stagger-children">
        {/* Login count */}
        <Card className="border-government-navy/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nombre de connexions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-government-navy">{profile.loginCount}</p>
          </CardContent>
        </Card>

        {/* Verified */}
        <Card className="border-government-navy/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compte verifie</CardTitle>
            {profile.isVerified ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            )}
          </CardHeader>
          <CardContent>
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                profile.isVerified
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-amber-200 bg-amber-50 text-amber-700',
              )}
            >
              {profile.isVerified ? 'Verifie' : 'Non verifie'}
            </Badge>
          </CardContent>
        </Card>

        {/* 2FA */}
        <Card className="border-government-navy/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Authentification 2FA</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                profile.totpEnabled
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-gray-50 text-gray-500',
              )}
            >
              {profile.totpEnabled ? 'Active' : 'Desactive'}
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
