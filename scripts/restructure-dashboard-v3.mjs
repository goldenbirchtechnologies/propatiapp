#!/usr/bin/env node

/**
 * Conservative dashboard restructure script.
 * 
 * Transforms estate-manager and admin pages to use new Figma Make composition:
 * - PageHeader, StatCard, glass-card, SectionLabel, StatusBadge, Avatar, Button, Progress, EmptyState
 * 
 * This script is deliberately conservative: it only transforms well-defined patterns
 * and leaves everything else untouched.
 */

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

const EM_PAGES = [
  'src/app/dashboard/estate-manager/page.tsx',
  'src/app/dashboard/estate-manager/agreements/page.tsx',
  'src/app/dashboard/estate-manager/analytics/page.tsx',
  'src/app/dashboard/estate-manager/billing/page.tsx',
  'src/app/dashboard/estate-manager/invite-property-manager/page.tsx',
  'src/app/dashboard/estate-manager/invoices/page.tsx',
  'src/app/dashboard/estate-manager/lease-negotiation/page.tsx',
  'src/app/dashboard/estate-manager/lease-review/page.tsx',
  'src/app/dashboard/estate-manager/ledger/page.tsx',
  'src/app/dashboard/estate-manager/maintenance/page.tsx',
  'src/app/dashboard/estate-manager/messages/page.tsx',
  'src/app/dashboard/estate-manager/move-in/page.tsx',
  'src/app/dashboard/estate-manager/portfolio/page.tsx',
  'src/app/dashboard/estate-manager/portfolio/analytics/page.tsx',
  'src/app/dashboard/estate-manager/profile/page.tsx',
  'src/app/dashboard/estate-manager/receipts/page.tsx',
  'src/app/dashboard/estate-manager/reports/page.tsx',
  'src/app/dashboard/estate-manager/service-charges/page.tsx',
  'src/app/dashboard/estate-manager/statements/page.tsx',
  'src/app/dashboard/estate-manager/subscription/page.tsx',
  'src/app/dashboard/estate-manager/team/page.tsx',
  'src/app/dashboard/estate-manager/tenants/page.tsx',
  'src/app/dashboard/estate-manager/turnover/page.tsx',
  'src/app/dashboard/estate-manager/units/page.tsx',
  'src/app/dashboard/estate-manager/utilities/page.tsx',
  'src/app/dashboard/estate-manager/financials/scenario-builder/page.tsx',
  'src/app/dashboard/estate-manager/financials/scenario/page.tsx',
  'src/app/dashboard/estate-manager/maintenance/[id]/page.tsx',
  'src/app/dashboard/estate-manager/portfolio/[unitId]/page.tsx',
  'src/app/dashboard/estate-manager/units/[unitId]/page.tsx',
];

const ADMIN_PAGES = [
  'src/app/dashboard/admin/page.tsx',
  'src/app/dashboard/admin/agreements/page.tsx',
  'src/app/dashboard/admin/audit/logs/page.tsx',
  'src/app/dashboard/admin/disputes/page.tsx',
  'src/app/dashboard/admin/flags/page.tsx',
  'src/app/dashboard/admin/invoices/page.tsx',
  'src/app/dashboard/admin/overview/page.tsx',
  'src/app/dashboard/admin/payments/page.tsx',
  'src/app/dashboard/admin/profile/page.tsx',
  'src/app/dashboard/admin/properties/page.tsx',
  'src/app/dashboard/admin/receipts/page.tsx',
  'src/app/dashboard/admin/reports/page.tsx',
  'src/app/dashboard/admin/revenue/page.tsx',
  'src/app/dashboard/admin/settings/page.tsx',
  'src/app/dashboard/admin/statements/page.tsx',
  'src/app/dashboard/admin/transactions/page.tsx',
  'src/app/dashboard/admin/users/page.tsx',
  'src/app/dashboard/admin/verification/page.tsx',
  'src/app/dashboard/admin/verifications/page.tsx',
  'src/app/dashboard/admin/settings/dashboard/page.tsx',
  'src/app/dashboard/admin/settings/global/page.tsx',
  'src/app/dashboard/admin/settings/countries/page.tsx',
  'src/app/dashboard/admin/settings/mfa/page.tsx',
  'src/app/dashboard/admin/settings/rules/page.tsx',
  'src/app/dashboard/admin/settings/notifications/page.tsx',
  'src/app/dashboard/admin/profile/security/page.tsx',
  'src/app/dashboard/admin/transactions/escrow/page.tsx',
  'src/app/dashboard/admin/transactions/withdrawals/page.tsx',
  'src/app/dashboard/admin/users/management/page.tsx',
  'src/app/dashboard/admin/roles/verification-officer/page.tsx',
];

