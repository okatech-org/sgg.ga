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
import { toast } from "sonner";
import { Loader2, Search, Shield, Users } from "lucide-react";

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

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.institution?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <Badge variant="outline" className="text-lg px-4 py-2">
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
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou institution..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
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
                  {filteredUsers.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-medium">
                        {user.full_name || "—"}
                      </TableCell>
                      <TableCell>{user.institution || "—"}</TableCell>
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
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Aucun utilisateur trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
