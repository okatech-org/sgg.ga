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
  { label: "PAG 2026", href: "/pag-2026" },
  { label: "Modules", href: "/modules" },
  { label: "Journal Officiel", href: "/journal-officiel" },
  { label: "À propos", href: "/about" },
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
        <Link to="/" className="flex items-center gap-4">
          <img src="/emblem_gabon.png" alt="Emblème du Gabon" className="h-[60px] w-[60px] object-contain" />
          <div className="flex flex-col items-start justify-center">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground leading-tight w-full mb-1">Présidence de la République</span>
            <span className="font-serif font-black text-[13.5px] uppercase leading-none tracking-normal text-primary dark:text-an-light w-full">Secrétariat Général</span>
            <span className="font-serif font-black text-[12.5px] uppercase leading-none tracking-[0.2em] text-primary dark:text-an-light w-full">du Gouvernement</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link, index) => (
            link.href.startsWith('/') ? (
              <Link
                key={index}
                to={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-an transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={index}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-an transition-colors"
              >
                {link.label}
              </a>
            )
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
                <div className="flex items-center gap-4 mb-8">
                  <img src="/emblem_gabon.png" alt="Emblème du Gabon" className="h-[60px] w-[60px] object-contain" />
                  <div className="flex flex-col items-start justify-center">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground leading-tight w-full mb-1">Présidence de la République</span>
                    <span className="font-serif font-black text-[13.5px] uppercase leading-none tracking-normal text-primary dark:text-an-light w-full">Secrétariat Général</span>
                    <span className="font-serif font-black text-[12.5px] uppercase leading-none tracking-[0.2em] text-primary dark:text-an-light w-full">du Gouvernement</span>
                  </div>
                </div>

                <nav className="flex flex-col gap-4 flex-1">
                  {navLinks.map((link, index) => (
                    link.href.startsWith('/') ? (
                      <Link
                        key={index}
                        to={link.href}
                        onClick={() => setIsOpen(false)}
                        className="text-lg font-medium text-foreground hover:text-an transition-colors py-2 border-b"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        key={index}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="text-lg font-medium text-foreground hover:text-an transition-colors py-2 border-b"
                      >
                        {link.label}
                      </a>
                    )
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
