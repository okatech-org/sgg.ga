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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {contactInfo.map((item, index) => (
            <a 
              key={index}
              href={item.href}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border transition-all duration-300 hover:shadow-gov hover:border-government-gold/30 group"
            >
              <div className="h-12 w-12 rounded-lg bg-government-navy/10 flex items-center justify-center flex-shrink-0 group-hover:bg-government-gold/10 transition-colors">
                <item.icon className="h-5 w-5 text-government-navy group-hover:text-government-gold transition-colors" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="font-medium text-foreground">{item.value}</p>
              </div>
            </a>
          ))}
        </div>
        
        {/* Social Links */}
        <div className="flex items-center justify-center gap-4">
          <span className="text-sm text-muted-foreground">Suivez-nous :</span>
          <div className="flex gap-2">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                aria-label={social.label}
                className="h-10 w-10 rounded-full bg-card border flex items-center justify-center transition-all duration-300 hover:bg-government-navy hover:text-white hover:border-government-navy"
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
