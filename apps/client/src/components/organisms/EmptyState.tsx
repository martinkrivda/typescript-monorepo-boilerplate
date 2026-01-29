import * as React from 'react';

export interface EmptyStateProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}
export const EmptyState = ({ title, description, action }: EmptyStateProps) => {
  return (
    <div className="rounded-lg border border-dashed p-6 text-center">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
};
