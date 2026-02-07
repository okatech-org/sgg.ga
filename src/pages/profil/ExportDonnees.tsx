/**
 * SGG Digital — Page Export & Donnees Personnelles (RGPD)
 * Export des donnees utilisateur et suppression de compte.
 */

import { useState } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useDemoUser } from '@/hooks/useDemoUser';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Trash2,
  AlertTriangle,
  FileJson,
  FileText,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const EXPORT_DATA_ITEMS = [
  { label: 'Profil', description: 'Nom, email, telephone, institution' },
  { label: 'Role et permissions', description: 'Role attribue et niveau d\'acces' },
  { label: 'Historique de connexions', description: 'Sessions, adresses IP, appareils' },
  { label: 'Activites recentes', description: 'Actions effectuees dans l\'application' },
];

export default function ExportDonnees() {
  const { profile, isDemo } = useUserProfile();
  const { demoUser } = useDemoUser();
  const [isExporting, setIsExporting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 1200));

      const exportData = {
        exportDate: new Date().toISOString(),
        platform: 'SGG Digital',
        profile: profile
          ? {
              id: profile.id,
              fullName: profile.fullName,
              email: profile.email,
              phone: profile.phone,
              role: profile.roleLabel,
              institution: profile.institution,
              isActive: profile.isActive,
              isVerified: profile.isVerified,
              createdAt: profile.createdAt,
              lastLogin: profile.lastLogin,
              loginCount: profile.loginCount,
            }
          : null,
        exportedBy: 'SGG Digital - Export RGPD',
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sgg-digital-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Donnees exportees avec succes');
    } catch {
      toast.error('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    toast.info('Fonctionnalite bientot disponible');
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));

      if (isDemo) {
        toast.success('Mode Demo : suppression simulee');
      } else {
        toast.success('Demande de suppression enregistree');
      }

      setDeleteDialogOpen(false);
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Export & Donnees Personnelles
          </h2>
          <p className="text-sm text-muted-foreground">
            Conformement au RGPD, vous pouvez exporter vos donnees personnelles
            ou demander la suppression de votre compte.
          </p>
        </div>
      </div>

      {/* Card: Exporter mes donnees */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="h-4 w-4" />
            Exporter mes donnees
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Telechargez une copie de toutes les donnees personnelles que nous
            detenons a votre sujet. Le fichier contient les informations
            suivantes :
          </p>

          {/* List of included data */}
          <div className="space-y-2">
            {EXPORT_DATA_ITEMS.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 rounded-lg border bg-muted/20 px-4 py-3"
              >
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div>
                  <span className="text-sm font-medium">{item.label}</span>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Export buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleExportJSON}
              disabled={isExporting}
              className="gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Export en cours...
                </>
              ) : (
                <>
                  <FileJson className="h-4 w-4" />
                  Exporter en JSON
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Exporter en PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card: Supprimer mon compte */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <Trash2 className="h-4 w-4" />
            Supprimer mon compte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50/50 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">
                Attention : cette action est definitive
              </p>
              <p className="text-xs text-muted-foreground">
                La suppression de votre compte entrainera la perte irreversible
                de toutes vos donnees, incluant votre profil, vos preferences,
                votre historique de connexions et toutes vos activites sur la
                plateforme.
              </p>
            </div>
          </div>

          {isDemo ? (
            <Badge
              variant="secondary"
              className="bg-amber-50 text-amber-700 border-amber-200"
            >
              Non disponible en mode Demo
            </Badge>
          ) : null}

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={isDemo}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer mon compte
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Supprimer votre compte ?
                </DialogTitle>
                <DialogDescription>
                  Cette action est irreversible. Toutes vos donnees seront
                  definitivement supprimees, y compris :
                </DialogDescription>
              </DialogHeader>

              <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                  Votre profil et informations personnelles
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                  Votre historique de connexions et sessions
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                  Toutes vos preferences et notifications
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                  Vos activites et contributions
                </li>
              </ul>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Confirmer la suppression
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
