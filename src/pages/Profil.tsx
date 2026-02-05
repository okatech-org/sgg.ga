
import {
    User,
    Mail,
    Building,
    Shield,
    Clock,
    Settings,
    Bell,
    Lock,
    FileCheck,
    FileText,
    Activity,
    LogOut,
    PenTool
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDemoUser } from "@/hooks/useDemoUser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Profil() {
    const navigate = useNavigate();
    const { user, profile, role, signOut } = useAuth();
    const { demoUser, clearDemoUser } = useDemoUser();

    // Unified user data
    const displayName = demoUser?.title || profile?.full_name || "Utilisateur";
    const displayEmail = demoUser?.email || user?.email || "user@sgg.ga";
    const displayRole = demoUser?.role || role || "Invité";
    const displayInstitution = demoUser?.institution || profile?.institution || "SGG";
    const initials = displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const handleLogout = async () => {
        if (demoUser) {
            clearDemoUser();
            navigate("/");
        } else {
            await signOut();
            navigate("/auth");
        }
    };

    // Custom activity feeds based on role
    const feeds = {
        "Admin Système": [
            { action: "Mise à jour système", target: "Déploiement v2.4.0", time: "Il y a 30 min", icon: Settings, color: "text-blue-500", bg: "bg-blue-500/10" },
            { action: "Nouvel utilisateur", target: "Création compte SG Ministère", time: "Il y a 2h", icon: User, color: "text-green-500", bg: "bg-green-500/10" },
            { action: "Sécurité", target: "Audit des logs système", time: "Hier, 18:00", icon: Shield, color: "text-purple-500", bg: "bg-purple-500/10" },
            { action: "Connexion", target: "Accès Admin", time: "Hier, 08:00", icon: LogOut, color: "text-gray-500", bg: "bg-gray-500/10" },
        ],
        "Publication": [
            { action: "Publication JO", target: "Journal Officiel n°1542", time: "Il y a 1h", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
            { action: "Consolidation", target: "Loi n°12/2026", time: "Il y a 3h", icon: FileCheck, color: "text-green-500", bg: "bg-green-500/10" },
            { action: "Archivage", target: "Textes Janvier 2026", time: "Hier, 16:30", icon: Building, color: "text-orange-500", bg: "bg-orange-500/10" },
            { action: "Connexion", target: "Accès Publication", time: "Hier, 09:15", icon: LogOut, color: "text-gray-500", bg: "bg-gray-500/10" },
        ],
        "Direction": [
            { action: "Validation dossier", target: "Nomination DG Petrolem Gabon", time: "Il y a 2h", icon: FileCheck, color: "text-green-500", bg: "bg-green-500/10" },
            { action: "Note de service", target: "Réorganisation DSI", time: "Il y a 4h", icon: PenTool, color: "text-blue-500", bg: "bg-blue-500/10" },
            { action: "Consultation", target: "Rapport GAR Trimestriel", time: "Hier, 14:30", icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10" },
            { action: "Connexion", target: "Accès Direction", time: "Hier, 08:00", icon: LogOut, color: "text-gray-500", bg: "bg-gray-500/10" },
        ]
    };

    const defaultFeed = [
        { action: "Consultation", target: "Journal Officiel - Janvier 2026", time: "Hier, 14:30", icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10" },
        { action: "Connexion", target: "Accès depuis portail", time: "Hier, 08:00", icon: LogOut, color: "text-gray-500", bg: "bg-gray-500/10" },
    ];

    const activityFeed = demoUser?.role && feeds[demoUser.role as keyof typeof feeds]
        ? feeds[demoUser.role as keyof typeof feeds]
        : defaultFeed;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-government-navy">Profil Utilisateur</h1>
                    <p className="text-muted-foreground">Gérez vos informations personnelles et préférences</p>
                </div>
                <Button variant="outline" className="gap-2" onClick={() => navigate(-1)}>
                    Retour
                </Button>
            </div>

            <div className="grid gap-8 md:grid-cols-[300px_1fr]">
                {/* Sidebar Card */}
                <div className="space-y-6">
                    <Card className="overflow-hidden border-government-navy/10 shadow-gov-sm">
                        <div className="h-32 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-government-navy to-background"></div>
                        <CardContent className="-mt-12 relative flex flex-col items-center text-center pt-0">
                            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                <AvatarFallback className="bg-government-gold text-government-navy text-2xl font-bold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="mt-4 space-y-1">
                                <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
                                <Badge variant="secondary" className="px-3 py-1 bg-government-navy/5 text-government-navy">
                                    {displayRole}
                                </Badge>
                            </div>

                            <div className="w-full mt-6 space-y-4">
                                <div className="flex items-center gap-3 text-sm text-muted-foreground p-3 rounded-lg bg-muted/50">
                                    <Mail className="h-4 w-4 text-government-gold" />
                                    <span className="truncate">{displayEmail}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground p-3 rounded-lg bg-muted/50">
                                    <Building className="h-4 w-4 text-government-gold" />
                                    <span className="truncate">{displayInstitution}</span>
                                </div>
                            </div>

                            <Button
                                variant="destructive"
                                className="w-full mt-6 gap-2"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4" />
                                Déconnexion
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Statistiques Rapides</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Dossiers traités</span>
                                <span className="font-bold">142</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Validations</span>
                                <span className="font-bold">89</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Temps moyen</span>
                                <span className="font-bold">1.2j</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="space-y-6">
                    <Tabs defaultValue="apercu" className="w-full">
                        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
                            <TabsTrigger
                                value="apercu"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-government-gold data-[state=active]:bg-transparent px-4 py-3"
                            >
                                Vue d'ensemble
                            </TabsTrigger>
                            <TabsTrigger
                                value="activite"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-government-gold data-[state=active]:bg-transparent px-4 py-3"
                            >
                                Activité Récente
                            </TabsTrigger>
                            <TabsTrigger
                                value="parametres"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-government-gold data-[state=active]:bg-transparent px-4 py-3"
                            >
                                Paramètres
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="apercu" className="space-y-6 mt-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Taux d'approbation</CardTitle>
                                        <Activity className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">94%</div>
                                        <p className="text-xs text-muted-foreground">+2.5% par rapport au mois dernier</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Dossiers en attente</CardTitle>
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">12</div>
                                        <p className="text-xs text-muted-foreground">4 urgents nécessitant attention</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Informations Professionnelles</CardTitle>
                                    <CardDescription>Détails associés à votre compte SGG Digital</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Département</Label>
                                            <Input value="Direction des Systèmes d'Information" disabled />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Supérieur Hiérarchique</Label>
                                            <Input value="Secrétaire Général du Gouvernement" disabled />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Dernière connexion</Label>
                                            <Input value="Aujourd'hui, 10:24" disabled />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Niveau d'accréditation</Label>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge className="bg-government-gold text-government-navy">Niveau 5</Badge>
                                                <span className="text-xs text-muted-foreground">Accès Confidentiel Défense</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="activite" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Journal d'activité</CardTitle>
                                    <CardDescription>Vos actions récentes sur la plateforme</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-8">
                                        {activityFeed.map((item, index) => (
                                            <div key={index} className="flex items-start">
                                                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.bg} sm:mr-4 mr-3`}>
                                                    <item.icon className={`h-5 w-5 ${item.color}`} />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium leading-none">{item.action}</p>
                                                    <p className="text-sm text-muted-foreground">{item.target}</p>
                                                    <p className="text-xs text-muted-foreground">{item.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="parametres" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Préférences de notification</CardTitle>
                                    <CardDescription>Gérez comment vous souhaitez être informé.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between space-x-2">
                                        <Label htmlFor="notifications-email" className="flex flex-col space-y-1">
                                            <span>Notifications par email</span>
                                            <span className="font-normal text-xs text-muted-foreground">Recevoir un résumé quotidien</span>
                                        </Label>
                                        <Switch id="notifications-email" defaultChecked />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between space-x-2">
                                        <Label htmlFor="notifications-browser" className="flex flex-col space-y-1">
                                            <span>Notifications navigateur</span>
                                            <span className="font-normal text-xs text-muted-foreground">Alertes en temps réel</span>
                                        </Label>
                                        <Switch id="notifications-browser" defaultChecked />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Sécurité</CardTitle>
                                    <CardDescription>Paramètres de sécurité de votre compte.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between space-x-2">
                                        <Label htmlFor="2fa" className="flex flex-col space-y-1">
                                            <span>Authentification à deux facteurs</span>
                                            <span className="font-normal text-xs text-muted-foreground">Sécuriser votre compte avec 2FA</span>
                                        </Label>
                                        <Switch id="2fa" />
                                    </div>
                                    <div className="pt-4">
                                        <Button variant="outline" className="w-full sm:w-auto">Changer de mot de passe</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
