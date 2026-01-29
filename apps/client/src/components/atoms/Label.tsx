import { Label as ShadLabel } from '@/components/ui/label';
import * as React from 'react';

export type LabelProps = React.ComponentPropsWithoutRef<typeof ShadLabel>;

export const Label = React.forwardRef<
  React.ElementRef<typeof ShadLabel>,
  LabelProps
>((props, ref) => <ShadLabel ref={ref} {...props} />);

Label.displayName = 'Label';
