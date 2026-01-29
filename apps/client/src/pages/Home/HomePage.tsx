import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/atoms';
import { PageHeader, SectionCard } from '@/components/organisms';
import { MainPageLayout } from '@/templates';
import { PATHNAMES } from '@/lib/paths/pathnames';

export const HomePage = () => {
  const { t } = useTranslation(['translation', 'common']);

  return (
    <MainPageLayout>
      <div className="space-y-8">
        <PageHeader
          title={t('Pages.Home.Title')}
          description={t('Pages.Home.Ready')}
          actions={
            <Button asChild>
              <Link {...PATHNAMES.components()}>
                {t('Pages.Home.ComponentsLink')}
              </Link>
            </Button>
          }
        />

        <SectionCard
          title={t('Pages.Home.CardTitle')}
          description={t('Pages.Home.CardBody')}
        >
          <div className="text-sm text-muted-foreground">
            {t('Pages.Home.CardHint')}
          </div>
        </SectionCard>
      </div>
    </MainPageLayout>
  );
};
