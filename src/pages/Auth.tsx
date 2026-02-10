import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { useTranslation } from "@/i18n";

// Validation schemas
const emailSchema = z.string().email("Adresse email invalide");
const passwordSchema = z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères");
const fullNameSchema = z.string().min(2, "Le nom doit contenir au moins 2 caractères");

export default function Auth() {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const { t } = useTranslation();

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
        setError(t('auth.invalidCredentials'));
      } else if (error.message.includes("Email not confirmed")) {
        setError(t('auth.emailNotConfirmed'));
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
        setError(t('auth.emailExists'));
      } else {
        setError(error.message);
      }
    } else {
      setSuccess(t('auth.accountCreated'));
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
        <div className="flex items-center gap-4">
          <img src="/emblem_gabon.png" alt="Emblème du Gabon" className="h-[60px] w-[60px] object-contain" />
          <div className="flex flex-col items-start justify-center">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-white/70 leading-tight w-full mb-1">{t('sidebar.presidency')}</span>
            <span className="font-serif font-black text-[13.5px] uppercase leading-none tracking-normal text-white w-full">{t('sidebar.sggFull')}</span>
            <span className="font-serif font-black text-[12.5px] uppercase leading-none tracking-[0.2em] text-white w-full">{t('sidebar.sggSub')}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4" id="main-content">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <img src="/emblem_gabon.png" alt="Emblème du Gabon" className="h-20 w-20 object-contain" />
            </div>
            <CardTitle className="text-2xl">{t('auth.platformName')}</CardTitle>
            <CardDescription>
              {t('auth.platformDesc')}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">{t('auth.loginAction')}</TabsTrigger>
                <TabsTrigger value="signup">{t('auth.signupAction')}</TabsTrigger>
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
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('auth.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('auth.password')}</Label>
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
                        {t('auth.loginLoading')}
                      </>
                    ) : (
                      t('auth.login')
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder={t('auth.namePlaceholder')}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">{t('auth.email')}</Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      placeholder={t('auth.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">{t('auth.password')}</Label>
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
                      {t('auth.passwordMinLength')}
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
                        {t('auth.signupLoading')}
                      </>
                    ) : (
                      t('auth.register')
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    {t('auth.defaultRoleNote')}
                    <br />
                    {t('auth.contactAdmin')}
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
                {t('auth.demoAccess')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-sm text-white/60">
          {t('footer.copyright', { year: '2026' })}
        </p>
      </footer>
    </div>
  );
}
