#!/usr/bin/env node

/**
 * Conservative dashboard restructure script.
 * 
 * Key principle: ONLY modify JSX inside return statements.
 * Backend logic (data fetching, state, handlers) is NEVER touched.
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
 * Find the return statement and extract pre-return and post-return code.
 * Returns { before, jsx, after } or null if no return found.
 */
function splitReturnBlock(content) {
  // Find the first `return (` that contains JSX
  const returnMatch = content.match(/(\s*)return\s*\(([\s\S]*?)\);/);
  if (!returnMatch) return null;
  
  const indent = returnMatch[1];
  const jsx = returnMatch[2];
  const before = content.substring(0, returnMatch.index);
  const after = content.substring(returnMatch.index + returnMatch[0].length);
  
  return { before, jsx, after, indent };
}

/**
 * Transform the JSX portion of a file
 */
function transformJSX(jsx) {
  let result = jsx;
  
  // 1. Replace header pattern: <div><h1>Title</h1><p>Description</p></div>
  result = result.replace(
    /<div[^>]*>\s*<h1[^>]*className="[^"]*font-bold[^"]*text-white[^"]*"[^>]*>([^<]+)<\/h1>\s*<p[^>]*className="[^"]*text-zinc-500[^"]*"[^>]*>([^<]*)<\/p>\s*<\/div>/,
    (match, title, description) => {
      return `<PageHeader
    title="${title}"
    description="${description}"
  />`;
    }
  );
  
  // 2. Replace KPI card divs
  result = result.replace(
    /<div className="[^"]*p-6[^"]*">\s*<p className="[^"]*text-zinc-500[^"]*text-sm[^"]*">([^<]+)<\/p>\s*<p className="[^"]*text-2xl[^"]*font-bold[^"]*text-white[^"]*mt-2[^"]*">([^<]+)<\/p>\s*<\/div>/g,
    (match, label, value) => {
      return `<StatCard label="${label}" value="${value}" />`;
    }
  );
  
  // 3. Replace <Card>...</Card> (without nested CardHeader/CardContent)
  result = result.replace(
    /<Card(\s[^>]*)?>([\s\S]*?)<\/Card>/g,
    (match, attrs, inner) => {
      if (inner.includes('CardHeader') || inner.includes('CardContent')) {
        return match;
      }
      const extraClasses = attrs?.match(/className="([^"]*)"/)?.[1] || '';
      return `<div className="glass-card ${extraClasses}">${inner}</div>`;
    }
  );
  
  // 4. Replace CardHeader with CardTitle
  result = result.replace(
    /<CardHeader(\s[^>]*)?>\s*<CardTitle(\s[^>]*)?>([\s\S]*?)<\/CardTitle>\s*<\/CardHeader>/g,
    (match, hAttrs, tAttrs, title) => {
      const titleText = title.trim();
      return `<div className="flex items-center justify-between mb-4"><h3 className="text-white font-semibold text-sm">${titleText}</h3>`;
    }
  );
  
  // 5. Replace CardContent
  result = result.replace(
    /<CardContent(\s[^>]*)?>([\s\S]*?)<\/CardContent>/g,
    (match, attrs, inner) => {
      const extraClasses = attrs?.match(/className="([^"]*)"/)?.[1] || '';
      return `<div className="${extraClasses}">${inner}</div>`;
    }
  );
  
  // Close the header div after CardContent opens
  result = result.replace(
    /(<div className="flex items-center justify-between mb-4">)([\s\S]*?)(<div className="[^"]*">)/,
    '$1$2</div>$3'
  );
  
  // 6. Replace buttons
  result = result.replace(
    /<button className="px-4 py-2 bg-green-600 text-on-success rounded-lg hover:bg-green-700">/g,
    '<Button variant="primary">'
  );
  result = result.replace(
    /<button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50">/g,
    '<Button variant="primary">'
  );
  result = result.replace(
    /<button className="rounded-lg border border-\[#262626\] px-4 py-2 text-sm font-medium hover:bg-obsidian-800-lowest disabled:opacity-50">/g,
    '<Button variant="outline">'
  );
  result = result.replace(
    /<button className="btn btn-secondary text-sm" style=\{[^}]+\}>/g,
    '<Button variant="outline">'
  );
  
  // 7. Replace empty state
  result = result.replace(
    /<div className="text-center py-12">\s*<([^>]+) className="h-12 w-12 mx-auto mb-4"\s*style=\{\{ color: 'text-zinc-400', opacity: 0\.5 \}\}\s*\/>\s*<p className="font-medium"\s*className="text-white">([^<]+)<\/p>\s*<p className="text-sm mt-1"\s*style=\{\{ color: 'text-zinc-400' \}\}>([^<]+)<\/p>\s*<\/div>/g,
    (match, iconClass, title, description) => {
      return `<EmptyState icon={Inbox} title="${title}" description="${description}" />`;
    }
  );
  
  // 8. Replace progress bars
  result = result.replace(
    /<div className="h-1\.5 rounded-full bg-zinc-800\/10 overflow-hidden">\s*<div className="h-full rounded-full bg-neutral-600\/80" style=\{\{ width: `\$\{[^}]+\}` \}\} \/>\s*<\/div>/g,
    '<Progress value={50} className="h-1.5" />'
  );
  
  return result;
}

