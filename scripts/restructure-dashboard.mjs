#!/usr/bin/env node

/**
 * Restructure estate-manager and admin dashboard pages to match Figma Make composition.
 * 
 * This script applies conservative transformations to JSX presentation layer:
 * 1. Replace Card imports with new UI components
 * 2. Replace h1+description headers with PageHeader
 * 3. Replace custom KPI divs with StatCard
 * 4. Replace card wrappers with glass-card divs
 * 5. Replace Badge status with StatusBadge
 * 6. Replace custom avatars with Avatar
 * 7. Replace old button styles with Button component
 * 8. Replace custom progress with Progress
 * 9. Replace custom empty states with EmptyState
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

// Determine if this is an estate-manager or admin page
function getRole(filePath) {
  if (filePath.includes('estate-manager')) return 'estate-manager';
  return 'admin';
}

function transformImports(content, role) {
  const navImport = role === 'estate-manager' 
    ? "import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';"
    : "import { ADMIN_NAVIGATION } from '@/lib/navigation';";
  
  // Replace Card imports
  content = content.replace(
    /import\s*\{?\s*Card\s*,?\s*CardContent\s*,?\s*CardHeader\s*,?\s*CardTitle\s*,?\s*CardDescription\s*?\s*\}?\s*from\s*['"]@\/components\/ui\/card['"];?/g,
    "import { PageHeader, StatCard, StatusBadge, Progress, SectionLabel, Avatar, EmptyState } from '@/components/ui';"
  );
  
  // Replace Badge import (keep if already using StatusBadge, otherwise add)
  if (!content.includes("StatusBadge")) {
    content = content.replace(
      /import\s*\{?\s*Badge\s*\}?\s*from\s*['"]@\/components\/ui\/badge['"];?/g,
      "import { StatusBadge } from '@/components/ui';"
    );
  }
  
  // Add Button import if needed
  if (!content.includes("from '@/components/ui/button'") && !content.includes("from \"@/components/ui/button\"")) {
    if (content.includes("<button") || content.includes("<Button")) {
      content = content.replace(
        /(import\s*\{[^}]*\}\s*from\s*['"]@\/components\/ui\/['"];?\n)/,
        "$1import { Button } from '@/components/ui/button';\n"
      );
    }
  }
  
  return content;
}

function transformHeader(content, role) {
  const titleMatch = content.match(/<h1[^>]*className="[^"]*font-bold[^"]*text-white[^"]*"[^>]*>([^<]+)<\/h1>/);
  if (!titleMatch) return content;
  
  const title = titleMatch[1];
  
  // Find the description paragraph
  const descMatch = content.match(/<p[^>]*className="[^"]*text-muted-foreground[^"]*"[^>]*>([^<]+)<\/p>/);
  const description = descMatch ? descMatch[1] : '';
  
  // Build PageHeader replacement
  const pageHeader = `<PageHeader
    title="${title}"
    description="${description}"
  />`;
  
  // Replace the header div (h1 + p)
  content = content.replace(
    /<div[^>]*>\s*<h1[^>]*>.*?<\/h1>\s*<p[^>]*>.*?<\/p>\s*<\/div>/s,
    pageHeader
  );
  
  return content;
}

function transformKPICards(content) {
  // Replace simple StatCard-like divs with actual StatCard
  // Pattern: div with p label + p value
  
  content = content.replace(
    /<div className="rounded-lg border border-\[#262626\] bg-obsidian-800\/30 p-6 shadow-card">\s*<p className="text-muted-foreground text-sm">([^<]+)<\/p>\s*<p className="text-2xl font-bold text-white mt-2">([^<]+)<\/p>\s*<\/div>/g,
    (match, label, value) => {
      return `<StatCard label="${label}" value="${value}" />`;
    }
  );
  
  return content;
}

function transformCardWrapper(content) {
  // Replace Card, CardHeader, CardContent with glass-card divs
  content = content.replace(
    /<Card>\s*<CardHeader>\s*<CardTitle>([^<]+)<\/CardTitle>\s*<\/CardHeader>\s*<CardContent>/g,
    (match, title) => {
      return `<div className="glass-card p-5"><div className="flex items-center justify-between mb-4"><h3 className="text-white font-semibold text-sm">${title}</h3>`;
    }
  );
  
  content = content.replace(
    /<\/CardContent>\s*<\/Card>/g,
    '</div></div>'
  );
  
  // Also handle simpler Card patterns
  content = content.replace(
    /<Card className="p-4">/g,
    '<div className="glass-card p-4">'
  );
  content = content.replace(
    /<Card>/g,
    '<div className="glass-card">'
  );
  content = content.replace(
    /<\/Card>/g,
    '</div>'
  );
  content = content.replace(
    /<CardContent className="pt-6">/g,
    '<div className="p-5">'
  );
  content = content.replace(
    /<CardContent>/g,
    '<div className="p-5">'
  );
  content = content.replace(
    /<\/CardContent>/g,
    '</div>'
  );
  content = content.replace(
    /<CardHeader className="pb-3">/g,
    '<div className="pb-3">'
  );
  content = content.replace(
    /<CardHeader>/g,
    '<div>'
  );
  content = content.replace(
    /<\/CardHeader>/g,
    '</div>'
  );
  content = content.replace(
    /<CardTitle className="text-sm font-semibold/g,
    '<h3 className="text-white font-semibold text-sm'
  );
  content = content.replace(
    /<CardTitle>/g,
    '<h3 className="text-white font-semibold text-sm'
  );
  content = content.replace(
    /<\/CardTitle>/g,
    '</h3>'
  );
  
  return content;
}

function transformBadges(content) {
  // Replace custom span badges with StatusBadge where appropriate
  // Only replace simple status span patterns
  
  // Pattern: span with inline status classes
  content = content.replace(
    /<span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800">Active<\/span>/g,
    '<StatusBadge status="Active" />'
  );
  content = content.replace(
    /<span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-red-100 text-red-800">Banned<\/span>/g,
    '<StatusBadge status="Suspended" />'
  );
  
  return content;
}

function transformButtons(content) {
  // Replace old button classes with Button component
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
  
  return content;
}

function transformEmptyStates(content) {
  // Replace custom empty state divs with EmptyState
  const emptyStatePattern = /<div className="text-center py-12">\s*<([^>]+) className="h-12 w-12 mx-auto mb-4"\s*style=\{[^}]+\}\s*\/>\s*<p className="font-medium"\s*style=\{[^}]+\}>([^<]+)<\/p>\s*<p className="text-sm mt-1"\s*style=\{[^}]+\}>([^<]+)<\/p>\s*<\/div>/g;
  
  content = content.replace(
    emptyStatePattern,
    (match, iconClass, title, description) => {
      // Extract icon name from class
      const iconMatch = iconClass.match(/w-12 h-12/);
      const iconName = iconMatch ? 'Inbox' : 'Inbox';
      return `<EmptyState icon={${iconName}} title="${title}" description="${description}" />`;
    }
  );
  
  return content;
}

function transformProgressBars(content) {
  // Replace custom progress bar divs
  content = content.replace(
    /<div className="h-1\.5 rounded-full bg-zinc-800\/10 overflow-hidden">\s*<div className="h-full rounded-full bg-neutral-600\/80" style=\{\{ width: `\$\{[^}]+\}` \}\} \/>\s*<\/div>/g,
    (match) => {
      return '<Progress value={50} className="h-1.5" />';
    }
  );
  
  return content;
}

function transformObsidianClasses(content) {
  // Replace old obsidian/border color classes with new patterns
  content = content.replace(/border-\[#262626\]/g, 'border-white/[0.08]');
  content = content.replace(/bg-obsidian-800\/30/g, 'bg-zinc-950');
  content = content.replace(/bg-obsidian-800-lowest/g, 'bg-zinc-900');
  content = content.replace(/hover:bg-obsidian-800-lowest\/50/g, 'hover:bg-zinc-900/50');
  content = content.replace(/hover:bg-obsidian-800\/60/g, 'hover:bg-zinc-900/60');
  content = content.replace(/bg-obsidian-800\/60/g, 'bg-zinc-900/60');
  content = content.replace(/border-\[#262626\]/g, 'border-white/[0.08]');
  content = content.replace(/text-muted-foreground/g, 'text-zinc-500');
  content = content.replace(/bg-primary/g, 'bg-emerald-500');
  content = content.replace(/text-primary/g, 'text-emerald-400');
  content = content.replace(/border-border/g, 'border-white/[0.08]');
  content = content.replace(/bg-background/g, 'bg-zinc-900');
  content = content.replace(/text-foreground/g, 'text-white');
  content = content.replace(/bg-muted/g, 'bg-zinc-900');
  content = content.replace(/text-muted/g, 'text-zinc-500');
  content = content.replace(/text-success/g, 'text-emerald-400');
  content = content.replace(/text-warning/g, 'text-amber-400');
  content = content.replace(/bg-warning\/10/g, 'bg-amber-500/10');
  content = content.replace(/text-warning/g, 'text-amber-400');
  content = content.replace(/bg-destructive\/5/g, 'bg-red-500/5');
  content = content.replace(/text-destructive/g, 'text-red-400');
  content = content.replace(/bg-success\/10/g, 'bg-emerald-500/10');
  content = content.replace(/text-green-100/g, 'text-emerald-500/10');
  content = content.replace(/text-green-800/g, 'text-emerald-400');
  content = content.replace(/text-red-100/g, 'text-red-500/10');
  content = content.replace(/text-red-800/g, 'text-red-400');
  content = content.replace(/font-headline-sm/g, 'text-white');
  content = content.replace(/font-label-md/g, 'text-xs');
  content = content.replace(/shadow-card/g, '');
  content = content.replace(/rounded-xl border border-dashed border-\[#262626\] bg-obsidian-800\/30\/50/g, 'border border-dashed border-white/[0.08] bg-zinc-950/50');
  
  return content;
}

function transformPage(filePath) {
  let content = readFile(filePath);
  if (!content) return false;
  
  const role = getRole(filePath);
  const original = content;
  
  // Phase 1: Imports
  content = transformImports(content, role);
  
  // Phase 2: Header patterns
  content = transformHeader(content, role);
  
  // Phase 3: KPI cards
  content = transformKPICards(content);
  
  // Phase 4: Card wrappers
  content = transformCardWrapper(content);
  
  // Phase 5: Badges
  content = transformBadges(content);
  
  // Phase 6: Buttons
  content = transformButtons(content);
  
  // Phase 7: Empty states
  content = transformEmptyStates(content);
  
  // Phase 8: Progress bars
  content = transformProgressBars(content);
  
  // Phase 9: Legacy classes
  content = transformObsidianClasses(content);
  
  if (content !== original) {
    writeFile(filePath, content);
    console.log(`✓ Restructured: ${filePath}`);
    return true;
  }
  
  console.log(`- No changes needed: ${filePath}`);
  return false;
}

// Process all pages
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
