import { Button } from '@/components/atoms';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import * as React from 'react';

export interface SheetPanelProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  triggerText: React.ReactNode;
  children: React.ReactNode;
}
export const SheetPanel = ({
  title,
  description,
  triggerText,
  children,
}: SheetPanelProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          {triggerText}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetTitle>{title}</SheetTitle>
        {description ? (
          <SheetDescription className="mt-1 text-sm text-muted-foreground">
            {description}
          </SheetDescription>
        ) : null}
        <div className="mt-4 space-y-3 text-sm text-muted-foreground">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};
