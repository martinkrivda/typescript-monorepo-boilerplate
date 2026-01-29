import { createFileRoute } from '@tanstack/react-router';
import { NotAuthorizedPage } from '@/pages';

const RouteComponent = () => {
  return <NotAuthorizedPage />;
};

export const Route = createFileRoute('/not-authorized')({
  component: RouteComponent,
});
