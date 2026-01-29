import { useTranslation } from 'react-i18next';
export const Footer = () => {
  const { t } = useTranslation(['translation', 'common']);

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 text-xs text-muted-foreground">
        {t('Common.AppName', { ns: 'common' })} · {new Date().getFullYear()}
      </div>
    </footer>
  );
};
