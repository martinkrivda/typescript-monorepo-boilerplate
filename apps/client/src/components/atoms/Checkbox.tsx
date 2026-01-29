import { Checkbox as ShadCheckbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import * as React from 'react';

export type CheckboxProps = React.ComponentPropsWithoutRef<typeof ShadCheckbox>;

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return <ShadCheckbox ref={ref} className={cn(className)} {...props} />;
  }
);

Checkbox.displayName = 'Checkbox';
