'use client';

import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { routing } from '@/i18n/routing';

export function LocaleSwitcher() {
  const pathname = usePathname();
  const currentLocale = useLocale();
  const t = useTranslations('LocaleSwitcher');

  // Extract locale prefix from pathname to build remaining path
  const segments = pathname.split('/');
  const localeInPath = segments[1];
  const remainingPath = segments.slice(localeInPath && routing.locales.includes(localeInPath as any) ? 2 : 1).join('/');

  const switchLocale = (newLocale: string) => {
    const newPath = `/${newLocale}${remainingPath ? `/${remainingPath}` : ''}`;
    window.location.href = newPath;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('switchLocale')}>
          <Globe className="h-5 w-5" />
          <span className="sr-only">{t('switchLocale')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLocale(locale)}
            disabled={locale === currentLocale}
          >
            {locale === currentLocale && (
              <span className="mr-2 text-primary">✓</span>
            )}
            {locale.toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
