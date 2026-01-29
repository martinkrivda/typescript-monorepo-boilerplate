import { createFileRoute } from '@tanstack/react-router';
import { ComponentsPage } from '@/pages';

const RouteComponent = () => {
  return <ComponentsPage />;
};

export const Route = createFileRoute('/components')({
  component: RouteComponent,
});
