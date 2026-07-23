import { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface TabItem {
  value: string;
  label: string;
}

interface RentAndPaymentsHubProps {
  defaultTab?: string;
  tabs: TabItem[];
  defaultTabFallback?: string;
  children: ReactNode;
}

export default function RentAndPaymentsHub({
  defaultTab = 'overview',
  tabs,
  defaultTabFallback = 'overview',
  children,
}: RentAndPaymentsHubProps) {
  const safeDefault = tabs.some((t) => t.value === defaultTab) ? defaultTab : defaultTabFallback;

  return (
    <div className="space-y-6">
      <Tabs defaultValue={safeDefault}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {children}
      </Tabs>
    </div>
  );
}
