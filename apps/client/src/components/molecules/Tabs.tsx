import {
  Tabs as ShadTabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import * as React from 'react';

export interface TabsItem {
  value: string;
  label: React.ReactNode;
  content: React.ReactNode;
}

export interface TabsProps
  extends React.ComponentPropsWithoutRef<typeof ShadTabs> {
  items: TabsItem[];
  listClassName?: string;
}
export const Tabs = ({ items, listClassName, ...props }: TabsProps) => {
  return (
    <ShadTabs {...props}>
      <TabsList className={listClassName}>
        {items.map(item => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map(item => (
        <TabsContent key={item.value} value={item.value}>
          {item.content}
        </TabsContent>
      ))}
    </ShadTabs>
  );
};
