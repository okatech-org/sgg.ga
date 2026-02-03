import { Link } from "react-router-dom";
import { 
  BarChart3, 
  Users, 
  FileText, 
  BookOpen, 
  Building2, 
  ScrollText,
  ChevronRight 
} from "lucide-react";
import { useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { FadeInView, StaggerView, StaggerItem, ScaleOnHover } from "@/components/ui/motion";

const quickLinks = [
  {
    icon: BarChart3,
    title: "Tableau de Bord GAR",
    description: "Suivi de l'exécution du PAG",
    href: "/dashboard",
    color: "bg-an",
  },
  {
    icon: Users,
    title: "Portail Nominations",
    description: "Gestion des nominations",
    href: "/nominations",
    color: "bg-success",
  },
  {
    icon: FileText,
    title: "Cycle Législatif",
    description: "Textes en cours d'examen",
    href: "/cycle-legislatif",
    color: "bg-info",
  },
  {
    icon: Building2,
    title: "Institutions",
    description: "Annuaire des ministères",
    href: "/institutions",
    color: "bg-primary",
  },
  {
    icon: ScrollText,
    title: "e-Gop",
    description: "Conseils Interministériels",
    href: "/egop",
    color: "bg-an-dark",
  },
  {
    icon: BookOpen,
    title: "Journal Officiel",
    description: "Textes juridiques officiels",
    href: "/journal-officiel",
    color: "bg-warning",
  },
];

export default function QuickLinksSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <FadeInView>
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-2">
              Accès Rapide
            </h2>
            <p className="text-muted-foreground">
              Naviguez directement vers les modules principaux
            </p>
          </div>
        </FadeInView>

        {/* Mobile: Horizontal Scroll */}
        {isMobile ? (
          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {quickLinks.map((link, index) => (
              <Link 
                key={index} 
                to={link.href}
                className="flex-shrink-0 w-[280px] snap-start"
              >
                <div className="neu-card p-5 h-full transition-all duration-300 hover:shadow-an active:scale-[0.98]">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-lg ${link.color} flex items-center justify-center flex-shrink-0 shadow-elegant`}>
                      <link.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-semibold text-foreground truncate">{link.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{link.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Desktop: Grid Layout */
          <StaggerView className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link, index) => (
              <StaggerItem key={index}>
                <Link to={link.href} className="group block">
                  <ScaleOnHover>
                    <div className="neu-card p-5 h-full transition-all duration-300 hover:shadow-an-lg">
                      <div className="flex items-center gap-4">
                        <motion.div 
                          className={`h-12 w-12 rounded-lg ${link.color} flex items-center justify-center shadow-elegant`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <link.icon className="h-6 w-6 text-white" />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="font-serif font-semibold text-foreground group-hover:text-an transition-colors">
                            {link.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{link.description}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-an group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </ScaleOnHover>
                </Link>
              </StaggerItem>
            ))}
          </StaggerView>
        )}
      </div>
    </section>
  );
}
