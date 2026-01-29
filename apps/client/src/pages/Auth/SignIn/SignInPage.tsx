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

export const SignInPage = () => {
  const { t } = useTranslation(['translation', 'common']);

  return (
    <AuthPageLayout t={t}>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            {t('Pages.Auth.SignIn.Title')}
          </CardTitle>
          <CardDescription>
            {t('Pages.Auth.SignIn.Description')}
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
                {t('Pages.Auth.SignIn.EmailLabel')}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('Pages.Auth.SignIn.EmailPlaceholder')}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">
                  {t('Pages.Auth.SignIn.PasswordLabel')}
                </Label>
                <Link
                  {...PATHNAMES.forgotPassword()}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('Pages.Auth.SignIn.ForgotLink')}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder={t('Pages.Auth.SignIn.PasswordPlaceholder')}
                autoComplete="current-password"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full">
              {t('Pages.Auth.SignIn.Submit')}
            </Button>

            <div className="text-sm text-muted-foreground">
              {t('Pages.Auth.SignIn.NoAccount')}{' '}
              <Link
                {...PATHNAMES.signUp()}
                className="text-foreground hover:underline"
              >
                {t('Pages.Auth.SignIn.SignUpLink')}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </AuthPageLayout>
  );
};
