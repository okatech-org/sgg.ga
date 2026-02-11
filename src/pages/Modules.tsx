import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { modulesData } from "@/data/modulesData";
import { ModuleDetail } from "@/components/modules/ModuleDetail";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

const Modules = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const defaultTab = searchParams.get("tab") || "gar";
    // Convert modulesData object to array
    const modules = Object.values(modulesData);

    // Sort logic to ensure specific order if needed (optional), currently relying on data order
    // Order: GAR, Nominations, Cycle Legislatif, e-GOP, Institutions, Journal Officiel is handled by data object order or we can sort manually

    const handleTabChange = (value: string) => {
        setSearchParams({ tab: value });
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <LandingHeader />

            <main className="flex-grow container mx-auto px-4 py-12 md:py-24">
                <div className="text-center mb-12 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                        Modules Applicatifs
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Accédez aux différents services et applications de la plateforme gouvernementale.
                    </p>
                </div>

                <Tabs
                    defaultValue={defaultTab}
                    value={searchParams.get("tab") || "gar"}
                    onValueChange={handleTabChange}
                    className="w-full space-y-8"
                >
                    <div className="flex justify-center w-full px-4 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
                        <TabsList className="h-auto w-auto p-1 bg-muted/50 backdrop-blur-sm border border-border/50 rounded-full flex-nowrap inline-flex min-w-max">
                            {modules.map((module) => {
                                // Shorter labels for tab display
                                const shortTitle = module.title
                                    .replace('Gestion Axée sur les Résultats (GAR)', 'GAR')
                                    .replace('Portail des Nominations', 'Nominations')
                                    .replace('La Fabrique de la Loi', 'Cycle Législatif')
                                    .replace('e-GOP (Conseil des Ministres)', 'e-GOP')
                                    .replace('Annuaire des Institutions', 'Institutions')
                                    .replace('Journal Officiel (Open Data)', 'Journal Officiel')
                                    .replace('Programme de Travail Ministériel (PTM/PTG)', 'PTM/PTG');
                                return (
                                    <TabsTrigger
                                        key={module.id}
                                        value={module.id}
                                        className="rounded-full px-3 py-2 md:px-5 md:py-3 text-xs md:text-sm data-[state=active]:bg-background data-[state=active]:text-primary transition-all whitespace-nowrap"
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <module.icon className="h-4 w-4 flex-shrink-0" />
                                            <span>{shortTitle}</span>
                                        </div>
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </div>

                    {modules.map((module) => (
                        <TabsContent key={module.id} value={module.id} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                            <ModuleDetail module={module} />
                        </TabsContent>
                    ))}
                </Tabs>
            </main>

            <LandingFooter />
        </div>
    );
};

export default Modules;
