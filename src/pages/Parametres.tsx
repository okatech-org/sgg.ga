/**
 * SGG Digital — Page Paramètres
 * Configuration système de la plateforme pour les administrateurs SGG.
 */

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
    Settings,
    Bell,
    Shield,
    Database,
    Globe,
    Mail,
    Clock,
    Save,
    RefreshCw,
} from "lucide-react";

interface SettingToggle {
    id: string;
    label: string;
    description: string;
    defaultValue: boolean;
}

const notifSettings: SettingToggle[] = [
    { id: "email_rapports", label: "Rapports en retard", description: "Recevoir un email lorsqu'un rapport dépasse la deadline", defaultValue: true },
    { id: "email_nominations", label: "Nouvelles nominations", description: "Notification pour chaque dossier de nomination soumis", defaultValue: true },
    { id: "email_validation", label: "Validations en attente", description: "Rappel quotidien des rapports à valider", defaultValue: false },
    { id: "email_jo", label: "Publications JO", description: "Notification lors d'une publication au Journal Officiel", defaultValue: true },
];

const securitySettings: SettingToggle[] = [
    { id: "2fa", label: "Authentification 2FA", description: "Exiger la double authentification pour tous les utilisateurs", defaultValue: false },
    { id: "session_timeout", label: "Expiration de session", description: "Déconnecter automatiquement après 30 minutes d'inactivité", defaultValue: true },
    { id: "ip_whitelist", label: "Restriction IP", description: "Limiter l'accès aux adresses IP autorisées", defaultValue: false },
    { id: "audit_log", label: "Journal d'audit", description: "Enregistrer toutes les actions critiques des utilisateurs", defaultValue: true },
];

export default function Parametres() {
    const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({});
    const [saving, setSaving] = useState(false);

    const getToggleValue = (id: string, defaultValue: boolean) => {
        return toggleStates[id] !== undefined ? toggleStates[id] : defaultValue;
    };

    const handleToggle = (id: string, value: boolean) => {
        setToggleStates(prev => ({ ...prev, [id]: value }));
    };

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            toast({
                title: "Paramètres enregistrés",
                description: "Les modifications ont été appliquées avec succès.",
            });
        }, 800);
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-government-navy/10 flex items-center justify-center">
                        <Settings className="h-5 w-5 text-government-navy" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
                        <p className="text-sm text-muted-foreground">
                            Configuration système de la plateforme SGG Digital
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-government-navy hover:bg-government-navy-light"
                >
                    {saving ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4 mr-2" />
                    )}
                    Enregistrer
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Général */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-government-navy" />
                            <CardTitle className="text-lg">Général</CardTitle>
                        </div>
                        <CardDescription>Paramètres généraux de la plateforme</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="org_name">Nom de l'organisation</Label>
                            <Input id="org_name" defaultValue="Secrétariat Général du Gouvernement" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="timezone">Fuseau horaire</Label>
                            <Input id="timezone" defaultValue="Africa/Libreville (WAT, UTC+1)" disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fiscal_year">Année de référence</Label>
                            <Input id="fiscal_year" defaultValue="2026" type="number" />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="font-medium">Mode maintenance</Label>
                                <p className="text-xs text-muted-foreground">Désactiver l'accès public temporairement</p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-government-navy" />
                            <CardTitle className="text-lg">Notifications</CardTitle>
                        </div>
                        <CardDescription>Gérer les alertes email et système</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {notifSettings.map((setting) => (
                            <div key={setting.id} className="flex items-center justify-between">
                                <div className="flex-1 mr-4">
                                    <Label className="font-medium">{setting.label}</Label>
                                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                                </div>
                                <Switch
                                    checked={getToggleValue(setting.id, setting.defaultValue)}
                                    onCheckedChange={(v) => handleToggle(setting.id, v)}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Sécurité */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-government-navy" />
                            <CardTitle className="text-lg">Sécurité</CardTitle>
                        </div>
                        <CardDescription>Paramètres de sécurité et d'accès</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {securitySettings.map((setting) => (
                            <div key={setting.id} className="flex items-center justify-between">
                                <div className="flex-1 mr-4">
                                    <Label className="font-medium">{setting.label}</Label>
                                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                                </div>
                                <Switch
                                    checked={getToggleValue(setting.id, setting.defaultValue)}
                                    onCheckedChange={(v) => handleToggle(setting.id, v)}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Base de données */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Database className="h-5 w-5 text-government-navy" />
                            <CardTitle className="text-lg">Base de Données</CardTitle>
                        </div>
                        <CardDescription>État de la connexion et informations système</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Instance Cloud SQL</span>
                            <Badge variant="outline" className="font-mono text-xs">idetude-db</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Base de données</span>
                            <Badge variant="outline" className="font-mono text-xs">db_sgg</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Statut</span>
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                Connecté
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Région</span>
                            <span className="text-sm text-muted-foreground">europe-west1</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-sm font-medium flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Dernière sauvegarde
                                </span>
                            </div>
                            <span className="text-sm text-muted-foreground">09 fév. 2026, 03:00</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-sm font-medium flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    Alertes DBA
                                </span>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