/**
 * Transform imports only
 */
function transformImports(content) {
  let result = content;
  
  // Replace Card imports
  result = result.replace(
    /import\s*\{?\s*Card\s*,?\s*CardContent\s*,?\s*CardHeader\s*,?\s*CardTitle\s*,?\s*CardDescription\s*?\s*\}?\s*,?\s*from\s*['"]@\/components\/ui\/card['"];?\n/g,
    "import { PageHeader, StatCard, StatusBadge, Progress, SectionLabel, Avatar, EmptyState } from '@/components/ui';\n"
  );
  
  // Replace Badge import
  if (result.includes('Badge') && !result.includes('StatusBadge')) {
    result = result.replace(
      /import\s*\{?\s*Badge\s*\}?\s*,?\s*from\s*['"]@\/components\/ui\/badge['"];?\n/g,
      "import { StatusBadge } from '@/components/ui';\n"
    );
  }
  
  // Add Button import
  if ((result.includes('<button') || result.includes('<Button')) && !result.includes("from '@/components/ui/button'")) {
    result = result.replace(
      /(import\s*\{[^}]*from\s*['"]@\/components\/ui\/['"];?\n)/,
      "$1import { Button } from '@/components/ui/button';\n"
    );
  }
  
  // Add PageHeader if needed
  if (!result.includes('PageHeader')) {
    result = result.replace(
      /(import\s*\{[^}]*from\s*['"]@\/components\/ui\/['"];?\n)/,
      "$1import { PageHeader } from '@/components/ui';\n"
    );
  }
  
  // Add StatCard if needed
  if (!result.includes('StatCard')) {
    result = result.replace(
      /(import\s*\{[^}]*from\s*['"]@\/components\/ui\/['"];?\n)/,
      "$1import { StatCard } from '@/components/ui';\n"
    );
  }
  
  return result;
}

/**
 * Replace legacy class names globally (safe in JSX)
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

function transformPage(filePath) {
  let content = readFile(filePath);
  if (!content) return false;
  
  const original = content;
  
  // Phase 1: Imports
  content = transformImports(content);
  
  // Phase 2: Classes (global - safe in JSX only)
  content = transformClasses(content);
  
  // Phase 3: JSX structure (only inside return blocks)
  const returnBlock = splitReturnBlock(content);
  if (returnBlock) {
    const transformedJSX = transformJSX(returnBlock.jsx);
    if (transformedJSX !== returnBlock.jsx) {
      content = returnBlock.before + `return (${transformedJSX});` + returnBlock.after;
    }
  }
  
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
