import {
  DropdownMenu as ShadDropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/atoms';
import * as React from 'react';

export interface DropdownMenuItemConfig {
  label: React.ReactNode;
  onSelect?: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export interface DropdownMenuProps {
  label: React.ReactNode;
  items: DropdownMenuItemConfig[];
  title?: React.ReactNode;
  triggerText: React.ReactNode;
}
export const DropdownMenu = ({
  label,
  items,
  title,
  triggerText,
}: DropdownMenuProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <ShadDropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {triggerText}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {title ? <DropdownMenuLabel>{title}</DropdownMenuLabel> : null}
          {title ? <DropdownMenuSeparator /> : null}
          {items.map(item => (
            <DropdownMenuItem
              key={String(item.label)}
              onSelect={event => {
                event.preventDefault();
                item.onSelect?.();
              }}
              className={item.destructive ? 'text-destructive' : undefined}
              {...(item.disabled !== undefined
                ? { disabled: item.disabled }
                : {})}
            >
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </ShadDropdownMenu>
    </div>
  );
};
