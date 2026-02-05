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
                    <div className="flex justify-center w-full px-4 overflow-x-auto pb-4 md:pb-0">
                        <TabsList className="h-auto w-auto p-1 bg-muted/50 backdrop-blur-sm border border-border/50 rounded-full flex-nowrap inline-flex min-w-max">
                            {modules.map((module) => (
                                <TabsTrigger
                                    key={module.id}
                                    value={module.id}
                                    className="rounded-full px-4 py-2 md:px-6 md:py-3 text-sm md:text-base data-[state=active]:bg-background data-[state=active]:text-primary transition-all"
                                >
                                    <div className="flex items-center gap-2">
                                        <module.icon className="h-4 w-4" />
                                        <span>{module.title.split('(')[0].trim()}</span>
                                    </div>
                                </TabsTrigger>
                            ))}
                            {/* Manually adding Journal Officiel if it wasn't in modulesData, but it should be? 
                                Actually JO is often treated separately but if it's in modulesData likely we want it here.
                                Let's check modulesData structure above. It is there if we added it?
                                Wait, modulesData.ts from previous step had: gar, nominations, cycleLegislatif, egop, institutions.
                                Ah, wait, JO was NOT in modulesData.ts in my previous write_file step 228!
                                I should verify this.
                            */}
                        </TabsList>
                    </div>

                    {modules.map((module) => (
                        <TabsContent key={module.id} value={module.id} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                            <ModuleDetail module={module} />
                        </TabsContent>
                    ))}

                    {/* Add content specifically for Journal Officiel if it's not in modulesData usually? 
                        The user asked to align "Modules Applicatifs". 
                        If JO is considered a module, it should be there.
                        But modulesData usually contains only private apps.
                        However, the user request implies grouping all under "Modules Applicatifs".
                        Let's check if I should add JO to data or handle it separately.
                        The user said "Modules Applicatifs" page.
                        If I check modulesData, I see: gar, nominations, cycleLegislatif, egop, institutions.
                        Wait, Modules.tsx original file HAD Journal Officiel in the list (lines 51-57 of step 224)!
                        So I MUST include Journal Officiel in the tabs.
                        I need to update modulesData.ts to include Journal Officiel OR handle it manually here.
                        Better to add it to modulesData.ts for consistency.
                    */}
                </Tabs>
            </main>

            <LandingFooter />
        </div>
    );
};

export default Modules;
