import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Globe, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { z } from "zod";

// Validation schemas
const emailSchema = z.string().email("Adresse email invalide");
const passwordSchema = z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères");
const fullNameSchema = z.string().min(2, "Le nom doit contenir au moins 2 caractères");

export default function Auth() {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  const validateForm = (): boolean => {
    setError(null);

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      if (activeTab === "signup") {
        fullNameSchema.parse(fullName);
      }
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        setError("Email ou mot de passe incorrect");
      } else if (error.message.includes("Email not confirmed")) {
        setError("Veuillez confirmer votre email avant de vous connecter");
      } else {
        setError(error.message);
      }
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error } = await signUp(email, password, fullName);

    if (error) {
      if (error.message.includes("User already registered")) {
        setError("Un compte existe déjà avec cet email");
      } else {
        setError(error.message);
      }
    } else {
      setSuccess("Compte créé ! Vérifiez votre email pour confirmer votre inscription.");
      setActiveTab("login");
      setPassword("");
    }

    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-government-navy" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-government-navy to-government-navy-light">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
            <Globe className="h-5 w-5 text-government-navy" />
          </div>
          <div>
            <span className="font-bold text-white">SGG Digital</span>
            <span className="hidden md:inline text-sm text-white/70 ml-2">
              République Gabonaise
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-government-navy flex items-center justify-center">
                <Globe className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Plateforme SGG</CardTitle>
            <CardDescription>
              Secrétariat Général du Gouvernement — Ve République
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-4 border-status-success bg-status-success/10">
                  <CheckCircle2 className="h-4 w-4 text-status-success" />
                  <AlertDescription className="text-status-success">{success}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="vous@ministere.ga"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-government-navy hover:bg-government-navy-light"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion...
                      </>
                    ) : (
                      "Se connecter"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nom complet</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Jean DUPONT"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">Email</Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      placeholder="vous@ministere.ga"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">Mot de passe</Label>
                    <Input
                      id="signupPassword"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum 6 caractères
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-government-gold hover:bg-government-gold-light text-government-navy"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Création...
                      </>
                    ) : (
                      "Créer un compte"
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Les nouveaux comptes reçoivent le rôle "Citoyen" par défaut.
                    <br />
                    Contactez l'administrateur SGG pour un accès étendu.
                  </p>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-6 border-t text-center">
              <Button
                variant="link"
                className="text-muted-foreground"
                onClick={() => navigate("/demo")}
              >
                Accéder à la démo sans compte
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-sm text-white/60">
          © 2026 Secrétariat Général du Gouvernement
        </p>
      </footer>
    </div>
  );
}
