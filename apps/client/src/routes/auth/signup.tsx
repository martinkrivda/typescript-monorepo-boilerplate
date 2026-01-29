import { createFileRoute } from '@tanstack/react-router';
import { SignUpPage } from '@/pages';

const RouteComponent = () => {
  return <SignUpPage />;
};

export const Route = createFileRoute('/auth/signup')({
  component: RouteComponent,
});
