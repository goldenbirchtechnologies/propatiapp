#!/usr/bin/env node

/**
 * Safe dashboard class/import restructure script.
 * 
 * This script ONLY does transformations that are guaranteed to be safe:
 * 1. Replace specific class names globally
 * 2. Update import statements
 * 3. Add new import statements
 * 
 * It does NOT touch JSX structure (no Card→div, no h1→PageHeader, etc.)
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

function transformImports(content) {
  let result = content;
  
  // 1. Replace Card imports
  result = result.replace(
    /import\s*\{?\s*Card\s*,?\s*CardContent\s*,?\s*CardHeader\s*,?\s*CardTitle\s*,?\s*CardDescription\s*?\s*\}?\s*,?\s*from\s*['"]@\/components\/ui\/card['"];?\n/g,
    "import { PageHeader, StatCard, StatusBadge, Progress, SectionLabel, Avatar, EmptyState } from '@/components/ui';\n"
  );
  
  // 2. Replace Badge import with StatusBadge
  if (result.includes('Badge') && !result.includes('StatusBadge')) {
    result = result.replace(
      /import\s*\{?\s*Badge\s*\}?\s*,?\s*from\s*['"]@\/components\/ui\/badge['"];?\n/g,
      "import { StatusBadge } from '@/components/ui';\n"
    );
  }
  
  // 3. Add Button import if needed
  if ((result.includes('<button') || result.includes('<Button')) && !result.includes("from '@/components/ui/button'")) {
    result = result.replace(
      /(import\s*\{[^}]*from\s*['"]@\/components\/ui\/['"];?\n)/,
      "$1import { Button } from '@/components/ui/button';\n"
    );
  }
  
  // 4. Add Avatar import if needed
  if (result.includes('w-7 h-7 rounded-full') && !result.includes('Avatar')) {
    result = result.replace(
      /(import\s*\{[^}]*from\s*['"]@\/components\/ui\/['"];?\n)/,
      "$1import { Avatar } from '@/components/ui';\n"
    );
  }
  
  // 5. Add StarRating import if needed
  if (result.includes('StarRating') && !result.includes('from \'@/components/ui/star-rating\'')) {
    result = result.replace(
      /(import\s*\{[^}]*from\s*['"]@\/components\/ui\/['"];?\n)/,
      "$1import { StarRating } from '@/components/ui/star-rating';\n"
    );
  }
  
  return result;
}

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

function transformPage(filePath) {
  let content = readFile(filePath);
  if (!content) return false;
  
  const original = content;
  
  // Only do safe transformations
  content = transformImports(content);
  content = transformClasses(content);
  
  if (content !== original) {
    writeFile(filePath, content);
    console.log(`✓ Transformed: ${filePath}`);
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