const ALL_PAGES = [...EM_PAGES, ...ADMIN_PAGES];

function readFile(filePath) {
  try {
    return fs.readFileSync(path.join(ROOT, filePath), 'utf-8');
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e.message);
    return null;
  }
}

function writeFile(filePath, content) {
  fs.writeFileSync(path.join(ROOT, filePath), content, 'utf-8');
}

/**
 * Phase 1: Transform imports - safe, well-defined replacements
 */
function transformImports(content) {
  const lines = content.split('\n');
  const newLines = [];
  const addedImports = new Set();
  
  // Track what needs to be added
  const needsPageHeader = !content.includes('PageHeader');
  const needsStatCard = !content.includes('StatCard');
  const needsStatusBadge = content.includes('Badge') && !content.includes('StatusBadge');
  const needsButton = (content.includes('<button') || content.includes('<Button')) && !content.includes("from '@/components/ui/button'");
  const needsAvatar = content.includes('w-7 h-7 rounded-full') && !content.includes('Avatar');
  
  for (const line of lines) {
    // Replace Card imports
    if (line.includes("from '@/components/ui/card'")) {
      if (line.includes('Card') || line.includes('CardContent') || line.includes('CardHeader') || line.includes('CardTitle')) {
        newLines.push("import { PageHeader, StatCard, StatusBadge, Progress, SectionLabel, Avatar, EmptyState } from '@/components/ui';");
        continue;
      }
    }
    
    // Replace Badge import
    if (line.includes("from '@/components/ui/badge'") && needsStatusBadge) {
      newLines.push("import { StatusBadge } from '@/components/ui';");
      continue;
    }
    
    // Add new imports after existing UI imports
    if (line.includes("from '@/components/ui/") || line.includes('from "@/components/ui/')) {
      newLines.push(line);
      
      if (needsPageHeader && !addedImports.has('PageHeader')) {
        newLines.push("import { PageHeader } from '@/components/ui';");
        addedImports.add('PageHeader');
      }
      if (needsStatCard && !addedImports.has('StatCard')) {
        newLines.push("import { StatCard } from '@/components/ui';");
        addedImports.add('StatCard');
      }
      if (needsButton && !addedImports.has('Button')) {
        newLines.push("import { Button } from '@/components/ui/button';");
        addedImports.add('Button');
      }
      if (needsAvatar && !addedImports.has('Avatar')) {
        newLines.push("import { Avatar } from '@/components/ui';");
        addedImports.add('Avatar');
      }
      continue;
    }
    
    newLines.push(line);
  }
  
  return newLines.join('\n');
}

/**
 * Phase 2: Replace legacy color classes
 */
