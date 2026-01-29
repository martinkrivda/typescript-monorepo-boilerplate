import { Link, useRouter } from '@tanstack/react-router';
import { Home, Map, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/atoms';
import { PATHNAMES } from '@/lib/paths/pathnames';

export const NotFoundPage = () => {
  const router = useRouter();
  const { t } = useTranslation(['translation', 'common']);

  const handleGoBack = () => {
    router.history.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="text-center space-y-8 max-w-sm">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center">
                <Map className="h-12 w-12 text-muted-foreground/60" />
              </div>
              <div className="absolute -top-2 -right-2">
                <div className="bg-destructive text-destructive-foreground text-sm font-mono px-2 py-1 rounded">
                  404
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {t('Pages.NotFound.Title')}
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              {t('Pages.NotFound.Description')}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={handleGoBack} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            {t('Pages.NotFound.GoBack')}
          </Button>

          <Button asChild className="gap-2">
            <Link {...PATHNAMES.home()}>
              <Home className="h-4 w-4" />
              {t('Pages.NotFound.BackHome')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
