import {
  Tooltip as ShadTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import * as React from 'react';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
}
export const Tooltip = ({ content, children }: TooltipProps) => {
  return (
    <TooltipProvider>
      <ShadTooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </ShadTooltip>
    </TooltipProvider>
  );
};
