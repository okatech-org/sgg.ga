/**
 * SGG Digital — Page Sécurité du Compte
 * Changement de mot de passe, 2FA, gestion des sessions actives.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUserSecurity } from '@/hooks/useUserSecurity';
import { useDemoUser } from '@/hooks/useDemoUser';
import { passwordSchema, type PasswordFormValues } from '@/types/user-profile';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Shield,
  Key,
  Smartphone,
  Monitor,
  Globe,
  Loader2,
  Trash2,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Securite() {
  const {
    isLoading,
    isDemo,
    totpEnabled,
    sessions,
    changePassword,
    toggleTotp,
    revokeSession,
    revokeAllSessions,
  } = useUserSecurity();

  const { demoUser } = useDemoUser();

  const [revokeAllOpen, setRevokeAllOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    const success = await changePassword(data);
    if (success) {
      reset();
    }
  };

  const handleRevokeAll = async () => {
    await revokeAllSessions();
    setRevokeAllOpen(false);
  };

  const getDeviceIcon = (device: string) => {
    const lower = device.toLowerCase();
    if (lower.includes('iphone') || lower.includes('android') || lower.includes('mobile')) {
      return <Smartphone className="h-5 w-5 text-muted-foreground" />;
    }
    return <Monitor className="h-5 w-5 text-muted-foreground" />;
  };

  const formatSessionDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const nonCurrentSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Securite du compte
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerez votre mot de passe, l'authentification a deux facteurs et vos sessions.
          </p>
        </div>
      </div>

      {/* Demo banner */}
      {isDemo && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            <strong>Mode Demo</strong> — Les modifications de securite sont
            simulees et ne seront pas persistees.
          </span>
        </div>
      )}

      {/* Card: Mot de passe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="h-4 w-4" />
            Mot de passe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
            {/* Current password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Entrez votre mot de passe actuel"
                {...register('currentPassword')}
                className={cn(errors.currentPassword && 'border-destructive')}
              />
              {errors.currentPassword && (
                <p className="text-xs text-destructive">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            {/* New password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Minimum 8 caracteres, 1 majuscule, 1 chiffre"
                {...register('newPassword')}
                className={cn(errors.newPassword && 'border-destructive')}
              />
              {errors.newPassword && (
                <p className="text-xs text-destructive">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Retapez le nouveau mot de passe"
                {...register('confirmPassword')}
                className={cn(errors.confirmPassword && 'border-destructive')}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Modification...
                  </>
                ) : (
                  'Modifier le mot de passe'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Card: 2FA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Smartphone className="h-4 w-4" />
            Authentification a deux facteurs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            L'authentification a deux facteurs (2FA) ajoute une couche de
            securite supplementaire a votre compte. Une fois activee, vous
            devrez fournir un code genere par une application d'authentification
            (Google Authenticator, Authy, etc.) lors de chaque connexion.
          </p>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch
                checked={totpEnabled}
                onCheckedChange={toggleTotp}
                disabled={isLoading}
              />
              <span className="text-sm font-medium">
                {totpEnabled ? 'Activee' : 'Desactivee'}
              </span>
            </div>
            <Badge
              variant={totpEnabled ? 'default' : 'secondary'}
              className={cn(
                totpEnabled
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : 'bg-gray-100 text-gray-600 border-gray-200'
              )}
            >
              {totpEnabled ? 'Active' : 'Inactif'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Card: Sessions actives */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" />
            Sessions actives
          </CardTitle>

          {nonCurrentSessions.length > 0 && (
            <Dialog open={revokeAllOpen} onOpenChange={setRevokeAllOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  Revoquer toutes
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Revoquer toutes les sessions ?
                  </DialogTitle>
                  <DialogDescription>
                    Cette action deconnectera toutes les sessions sauf la session
                    actuelle. Les utilisateurs devront se reconnecter sur les
                    appareils concernes.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    variant="outline"
                    onClick={() => setRevokeAllOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleRevokeAll}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Revocation...
                      </>
                    ) : (
                      'Revoquer toutes les sessions'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucune session active.
            </p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    'flex items-center justify-between rounded-lg border p-4',
                    session.isCurrent && 'border-green-200 bg-green-50/50'
                  )}
                >
                  <div className="flex items-center gap-4">
                    {getDeviceIcon(session.device)}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {session.browser}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          — {session.device}
                        </span>
                        {session.isCurrent && (
                          <Badge
                            variant="outline"
                            className="border-green-300 bg-green-100 text-green-700 text-[10px] px-1.5 py-0"
                          >
                            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                            Actuelle
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {session.ipAddress}
                        </span>
                        {session.location && (
                          <span>{session.location}</span>
                        )}
                        <span>{formatSessionDate(session.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {!session.isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => revokeSession(session.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
