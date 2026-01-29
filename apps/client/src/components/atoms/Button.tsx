import {
  Button as ShadButton,
  buttonVariants as shadButtonVariants,
} from '@/components/ui/button';
import { type VariantProps } from 'class-variance-authority';
import * as React from 'react';

export type ButtonVariantProps = VariantProps<typeof shadButtonVariants>;

export type ButtonProps = React.ComponentPropsWithoutRef<typeof ShadButton>;

export const Button = React.forwardRef<
  React.ElementRef<typeof ShadButton>,
  ButtonProps
>((props, ref) => <ShadButton ref={ref} {...props} />);
Button.displayName = 'Button';

export const buttonVariants = shadButtonVariants;
