import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export interface LanguageSelectorProps {
  className?: string;
  labelClassName?: string;
  selectClassName?: string;
  showLabel?: boolean;
}
export const LanguageSelector = ({
  className,
  labelClassName,
  selectClassName,
  showLabel = false,
}: LanguageSelectorProps) => {
  const { t, i18n } = useTranslation(['translation', 'common']);

  return (
    <label className={className ?? 'flex items-center gap-2 text-xs text-gray-600'}>
      {showLabel ? (
        <span className={labelClassName}>
          {t('Common.Language', { ns: 'common' })}
        </span>
      ) : null}
      <select
        className={cn(
          'rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground shadow-sm',
          selectClassName
        )}
        value={i18n.resolvedLanguage ?? i18n.language}
        onChange={event => i18n.changeLanguage(event.target.value)}
      >
        <option value="en">{t('Common.English', { ns: 'common' })}</option>
        <option value="cs">{t('Common.Czech', { ns: 'common' })}</option>
        <option value="es">{t('Common.Spanish', { ns: 'common' })}</option>
      </select>
    </label>
  );
};
