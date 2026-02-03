import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Globe, 
  ArrowRight, 
  Menu
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion } from "framer-motion";

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "Modules", href: "#features" },
  { label: "À propos", href: "#about" },
  { label: "Journal Officiel", href: "/journal-officiel" },
];

export default function LandingHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.header 
      className="sticky top-0 z-50 w-full border-b glass"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-an shadow-an">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-serif font-bold text-primary dark:text-an-light">SGG Digital</span>
            <span className="hidden md:inline text-sm text-muted-foreground ml-2">
              République Gabonaise
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link, index) => (
            <a 
              key={index}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-an transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link to="/demo">
            <Button variant="an-outline" size="default">
              Accès Démo
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="an" size="default">
              Se connecter
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-an">
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-serif font-bold text-primary dark:text-an-light">SGG Digital</span>
                </div>
                
                <nav className="flex flex-col gap-4 flex-1">
                  {navLinks.map((link, index) => (
                    <a 
                      key={index}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-foreground hover:text-an transition-colors py-2 border-b"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
                
                <div className="flex flex-col gap-3 pt-6 border-t">
                  <Link to="/demo" onClick={() => setIsOpen(false)}>
                    <Button variant="an-outline" className="w-full">
                      Accès Démo
                    </Button>
                  </Link>
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="an" className="w-full">
                      Se connecter
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
