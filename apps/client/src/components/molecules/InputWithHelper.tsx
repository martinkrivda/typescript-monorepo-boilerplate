import { cn } from '@/lib/utils';
import * as React from 'react';
import { forwardRef } from 'react';
import { Input, type InputProps, Label } from '../atoms';

export interface InputWithHelperProps extends InputProps {
  error?: React.ReactNode;
  helperText?: React.ReactNode;
  label?: string;
}

const InputWithHelperComponent = forwardRef<
  HTMLInputElement,
  InputWithHelperProps
>(({ error, helperText, label, className, id, ...props }, ref) => {
  const hasError = Boolean(error);
  const fieldClass = cn(className, hasError && 'border-destructive');

  return (
    <div className="space-y-1">
      {label ? (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
      ) : null}
      <Input
        {...props}
        ref={ref}
        id={id}
        className={fieldClass}
        aria-invalid={hasError || undefined}
      />
      {!hasError && helperText ? (
        <p className="px-1 pt-1 text-left text-xs text-muted-foreground">
          {helperText}
        </p>
      ) : null}
      {hasError ? (
        <p className="px-1 pt-1 text-left text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
});

InputWithHelperComponent.displayName = 'InputWithHelper';

export const InputWithHelper = InputWithHelperComponent;
