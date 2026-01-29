import { Link, useParams } from '@tanstack/react-router';
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

export const ResetPasswordPage = () => {
  const { t } = useTranslation(['translation', 'common']);
  const { token } = useParams({ from: '/auth/reset-password/$token' });

  return (
    <AuthPageLayout t={t}>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            {t('Pages.Auth.ResetPassword.Title')}
          </CardTitle>
          <CardDescription>
            {t('Pages.Auth.ResetPassword.Description')}
          </CardDescription>
        </CardHeader>

        <form
          onSubmit={event => {
            event.preventDefault();
          }}
        >
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">
                {t('Pages.Auth.ResetPassword.PasswordLabel')}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={t('Pages.Auth.ResetPassword.PasswordPlaceholder')}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t('Pages.Auth.ResetPassword.ConfirmPasswordLabel')}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t('Pages.Auth.ResetPassword.ConfirmPasswordPlaceholder')}
                autoComplete="new-password"
              />
            </div>

            <div className="text-xs text-muted-foreground">
              {t('Pages.Auth.ResetPassword.TokenHint', { token })}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full">
              {t('Pages.Auth.ResetPassword.Submit')}
            </Button>

            <Link
              {...PATHNAMES.signIn()}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('Pages.Auth.ResetPassword.BackToSignIn')}
            </Link>
          </CardFooter>
        </form>
      </Card>
    </AuthPageLayout>
  );
};
