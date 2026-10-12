'use client';

import { useActiveOrganization } from '@/contexts/ActiveOrganizationContext';
import { ChevronDown, Building2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

export function OrganizationSwitcher() {
  const { organization, organizations, setOrganization } = useActiveOrganization();

  if (!organization) {
    return (
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/estate-manager/profile">
          <Building2 className="h-4 w-4 mr-2" />
          Create Organization
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 font-medium text-zinc-900 dark:text-white"
        >
          <span className="hidden sm:inline">{organization.name}</span>
          <Badge variant="outline" className="ml-2 bg-muted/50 text-xs">
            EM
          </Badge>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[220px]">
        <DropdownMenuLabel>Organization</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => setOrganization(org)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span>{org.name}</span>
            {organization.id === org.id && <Check className="h-3 w-3 text-[#10b981]" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/estate-manager/profile" className="cursor-pointer">
            Manage Organizations
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
