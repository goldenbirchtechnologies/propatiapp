#!/usr/bin/env node

/**
 * Targeted JSX restructure for dashboard pages.
 * 
 * This script transforms specific, well-defined JSX patterns inside return blocks.
 * It is deliberately conservative - only replaces patterns that exactly match.
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
 * Split content at the return statement to isolate JSX
 */
function splitReturnBlock(content) {
  const returnMatch = content.match(/(\s*)return\s*\(([\s\S]*?)\);/);
  if (!returnMatch) return null;
  
  const indent = returnMatch[1];
  const jsx = returnMatch[2];
  const before = content.substring(0, returnMatch.index);
  const after = content.substring(returnMatch.index + returnMatch[0].length);
  
  return { before, jsx, after, indent };
}

/**
 * Transform header: <div><h1>Title</h1><p>Description</p></div> -> PageHeader
 * Only when h1 has text-white and p has text-zinc-500
 */
function transformHeader(jsx) {
  const pattern = /<div[^>]*>\s*<h1[^>]*className="[^"]*font-bold[^"]*text-white[^"]*"[^>]*>([^<]+)<\/h1>\s*<p[^>]*className="[^"]*text-zinc-500[^"]*"[^>]*>([^<]*)<\/p>\s*<\/div>/;
  
  if (pattern.test(jsx)) {
    jsx = jsx.replace(pattern, (match, title, description) => {
      return `<PageHeader
    title="${title}"
    description="${description}"
  />`;
    });
  }
  
  return jsx;
}

/**
 * Transform KPI card: div with p(text-zinc-500 text-sm) + p(text-2xl font-bold text-white mt-2)
 */
function transformKPICards(jsx) {
  const pattern = /<div className="[^"]*p-6[^"]*">\s*<p className="[^"]*text-zinc-500[^"]*text-sm[^"]*">([^<]+)<\/p>\s*<p className="[^"]*text-2xl[^"]*font-bold[^"]*text-white[^"]*mt-2[^"]*">([^<]+)<\/p>\s*<\/div>/g;
  
  jsx = jsx.replace(pattern, (match, label, value) => {
    return `<StatCard label="${label}" value="${value}" />`;
  });
  
  return jsx;
}

/**
 * Transform status badge: <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-{color}-100 text-{color}-800">
 */
function transformStatusBadges(jsx) {
  // Match inline status badges with specific color patterns
  jsx = jsx.replace(
    /<span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-zinc-900 text-white">/g,
    '<StatusBadge variant="default" size="sm">'
  );
  jsx = jsx.replace(
    /<span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-emerald-500\/10 text-emerald-400">/g,
    '<StatusBadge variant="success" size="sm">'
  );
  jsx = jsx.replace(
    /<span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-amber-500\/10 text-amber-400">/g,
    '<StatusBadge variant="warning" size="sm">'
  );
  jsx = jsx.replace(
    /<span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-red-500\/10 text-red-400">/g,
    '<StatusBadge variant="error" size="sm">'
  );
  jsx = jsx.replace(
    /<span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-zinc-800 text-zinc-400">/g,
    '<StatusBadge variant="neutral" size="sm">'
  );
  
  // Also handle legacy color classes that were already replaced
  jsx = jsx.replace(
    /<span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-emerald-400">/g,
    '<StatusBadge variant="success" size="sm">'
  );
  jsx = jsx.replace(
    /<span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-red-100 text-red-400">/g,
    '<StatusBadge variant="error" size="sm">'
  );
  
  // Close the StatusBadge tags
  jsx = jsx.replace(/<\/span>/g, '</StatusBadge>');
  
  return jsx;
}

/**
 * Transform buttons
 */
