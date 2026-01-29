import { createFileRoute } from '@tanstack/react-router';
import { DocsPage } from '@/pages';

const RouteComponent = () => {
  return <DocsPage />;
};

export const Route = createFileRoute('/docs')({
  component: RouteComponent,
});
