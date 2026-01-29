import React from 'react';
import { render, screen } from '@testing-library/react';
import { ComponentsPage } from '@/pages/Components/ComponentsPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/templates', () => ({
  MainPageLayout: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe('ComponentsPage', () => {
  it('renders page title', () => {
    render(<ComponentsPage />);
    expect(screen.getByText('Pages.Components.Title')).toBeInTheDocument();
  });
});
