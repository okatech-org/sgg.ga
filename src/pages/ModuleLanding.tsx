
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, CheckCircle2, Shield } from "lucide-react";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import { modulesData } from "@/data/modulesData";
// import { FadeInUp } from "@/components/ui/motion"; // Temporarily removed for debugging
// import { ImageWithSkeleton } from "@/components/landing/ImageWithSkeleton"; // Temporarily removed
import NotFound from "./NotFound";

const colorMap: Record<string, { bg: string, text: string, darkBg: string, darkText: string, iconBg: string }> = {
    blue: { bg: "bg-blue-100", text: "text-blue-700", darkBg: "dark:bg-blue-900/30", darkText: "dark:text-blue-300", iconBg: "bg-blue-500/5" },
    green: { bg: "bg-green-100", text: "text-green-700", darkBg: "dark:bg-green-900/30", darkText: "dark:text-green-300", iconBg: "bg-green-500/5" },
    amber: { bg: "bg-amber-100", text: "text-amber-700", darkBg: "dark:bg-amber-900/30", darkText: "dark:text-amber-300", iconBg: "bg-amber-500/5" },
    purple: { bg: "bg-purple-100", text: "text-purple-700", darkBg: "dark:bg-purple-900/30", darkText: "dark:text-purple-300", iconBg: "bg-purple-500/5" },
    red: { bg: "bg-red-100", text: "text-red-700", darkBg: "dark:bg-red-900/30", darkText: "dark:text-red-300", iconBg: "bg-red-500/5" },
};

export default function ModuleLandingPage() {
    const { moduleId } = useParams<{ moduleId: string }>();

    // Find module data
    const module = Object.values(modulesData).find(m => m.id === moduleId);

    if (!module) {
        return <NotFound />;
    }

    const Icon = module.icon;
    const colors = colorMap[module.color] || colorMap.blue;

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <LandingHeader />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative py-20 md:py-32 overflow-hidden bg-muted/20">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="flex flex-col md:flex-row gap-12 items-center">
                            <div className="flex-1 space-y-6">
                                <div>
                                    <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${colors.bg} ${colors.text} ${colors.darkBg} ${colors.darkText}`}>
                                        <Icon className="h-4 w-4" />
                                        <span className="font-medium text-sm">Application SGG</span>
                                    </div>
                                </div>

                                <div>
                                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight">
                                        {module.title}
                                    </h1>
                                </div>

                                <div>
                                    <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                                        {module.fullDescription}
                                    </p>
                                </div>

                                <div className="pt-4">
                                    <Link to={`/auth?redirect=${encodeURIComponent(module.appLink)}`}>
                                        <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                                            <Lock className="h-4 w-4" />
                                            Accès Réservé (Connexion)
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <p className="text-sm text-muted-foreground mt-3 italic">
                                        * L'accès à ce module est strictement réservé aux agents habilités.
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 w-full max-w-lg md:max-w-none">
                                <div>
                                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-background">
                                        <div className="aspect-video relative">
                                            <img
                                                src={module.image}
                                                alt={module.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                                                <div className="text-white">
                                                    <p className="font-serif text-lg italic">"Moderniser l'État, servir le Citoyen"</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Background decoration */}
                    <div className={`absolute top-0 right-0 w-1/3 h-full ${colors.iconBg} blur-3xl -z-10 rounded-l-full`} />
                </section>

                {/* SGG Role Section */}
                <section className="py-20 bg-background">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-12 gap-12">
                            <div className="md:col-span-5 lg:col-span-4">
                                <div className="sticky top-24 p-6 rounded-2xl bg-muted/30 border border-border">
                                    <h3 className="text-xl font-bold font-serif mb-4 flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-an" />
                                        Le Rôle du SGG
                                    </h3>
                                    <div className="w-12 h-1 bg-an rounded-full mb-6" />
                                    <p className="text-muted-foreground leading-relaxed">
                                        {module.sggRole}
                                    </p>
                                </div>
                            </div>

                            <div className="md:col-span-7 lg:col-span-8 space-y-12">
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-bold mb-8">Fonctionnalités Clés</h3>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        {module.features.map((feature, idx) => (
                                            <div
                                                key={idx}
                                                className="flex gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors"
                                            >
                                                <div className={`mt-1 h-8 w-8 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0 ${colors.text} ${colors.darkBg} ${colors.darkText}`}>
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-foreground mb-1">Fonctionnalité {idx + 1}</h4>
                                                    <p className="text-muted-foreground">{feature}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-primary/5 p-8 border border-primary/10">
                                    <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                                        <div>
                                            <h4 className="text-xl font-bold mb-2">Besoin d'un accès ?</h4>
                                            <p className="text-muted-foreground">
                                                Les comptes sont gérés par la Direction des Systèmes d'Information (DSI).
                                            </p>
                                        </div>
                                        <Link to="/about">
                                            <Button variant="outline" className="whitespace-nowrap">
                                                Contacter la DSI
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <LandingFooter />
        </div>
    );
}
