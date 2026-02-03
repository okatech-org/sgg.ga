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
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-an shadow-an">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-serif font-bold">SGG Digital</p>
                <p className="text-xs text-primary-foreground/60">République Gabonaise</p>
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
