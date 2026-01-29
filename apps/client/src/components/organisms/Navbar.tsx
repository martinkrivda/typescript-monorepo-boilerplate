import { Link } from '@tanstack/react-router';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Button } from '@/components/atoms';
import { LanguageSelector, ThemeToggleButton } from '@/components/molecules';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { PATHNAMES } from '@/lib/paths/pathnames';
export const Navbar = () => {
  const { t } = useTranslation(['translation', 'common']);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <Link {...PATHNAMES.home()} className="text-lg font-semibold text-foreground">
            {t('Common.AppName', { ns: 'common' })}
          </Link>
          <Badge variant="secondary">starter</Badge>
        </div>
        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-4 text-sm text-muted-foreground md:flex">
            <Link {...PATHNAMES.home()} className="[&.active]:text-foreground">
              {t('Common.NavHome', { ns: 'common' })}
            </Link>
            <Link {...PATHNAMES.components()} className="[&.active]:text-foreground">
              {t('Common.NavComponents', { ns: 'common' })}
            </Link>
            <Link {...PATHNAMES.docs()} className="[&.active]:text-foreground">
              {t('Common.NavDocs', { ns: 'common' })}
            </Link>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <LanguageSelector />
            <ThemeToggleButton />
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2">
                  <LanguageSelector />
                  <ThemeToggleButton />
                </div>
                <nav className="flex flex-col gap-4 text-sm text-muted-foreground">
                  <Link
                    {...PATHNAMES.home()}
                    className="[&.active]:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    {t('Common.NavHome', { ns: 'common' })}
                  </Link>
                  <Link
                    {...PATHNAMES.components()}
                    className="[&.active]:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    {t('Common.NavComponents', { ns: 'common' })}
                  </Link>
                  <Link
                    {...PATHNAMES.docs()}
                    className="[&.active]:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    {t('Common.NavDocs', { ns: 'common' })}
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
