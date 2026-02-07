/**
 * SGG Digital — Editer mon Profil (formulaire)
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Edit, Save, Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useDemoUser } from '@/hooks/useDemoUser';
import { profileSchema } from '@/types/user-profile';
import type { ProfileFormValues } from '@/types/user-profile';
import { AvatarUpload } from '@/components/profil/AvatarUpload';

export default function EditerProfil() {
  const { profile, isLoading, updateProfile, uploadAvatar } = useUserProfile();
  const { demoUser } = useDemoUser();
  const isDemo = !!demoUser;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      phone: '',
    },
  });

  // Sync form with profile data
  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName,
        phone: profile.phone || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    await updateProfile(data);
  };

  const canEditAvatar = !isDemo && profile?.role !== 'citoyen';

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl animate-fade-in">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-government-navy/10">
            <Edit className="h-5 w-5 text-government-navy" />
          </div>
          <h1 className="text-2xl font-bold text-government-navy">Modifier mon profil</h1>
        </div>

        <Link to="/profil">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour au profil
          </Button>
        </Link>
      </div>

      {/* ── Demo Banner ─────────────────────────────────────────── */}
      {isDemo && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Mode Demo :</strong> les modifications ne seront pas enregistrees.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Avatar Section ──────────────────────────────────────── */}
        <Card className="border-government-navy/10 shadow-gov-sm">
          <CardHeader>
            <CardTitle className="text-base">Photo de profil</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <AvatarUpload
              avatarUrl={profile?.avatarUrl}
              fullName={profile?.fullName || 'U'}
              onUpload={uploadAvatar}
              disabled={!canEditAvatar}
              isLoading={isLoading}
              size="lg"
            />
          </CardContent>
        </Card>

        {/* ── Form Fields ─────────────────────────────────────────── */}
        <Card className="border-government-navy/10 shadow-gov-sm">
          <CardHeader>
            <CardTitle className="text-base">Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Nom complet */}
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Nom complet <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="Prenom et Nom"
                {...register('fullName')}
                className={errors.fullName ? 'border-destructive' : ''}
              />
              {errors.fullName && (
                <p className="text-xs text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            {/* Telephone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telephone</Label>
              <Input
                id="phone"
                placeholder="+241XXXXXXXX"
                {...register('phone')}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <Separator />

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile?.email || ''}
                disabled
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">L'adresse email ne peut pas etre modifiee.</p>
            </div>

            {/* Role (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={profile?.roleLabel || ''}
                disabled
                className="bg-muted/50"
              />
            </div>

            {/* Institution (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                value={profile?.institution || ''}
                disabled
                className="bg-muted/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Submit ──────────────────────────────────────────────── */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || isLoading || !isDirty}
            className="gap-2 bg-government-navy hover:bg-government-navy/90 text-white min-w-[180px]"
          >
            {isSubmitting || isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
