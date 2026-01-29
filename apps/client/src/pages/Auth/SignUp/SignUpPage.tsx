import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Label } from '@/components/atoms';
import { PasswordStrengthIndicator } from '@/components/molecules';
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

export const SignUpPage = () => {
  const { t } = useTranslation(['translation', 'common']);
  const [password, setPassword] = useState('');

  return (
    <AuthPageLayout t={t}>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            {t('Pages.Auth.SignUp.Title')}
          </CardTitle>
          <CardDescription>
            {t('Pages.Auth.SignUp.Description')}
          </CardDescription>
        </CardHeader>

        <form
          onSubmit={event => {
            event.preventDefault();
          }}
        >
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  {t('Pages.Auth.SignUp.FirstNameLabel')}
                </Label>
                <Input
                  id="firstName"
                  placeholder={t('Pages.Auth.SignUp.FirstNamePlaceholder')}
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  {t('Pages.Auth.SignUp.LastNameLabel')}
                </Label>
                <Input
                  id="lastName"
                  placeholder={t('Pages.Auth.SignUp.LastNamePlaceholder')}
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                {t('Pages.Auth.SignUp.EmailLabel')}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('Pages.Auth.SignUp.EmailPlaceholder')}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                {t('Pages.Auth.SignUp.PasswordLabel')}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={t('Pages.Auth.SignUp.PasswordPlaceholder')}
                autoComplete="new-password"
                value={password}
                onChange={event => setPassword(event.target.value)}
              />
              <PasswordStrengthIndicator
                password={password}
                labels={{
                  title: t('Components.Molecules.PasswordStrength.Label'),
                  levels: [
                    t('Components.Molecules.PasswordStrength.VeryWeak'),
                    t('Components.Molecules.PasswordStrength.Weak'),
                    t('Components.Molecules.PasswordStrength.Fair'),
                    t('Components.Molecules.PasswordStrength.Good'),
                    t('Components.Molecules.PasswordStrength.Strong'),
                    t('Components.Molecules.PasswordStrength.VeryStrong'),
                  ],
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t('Pages.Auth.SignUp.ConfirmPasswordLabel')}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t('Pages.Auth.SignUp.ConfirmPasswordPlaceholder')}
                autoComplete="new-password"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full">
              {t('Pages.Auth.SignUp.Submit')}
            </Button>

            <div className="text-sm text-muted-foreground">
              {t('Pages.Auth.SignUp.HaveAccount')}{' '}
              <Link
                {...PATHNAMES.signIn()}
                className="text-foreground hover:underline"
              >
                {t('Pages.Auth.SignUp.SignInLink')}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </AuthPageLayout>
  );
};
