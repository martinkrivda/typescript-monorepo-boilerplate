import { Badge as ShadBadge } from '@/components/ui/badge';
import * as React from 'react';

export type BadgeProps = React.ComponentPropsWithoutRef<typeof ShadBadge>;
export const Badge = (props: BadgeProps) => {
  return <ShadBadge {...props} />;
};
