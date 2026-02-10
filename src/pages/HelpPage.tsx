/**
 * SGG Digital — Centre d'Aide & Documentation
 *
 * Page d'assistance complète pour les utilisateurs :
 *   - Onglets : FAQ · Glossaire · Processus · Raccourcis · Contact
 *   - GlossaryPanel : 35+ termes techniques
 *   - WorkflowMap : 2 processus visuels interactifs
 *   - FAQ avec accordéon filtrable
 *   - Guides rapides par rôle
 *   - Raccourcis clavier
 *   - Formulaire de contact support
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    HelpCircle, Search, BookOpen, Keyboard,
    ChevronDown, ChevronRight, Mail,
    Users, Shield, FileText, BarChart3,
    GitBranch, Bell, Upload, Settings,
    ExternalLink, MessageSquare, Lightbulb,
    GraduationCap, Play, CheckCircle2,
    BookText, Workflow,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { GlossaryPanel } from '@/components/onboarding/Glossary';
import { WorkflowMap } from '@/components/onboarding/WorkflowMap';
import { cn } from '@/lib/utils';

// ── Types ───────────────────────────────────────────────────────────────────

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

interface Guide {
    title: string;
    description: string;
    role: string;
    steps: string[];
    icon: typeof FileText;
}

// ── Data ────────────────────────────────────────────────────────────────────

const FAQ_ITEMS: FAQItem[] = [
    {
        question: 'Comment soumettre un rapport GAR mensuel ?',
        answer: 'Accédez à "Matrice GAR/PAG" → "Saisie Mensuelle" dans le menu latéral. Sélectionnez le mois, remplissez les indicateurs, ajoutez des commentaires si nécessaire, puis cliquez sur "Soumettre". Le rapport sera envoyé à votre hiérarchie pour validation.',
        category: 'Reporting',
    },
    {
        question: 'Comment créer un nouveau dossier de nomination ?',
        answer: 'Dans le module "Nominations", cliquez sur le bouton "+ Nouvelle nomination". Remplissez les informations du candidat, le poste visé, le ministère concerné, et joignez les documents requis (CV, décret proposé). Le dossier sera automatiquement intégré au circuit d\'approbation.',
        category: 'Nominations',
    },
    {
        question: 'Comment utiliser la recherche globale ?',
        answer: 'Appuyez sur ⌘K (Mac) ou Ctrl+K (Windows) pour ouvrir la palette de commandes. Tapez le nom d\'une page, d\'un module ou d\'une action pour naviguer instantanément. Vous pouvez aussi cliquer sur la barre de recherche dans l\'en-tête.',
        category: 'Navigation',
    },
    {
        question: 'Qui peut valider un décret dans le workflow ?',
        answer: 'Le circuit de validation d\'un décret suit l\'ordre : Point Focal → SG Ministère → SGG → SGPR. Chaque acteur peut approuver, retourner (demander des corrections) ou rejeter le dossier. L\'administrateur SGG (admin_sgg) peut voir et gérer tous les workflows.',
        category: 'Workflows',
    },
    {
        question: 'Comment exporter des données en Excel ?',
        answer: 'Rendez-vous dans "Import/Export" via le menu Admin. Sélectionnez le jeu de données souhaité (Institutions, Utilisateurs, Nominations) et cliquez sur "Export Excel". Vous pouvez aussi télécharger un template vide pour préparer un import.',
        category: 'Données',
    },
    {
        question: 'Comment changer mon mot de passe ?',
        answer: 'Allez dans "Mon Profil" → "Sécurité". Entrez votre mot de passe actuel, puis le nouveau mot de passe (minimum 8 caractères, incluant majuscules, chiffres et caractères spéciaux). L\'activation de la double authentification (2FA) est recommandée.',
        category: 'Compte',
    },
    {
        question: 'Comment consulter le journal d\'audit ?',
        answer: 'Les administrateurs SGG peuvent accéder au "Journal d\'Audit" dans le menu Admin. Ce journal trace toutes les actions : connexions, modifications, validations, exports, etc. Vous pouvez filtrer par type d\'action, sévérité, utilisateur ou adresse IP.',
        category: 'Admin',
    },
    {
        question: 'Comment sont calculés les scores GAR ?',
        answer: 'Le score GAR est calculé selon la méthodologie nationale : pondération des indicateurs par priorité (PAG, sectoriel, transversal), puis agrégation par ministère. Les barres de progression dans la matrice reflètent le % d\'atteinte des cibles trimestrielles.',
        category: 'Reporting',
    },
    {
        question: 'Comment activer le mode sombre ?',
        answer: 'Cliquez sur l\'icône soleil/lune dans l\'en-tête (coin supérieur droit). Le thème sera mémorisé pour vos prochaines visites. Le mode sombre réduit la fatigue visuelle lors des sessions prolongées.',
        category: 'Interface',
    },
    {
        question: 'Que faire en cas de tentative de connexion suspecte ?',
        answer: 'Si vous recevez une alerte de connexion suspecte, changez immédiatement votre mot de passe. Activez la 2FA si ce n\'est pas encore fait. Contactez l\'administrateur SGG (admin@sgg.ga) pour signaler l\'incident et vérifier les logs d\'audit.',
        category: 'Sécurité',
    },
];

const GUIDES: Guide[] = [
    {
        title: 'Guide du Point Focal',
        description: 'Saisie et soumission des rapports mensuels',
        role: 'point_focal',
        icon: FileText,
        steps: [
            'Connectez-vous avec vos identifiants',
            'Accédez à "Matrice GAR/PAG" dans le menu',
            'Cliquez sur "Saisie Mensuelle"',
            'Sélectionnez le mois et remplissez les indicateurs',
            'Vérifiez les données et soumettez le rapport',
        ],
    },
    {
        title: 'Guide du Secrétaire Général',
        description: 'Validation des rapports et suivi institutionnel',
        role: 'sg_ministere',
        icon: Shield,
        steps: [
            'Consultez le tableau de bord pour les rapports en attente',
            'Cliquez sur un rapport pour le réviser',
            'Validez ou retournez avec commentaires',
            'Suivez les indicateurs GAR dans la matrice',
            'Exportez les données pour vos réunions',
        ],
    },
    {
        title: 'Guide Administrateur SGG',
        description: 'Gestion complète de la plateforme',
        role: 'admin_sgg',
        icon: Settings,
        steps: [
            'Gérez les utilisateurs et les rôles dans "Admin"',
            'Configurez les permissions par module',
            'Surveillez les workflows et les validations',
            'Consultez le monitoring et les logs d\'audit',
            'Exportez les données et les rapports PDF',
        ],
    },
    {
        title: 'Guide SGPR',
        description: 'Validation présidentielle et suivi stratégique',
        role: 'sgpr',
        icon: BarChart3,
        steps: [
            'Accédez au "Dashboard SGPR" pour la vue consolidée',
            'Validez les nominations et décrets finaux',
            'Consultez les indicateurs PAG 2026',
            'Suivez les rapports de performance par ministère',
            'Utilisez l\'analytique pour les décisions stratégiques',
        ],
    },
];

const SHORTCUTS = [
    { keys: ['⌘', 'K'], description: 'Recherche globale' },
    { keys: ['⌘', 'B'], description: 'Basculer le menu latéral' },
    { keys: ['⌘', 'D'], description: 'Mode sombre / clair' },
    { keys: ['Échap'], description: 'Fermer les dialogues' },
    { keys: ['Tab'], description: 'Navigation au clavier' },
    { keys: ['Entrée'], description: 'Confirmer une action' },
];

// ── Tab Config ──────────────────────────────────────────────────────────────

type TabKey = 'faq' | 'glossary' | 'workflows' | 'shortcuts' | 'contact';

const TABS: { key: TabKey; label: string; icon: typeof HelpCircle }[] = [
    { key: 'faq', label: 'FAQ & Guides', icon: Lightbulb },
    { key: 'glossary', label: 'Glossaire', icon: BookText },
    { key: 'workflows', label: 'Processus', icon: Workflow },
    { key: 'shortcuts', label: 'Raccourcis', icon: Keyboard },
    { key: 'contact', label: 'Contact', icon: Mail },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function HelpPage() {
    const [search, setSearch] = useState('');
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [expandedGuide, setExpandedGuide] = useState<number | null>(null);
    const [contactMessage, setContactMessage] = useState('');
    const [activeTab, setActiveTab] = useState<TabKey>('faq');

    const filteredFaq = FAQ_ITEMS.filter(f => {
        if (!search) return true;
        const q = search.toLowerCase();
        return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
    });

    const faqCategories = [...new Set(FAQ_ITEMS.map(f => f.category))];

    const handleSendMessage = () => {
        if (!contactMessage.trim()) return;
        toast({ title: '✉️ Message envoyé', description: 'L\'équipe support vous répondra sous 24h.' });
        setContactMessage('');
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto">
                    <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                        <HelpCircle className="h-7 w-7 text-blue-600" />
                        Centre d'Aide
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Trouvez rapidement les réponses à vos questions, consultez le glossaire ou explorez les processus
                    </p>
                    {/* Search */}
                    <div className="relative mt-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher dans l'aide..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-12 h-12 text-base rounded-xl"
                        />
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="text-center">
                        <CardContent className="pt-4 pb-3">
                            <BookOpen className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                            <p className="text-lg font-bold">{FAQ_ITEMS.length}</p>
                            <p className="text-[10px] text-muted-foreground">Questions FAQ</p>
                        </CardContent>
                    </Card>
                    <Card className="text-center">
                        <CardContent className="pt-4 pb-3">
                            <BookText className="h-5 w-5 mx-auto text-emerald-600 mb-1" />
                            <p className="text-lg font-bold">35+</p>
                            <p className="text-[10px] text-muted-foreground">Termes au glossaire</p>
                        </CardContent>
                    </Card>
                    <Card className="text-center">
                        <CardContent className="pt-4 pb-3">
                            <Workflow className="h-5 w-5 mx-auto text-purple-600 mb-1" />
                            <p className="text-lg font-bold">2</p>
                            <p className="text-[10px] text-muted-foreground">Processus illustrés</p>
                        </CardContent>
                    </Card>
                    <Card className="text-center">
                        <CardContent className="pt-4 pb-3">
                            <MessageSquare className="h-5 w-5 mx-auto text-amber-600 mb-1" />
                            <p className="text-lg font-bold">24h</p>
                            <p className="text-[10px] text-muted-foreground">Temps de réponse</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 border-b overflow-x-auto pb-px">
                    {TABS.map(tab => {
                        const TabIcon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                                    activeTab === tab.key
                                        ? "border-government-navy text-government-navy"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                                )}
                            >
                                <TabIcon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* ─── TAB: FAQ & Guides ──────────────────────────────────────── */}
                {activeTab === 'faq' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* FAQ */}
                        <div className="lg:col-span-2 space-y-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-amber-500" />
                                Questions Fréquentes
                            </h2>

                            {/* Category pills */}
                            <div className="flex flex-wrap gap-1.5">
                                <Button variant={!search ? 'default' : 'ghost'} size="sm" className="h-7 text-xs" onClick={() => setSearch('')}>
                                    Toutes
                                </Button>
                                {faqCategories.map(cat => (
                                    <Button
                                        key={cat}
                                        variant={search === cat ? 'default' : 'ghost'}
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() => setSearch(search === cat ? '' : cat)}
                                    >
                                        {cat}
                                    </Button>
                                ))}
                            </div>

                            {/* FAQ Accordion */}
                            <div className="space-y-2">
                                {filteredFaq.map((faq, i) => (
                                    <Card
                                        key={i}
                                        className="cursor-pointer hover:shadow-md transition-all"
                                        onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                                    >
                                        <CardContent className="py-3 px-4">
                                            <div className="flex items-start gap-2">
                                                <ChevronDown className={`h-4 w-4 text-muted-foreground mt-0.5 transition-transform shrink-0 ${expandedFaq === i ? 'rotate-180' : ''}`} />
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="text-sm font-medium">{faq.question}</p>
                                                        <Badge variant="secondary" className="text-[10px] shrink-0">{faq.category}</Badge>
                                                    </div>
                                                    {expandedFaq === i && (
                                                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{faq.answer}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Right column: Guides */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Play className="h-4 w-4 text-green-600" />
                                        Guides par Rôle
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {GUIDES.map((guide, i) => (
                                        <div
                                            key={i}
                                            className="p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors"
                                            onClick={() => setExpandedGuide(expandedGuide === i ? null : i)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <guide.icon className="h-4 w-4 text-muted-foreground" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{guide.title}</p>
                                                    <p className="text-[10px] text-muted-foreground">{guide.description}</p>
                                                </div>
                                                <ChevronRight className={`h-4 w-4 transition-transform ${expandedGuide === i ? 'rotate-90' : ''}`} />
                                            </div>
                                            {expandedGuide === i && (
                                                <div className="mt-2 pt-2 border-t">
                                                    <ol className="space-y-1.5">
                                                        {guide.steps.map((step, j) => (
                                                            <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                                                                <span className="bg-primary/10 text-primary rounded-full w-4 h-4 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                                                                    {j + 1}
                                                                </span>
                                                                {step}
                                                            </li>
                                                        ))}
                                                    </ol>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* ─── TAB: Glossaire ─────────────────────────────────────────── */}
                {activeTab === 'glossary' && (
                    <div>
                        <GlossaryPanel />
                    </div>
                )}

                {/* ─── TAB: Processus (WorkflowMap) ──────────────────────────── */}
                {activeTab === 'workflows' && (
                    <div className="space-y-6">
                        <div className="max-w-2xl">
                            <h2 className="text-lg font-bold flex items-center gap-2 mb-1">
                                <Workflow className="h-5 w-5 text-purple-500" />
                                Processus gouvernementaux illustrés
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Visualisez les circuits administratifs étape par étape. Cliquez sur chaque étape pour voir les détails.
                            </p>
                        </div>
                        <WorkflowMap />
                    </div>
                )}

                {/* ─── TAB: Raccourcis ────────────────────────────────────────── */}
                {activeTab === 'shortcuts' && (
                    <div className="max-w-xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Keyboard className="h-4 w-4 text-purple-600" />
                                    Raccourcis Clavier
                                </CardTitle>
                                <CardDescription>
                                    Naviguez plus rapidement avec ces combinaisons de touches
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {SHORTCUTS.map((sc, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                                            <span className="text-foreground font-medium">{sc.description}</span>
                                            <div className="flex gap-1">
                                                {sc.keys.map((key, j) => (
                                                    <kbd key={j} className="bg-muted px-2 py-1 rounded border text-xs font-mono min-w-[28px] text-center">
                                                        {key}
                                                    </kbd>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Accessibility tips */}
                        <Card className="mt-4 border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    Conseils d'accessibilité
                                </h3>
                                <ul className="space-y-1.5 text-xs text-muted-foreground">
                                    <li>• Utilisez <kbd className="bg-muted px-1 rounded border text-[10px] font-mono">Tab</kbd> pour naviguer entre les éléments interactifs</li>
                                    <li>• Le mode sombre réduit la fatigue visuelle lors des longues sessions</li>
                                    <li>• Les titres de breadcrumbs montrent une description au survol</li>
                                    <li>• Le bouton d'aide flottant (en bas à droite) est accessible avec <kbd className="bg-muted px-1 rounded border text-[10px] font-mono">?</kbd></li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* ─── TAB: Contact ───────────────────────────────────────────── */}
                {activeTab === 'contact' && (
                    <div className="max-w-xl mx-auto space-y-4">
                        <Card className="border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-blue-600" />
                                    Contacter le Support
                                </CardTitle>
                                <CardDescription>Équipe technique SGG — réponse sous 24h</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <textarea
                                    className="w-full h-32 rounded-lg border bg-background px-3 py-2 text-sm resize-none"
                                    placeholder="Décrivez votre problème ou question..."
                                    value={contactMessage}
                                    onChange={e => setContactMessage(e.target.value)}
                                />
                                <Button className="w-full gap-2" size="sm" onClick={handleSendMessage} disabled={!contactMessage.trim()}>
                                    <Mail className="h-4 w-4" />
                                    Envoyer le message
                                </Button>
                                <p className="text-[10px] text-muted-foreground text-center">
                                    Ou envoyez un email à <span className="font-mono">support@sgg.ga</span>
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm mb-3">Canaux de support</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between py-2 border-b">
                                        <span className="text-muted-foreground">Email</span>
                                        <span className="font-mono text-xs">support@sgg.ga</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b">
                                        <span className="text-muted-foreground">Téléphone</span>
                                        <span className="font-mono text-xs">+241 01 74 XX XX</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-muted-foreground">Horaires</span>
                                        <span className="text-xs">Lun-Ven, 8h00 – 17h00</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