function transformClasses(content) {
  const replacements = [
    ['border-[#262626]', 'border-white/[0.08]'],
    ['bg-obsidian-800/30', 'bg-zinc-950'],
    ['bg-obsidian-800-lowest', 'bg-zinc-900'],
    ['hover:bg-obsidian-800-lowest/50', 'hover:bg-zinc-900/50'],
    ['hover:bg-obsidian-800/60', 'hover:bg-zinc-900/60'],
    ['bg-obsidian-800/60', 'bg-zinc-900/60'],
    ['text-muted-foreground', 'text-zinc-500'],
    ['bg-primary', 'bg-emerald-500'],
    ['text-primary', 'text-emerald-400'],
    ['border-border', 'border-white/[0.08]'],
    ['bg-background', 'bg-zinc-900'],
    ['text-foreground', 'text-white'],
    ['bg-muted', 'bg-zinc-900'],
    ['text-muted', 'text-zinc-500'],
    ['text-success', 'text-emerald-400'],
    ['text-warning', 'text-amber-400'],
    ['bg-warning/10', 'bg-amber-500/10'],
    ['bg-destructive/5', 'bg-red-500/5'],
    ['text-destructive', 'text-red-400'],
    ['bg-success/10', 'bg-emerald-500/10'],
    ['text-green-100', 'text-emerald-500/10'],
    ['text-green-800', 'text-emerald-400'],
    ['text-red-100', 'text-red-500/10'],
    ['text-red-800', 'text-red-400'],
    ['font-headline-sm', 'text-white'],
    ['font-label-md', 'text-xs'],
    ['shadow-card', ''],
    ['border border-dashed border-[#262626] bg-obsidian-800/30/50', 'border border-dashed border-white/[0.08] bg-zinc-950/50'],
  ];
  
  for (const [old, newClass] of replacements) {
    content = content.split(old).join(newClass);
  }
  
  return content;
}

/**
 * Phase 3: Replace h1+description header with PageHeader
 * Only matches complete header blocks
 */
function transformHeaders(content) {
  // Pattern: div > h1 + p (description)
  // We need to match this very carefully to avoid breaking things
  
  // Match common header pattern at the start of JSX
  const headerPattern = /<div[^>]*>\s*<h1[^>]*className="[^"]*font-bold[^"]*text-white[^"]*"[^>]*>([^<]+)<\/h1>\s*<p[^>]*className="[^"]*text-zinc-500[^"]*"[^>]*>([^<]*)<\/p>\s*<\/div>/;
  
  if (headerPattern.test(content)) {
    content = content.replace(
      headerPattern,
      (match, title, description) => {
        return `<PageHeader
    title="${title}"
    description="${description}"
  />`;
      }
    );
  }
  
  return content;
}

/**
 * Phase 4: Replace simple KPI card divs with StatCard
 */
function transformKPICards(content) {
  // Match: div with p(text-muted-foreground text-sm) + p(text-2xl font-bold text-white mt-2)
  const kpiPattern = /<div className="[^"]*p-6[^"]*">\s*<p className="[^"]*text-zinc-500[^"]*text-sm[^"]*">([^<]+)<\/p>\s*<p className="[^"]*text-2xl[^"]*font-bold[^"]*text-white[^"]*mt-2[^"]*">([^<]+)<\/p>\s*<\/div>/g;
  
  content = content.replace(kpiPattern, (match, label, value) => {
    return `<StatCard label="${label}" value="${value}" />`;
  });
  
  return content;
}

/**
 * Phase 5: Replace Card components with glass-card divs
 * Conservative: only handles <Card>...</Card> without nested CardHeader/CardContent
 */
function transformCardComponents(content) {
  // Simple Card replacement (no nested CardHeader/CardContent)
  const simpleCardPattern = /<Card(\s[^>]*)?>([\s\S]*?)<\/Card>/g;
  
  content = content.replace(simpleCardPattern, (match, attrs, inner) => {
    // Skip if it contains CardHeader or CardContent
    if (inner.includes('CardHeader') || inner.includes('CardContent')) {
      return match;
    }
    
    const extraClasses = attrs?.match(/className="([^"]*)"/)?.[1] || '';
    return `<div className="glass-card ${extraClasses}">${inner}</div>`;
  });
  
  return content;
}

/**
 * Phase 6: Replace button elements with Button component
 */
function transformButtons(content) {
  content = content.replace(
    /<button className="px-4 py-2 bg-green-600 text-on-success rounded-lg hover:bg-green-700">/g,
    '<Button variant="primary">'
  );
  
  content = content.replace(
    /<button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50">/g,
    '<Button variant="primary">'
  );
  
  content = content.replace(
    /<button className="rounded-lg border border-\[#262626\] px-4 py-2 text-sm font-medium hover:bg-obsidian-800-lowest disabled:opacity-50">/g,
    '<Button variant="outline">'
  );
  
  content = content.replace(
    /<button className="btn btn-secondary text-sm" style=\{[^}]+\}>/g,
    '<Button variant="outline">'
  );
  
  return content;
}

