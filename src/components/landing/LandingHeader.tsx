import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Globe, 
  ArrowRight, 
  Menu,
  Home
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "Modules", href: "#features" },
  { label: "À propos", href: "#about" },
  { label: "Journal Officiel", href: "/journal-officiel" },
];

export default function LandingHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-government-navy">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-government-navy dark:text-government-gold">SGG Digital</span>
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
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link to="/demo">
            <Button variant="outline" size="default">
              Accès Démo
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="hero" size="default">
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-government-navy">
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-government-navy dark:text-government-gold">SGG Digital</span>
                </div>
                
                <nav className="flex flex-col gap-4 flex-1">
                  {navLinks.map((link, index) => (
                    <a 
                      key={index}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-foreground hover:text-government-gold transition-colors py-2 border-b"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
                
                <div className="flex flex-col gap-3 pt-6 border-t">
                  <Link to="/demo" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Accès Démo
                    </Button>
                  </Link>
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="hero" className="w-full">
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
    </header>
  );
}
