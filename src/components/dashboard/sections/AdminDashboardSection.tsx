/**
 * SGG Digital - Section Dashboard Administratif
 * Pour: Administrateur SGG, Directeur SGG, DGJO
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  FileText,
  Activity,
  Shield,
  ArrowRight,
  Settings,
  BookOpen,
  Upload,
  Archive,
  Clock,
  CheckCircle2,
  Server,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { administratifData, statutLabels, statutColors } from "@/data/demoData";
import { GARProgressChart } from "@/components/dashboard/GARProgressChart";
import { MinistryReportingTable } from "@/components/dashboard/MinistryReportingTable";

interface AdminDashboardSectionProps {
  roleId?: string;
}

export function AdminDashboardSection({ roleId }: AdminDashboardSectionProps) {
  const isDGJO = roleId === "dgjo";
  const isAdmin = roleId === "sgg-admin";
  const isDirecteur = roleId === "sgg-directeur";

  if (isDGJO) {
    return <DGJOView />;
  }

  return <SGGAdminView isAdmin={isAdmin} isDirecteur={isDirecteur} />;
}

// Vue SGG Admin/Directeur
function SGGAdminView({ isAdmin, isDirecteur }: { isAdmin: boolean; isDirecteur: boolean }) {
  const { statsSysteme, utilisateursRecents } = administratifData;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Utilisateurs Actifs"
          value={String(statsSysteme.utilisateursActifs)}
          subtitle="Comptes activés"
          icon={Users}
          status="success"
        />
        <StatCard
          title="Sessions Aujourd'hui"
          value={String(statsSysteme.sessionsJour)}
          subtitle="Connexions"
          icon={Activity}
          status="info"
        />
        <StatCard
          title="Documents Traités"
          value={String(statsSysteme.documentsTraites)}
          subtitle="Ce mois"
          icon={FileText}
          status="success"
        />
        <StatCard
          title="Alertes Sécurité"
          value={String(statsSysteme.alertesSecurite)}
          subtitle="Dernières 24h"
          icon={Shield}
          status={statsSysteme.alertesSecurite > 0 ? "danger" : "success"}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* GAR Progress - visible pour tous les admins */}
          <GARProgressChart />

          {/* Reporting ministères */}
          <MinistryReportingTable />

          {/* Utilisateurs récents - Admin seulement */}
          {isAdmin && (
            <Card className="shadow-gov">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-government-navy" />
                  Activité Utilisateurs Récente
                </CardTitle>
                <Button variant="outline" size="sm">
                  Gérer les utilisateurs
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Dernier Accès</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {utilisateursRecents.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.nom}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {user.role.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.dernierAcces}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Statut système */}
          <Card className="shadow-gov">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Server className="h-5 w-5 text-government-green" />
                Statut Système
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-status-success animate-pulse" />
                    <span className="text-sm">API Backend</span>
                  </div>
                  <Badge variant="outline" className="bg-status-success/10 text-status-success">
                    Opérationnel
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-status-success animate-pulse" />
                    <span className="text-sm">Base de données</span>
                  </div>
                  <Badge variant="outline" className="bg-status-success/10 text-status-success">
                    Opérationnel
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-status-success animate-pulse" />
                    <span className="text-sm">Cache Redis</span>
                  </div>
                  <Badge variant="outline" className="bg-status-success/10 text-status-success">
                    Opérationnel
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-status-success animate-pulse" />
                    <span className="text-sm">Stockage Cloud</span>
                  </div>
                  <Badge variant="outline" className="bg-status-success/10 text-status-success">
                    Opérationnel
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions administratives */}
          <Card className="shadow-gov">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Administration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {isAdmin && (
                  <>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Gestion utilisateurs
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Configuration système
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Database className="h-4 w-4 mr-2" />
                      Sauvegarde données
                    </Button>
                  </>
                )}
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Rapports d'activité
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  Logs système
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Vue DGJO (Direction Journal Officiel)
function DGJOView() {
  const { publicationsJO, editionsJO } = administratifData;

  const aPublier = publicationsJO.filter(p => p.statut === "a_publier").length;
  const publies = publicationsJO.filter(p => p.statut === "publie").length;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Textes à Publier"
          value={String(aPublier)}
          subtitle="En attente"
          icon={Upload}
          status="warning"
        />
        <StatCard
          title="Publiés ce Mois"
          value={String(publies)}
          subtitle="Textes officiels"
          icon={CheckCircle2}
          status="success"
        />
        <StatCard
          title="Édition en Cours"
          value="JO n°16"
          subtitle="2026"
          icon={BookOpen}
          status="info"
        />
        <StatCard
          title="Archives"
          value="2,450"
          subtitle="Textes consolidés"
          icon={Archive}
          status="success"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Queue de publication */}
          <Card className="shadow-gov">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-government-gold" />
                Queue de Publication
              </CardTitle>
              <Badge variant="outline" className="bg-status-warning/10 text-status-warning border-status-warning/20">
                {aPublier} en attente
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {publicationsJO.map((pub) => (
                  <div
                    key={pub.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {pub.type}
                        </Badge>
                        <h4 className="font-medium truncate">{pub.titre}</h4>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>Signé le {new Date(pub.dateSignature).toLocaleDateString("fr-FR")}</span>
                        {pub.datePublication && (
                          <span className="text-status-success">
                            Publié le {new Date(pub.datePublication).toLocaleDateString("fr-FR")}
                          </span>
                        )}
                        {pub.numeroJO && (
                          <span>{pub.numeroJO}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn(statutColors[pub.statut])}>
                        {statutLabels[pub.statut]}
                      </Badge>
                      {pub.statut === "a_publier" && (
                        <Button size="sm" variant="outline">
                          Publier
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Éditions JO */}
          <Card className="shadow-gov">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-government-navy" />
                Éditions du Journal Officiel
              </CardTitle>
              <Button variant="outline" size="sm">
                Nouvelle édition
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Textes</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editionsJO.map((edition, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{edition.numero}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(edition.date).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell>{edition.textes} textes</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            edition.statut === "publie"
                              ? "bg-status-success/10 text-status-success border-status-success/20"
                              : "bg-status-warning/10 text-status-warning border-status-warning/20"
                          )}
                        >
                          {edition.statut === "publie" ? "Publié" : "En préparation"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          {edition.statut === "publie" ? "Voir" : "Éditer"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Actions DGJO */}
          <Card className="shadow-gov">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Actions Publication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Ajouter un texte
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Créer une édition
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Archive className="h-4 w-4 mr-2" />
                  Consolider les textes
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Programmer publication
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques DGJO */}
          <Card className="shadow-gov">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Statistiques 2026</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Lois publiées</span>
                  <span className="font-bold">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Décrets publiés</span>
                  <span className="font-bold">156</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Arrêtés publiés</span>
                  <span className="font-bold">342</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Éditions JO</span>
                  <span className="font-bold">16</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total textes</span>
                    <span className="font-bold text-government-navy">522</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