/**
 * Phase 7: Replace custom empty states with EmptyState
 */
function transformEmptyStates(content) {
  // Match specific empty state pattern
  const emptyPattern = /<div className="text-center py-12">\s*<([^>]+) className="h-12 w-12 mx-auto mb-4"\s*style=\{\{ color: 'text-zinc-400', opacity: 0\.5 \}\}\s*\/>\s*<p className="font-medium"\s*className="text-white">([^<]+)<\/p>\s*<p className="text-sm mt-1"\s*style=\{\{ color: 'text-zinc-400' \}\}>([^<]+)<\/p>\s*<\/div>/g;
  
  if (emptyPattern.test(content)) {
    content = content.replace(
      emptyPattern,
      (match, iconClass, title, description) => {
        const iconName = 'Inbox'; // Default icon
        return `<EmptyState icon={${iconName}} title="${title}" description="${description}" />`;
      }
    );
  }
  
  return content;
}

/**
 * Phase 8: Replace custom progress bars with Progress
 */
function transformProgressBars(content) {
  content = content.replace(
    /<div className="h-1\.5 rounded-full bg-zinc-800\/10 overflow-hidden">\s*<div className="h-full rounded-full bg-neutral-600\/80" style=\{\{ width: `\$\{[^}]+\}` \}\} \/>\s*<\/div>/g,
    '<Progress value={50} className="h-1.5" />'
  );
  
  return content;
}

/**
 * Phase 9: Replace CardHeader/CardTitle/CardContent nested structures
 */
function transformNestedCardComponents(content) {
  // CardHeader with CardTitle -> div with h3
  content = content.replace(
    /<CardHeader(\s[^>]*)?>\s*<CardTitle(\s[^>]*)?>([\s\S]*?)<\/CardTitle>\s*<\/CardHeader>/g,
    (match, headerAttrs, titleAttrs, titleContent) => {
      const titleText = titleContent.trim();
      return `<div className="flex items-center justify-between mb-4"><h3 className="text-white font-semibold text-sm">${titleText}</h3>`;
    }
  );
  
  // CardContent -> div
  content = content.replace(
    /<CardContent(\s[^>]*)?>([\s\S]*?)<\/CardContent>/g,
    (match, attrs, inner) => {
      const extraClasses = attrs?.match(/className="([^"]*)"/)?.[1] || '';
      return `<div className="${extraClasses}">${inner}</div>`;
    }
  );
  
  // Close the Card header div after CardContent opens
  content = content.replace(
    /(<div className="flex items-center justify-between mb-4">)([\s\S]*?)(<div className="[^"]*">)/,
    '$1$2</div>$3'
  );
  
  return content;
}

function transformPage(filePath) {
  let content = readFile(filePath);
  if (!content) return false;
  
  const original = content;
  
  // Phase 1: Imports
  content = transformImports(content);
  
  // Phase 2: Legacy classes
  content = transformClasses(content);
  
  // Phase 3: Headers
  content = transformHeaders(content);
  
  // Phase 4: KPI cards
  content = transformKPICards(content);
  
  // Phase 5: Simple Card components
  content = transformCardComponents(content);
  
  // Phase 6: Nested Card components
  content = transformNestedCardComponents(content);
  
  // Phase 7: Buttons
  content = transformButtons(content);
  
  // Phase 8: Empty states
  content = transformEmptyStates(content);
  
  // Phase 9: Progress bars
  content = transformProgressBars(content);
  
  if (content !== original) {
    writeFile(filePath, content);
    console.log(`✓ Restructured: ${filePath}`);
    return true;
  }
  
  console.log(`- No changes needed: ${filePath}`);
  return false;
}

let changed = 0;
let skipped = 0;

for (const page of ALL_PAGES) {
  if (transformPage(page)) {
    changed++;
  } else {
    skipped++;
  }
}

console.log(`\nDone! Changed ${changed} files, skipped ${skipped} files.`);
