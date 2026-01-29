import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector, ThemeToggleButton } from '@/components/molecules';
import { PATHNAMES } from '@/lib/paths/pathnames';

type TFunction = ReturnType<typeof useTranslation>['t'];

interface AuthPageLayoutProps {
  children: React.ReactNode;
  t: TFunction;
  pageName?: string;
}

export const AuthPageLayout = ({ children, t }: AuthPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Link
          {...PATHNAMES.home()}
          className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {t('Common.Back', { ns: 'common' })}
        </Link>

        <div className="absolute right-4 top-4 md:right-8 md:top-8">
          <div className="flex items-center gap-1">
            <LanguageSelector />
            <ThemeToggleButton />
          </div>
        </div>

        {children}
      </div>
    </div>
  );
};
