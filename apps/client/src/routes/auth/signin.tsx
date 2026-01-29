import { createFileRoute } from '@tanstack/react-router';
import { SignInPage } from '@/pages';

const RouteComponent = () => {
  return <SignInPage />;
};

export const Route = createFileRoute('/auth/signin')({
  component: RouteComponent,
});
