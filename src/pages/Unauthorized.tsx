import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldX, ArrowLeft, Home } from "lucide-react";
import { useTranslation } from "@/i18n";

export default function Unauthorized() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="h-24 w-24 rounded-full bg-status-danger/10 flex items-center justify-center">
            <ShieldX className="h-12 w-12 text-status-danger" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-4">
          {t('errors.unauthorized')}
        </h1>

        <p className="text-muted-foreground mb-8">
          {t('errors.unauthorizedDesc')}{' '}
          {t('errors.unauthorizedHint')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
          <Link to="/dashboard">
            <Button className="bg-government-navy hover:bg-government-navy-light">
              <Home className="h-4 w-4 mr-2" />
              {t('common.home')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
