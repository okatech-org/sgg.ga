
import { Link } from "react-router-dom";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import { useToast } from "@/hooks/use-toast";
import {
    ArrowRight,
    TrendingUp,
    Download,
    Target,
    Users,
    Building2,
    PieChart,
    BarChart3,
    CheckCircle2,
    Calendar,
    FileText,
    HelpCircle,
    ChevronRight,
    Sparkles,
    Shield,
    Globe2,
    Briefcase,
    GraduationCap,
    Heart
} from "lucide-react";
import {
    pag2026Config,
    macroIndicators,
    sectorDrivers,
    priorities,
    strategicFunds,
    budgetStructure,
    topInvestmentMissions,
    garKPIs,
    oddImpacts,
    faqItems,
    citizenBenefits
} from "@/data/pag2026Data";

// Color mapping for priority cards
const priorityColorMap: Record<string, { bg: string, text: string, border: string, gradient: string }> = {
    blue: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800", gradient: "from-blue-500 to-blue-600" },
    amber: { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800", gradient: "from-amber-500 to-amber-600" },
    red: { bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800", gradient: "from-red-500 to-red-600" },
    green: { bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-700 dark:text-green-300", border: "border-green-200 dark:border-green-800", gradient: "from-green-500 to-green-600" },
    purple: { bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800", gradient: "from-purple-500 to-purple-600" },
    indigo: { bg: "bg-indigo-50 dark:bg-indigo-950/30", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-200 dark:border-indigo-800", gradient: "from-indigo-500 to-indigo-600" },
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800", gradient: "from-emerald-500 to-emerald-600" },
};

// Documents available for download
const documentsOfficiels = [
    { title: "PAG 2026 - Version Complète", format: "PDF", size: "2.4 MB", filename: "PAG_2026_Version_Complete.pdf" },
    { title: "Synthèse Exécutive", format: "PDF", size: "450 KB", filename: "PAG_2026_Synthese_Executive.pdf" },
    { title: "Loi de Finances 2026", format: "PDF", size: "1.8 MB", filename: "Loi_de_Finances_2026.pdf" },
    { title: "Matrice de Reporting GAR", format: "Excel", size: "320 KB", filename: "Matrice_Reporting_GAR_2026.xlsx" },
    { title: "Décrets 5 Fonds Stratégiques", format: "PDF", size: "890 KB", filename: "Decrets_5_Fonds_Strategiques.pdf" },
    { title: "Cartographie Projets Prioritaires", format: "PDF", size: "1.2 MB", filename: "Cartographie_Projets_Prioritaires.pdf" },
];

export default function PAG2026() {
    const { toast } = useToast();

    const handleDownload = useCallback((filename: string, title: string) => {
        // Create a simulated document blob for download
        const content = `\n===========================================\n  ${title}\n  République Gabonaise\n  Secrétariat Général du Gouvernement\n===========================================\n\nCe document est un aperçu de démonstration.\nLe document original complet sera disponible prochainement.\n\nSource: ${pag2026Config.source}\nMise à jour: ${pag2026Config.lastUpdate}\nVersion: ${pag2026Config.version}\n\n---\nGénéré depuis SGG Digital — sgg.ga\n`;
        const blob = new Blob([content], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
            title: "Téléchargement lancé",
            description: `${title} est en cours de téléchargement.`,
        });
    }, [toast]);

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <LandingHeader />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative py-24 md:py-36 overflow-hidden">
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/images/pag-infrastructure.png"
                            alt="Développement du Gabon"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-900/60" />
                        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10 mix-blend-overlay" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-4xl mx-auto text-center text-white">
                            <Badge className="mb-6 bg-black/60 text-white border-white/20 hover:bg-black/70 backdrop-blur-sm">
                                <Calendar className="h-3 w-3 mr-1" />
                                Mis à jour le {pag2026Config.lastUpdate}
                            </Badge>

                            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
                                Plan d'Action Gouvernemental <span className="text-an-light">2026</span>
                            </h1>

                            <blockquote className="text-xl md:text-2xl italic text-white/95 mb-8 border-l-4 border-an-light pl-6 text-left max-w-2xl mx-auto bg-black/40 backdrop-blur-sm p-6 rounded-r-lg">
                                "Améliorer concrètement le niveau de vie, assurer la justice sociale et engager une transformation structurelle irréversible."
                                <footer className="text-base text-white/70 mt-2 not-italic">— Objectif Politique 2026</footer>
                            </blockquote>

                            <p className="text-lg text-white/90 mb-10 max-w-2xl mx-auto">
                                La feuille de route opérationnelle de la République Gabonaise, élaborée sous l'égide du Secrétariat Général du Gouvernement, déclinant la vision présidentielle en actions concrètes.
                            </p>

                            <div className="flex flex-wrap justify-center gap-4">
                                <Button
                                    size="lg"
                                    className="bg-an hover:bg-an-dark text-white border border-transparent hover:scale-105 transition-transform"
                                    onClick={() => handleDownload('PAG_2026_Version_Complete.pdf', 'PAG 2026 - Version Complète')}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Télécharger le PAG 2026
                                </Button>
                                <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm">
                                    Explorer les 7 Priorités
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
                </section>

                {/* Macro Indicators Section */}
                <section className="py-16 md:py-24 bg-background">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <Badge variant="outline" className="mb-4">
                                <BarChart3 className="h-3 w-3 mr-1" />
                                Indicateurs Macroéconomiques
                            </Badge>
                            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                                Une Économie en Transformation
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Les chiffres clés du budget 2026 illustrent l'ambition d'un Gabon en pleine mutation structurelle.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {macroIndicators.map((indicator, idx) => (
                                <Card key={idx} className="text-center hover:border-primary/50 transition-colors border-border group bg-card">
                                    <CardContent className="pt-6">
                                        <div className={`text-3xl md:text-4xl font-bold mb-2 group-hover:scale-110 transition-transform ${indicator.trend === 'up' ? 'text-green-600' :
                                            indicator.trend === 'down' ? 'text-red-500' : 'text-primary'
                                            }`}>
                                            {indicator.value}
                                        </div>
                                        <p className="text-sm font-medium text-foreground mb-1">{indicator.label}</p>
                                        <p className="text-xs text-muted-foreground">{indicator.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Sector Drivers */}
                        <div className="mt-16">
                            <h3 className="text-2xl font-serif font-bold mb-8 text-center">
                                <TrendingUp className="inline h-6 w-6 mr-2 text-an" />
                                Moteurs Sectoriels - Top Performers 2026
                            </h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {sectorDrivers.map((sector, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                                        <div className="text-2xl font-bold text-an">{sector.growth}</div>
                                        <div>
                                            <p className="font-semibold text-foreground">{sector.sector}</p>
                                            <p className="text-sm text-muted-foreground">{sector.driver}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 7 Priorities Section */}
                <section className="py-16 md:py-24 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <Badge variant="outline" className="mb-4">
                                <Target className="h-3 w-3 mr-1" />
                                Les 7 Priorités
                            </Badge>
                            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                                L'Action Publique au Service du Citoyen
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Chaque priorité est pilotée par un ministère chef de file et alignée sur les Objectifs de Développement Durable.
                            </p>
                        </div>

                        <Tabs defaultValue="1" className="w-full">
                            <TabsList className="flex flex-wrap justify-center gap-2 h-auto bg-transparent mb-8">
                                {priorities.map((priority) => {
                                    const colors = priorityColorMap[priority.color] || priorityColorMap.blue;
                                    return (
                                        <TabsTrigger
                                            key={priority.id}
                                            value={priority.id.toString()}
                                            className={`px-4 py-3 rounded-full border ${colors.border} data-[state=active]:${colors.bg} data-[state=active]:${colors.text} transition-all`}
                                        >
                                            <priority.icon className="h-4 w-4 mr-2" />
                                            <span className="hidden sm:inline">{priority.title}</span>
                                            <span className="sm:hidden">P{priority.id}</span>
                                        </TabsTrigger>
                                    );
                                })}
                            </TabsList>

                            {priorities.map((priority) => {
                                const colors = priorityColorMap[priority.color] || priorityColorMap.blue;
                                const Icon = priority.icon;
                                return (
                                    <TabsContent key={priority.id} value={priority.id.toString()}>
                                        <Card className={`border-2 ${colors.border} overflow-hidden shadow-sm`}>
                                            <div className={`h-2 bg-gradient-to-r ${colors.gradient}`} />
                                            <CardHeader className="pb-4">
                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-4 rounded-2xl ${colors.bg}`}>
                                                            <Icon className={`h-8 w-8 ${colors.text}`} />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-2xl font-serif">
                                                                Priorité {priority.id} : {priority.title}
                                                            </CardTitle>
                                                            <CardDescription className="text-base">{priority.subtitle}</CardDescription>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`text-3xl font-bold ${colors.text}`}>{priority.kpiValue}</div>
                                                        <p className="text-sm text-muted-foreground">{priority.kpiLabel}</p>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="text-sm font-medium text-muted-foreground mb-1">Ministère Chef de File</p>
                                                            <p className="font-semibold">{priority.ministry}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-muted-foreground mb-1">Co-pilotes</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {priority.coPilots.map((pilot, idx) => (
                                                                    <Badge key={idx} variant="secondary">{pilot}</Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {priority.fund && (
                                                            <div>
                                                                <p className="text-sm font-medium text-muted-foreground mb-1">Fonds Dédié</p>
                                                                <Badge className={`${colors.bg} ${colors.text} border-0`}>{priority.fund}</Badge>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-sm font-medium text-muted-foreground mb-1">ODD Alignés</p>
                                                            <div className="flex gap-2">
                                                                {priority.odds.map((odd) => (
                                                                    <div key={odd} className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-sm">
                                                                        {odd}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground mb-3">Actions Clés 2026</p>
                                                        <ul className="space-y-3">
                                                            {priority.actions.map((action, idx) => (
                                                                <li key={idx} className="flex items-start gap-3">
                                                                    <CheckCircle2 className={`h-5 w-5 mt-0.5 ${colors.text} flex-shrink-0`} />
                                                                    <span>{action}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        <div className={`mt-6 p-4 rounded-xl ${colors.bg}`}>
                                                            <p className="text-sm font-medium mb-1">Cible fin 2026</p>
                                                            <p className={`font-semibold ${colors.text}`}>{priority.target}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                );
                            })}
                        </Tabs>
                    </div>
                </section>

                {/* Strategic Funds Section */}
                <section className="py-16 md:py-24 bg-background">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <Badge variant="outline" className="mb-4">
                                <Briefcase className="h-3 w-3 mr-1" />
                                FGIS - Fonds Gabonais d'Investissements Stratégiques
                            </Badge>
                            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                                135 Milliards FCFA pour 5 Fonds Stratégiques
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Gestion unifiée adoptée le 14 décembre 2025 pour une efficacité maximale.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {strategicFunds.map((fund, idx) => (
                                <Card key={idx} className="relative overflow-hidden hover:shadow-lg transition-shadow border-border/50">
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-an" />
                                    <CardContent className="pt-6">
                                        <div className="text-center mb-4">
                                            <Badge variant="outline" className="mb-2 font-mono">{fund.code}</Badge>
                                            <h3 className="font-semibold">{fund.name}</h3>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-an mb-1">{fund.amount}</div>
                                            <p className="text-sm text-muted-foreground">Mds FCFA</p>
                                        </div>
                                        <div className="mt-4">
                                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                <span>Part du Total</span>
                                                <span>{fund.percentage}%</span>
                                            </div>
                                            <Progress value={fund.percentage} className="h-2" />
                                        </div>
                                        <div className="mt-4 text-center">
                                            <Badge variant="secondary" className="text-xs">{fund.milestone}</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Budget Structure Section */}
                <section className="py-16 md:py-24 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <Badge variant="outline" className="mb-4">
                                <PieChart className="h-3 w-3 mr-1" />
                                Structure Budgétaire
                            </Badge>
                            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                                4 619 Milliards FCFA de Dépenses Totales
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Répartition par titres budgétaires selon la LFI 2026 (LOI N°041/2025).
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Budget by Titles */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Répartition par Titres Budgétaires</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {budgetStructure.map((item, idx) => (
                                        <div key={idx} className={`p-4 rounded-xl ${item.highlight ? 'bg-an/10 border border-an/30' : 'bg-muted/50'}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className={`font-semibold ${item.highlight ? 'text-an' : ''}`}>{item.title}</span>
                                                <span className="font-bold">{item.amount.toLocaleString()} Mds</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Progress value={item.percentage} className="flex-1 h-2" />
                                                <span className="text-sm text-muted-foreground w-12 text-right">{item.percentage}%</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">{item.observation}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Top Investment Missions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Top 10 Missions d'Investissement (Titre 5)</CardTitle>
                                    <CardDescription>Total Titre 5 : 2 173 Mds FCFA</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {topInvestmentMissions.map((mission, idx) => (
                                            <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx < 3 ? 'bg-an text-white' : 'bg-muted text-muted-foreground'}`}>
                                                    {mission.rank}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{mission.mission}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold">{mission.amount.toLocaleString()} Mds</p>
                                                    <p className="text-xs text-muted-foreground">{mission.share}%</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Citizen Benefits Section */}
                <section className="py-16 md:py-24 bg-background">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <Badge variant="outline" className="mb-4">
                                <Users className="h-3 w-3 mr-1" />
                                Mon PAG 2026
                            </Badge>
                            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                                Qu'est-ce que le PAG change pour vous ?
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Des bénéfices concrets pour chaque Gabonais, selon son profil.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {Object.entries(citizenBenefits).map(([key, section]) => {
                                // Determine styling based on key or color property
                                let colorClass = "border-gray-200";
                                let headerClass = "bg-gray-50";
                                let textClass = "text-gray-600";

                                if (key === 'families') {
                                    colorClass = "border-green-200 dark:border-green-800";
                                    headerClass = "bg-green-50 dark:bg-green-950/30";
                                    textClass = "text-green-600 dark:text-green-400";
                                } else if (key === 'youth') {
                                    colorClass = "border-blue-200 dark:border-blue-800";
                                    headerClass = "bg-blue-50 dark:bg-blue-950/30";
                                    textClass = "text-blue-600 dark:text-blue-400";
                                } else if (key === 'entrepreneurs') {
                                    colorClass = "border-purple-200 dark:border-purple-800";
                                    headerClass = "bg-purple-50 dark:bg-purple-950/30";
                                    textClass = "text-purple-600 dark:text-purple-400";
                                }

                                return (
                                    <Card key={key} className={`border-2 ${colorClass} overflow-hidden flex flex-col hover:shadow-lg transition-all hover:-translate-y-1`}>
                                        <div className="w-full h-48 overflow-hidden relative">
                                            <img
                                                src={section.image}
                                                alt={section.title}
                                                className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                                <h3 className="text-white font-serif font-bold text-xl">{section.title}</h3>
                                            </div>
                                        </div>
                                        {/* <CardHeader className={`${headerClass}`}>
                      <div className="flex items-center gap-3">
                        <div>
                          <CardTitle>{section.title}</CardTitle>
                          <CardDescription>{section.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader> */}
                                        <CardContent className="pt-6 flex-grow">
                                            <ul className="space-y-4">
                                                {section.benefits.map((benefit, idx) => (
                                                    <li key={idx} className="flex items-start gap-3 text-sm">
                                                        <span className="text-xl mt-[-2px]">{benefit.icon}</span>
                                                        <span>{benefit.text}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* KPIs Section */}
                <section className="py-16 md:py-24 bg-primary text-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <Badge className="mb-4 bg-white/20 text-white border-white/30">
                                <Target className="h-3 w-3 mr-1" />
                                Gestion Axée sur les Résultats (GAR)
                            </Badge>
                            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                                Objectifs de Performance 2026
                            </h2>
                            <p className="text-white/80 max-w-2xl mx-auto">
                                Des indicateurs clairs et mesurables pour garantir la transparence et l'efficacité.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {garKPIs.map((kpi, idx) => (
                                <div key={idx} className="p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-colors">
                                    <div className="text-2xl font-bold text-an-light mb-2">{kpi.target}</div>
                                    <p className="font-medium mb-1">{kpi.indicator}</p>
                                    <p className="text-sm text-white/60">{kpi.scope}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-16 md:py-24 bg-background">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto">
                            <div className="text-center mb-12">
                                <Badge variant="outline" className="mb-4">
                                    <HelpCircle className="h-3 w-3 mr-1" />
                                    Questions Fréquentes
                                </Badge>
                                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                                    Vos Questions sur le PAG 2026
                                </h2>
                            </div>

                            <Accordion type="single" collapsible className="w-full">
                                {faqItems.map((faq, idx) => (
                                    <AccordionItem key={idx} value={`item-${idx}`}>
                                        <AccordionTrigger className="text-left hover:no-underline">
                                            <span className="font-semibold">{faq.question}</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </div>
                </section>

                {/* Documents Section */}
                <section className="py-16 md:py-24 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <Badge variant="outline" className="mb-4">
                                <FileText className="h-3 w-3 mr-1" />
                                Documents Officiels
                            </Badge>
                            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                                Téléchargements
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                            {documentsOfficiels.map((doc, idx) => (
                                <Card
                                    key={idx}
                                    className="hover:shadow-lg transition-shadow cursor-pointer group"
                                    onClick={() => handleDownload(doc.filename, doc.title)}
                                >
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                                <FileText className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold group-hover:text-primary transition-colors">{doc.title}</h3>
                                                <p className="text-sm text-muted-foreground">{doc.format} • {doc.size}</p>
                                            </div>
                                            <Download className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 md:py-24 bg-gradient-to-r from-an to-an-dark text-white">
                    <div className="container mx-auto px-4 text-center">
                        <Sparkles className="h-12 w-12 mx-auto mb-6 text-white/80" />
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                            Participez à la Transformation du Gabon
                        </h2>
                        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                            Suivez l'avancement du PAG 2026 en temps réel et contribuez à l'amélioration des services publics.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link to="/modules?tab=gar">
                                <Button size="lg" className="bg-white text-an hover:bg-white/90">
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    Accéder au Tableau de Bord GAR
                                </Button>
                            </Link>
                            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                                Signaler / Suggérer
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <LandingFooter />
        </div>
    );
}
