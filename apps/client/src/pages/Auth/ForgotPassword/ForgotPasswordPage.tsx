import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button, Input, Label } from '@/components/atoms';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PATHNAMES } from '@/lib/paths/pathnames';
import { AuthPageLayout } from '@/templates';

export const ForgotPasswordPage = () => {
  const { t } = useTranslation(['translation', 'common']);

  return (
    <AuthPageLayout t={t}>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            {t('Pages.Auth.ForgotPassword.Title')}
          </CardTitle>
          <CardDescription>
            {t('Pages.Auth.ForgotPassword.Description')}
          </CardDescription>
        </CardHeader>

        <form
          onSubmit={event => {
            event.preventDefault();
          }}
        >
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                {t('Pages.Auth.ForgotPassword.EmailLabel')}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('Pages.Auth.ForgotPassword.EmailPlaceholder')}
                autoComplete="email"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full">
              {t('Pages.Auth.ForgotPassword.Submit')}
            </Button>

            <Link
              {...PATHNAMES.signIn()}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('Pages.Auth.ForgotPassword.BackToSignIn')}
            </Link>
          </CardFooter>
        </form>
      </Card>
    </AuthPageLayout>
  );
};
