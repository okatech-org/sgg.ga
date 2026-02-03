import { 
  Phone, 
  MapPin, 
  Mail, 
  Clock,
  Facebook,
  Twitter,
  Linkedin,
  Youtube
} from "lucide-react";
import { motion } from "framer-motion";
import { FadeInView, StaggerView, StaggerItem, ScaleOnHover } from "@/components/ui/motion";

const contactInfo = [
  {
    icon: Phone,
    label: "Téléphone",
    value: "+241 01 76 XX XX",
    href: "tel:+24101760000"
  },
  {
    icon: MapPin,
    label: "Adresse",
    value: "Boulevard Triomphal, Libreville",
    href: "#"
  },
  {
    icon: Mail,
    label: "Email",
    value: "contact@sgg.ga",
    href: "mailto:contact@sgg.ga"
  },
  {
    icon: Clock,
    label: "Horaires",
    value: "Lun-Ven : 8h-17h",
    href: "#"
  }
];

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" }
];

export default function ContactPreFooter() {
  return (
    <section className="py-12 bg-muted/50 border-t">
      <div className="container mx-auto px-4">
        <StaggerView className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {contactInfo.map((item, index) => (
            <StaggerItem key={index}>
              <a 
                href={item.href}
                className="block"
              >
                <ScaleOnHover>
                  <div className="flex items-center gap-4 p-4 neu-card group">
                    <div className="h-12 w-12 rounded-lg bg-an/10 flex items-center justify-center flex-shrink-0 group-hover:bg-an/20 transition-colors">
                      <item.icon className="h-5 w-5 text-an" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="font-medium text-foreground">{item.value}</p>
                    </div>
                  </div>
                </ScaleOnHover>
              </a>
            </StaggerItem>
          ))}
        </StaggerView>
        
        {/* Social Links */}
        <FadeInView delay={0.4}>
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm text-muted-foreground">Suivez-nous :</span>
            <div className="flex gap-2">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="h-10 w-10 rounded-full neu-card flex items-center justify-center transition-all duration-300 hover:bg-an hover:text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
