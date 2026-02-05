import { Link } from "react-router-dom";
import { Globe } from "lucide-react";
import { motion } from "framer-motion";

const footerLinks = {
  platform: [
    { label: "Tableau de Bord", href: "/dashboard" },
    { label: "Nominations", href: "/nominations" },
    { label: "Cycle Législatif", href: "/cycle-legislatif" },
    { label: "Journal Officiel", href: "/journal-officiel" },
  ],
  resources: [
    { label: "Documentation", href: "#" },
    { label: "Guide d'utilisation", href: "#" },
    { label: "FAQ", href: "#" },
    { label: "Support", href: "#" },
  ],
  legal: [
    { label: "Mentions légales", href: "#" },
    { label: "Politique de confidentialité", href: "#" },
    { label: "Conditions d'utilisation", href: "#" },
    { label: "Accessibilité", href: "#" },
  ],
};

export default function LandingFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <img src="/emblem_gabon.png" alt="Emblème du Gabon" className="h-[60px] w-[60px] object-contain" />
              <div className="flex flex-col items-start justify-center">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-primary-foreground/80 leading-tight w-full mb-1">Présidence de la République</span>
                <span className="font-serif font-black text-[13.5px] uppercase leading-none tracking-normal w-full text-white">Secrétariat Général</span>
                <span className="font-serif font-black text-[12.5px] uppercase leading-none tracking-[0.2em] w-full text-white">du Gouvernement</span>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/70 max-w-xs">
              Plateforme officielle de digitalisation du Secrétariat Général du Gouvernement.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-serif font-semibold text-an-light mb-4">Plateforme</h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-serif font-semibold text-an-light mb-4">Ressources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-serif font-semibold text-an-light mb-4">Légal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/60">
            © 2026 Secrétariat Général du Gouvernement. Tous droits réservés.
          </p>
          <p className="text-sm text-primary-foreground/60">
            Ve République Gabonaise
          </p>
        </div>
      </div>
    </footer>
  );
}
