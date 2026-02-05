
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, ShieldAlert, Activity } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

// Define locally to avoid circular deps or complex refactors
type AppRole = "admin_sgg" | "sg_ministere" | "sgpr" | "citoyen";

interface UserWithRole {
    user_id: string;
    full_name: string | null;
    institution: string | null;
    role: AppRole;
    created_at: string;
}

interface UserStatsProps {
    users: UserWithRole[];
}

const COLORS = {
    admin_sgg: "#ef4444", // Red-500
    sg_ministere: "#3b82f6", // Blue-500
    sgpr: "#a855f7", // Purple-500
    citoyen: "#9ca3af", // Gray-400
};

const ROLE_LABELS: Record<AppRole, string> = {
    admin_sgg: "Admin SGG",
    sg_ministere: "SG Ministère",
    sgpr: "SGPR",
    citoyen: "Citoyen",
};

export const UserStats = ({ users }: UserStatsProps) => {
    // Compute Stats
    const totalUsers = users.length;

    // Fake "active" logic for demo visual (since we don't have last_login in the interface passed currently, 
    // but looking at Profil.tsx it seems we might track it? For now assume arbitrary or all active for visual)
    // Or better, calculate "New this month"
    const now = new Date();
    const newThisMonth = users.filter(u => {
        const d = new Date(u.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const rolesCount = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
    }, {} as Record<AppRole, number>);

    const pieData = Object.entries(rolesCount).map(([role, count]) => ({
        name: ROLE_LABELS[role as AppRole],
        value: count,
        color: COLORS[role as AppRole] || "#cccccc",
    }));

    // Gabon Flag Colors for Cards
    const GABON_GREEN = "#009E60";
    const GABON_YELLOW = "#FCD116";
    const GABON_BLUE = "#3A75C4";

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8 animate-fade-in">
            {/* Total Users - Blue Theme (Recettes Style) */}
            <Card className="border-t-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderTopColor: GABON_BLUE }}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium text-muted-foreground">Total Utilisateurs</p>
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-700" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 mt-2">
                        <span className="text-3xl font-bold text-slate-800">{totalUsers}</span>
                        <div className="flex items-center text-xs text-muted-foreground gap-2">
                            <span className="text-green-600 font-medium">100%</span>
                            <span>Inscrits sur la plateforme</span>
                        </div>
                        {/* Progress Bar Visual */}
                        <div className="w-full bg-blue-100 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div className="h-full bg-[#3A75C4]" style={{ width: "100%" }}></div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Nouveaux - Green Theme (Investissement Style) */}
            <Card className="border-t-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderTopColor: GABON_GREEN }}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium text-muted-foreground">Nouveaux (Ce mois)</p>
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <Activity className="h-4 w-4 text-green-700" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 mt-2">
                        <span className="text-3xl font-bold text-slate-800">+{newThisMonth}</span>
                        <div className="flex items-center text-xs text-muted-foreground gap-2">
                            <span className="text-green-600 font-medium">Croissance</span>
                            <span>Par rapport au mois dernier</span>
                        </div>
                        <div className="w-full bg-green-100 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div className="h-full bg-[#009E60]" style={{ width: `${Math.min((newThisMonth / Math.max(totalUsers, 1)) * 100 * 5, 100)}%` }}></div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Admins - Yellow Theme */}
            <Card className="border-t-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderTopColor: GABON_YELLOW }}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium text-muted-foreground">Administrateurs</p>
                        <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                            <ShieldAlert className="h-4 w-4 text-yellow-700" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 mt-2">
                        <span className="text-3xl font-bold text-slate-800">{rolesCount['admin_sgg'] || 0}</span>
                        <div className="flex items-center text-xs text-muted-foreground gap-2">
                            <span className="text-yellow-600 font-medium">Super-Admins</span>
                            <span>Gestionnaires système</span>
                        </div>
                        <div className="w-full bg-yellow-100 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div className="h-full bg-[#FCD116]" style={{ width: `${((rolesCount['admin_sgg'] || 0) / Math.max(totalUsers, 1)) * 100}%` }}></div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Distribution Chart - White/Clean */}
            <Card className="shadow-sm hover:shadow-md transition-shadow md:col-span-1 border-l-4" style={{ borderLeftColor: "#64748b" }}>
                <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Structure des Rôles</CardTitle>
                </CardHeader>
                <CardContent className="p-0 h-[120px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={45}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontSize: '12px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-xs font-bold text-slate-500">{users.length}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
