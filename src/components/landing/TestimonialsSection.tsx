import { Star, Quote } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const testimonials = [
  {
    name: "Marie-Claire Ondo",
    role: "Secrétaire Général, Ministère de l'Économie",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    quote: "La plateforme SGG Digital a transformé notre façon de travailler. Les processus de nomination sont désormais transparents et traçables.",
    rating: 5
  },
  {
    name: "Jean-Pierre Moussavou",
    role: "Directeur de Cabinet, Primature",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    quote: "Le tableau de bord GAR nous permet de suivre l'avancement du PAG en temps réel. Un outil indispensable pour le pilotage gouvernemental.",
    rating: 5
  },
  {
    name: "Léonie Nzamba",
    role: "Chargée de Mission, SGPR",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    quote: "L'accès au Journal Officiel en ligne facilite grandement notre travail quotidien. La recherche est rapide et les textes toujours à jour.",
    rating: 5
  },
  {
    name: "Emmanuel Obame",
    role: "Conseiller Juridique, Ministère de la Justice",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    quote: "Le cycle législatif dématérialisé a considérablement réduit les délais de traitement des textes. Une vraie révolution administrative.",
    rating: 5
  }
];

const partners = [
  { name: "Primature", opacity: "opacity-60" },
  { name: "SGPR", opacity: "opacity-50" },
  { name: "Ministère de l'Économie", opacity: "opacity-55" },
  { name: "Ministère de la Justice", opacity: "opacity-50" },
  { name: "Ministère des Finances", opacity: "opacity-60" },
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ce qu'ils disent de <span className="text-government-gold">SGG Digital</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Retours d'expérience des utilisateurs de la plateforme
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative px-12 mb-16">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="h-full bg-card/80 backdrop-blur-sm border rounded-2xl p-6 flex flex-col transition-all duration-300 hover:shadow-gov-lg hover:bg-card">
                    {/* Quote Icon */}
                    <Quote className="h-8 w-8 text-government-gold/30 mb-4" />
                    
                    {/* Quote Text */}
                    <p className="text-foreground mb-6 flex-1 italic">
                      "{testimonial.quote}"
                    </p>
                    
                    {/* Rating */}
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-government-gold text-government-gold" />
                      ))}
                    </div>
                    
                    {/* Author */}
                    <div className="flex items-center gap-3">
                      <img 
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="h-12 w-12 rounded-full object-cover border-2 border-government-gold/20"
                      />
                      <div>
                        <p className="font-semibold text-foreground">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>

        {/* Partners/Institutions */}
        <div className="border-t pt-12">
          <p className="text-center text-sm text-muted-foreground mb-6">
            INSTITUTIONS CONNECTÉES
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {partners.map((partner, index) => (
              <div 
                key={index}
                className={`${partner.opacity} hover:opacity-100 transition-opacity duration-300 text-lg font-semibold text-foreground`}
              >
                {partner.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
