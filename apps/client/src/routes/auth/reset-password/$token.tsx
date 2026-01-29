import { createFileRoute } from '@tanstack/react-router';
import { ResetPasswordPage } from '@/pages';

const RouteComponent = () => {
  return <ResetPasswordPage />;
};

export const Route = createFileRoute('/auth/reset-password/$token')({
  component: RouteComponent,
});
