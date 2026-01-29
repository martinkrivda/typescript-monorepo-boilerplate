import { cn } from '@/lib/utils';
import * as React from 'react';

export type ExternalLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;
export const ExternalLink = ({
  children,
  className,
  target = '_blank',
  rel = 'noreferrer',
  ...props
}: ExternalLinkProps) => {
  return (
    <a
      {...props}
      target={target}
      rel={rel}
      className={cn('text-primary underline-offset-4 hover:underline', className)}
    >
      {children}
    </a>
  );
};
