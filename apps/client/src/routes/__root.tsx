import * as React from 'react';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { NotFoundPage } from '@/pages';

const RootComponent = () => {
  return (
    <React.Fragment>
      <Outlet />
    </React.Fragment>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundPage,
});
