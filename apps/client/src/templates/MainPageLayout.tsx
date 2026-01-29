import * as React from 'react';
import { Footer, Navbar } from '@/components/organisms';

export interface MainPageLayoutProps {
  children: React.ReactNode;
}
export const MainPageLayout = ({ children }: MainPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-8">{children}</div>
      </main>
      <Footer />
    </div>
  );
};
