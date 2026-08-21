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
        <TabsList className="w-full overflow-x-auto border-b border-[#262626] bg-transparent p-0">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="border-b-2 border-transparent text-neutral-400 transition-colors hover:text-white hover:border-neutral-300 data-[state=active]:border-[#00ff66] data-[state=active]:text-[#00ff66]"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {children}
      </Tabs>
    </div>
  );
}
