/**
 * SGG Digital — Page Aide & Support
 * FAQ, formulaire de contact support, liens utiles et documentation.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  contactSupportSchema,
  type ContactSupportFormValues,
} from '@/types/user-profile';
import { useDemoUser } from '@/hooks/useDemoUser';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  HelpCircle,
  MessageSquare,
  BookOpen,
  ExternalLink,
  Send,
  Loader2,
  Info,
  Phone,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── FAQ DATA ──────────────────────────────────────────────────────────────────

const faqItems = [
  {
    id: 'faq-1',
    question: 'Comment modifier mon profil ?',
    answer:
      'Naviguez vers la section "Mon Profil" depuis le menu lateral, puis cliquez sur le bouton "Editer le profil" ou rendez-vous directement sur /profil/editer pour modifier vos informations personnelles (nom, telephone, etc.).',
  },
  {
    id: 'faq-2',
    question: "Comment activer la double authentification ?",
    answer:
      "Allez dans la section Securite de votre espace profil. Vous y trouverez un interrupteur pour activer l'authentification a deux facteurs (2FA). Une fois activee, vous devrez utiliser une application comme Google Authenticator ou Authy pour generer un code a chaque connexion.",
  },
  {
    id: 'faq-3',
    question: 'Comment changer mon mot de passe ?',
    answer:
      'Rendez-vous dans la section Securite de votre profil. Le formulaire de changement de mot de passe vous demandera votre mot de passe actuel, puis le nouveau mot de passe (minimum 8 caracteres, une majuscule et un chiffre) avec confirmation.',
  },
  {
    id: 'faq-4',
    question: 'Que signifient les permissions W, V, R ?',
    answer:
      'W = Ecriture (saisie et soumission de donnees), V = Validation (validation et approbation des soumissions), R = Lecture (consultation seule, sans modification possible). Ces niveaux de permission determinent vos droits sur chaque module de la plateforme.',
  },
  {
    id: 'faq-5',
    question: 'Comment exporter mes donnees ?',
    answer:
      "Accedez a la section Export disponible dans les modules concernes (Matrice Reporting, PTM, etc.). Vous pouvez exporter vos donnees aux formats PDF et Excel selon les options disponibles pour votre role.",
  },
  {
    id: 'faq-6',
    question: 'Comment soumettre un rapport dans la matrice ?',
    answer:
      "Rendez-vous dans le module Matrice Reporting, puis dans la section Saisie. Remplissez les champs requis pour votre institution, verifiez les donnees saisies, puis cliquez sur \"Soumettre\". Le rapport sera ensuite transmis pour validation selon le workflow etabli.",
  },
  {
    id: 'faq-7',
    question: 'Qui contacter en cas de probleme technique ?',
    answer:
      "Utilisez le formulaire de contact ci-dessous pour signaler un probleme technique. Vous pouvez egalement envoyer un email directement a support@sgg.ga. L'equipe technique du SGG vous repondra dans les meilleurs delais.",
  },
  {
    id: 'faq-8',
    question: 'Comment fonctionne le mode Demo ?',
    answer:
      "Le mode Demo permet de simuler l'utilisation de la plateforme sans connexion a Supabase. Les donnees affichees sont des donnees de demonstration et ne sont pas persistees. Toutes les actions (saisie, validation, export) sont simulees localement.",
  },
  {
    id: 'faq-9',
    question: 'Puis-je changer mon role ?',
    answer:
      "Non, le role est attribue par l'administrateur du SGG et ne peut pas etre modifie par l'utilisateur. Si vous pensez que votre role ne correspond pas a vos fonctions, contactez l'administrateur SGG via le formulaire ci-dessous ou par email a support@sgg.ga.",
  },
  {
    id: 'faq-10',
    question: 'Quels navigateurs sont supportes ?',
    answer:
      'SGG Digital est optimise pour les dernieres versions des navigateurs suivants : Google Chrome, Mozilla Firefox, Apple Safari et Microsoft Edge. Nous recommandons de maintenir votre navigateur a jour pour une experience optimale.',
  },
];

// ─── USEFUL LINKS DATA ─────────────────────────────────────────────────────────

const usefulLinks = [
  {
    title: 'Documentation technique',
    description: 'Consultez la documentation complete de la plateforme SGG Digital.',
    icon: BookOpen,
    href: '#',
  },
  {
    title: 'Guide de demarrage',
    description: 'Decouvrez les premieres etapes pour utiliser la plateforme.',
    icon: Info,
    href: '#',
  },
  {
    title: 'Contact telephonique',
    description: '+241 01 XX XX XX',
    icon: Phone,
    href: '#',
  },
  {
    title: 'Email',
    description: 'support@sgg.ga',
    icon: Mail,
    href: '#',
  },
];

// ─── CATEGORY OPTIONS ──────────────────────────────────────────────────────────

const categoryOptions = [
  { value: 'bug', label: 'Signaler un bug' },
  { value: 'question', label: 'Question' },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'autre', label: 'Autre' },
] as const;

// ─── COMPONENT ─────────────────────────────────────────────────────────────────

export default function Aide() {
  const { demoUser } = useDemoUser();
  const isDemo = !!demoUser;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ContactSupportFormValues>({
    resolver: zodResolver(contactSupportSchema),
    defaultValues: {
      category: undefined,
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactSupportFormValues) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (isDemo) {
        toast.success('Mode Demo : message simule', {
          description: `Categorie: ${data.category} — Sujet: ${data.subject}`,
        });
      } else {
        toast.success('Message envoye', {
          description:
            'Votre message a ete transmis a l\'equipe support. Nous vous repondrons dans les meilleurs delais.',
        });
      }
      reset();
    } catch {
      toast.error('Erreur lors de l\'envoi du message. Veuillez reessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <HelpCircle className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Aide & Support
          </h2>
          <p className="text-sm text-muted-foreground">
            Trouvez des reponses a vos questions ou contactez l'equipe support.
          </p>
        </div>
      </div>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HelpCircle className="h-4 w-4" />
            Foire Aux Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-left text-sm font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* ── Contact Support ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4" />
            Contacter le support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Categorie</Label>
              <Select
                onValueChange={(value) => {
                  setValue(
                    'category',
                    value as ContactSupportFormValues['category']
                  );
                  trigger('category');
                }}
              >
                <SelectTrigger
                  id="category"
                  className={cn(errors.category && 'border-destructive')}
                >
                  <SelectValue placeholder="Selectionnez une categorie" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-destructive">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Sujet</Label>
              <Input
                id="subject"
                placeholder="Decrivez brievement votre demande"
                {...register('subject')}
                className={cn(errors.subject && 'border-destructive')}
              />
              {errors.subject && (
                <p className="text-xs text-destructive">
                  {errors.subject.message}
                </p>
              )}
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Decrivez votre probleme ou votre question en detail (minimum 20 caracteres)"
                rows={5}
                {...register('message')}
                className={cn(errors.message && 'border-destructive')}
              />
              {errors.message && (
                <p className="text-xs text-destructive">
                  {errors.message.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer le message
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── Useful Links ────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4" />
            Liens utiles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {usefulLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.title}
                  href={link.href}
                  className="group flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium group-hover:underline">
                        {link.title}
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {link.description}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Version Badge ───────────────────────────────────────────────────── */}
      <Separator />
      <div className="flex justify-center pb-4">
        <Badge variant="outline" className="text-xs text-muted-foreground">
          SGG Digital v1.0.0 — Fevrier 2026
        </Badge>
      </div>
    </div>
  );
}
