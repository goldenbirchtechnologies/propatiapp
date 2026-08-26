#!/usr/bin/env node

/**
 * Conservative restructure script for estate-manager and admin dashboard pages.
 * 
 * Only applies safe, well-defined transformations:
 * 1. Update imports to use new UI components
 * 2. Replace shadcn Card* components with div + glass-card
 * 3. Replace Badge with StatusBadge for status patterns
 * 4. Replace old button elements with Button component where safe
 * 5. Replace legacy Tailwind classes with new theme
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

function backupFile(filePath) {
  const backupPath = filePath + '.bak';
  const content = readFile(filePath);
  if (content) {
    fs.writeFileSync(path.join(ROOT, backupPath), content, 'utf-8');
  }
}

function getRole(filePath) {
  if (filePath.includes('estate-manager')) return 'estate-manager';
  return 'admin';
}

/**
 * Phase 1: Update imports
 */
function transformImports(content) {
  const original = content;
  
  // 1. Replace Card imports with new UI imports
  content = content.replace(
    /import\s*\{?\s*Card\s*,?\s*CardContent\s*,?\s*CardHeader\s*,?\s*CardTitle\s*,?\s*CardDescription\s*?\s*\}?\s*,?\s*from\s*['"]@\/components\/ui\/card['"];?\n/g,
    "import { PageHeader, StatCard, StatusBadge, Progress, SectionLabel, Avatar, EmptyState } from '@/components/ui';\n"
  );
  
  // 2. Ensure Button is imported if used
  if ((content.includes('<Button') || content.includes('<button')) && !content.includes("from '@/components/ui/button'") && !content.includes('from "@/components/ui/button"')) {
    content = content.replace(
      /(import\s*\{[^}]*from\s*['"]@\/components\/ui\/['"];?\n)/,
      "$1import { Button } from '@/components/ui/button';\n"
    );
  }
  
  // 3. Ensure StatusBadge is imported if Badge was used
  if (content.includes('Badge') && !content.includes('StatusBadge')) {
    content = content.replace(
      /import\s*\{?\s*Badge\s*\}?\s*,?\s*from\s*['"]@\/components\/ui\/badge['"];?\n/g,
      "import { StatusBadge } from '@/components/ui';\n"
    );
  }
  
  // 4. Ensure Avatar is imported if custom avatars exist
  if (content.includes('w-7 h-7 rounded-full') && !content.includes('Avatar')) {
    content = content.replace(
      /(import\s*\{[^}]*from\s*['"]@\/components\/ui\/['"];?\n)/,
      "$1import { Avatar } from '@/components/ui';\n"
    );
  }
  
  // 5. Ensure PageHeader is imported
  if (!content.includes('PageHeader')) {
    content = content.replace(
      /(import\s*\{[^}]*from\s*['"]@\/components\/ui\/['"];?\n)/,
      "$1import { PageHeader } from '@/components/ui';\n"
    );
  }
  
  // 6. Ensure StatCard is imported
  if (!content.includes('StatCard')) {
    content = content.replace(
      /(import\s*\{[^}]*from\s*['"]@\/components\/ui\/['"];?\n)/,
      "$1import { StatCard } from '@/components/ui';\n"
    );
  }
  
  return content;
}

/**
 * Phase 2: Transform Card components to glass-card divs
 */
function transformCardComponents(content) {
  let result = content;
  
  // Pattern: <Card> ... </Card>
  result = result.replace(
    /<Card(\s[^>]*)?>([\s\S]*?)<\/Card>/g,
    (match, attrs, inner) => {
      // If it has CardHeader/CardContent structure, handle it
      if (inner.includes('CardHeader') || inner.includes('CardContent')) {
        return transformNestedCard(inner, attrs);
      }
      // Simple card
      const extraClasses = attrs?.match(/className="([^"]*)"/)?.[1] || '';
      return `<div className="glass-card ${extraClasses}">${inner}</div>`;
    }
  );
  
  return result;
}

function transformNestedCard(inner, cardAttrs) {
  let result = inner;
  
  // Extract CardHeader content
  const cardHeaderMatch = result.match(/<CardHeader(\s[^>]*)?>([\s\S]*?)<\/CardHeader>/);
  if (cardHeaderMatch) {
    const headerContent = cardHeaderMatch[2];
    // Check for CardTitle
    const titleMatch = headerContent.match(/<CardTitle(\s[^>]*)?>([\s\S]*?)<\/CardTitle>/);
    if (titleMatch) {
      const titleContent = titleMatch[2].trim();
      result = result.replace(cardHeaderMatch[0], `<div className="flex items-center justify-between mb-4"><h3 className="text-white font-semibold text-sm">${titleContent}</h3>`);
    } else {
      result = result.replace(cardHeaderMatch[0], '<div className="flex items-center justify-between mb-4">');
    }
  }
  
  // Extract CardContent
  const cardContentMatch = result.match(/<CardContent(\s[^>]*)?>([\s\S]*?)<\/CardContent>/);
  if (cardContentMatch) {
    const contentInner = cardContentMatch[2];
    result = result.replace(cardContentMatch[0], `<div className="p-5">${contentInner}</div>`);
  }
  
  // Close the header div
  // We need to close the "flex items-center justify-between mb-4" div
  // Find the first closing div after the header replacement and close it
  result = result.replace(
    /(<div className="flex items-center justify-between mb-4">)([\s\S]*?)(<div className="p-5">)/,
    '$1$2</div>$3'
  );
  
  return result;
}

/**
 * Phase 3: Transform simple KPI divs to StatCard
 */
function transformKPICards(content) {
  // Match: div with label + value structure
  // This is a conservative match for simple KPI cards
  const kpiPattern = /<div className="[^"]*p-6[^"]*">\s*<p className="[^"]*text-muted-foreground[^"]*text-sm[^"]*">([^<]+)<\/p>\s*<p className="[^"]*text-2xl[^"]*font-bold[^"]*text-white[^"]*mt-2[^"]*">([^<]+)<\/p>\s*<\/div>/g;
  
  content = content.replace(kpiPattern, (match, label, value) => {
    return `<StatCard label="${label}" value="${value}" />`;
  });
  
  return content;
}

/**
 * Phase 4: Replace legacy color classes
 */
function transformLegacyClasses(content) {
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
 * Phase 5: Replace header div with PageHeader
 */
function transformPageHeader(content) {
  // Match: <div> <h1 ...>Title</h1> <p ...>Description</p> </div>
  // This is a common header pattern in dashboard pages
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
 * Phase 6: Replace button elements with Button component
 */
function transformButtons(content) {
  // Replace <button className="px-4 py-2 bg-green-600 ..."> with <Button variant="primary">
  content = content.replace(
    /<button className="px-4 py-2 bg-green-600 text-on-success rounded-lg hover:bg-green-700">/g,
    '<Button variant="primary">'
  );
  
  // Replace other primary buttons
  content = content.replace(
    /<button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50">/g,
    '<Button variant="primary">'
  );
  
  // Replace outline buttons
  content = content.replace(
    /<button className="rounded-lg border border-\[#262626\] px-4 py-2 text-sm font-medium hover:bg-obsidian-800-lowest disabled:opacity-50">/g,
    '<Button variant="outline">'
  );
  
  // Replace btn btn-secondary
  content = content.replace(
    /<button className="btn btn-secondary text-sm" style=\{[^}]+\}>/g,
    '<Button variant="outline">'
  );
  
  return content;
}

function transformPage(filePath) {
  let content = readFile(filePath);
  if (!content) return false;
  
  backupFile(filePath);
  const original = content;
  
  // Apply transformations in order
  content = transformImports(content);
  content = transformCardComponents(content);
  content = transformKPICards(content);
  content = transformPageHeader(content);
  content = transformButtons(content);
  content = transformLegacyClasses(content);
  
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
