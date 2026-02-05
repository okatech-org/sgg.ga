/**
 * SGG Digital - Section Portail Public
 * Pour: Citoyen, Professionnel du Droit
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  FileText,
  BookOpen,
  Calendar,
  ArrowRight,
  Download,
  ExternalLink,
  Scale,
  Building2,
  Code,
  Key,
  Bookmark,
} from "lucide-react";
import { publicData } from "@/data/demoData";

interface PublicPortalSectionProps {
  roleId?: string;
}

export function PublicPortalSection({ roleId }: PublicPortalSectionProps) {
  const isProfessionnel = roleId === "professionnel-droit";
  const { publicationsRecentes, categoriesPopulaires, recherchesPopulaires } = publicData;

  return (
    <div className="space-y-6">
      {/* Search Bar - Hero style */}
      <Card className="shadow-gov bg-gradient-to-r from-government-navy to-government-navy/90 text-white">
        <CardContent className="py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-2">
              Journal Officiel de la République Gabonaise
            </h2>
            <p className="text-white/80 mb-6">
              Accédez aux textes officiels : lois, décrets, arrêtés et nominations
            </p>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher un texte, une loi, un décret..."
                className="pl-12 py-6 text-lg bg-white text-foreground"
              />
              <Button className="absolute right-2 top-1/2 -translate-y-1/2" variant="government">
                Rechercher
              </Button>
            </div>
            {isProfessionnel && (
              <div className="flex justify-center gap-2 mt-4 flex-wrap">
                {recherchesPopulaires.slice(0, 4).map((recherche, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-white/10 text-white border-white/20 cursor-pointer hover:bg-white/20"
                  >
                    {recherche}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Publications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Publications récentes */}
          <Card className="shadow-gov">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-government-navy" />
                Publications Récentes
              </CardTitle>
              <Button variant="outline" size="sm">
                Voir tout
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {publicationsRecentes.map((pub) => (
                  <div
                    key={pub.id}
                    className="flex items-start justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {pub.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {pub.numeroJO}
                        </span>
                      </div>
                      <h4 className="font-medium">{pub.titre}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Publié le {new Date(pub.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Catégories de textes */}
          <Card className="shadow-gov">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-government-navy" />
                Parcourir par Catégorie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categoriesPopulaires.map((cat, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border hover:border-government-gold/50 hover:bg-muted/50 transition-colors cursor-pointer text-center"
                  >
                    <div className="text-2xl font-bold text-government-navy">
                      {cat.count}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {cat.nom}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section Professionnel - Accès API */}
          {isProfessionnel && (
            <Card className="shadow-gov border-government-gold/30">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-government-gold" />
                  Accès API Développeurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <code className="text-sm">
                    GET https://api.jo.ga/v1/textes?type=loi&annee=2026
                  </code>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Intégrez les textes officiels dans vos applications. Accès en lecture
                  aux lois, décrets, arrêtés et nomenclatures.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Key className="h-4 w-4 mr-2" />
                    Demander une clé API
                  </Button>
                  <Button variant="ghost">
                    Documentation
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Accès rapide */}
          <Card className="shadow-gov">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Accès Rapide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Scale className="h-4 w-4 mr-2" />
                  Constitution du Gabon
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Codes et Lois
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Building2 className="h-4 w-4 mr-2" />
                  Organigramme Gouvernement
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Archives JO
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Éditions JO */}
          <Card className="shadow-gov">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-government-navy" />
                Dernières Éditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { numero: "JO n°16/2026", date: "05 février 2026", textes: 12 },
                  { numero: "JO n°15/2026", date: "30 janvier 2026", textes: 18 },
                  { numero: "JO n°14/2026", date: "25 janvier 2026", textes: 15 },
                ].map((edition, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer"
                  >
                    <div>
                      <p className="font-medium text-sm">{edition.numero}</p>
                      <p className="text-xs text-muted-foreground">{edition.date}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {edition.textes} textes
                    </Badge>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4" size="sm">
                Toutes les éditions
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Info professionnel */}
          {isProfessionnel && (
            <Card className="shadow-gov">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bookmark className="h-5 w-5 text-government-gold" />
                  Outils Pro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm font-medium">Veille juridique</p>
                    <p className="text-xs text-muted-foreground">
                      Alertes sur les nouveaux textes
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm font-medium">Export en masse</p>
                    <p className="text-xs text-muted-foreground">
                      Téléchargez plusieurs textes
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm font-medium">Recherche avancée</p>
                    <p className="text-xs text-muted-foreground">
                      Filtres par date, type, domaine
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info citoyen */}
          {!isProfessionnel && (
            <Card className="shadow-gov bg-government-gold/5 border-government-gold/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Besoin d'aide ?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Vous cherchez un texte spécifique ? Notre équipe peut vous aider
                  dans vos recherches.
                </p>
                <Button variant="outline" className="w-full">
                  Contacter le SGG
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
