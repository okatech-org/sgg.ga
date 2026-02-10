/**
 * SGG Digital — Portail Citoyen (Transparence Publique)
 *
 * Vue publique simplifiée des indicateurs gouvernementaux :
 *   - Indicateurs de transparence
 *   - Performance des services publics
 *   - Budget exécuté
 *   - Projets en cours
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Globe, TrendingUp, Users, Building2,
    CheckCircle2, Clock, AlertTriangle,
    DollarSign, FileText, MapPin, Heart,
    ExternalLink, ThumbsUp, ThumbsDown,
} from 'lucide-react';

// ── Component ───────────────────────────────────────────────────────────────

export default function CitizenPortalPage() {
    const [feedbackSent, setFeedbackSent] = useState(false);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                        <Globe className="h-7 w-7 text-emerald-600" />
                        Portail Citoyen — Transparence
                    </h1>
                    <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                        Accédez aux indicateurs de performance du gouvernement gabonais. Dernière mise à jour : 10 février 2026.
                    </p>
                    <Badge variant="outline" className="text-xs">
                        <Heart className="h-3 w-3 mr-1 text-red-500" /> Données ouvertes · Accès public
                    </Badge>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-emerald-500">
                        <CardContent className="pt-3 pb-2">
                            <p className="text-2xl font-bold text-emerald-600">72%</p>
                            <p className="text-[10px] text-muted-foreground">Performance Globale</p>
                            <p className="text-[9px] text-emerald-600">+4% ce mois</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2">
                            <p className="text-2xl font-bold text-blue-600">65%</p>
                            <p className="text-[10px] text-muted-foreground">Services digitalisés</p>
                            <p className="text-[9px] text-blue-600">32/50 services en ligne</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-3 pb-2">
                            <p className="text-2xl font-bold text-amber-600">6.2j</p>
                            <p className="text-[10px] text-muted-foreground">Délai traitement moyen</p>
                            <p className="text-[9px] text-amber-600">Objectif : 5 jours</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-violet-500">
                        <CardContent className="pt-3 pb-2">
                            <p className="text-2xl font-bold text-violet-600">72</p>
                            <p className="text-[10px] text-muted-foreground">Satisfaction (NPS)</p>
                            <p className="text-[9px] text-violet-600">Objectif : ≥70</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Budget */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-emerald-500" />
                                Exécution Budgétaire 2026
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                { label: 'Santé', allocated: 180, spent: 95, pct: 53 },
                                { label: 'Éducation', allocated: 220, spent: 145, pct: 66 },
                                { label: 'Infrastructure', allocated: 150, spent: 78, pct: 52 },
                                { label: 'Numérique', allocated: 45, spent: 32, pct: 71 },
                                { label: 'Sécurité', allocated: 120, spent: 88, pct: 73 },
                            ].map((item, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-medium">{item.label}</span>
                                        <span className="text-muted-foreground">{item.spent}/{item.allocated} Mds FCFA ({item.pct}%)</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${item.pct >= 65 ? 'bg-green-500' : item.pct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${item.pct}%` }} />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Grands Projets */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-blue-500" />
                                Grands Projets Nationaux
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {[
                                { name: 'Digitalisation 100% procédures', progress: 65, status: 'on-track' },
                                { name: 'Connectivité 9 provinces', progress: 78, status: 'at-risk' },
                                { name: 'Journal Officiel numérique', progress: 100, status: 'done' },
                                { name: 'Identité numérique citoyenne', progress: 25, status: 'on-track' },
                                { name: 'E-paiement services publics', progress: 40, status: 'on-track' },
                                { name: 'Guichet unique des entreprises', progress: 55, status: 'at-risk' },
                            ].map((proj, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    {proj.status === 'done' ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" /> :
                                        proj.status === 'at-risk' ? <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" /> :
                                            <Clock className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
                                    <span className="text-xs flex-1">{proj.name}</span>
                                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${proj.progress === 100 ? 'bg-green-500' : proj.progress >= 50 ? 'bg-blue-500' : 'bg-amber-400'}`} style={{ width: `${proj.progress}%` }} />
                                    </div>
                                    <span className="text-[10px] font-bold w-8 text-right">{proj.progress}%</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Services les plus demandés */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <FileText className="h-4 w-4 text-indigo-500" />
                                Services les Plus Demandés
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {[
                                { name: 'Extrait d\'acte de naissance', requests: 12500, online: true },
                                { name: 'Casier judiciaire', requests: 8200, online: true },
                                { name: 'Titre foncier', requests: 5800, online: false },
                                { name: 'Certificat de nationalité', requests: 4200, online: true },
                                { name: 'Passeport', requests: 3800, online: false },
                                { name: 'Permis de conduire', requests: 3500, online: true },
                            ].map((service, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-muted/30">
                                    <span className="w-4 text-[10px] font-bold text-muted-foreground">{i + 1}.</span>
                                    <span className="flex-1">{service.name}</span>
                                    {service.online ? (
                                        <Badge className="text-[8px] h-3.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">En ligne</Badge>
                                    ) : (
                                        <Badge className="text-[8px] h-3.5 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">Guichet</Badge>
                                    )}
                                    <span className="text-[9px] text-muted-foreground w-12 text-right">{(service.requests / 1000).toFixed(1)}k</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Couverture géographique */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-emerald-500" />
                                Couverture Géographique
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1.5">
                            {[
                                { province: 'Estuaire', score: 88, connected: true },
                                { province: 'Ogooué-Maritime', score: 75, connected: true },
                                { province: 'Haut-Ogooué', score: 72, connected: true },
                                { province: 'Woleu-Ntem', score: 62, connected: true },
                                { province: 'Moyen-Ogooué', score: 65, connected: true },
                                { province: 'Ngounié', score: 58, connected: true },
                                { province: 'Ogooué-Lolo', score: 55, connected: true },
                                { province: 'Nyanga', score: 35, connected: false },
                                { province: 'Ogooué-Ivindo', score: 30, connected: false },
                            ].map((p, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                    <span className={`w-1.5 h-1.5 rounded-full ${p.connected ? 'bg-green-500' : 'bg-red-400'}`} />
                                    <span className="flex-1">{p.province}</span>
                                    <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${p.score >= 70 ? 'bg-green-500' : p.score >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${p.score}%` }} />
                                    </div>
                                    <span className={`text-[10px] font-bold w-6 text-right ${p.score >= 70 ? 'text-green-600' : p.score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{p.score}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Votre avis */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Heart className="h-4 w-4 text-red-500" />
                                Votre Avis Compte
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-xs text-muted-foreground">Êtes-vous satisfait(e) des services publics numériques ?</p>
                            {feedbackSent ? (
                                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
                                    <p className="text-xs font-semibold text-green-700 dark:text-green-400">Merci pour votre retour !</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">Votre avis contribue à améliorer nos services.</p>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1 text-xs gap-1" onClick={() => setFeedbackSent(true)}>
                                        <ThumbsUp className="h-3.5 w-3.5 text-green-500" /> Satisfait
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1 text-xs gap-1" onClick={() => setFeedbackSent(true)}>
                                        <ThumbsDown className="h-3.5 w-3.5 text-red-500" /> Insatisfait
                                    </Button>
                                </div>
                            )}
                            <div className="border-t pt-2">
                                <p className="text-[10px] font-semibold mb-1.5">Résultats actuels</p>
                                <div className="flex items-center gap-2 text-xs">
                                    <ThumbsUp className="h-3 w-3 text-green-500" />
                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 rounded-full" style={{ width: '72%' }} />
                                    </div>
                                    <span className="text-[10px] font-bold">72%</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs mt-1">
                                    <ThumbsDown className="h-3 w-3 text-red-400" />
                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-red-400 rounded-full" style={{ width: '28%' }} />
                                    </div>
                                    <span className="text-[10px] font-bold">28%</span>
                                </div>
                                <p className="text-[9px] text-muted-foreground mt-1">3 847 réponses collectées</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Open Data */}
                <Card>
                    <CardContent className="p-3 flex flex-wrap gap-2 items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                            <Globe className="h-3.5 w-3.5 inline mr-1" />
                            Les données de cette page sont accessibles en Open Data via l'API publique SGG.
                        </p>
                        <Button variant="outline" size="sm" className="text-xs gap-1">
                            <ExternalLink className="h-3 w-3" /> Accéder à l'API
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
