import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, SearchX } from "lucide-react";
import { useTranslation } from "@/i18n";

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="text-center max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="h-28 w-28 rounded-full bg-government-navy/10 flex items-center justify-center">
            <SearchX className="h-14 w-14 text-government-navy" />
          </div>
        </div>

        <h1 className="text-6xl font-bold text-government-navy mb-2">{t('errors.pageNotFoundTitle')}</h1>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          {t('errors.pageNotFound')}
        </h2>
        <p className="text-muted-foreground mb-8">
          {t('errors.pageNotFoundDesc')}{' '}
          {t('errors.pageNotFoundHint')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
          <Link to="/">
            <Button className="bg-government-navy hover:bg-government-navy-light w-full sm:w-auto">
              <Home className="h-4 w-4 mr-2" />
              {t('common.home')}
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          {t('footer.copyright', { year: '2026' })}
        </p>
      </div>
    </div>
  );
};

export default NotFound;
