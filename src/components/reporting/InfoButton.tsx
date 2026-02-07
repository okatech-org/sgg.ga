import { useState } from "react";
import { cn } from "@/lib/utils";
import { Info, BookOpen, Shield, Users, HelpCircle, Mail, ExternalLink, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PAGE_INFO_CONFIG, type PageInfoConfig } from "@/config/pageInfoConfig";

interface InfoButtonProps {
  pageId: string;
  className?: string;
}

export function InfoButton({ pageId, className }: InfoButtonProps) {
  const [open, setOpen] = useState(false);
  const config = PAGE_INFO_CONFIG[pageId];
  if (!config) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8 rounded-full border border-muted-foreground/20 hover:border-government-gold hover:bg-government-gold/10", className)}
        onClick={() => setOpen(true)}
        aria-label="Informations sur cette page"
      >
        <Info className="h-4 w-4" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-government-gold/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-government-gold" />
              </div>
              <div>
                <SheetTitle className="text-lg">{config.titre}</SheetTitle>
                <SheetDescription>{config.sousTitre}</SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Objectif */}
            <section>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <HelpCircle className="h-4 w-4 text-government-gold" />
                Objectif
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{config.objectif}</p>
            </section>

            <Separator />

            {/* Workflow */}
            {config.workflow && (
              <>
                <section>
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                    <Workflow className="h-4 w-4 text-government-gold" />
                    Workflow / Processus
                  </h3>
                  <div className="space-y-2">
                    {config.workflow.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-government-navy text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{step.etape}</p>
                          <p className="text-xs text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                <Separator />
              </>
            )}

            {/* Droits d'accès */}
            {config.droitsAcces && (
              <>
                <section>
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-government-gold" />
                    Droits d'accès
                  </h3>
                  <div className="space-y-2">
                    {config.droitsAcces.map((droit, i) => (
                      <div key={i} className="flex items-center justify-between py-1">
                        <span className="text-sm">{droit.role}</span>
                        <Badge variant={droit.niveau === 'Écriture' ? 'default' : droit.niveau === 'Validation' ? 'secondary' : 'outline'} className="text-xs">
                          {droit.niveau}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </section>
                <Separator />
              </>
            )}

            {/* Logique métier */}
            {config.logique && (
              <>
                <section>
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-government-gold" />
                    Logique métier
                  </h3>
                  <Accordion type="single" collapsible className="w-full">
                    {config.logique.map((item, i) => (
                      <AccordionItem key={i} value={`logique-${i}`}>
                        <AccordionTrigger className="text-sm">{item.titre}</AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                          {item.contenu}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
                <Separator />
              </>
            )}

            {/* Support */}
            {config.support && (
              <section>
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Mail className="h-4 w-4 text-government-gold" />
                  Support & Assistance
                </h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm">{config.support.description}</p>
                  {config.support.contact && (
                    <p className="text-xs text-muted-foreground">
                      Contact : {config.support.contact}
                    </p>
                  )}
                  {config.support.documentation && (
                    <Button variant="outline" size="sm" className="mt-2">
                      <ExternalLink className="h-3 w-3 mr-2" />
                      Consulter la documentation
                    </Button>
                  )}
                </div>
              </section>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
