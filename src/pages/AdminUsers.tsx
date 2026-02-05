import { useState, useEffect } from "react";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Search, Shield, Users, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { UserStats } from "@/components/admin/UserStats";

const GABONESE_MINISTRIES = [
  "Présidence de la République",
  "Primature",
  "Secrétariat Général du Gouvernement",
  "Ministère des Affaires Étrangères",
  "Ministère de la Défense Nationale",
  "Ministère de l'Intérieur et de la Sécurité",
  "Ministère de la Justice",
  "Ministère de l'Économie et des Finances",
  "Ministère du Budget et des Comptes Publics",
  "Ministère de l'Éducation Nationale",
  "Ministère de l'Enseignement Supérieur",
  "Ministère de la Santé",
  "Ministère du Travail et de l'Emploi",
  "Ministère de l'Agriculture",
  "Ministère des Eaux et Forêts",
  "Ministère des Mines et de l'Énergie",
  "Ministère du Pétrole et du Gaz",
  "Ministère des Transports",
  "Ministère des Travaux Publics",
  "Ministère de l'Habitat et de l'Urbanisme",
  "Ministère du Commerce et des PME",
  "Ministère de l'Industrie",
  "Ministère du Tourisme",
  "Ministère de la Culture et des Arts",
  "Ministère des Sports",
  "Ministère de la Jeunesse",
  "Ministère de la Communication",
  "Ministère de la Fonction Publique",
  "Ministère des Affaires Sociales",
  "Ministère de la Promotion de la Femme",
  "Ministère de l'Environnement",
  "Ministère de la Transition Numérique",
  "Ministère de la Planification",
] as const;

const ITEMS_PER_PAGE = 10;

interface UserWithRole {
  user_id: string;
  full_name: string | null;
  institution: string | null;
  role: AppRole;
  created_at: string;
}

const roleLabels: Record<AppRole, string> = {
  admin_sgg: "Admin SGG",
  sg_ministere: "SG Ministère",
  sgpr: "SGPR",
  citoyen: "Citoyen",
};

const roleBadgeColors: Record<AppRole, string> = {
  admin_sgg: "bg-red-100 text-red-800 border-red-200",
  sg_ministere: "bg-blue-100 text-blue-800 border-blue-200",
  sgpr: "bg-purple-100 text-purple-800 border-purple-200",
  citoyen: "bg-gray-100 text-gray-800 border-gray-200",
};

export default function AdminUsers() {
  const { hasRole } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<AppRole | "all">("all");
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [institutionValue, setInstitutionValue] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const isAdmin = hasRole("admin_sgg");

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      // Fetch profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, institution, created_at");

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        return {
          user_id: profile.user_id,
          full_name: profile.full_name,
          institution: profile.institution,
          role: (userRole?.role as AppRole) || "citoyen",
          created_at: profile.created_at,
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: AppRole) => {
    setUpdating(userId);
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, role: newRole } : u))
      );

      toast.success(`Rôle mis à jour: ${roleLabels[newRole]}`);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Erreur lors de la mise à jour du rôle");
    } finally {
      setUpdating(null);
    }
  };

  const updateUserInstitution = async (userId: string, institution: string) => {
    setUpdating(userId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ institution })
        .eq("user_id", userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, institution } : u))
      );

      setDialogOpen(false);
      setEditingUser(null);
      setInstitutionValue("");
      toast.success("Institution mise à jour");
    } catch (error) {
      console.error("Error updating institution:", error);
      toast.error("Erreur lors de la mise à jour de l'institution");
    } finally {
      setUpdating(null);
    }
  };

  const handleOpenInstitutionDialog = (user: UserWithRole) => {
    setEditingUser(user);
    setInstitutionValue(user.institution || "");
    setDialogOpen(true);
  };

  const handleSaveInstitution = () => {
    if (editingUser) {
      updateUserInstitution(editingUser.user_id, institutionValue);
    }
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  const filteredUsers = users.filter(
    (user) =>
      (roleFilter === "all" || user.role === roleFilter) &&
      (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.institution?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Accès non autorisé</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Gestion des Utilisateurs
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez les rôles et permissions des utilisateurs de la plateforme
            </p>
          </div>
        </div>

        {/* Dashboard Stats Overview */}
        <div className="mb-6">
          <UserStats users={users} />
        </div>

        <div className="flex items-center justify-between">
          <div className="mb-2">
            <h2 className="text-xl font-semibold tracking-tight">Annuaire des Comptes</h2>
            <p className="text-sm text-muted-foreground">Liste détaillée et gestion des accès</p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2 bg-white">
            <Users className="h-4 w-4 mr-2" />
            {users.length} utilisateurs
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des Utilisateurs</CardTitle>
            <CardDescription>
              Modifiez les rôles pour ajuster les permissions d'accès
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou institution..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={roleFilter}
                onValueChange={(value) => setRoleFilter(value as AppRole | "all")}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="admin_sgg">Admin SGG</SelectItem>
                  <SelectItem value="sg_ministere">SG Ministère</SelectItem>
                  <SelectItem value="sgpr">SGPR</SelectItem>
                  <SelectItem value="citoyen">Citoyen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Institution</TableHead>
                      <TableHead>Rôle actuel</TableHead>
                      <TableHead>Modifier le rôle</TableHead>
                      <TableHead>Inscrit le</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell className="font-medium">
                          {user.full_name || "—"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2 text-left"
                            onClick={() => handleOpenInstitutionDialog(user)}
                          >
                            <Building2 className="h-4 w-4" />
                            {user.institution || "Assigner..."}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Badge className={roleBadgeColors[user.role]}>
                            {roleLabels[user.role]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value) =>
                              updateUserRole(user.user_id, value as AppRole)
                            }
                            disabled={updating === user.user_id}
                          >
                            <SelectTrigger className="w-40">
                              {updating === user.user_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin_sgg">Admin SGG</SelectItem>
                              <SelectItem value="sg_ministere">SG Ministère</SelectItem>
                              <SelectItem value="sgpr">SGPR</SelectItem>
                              <SelectItem value="citoyen">Citoyen</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString("fr-FR")}
                        </TableCell>
                      </TableRow>
                    ))}
                    {paginatedUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Aucun utilisateur trouvé
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Affichage {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} sur {filteredUsers.length} utilisateurs
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Précédent
                      </Button>
                      <span className="text-sm text-muted-foreground px-2">
                        Page {currentPage} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Suivant
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Institution Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier l'institution</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Institution</Label>
                <Select
                  value={institutionValue}
                  onValueChange={setInstitutionValue}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une institution..." />
                  </SelectTrigger>
                  <SelectContent>
                    {GABONESE_MINISTRIES.map((ministry) => (
                      <SelectItem key={ministry} value={ministry}>
                        {ministry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleSaveInstitution}
                disabled={updating === editingUser?.user_id}
                className="w-full"
              >
                {updating === editingUser?.user_id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
