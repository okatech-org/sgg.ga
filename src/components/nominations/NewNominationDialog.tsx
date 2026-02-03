import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  // Candidat
  nom: z.string().min(2, "Le nom est requis"),
  prenom: z.string().min(2, "Le prénom est requis"),
  dateNaissance: z.string().min(1, "La date de naissance est requise"),
  email: z.string().email("Email invalide"),
  
  // Poste
  poste: z.string().min(2, "Le poste est requis"),
  grade: z.string().min(1, "Le grade est requis"),
  direction: z.string().min(2, "La direction est requise"),
  ministere: z.string().min(1, "Le ministère est requis"),
  
  // Documents
  cvUploaded: z.boolean(),
  acteNaissanceUploaded: z.boolean(),
  diplomesUploaded: z.boolean(),
  casierUploaded: z.boolean(),
  
  // Confirmation
  confirmDelai: z.boolean().refine((val) => val === true, {
    message: "Vous devez confirmer le respect du délai de 30 jours",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface NewNominationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ministeres = [
  "Ministère de l'Économie et des Finances",
  "Ministère de la Santé",
  "Ministère de l'Éducation Nationale",
  "Ministère de l'Intérieur",
  "Ministère des Affaires Étrangères",
  "Ministère de la Défense",
  "Ministère de la Justice",
  "Ministère des Travaux Publics",
  "Ministère de l'Agriculture",
  "Ministère de l'Environnement",
];

const grades = [
  "Hors Échelle A",
  "Hors Échelle B",
  "Catégorie A1",
  "Catégorie A2",
  "Catégorie B1",
  "Catégorie B2",
];

export function NewNominationDialog({ open, onOpenChange }: NewNominationDialogProps) {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      dateNaissance: "",
      email: "",
      poste: "",
      grade: "",
      direction: "",
      ministere: "",
      cvUploaded: false,
      acteNaissanceUploaded: false,
      diplomesUploaded: false,
      casierUploaded: false,
      confirmDelai: false,
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log("Nomination submitted:", data);
    toast({
      title: "Nomination soumise",
      description: "Le dossier a été transmis au SGG pour contrôle de recevabilité.",
    });
    onOpenChange(false);
    form.reset();
    setStep(1);
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle Proposition de Nomination</DialogTitle>
          <DialogDescription>
            Étape {step}/3 — {step === 1 ? "Informations du Candidat" : step === 2 ? "Poste Proposé" : "Documents & Validation"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded ${s <= step ? "bg-government-navy" : "bg-muted"}`}
            />
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Step 1: Candidat */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input placeholder="MBOUMBA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="prenom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <Input placeholder="Jean-Pierre" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="dateNaissance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de naissance</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email professionnel</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="jp.mboumba@gouv.ga" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Step 2: Poste */}
            {step === 2 && (
              <>
                <FormField
                  control={form.control}
                  name="ministere"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ministère de destination</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un ministère" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ministeres.map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="direction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Direction / Service</FormLabel>
                      <FormControl>
                        <Input placeholder="Direction Générale du Budget" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="poste"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intitulé du poste</FormLabel>
                      <FormControl>
                        <Input placeholder="Directeur Général" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un grade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {grades.map((g) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Step 3: Documents */}
            {step === 3 && (
              <>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Téléversez les documents requis (PDF, max 5 Mo chacun)
                  </p>

                  {[
                    { name: "cvUploaded" as const, label: "CV détaillé" },
                    { name: "acteNaissanceUploaded" as const, label: "Extrait d'acte de naissance" },
                    { name: "diplomesUploaded" as const, label: "Copies certifiées des diplômes" },
                    { name: "casierUploaded" as const, label: "Casier judiciaire (si applicable)" },
                  ].map((doc) => (
                    <FormField
                      key={doc.name}
                      control={form.control}
                      name={doc.name}
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <FormLabel className="!mt-0 cursor-pointer">
                              {doc.label}
                            </FormLabel>
                          </div>
                          <Button type="button" variant="outline" size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Parcourir
                          </Button>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                <div className="bg-status-warning/10 border border-status-warning/30 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-status-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Délai réglementaire</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Conformément à l'article 5 du décret n°0273/PR, la proposition 
                        doit être soumise au moins 30 jours avant le Conseil des Ministres.
                      </p>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="confirmDelai"
                  render={({ field }) => (
                    <FormItem className="flex items-start gap-3 p-3 border rounded-lg">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-0.5"
                      />
                      <div>
                        <FormLabel className="cursor-pointer">
                          Je confirme le respect du délai de 30 jours
                        </FormLabel>
                        <FormDescription>
                          Le dossier sera automatiquement rejeté si ce délai n'est pas respecté.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={step === 1 ? () => onOpenChange(false) : handleBack}
              >
                {step === 1 ? "Annuler" : "Précédent"}
              </Button>
              {step < 3 ? (
                <Button type="button" onClick={handleNext}>
                  Suivant
                </Button>
              ) : (
                <Button type="submit" variant="government">
                  Soumettre la Nomination
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