function transformButtons(jsx) {
  jsx = jsx.replace(
    /<button className="px-4 py-2 bg-green-600 text-on-success rounded-lg hover:bg-green-700">/g,
    '<Button variant="primary">'
  );
  jsx = jsx.replace(
    /<button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50">/g,
    '<Button variant="primary">'
  );
  jsx = jsx.replace(
    /<button className="rounded-lg border border-\[#262626\] px-4 py-2 text-sm font-medium hover:bg-obsidian-800-lowest disabled:opacity-50">/g,
    '<Button variant="outline">'
  );
  jsx = jsx.replace(
    /<button className="btn btn-secondary text-sm" style=\{[^}]+\}>/g,
    '<Button variant="outline">'
  );
  jsx = jsx.replace(
    /<button className="btn btn-outline inline-flex items-center gap-2">/g,
    '<Button variant="outline">'
  );
  
  return jsx;
}

/**
 * Transform simple Card components
 */
function transformCards(jsx) {
  // Replace CardHeader/CardTitle/CardContent pattern
  jsx = jsx.replace(
    /<CardHeader(\s[^>]*)?>\s*<CardTitle(\s[^>]*)?>([\s\S]*?)<\/CardTitle>\s*<\/CardHeader>/g,
    (match, hAttrs, tAttrs, title) => {
      const titleText = title.trim();
      return `<div className="flex items-center justify-between mb-4"><h3 className="text-white font-semibold text-sm">${titleText}</h3>`;
    }
  );
  
  jsx = jsx.replace(
    /<CardContent(\s[^>]*)?>([\s\S]*?)<\/CardContent>/g,
    (match, attrs, inner) => {
      const extraClasses = attrs?.match(/className="([^"]*)"/)?.[1] || '';
      return `<div className="${extraClasses}">${inner}</div>`;
    }
  );
  
  // Close the header div after CardContent opens
  jsx = jsx.replace(
    /(<div className="flex items-center justify-between mb-4">)([\s\S]*?)(<div className="[^"]*">)/,
    '$1$2</div>$3'
  );
  
  // Replace simple <Card>...</Card> without nested components
  jsx = jsx.replace(
    /<Card(\s[^>]*)?>([\s\S]*?)<\/Card>/g,
    (match, attrs, inner) => {
      if (inner.includes('CardHeader') || inner.includes('CardContent')) {
        return match;
      }
      const extraClasses = attrs?.match(/className="([^"]*)"/)?.[1] || '';
      return `<div className="glass-card ${extraClasses}">${inner}</div>`;
    }
  );
  
  return jsx;
}

/**
 * Replace button closing tags
 */
function closeButtonTags(jsx) {
  // Close <Button variant="..."> tags that aren't properly closed
  jsx = jsx.replace(
    /(<Button variant="[^"]*">)([\s\S]*?)(<div[^>]*>|<span[^>]*>|<\/div>|<\/span>|<\/table>|<\/ErrorBoundary>|<\/DashboardShell>)/g,
    '$1$2</Button>$3'
  );
  
  // Also handle closing tags at the end of lines or before newlines
  jsx = jsx.replace(
    /(<Button variant="[^"]*">[\s\S]*?)(?=\n\s*<\/ErrorBoundary>)/g,
    (match) => match + '</Button>'
  );
  
  return jsx;
}

function transformPage(filePath) {
  let content = readFile(filePath);
  if (!content) return false;
  
  const original = content;
  const returnBlock = splitReturnBlock(content);
  
  if (!returnBlock) {
    console.log(`- No return block: ${filePath}`);
    return false;
  }
  
  let jsx = returnBlock.jsx;
  
  // Apply JSX transformations
  jsx = transformHeader(jsx);
  jsx = transformKPICards(jsx);
  jsx = transformCards(jsx);
  jsx = transformButtons(jsx);
  jsx = transformStatusBadges(jsx);
  jsx = closeButtonTags(jsx);
  
  if (jsx !== returnBlock.jsx) {
    content = returnBlock.before + `return (${jsx});` + returnBlock.after;
    writeFile(filePath, content);
    console.log(`✓ Restructured: ${filePath}`);
    return true;
  }
  
  console.log(`- No JSX changes needed: ${filePath}`);
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
