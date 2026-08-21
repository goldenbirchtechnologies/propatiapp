import fs from 'fs';
import path from 'path';

const ROOT = '/home/r2d2c3p0/NEWPROPATI_new';

// Target directories
const TARGET_DIRS = [
  'src/app/dashboard/tenant',
  'src/app/dashboard/accountant',
  'src/app/dashboard/estate-manager',
  'src/app/dashboard/landlord',
  'src/app/dashboard/admin',
  'src/app/dashboard/agent',
  'src/app/dashboard/[role]',
  'src/app/dashboard/verification',
  'src/app/dashboard/shared',
];

function findTargetFiles(dir) {
  const files = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...findTargetFiles(fullPath));
      } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  } catch (e) {
    // Directory might not exist
  }
  return files;
}

function hasOldTokens(content) {
  return content.includes('text-primary') ||
    content.includes('text-on-surface-variant') ||
    content.includes('bg-surface-container-low') ||
    content.includes('bg-blue-50') ||
    content.includes('bg-success-bright/10') ||
    content.includes('bg-destructive/10') ||
    content.includes('border-success-bright') ||
    content.includes('border-destructive') ||
    content.includes('border-outline-variant') ||
    content.includes('border-surface') ||
    content.includes('text-neutral-400-foreground') ||
    content.includes('text-success') ||
    content.includes('text-destructive') ||
    content.includes('divide-outline-variant') ||
    content.includes('bg-surface-container-low/60') ||
    content.includes('hover:bg-surface-container') ||
    content.includes("style={{ color: 'text-white'") ||
    content.includes("style={{ color: 'text-neutral-400'") ||
    content.includes("borderColor: 'border-");
}

// Build file list
let allFiles = [];
for (const dir of TARGET_DIRS) {
  const fullDir = path.join(ROOT, dir);
  if (fs.existsSync(fullDir)) {
    allFiles.push(...findTargetFiles(fullDir));
  }
}

const targetFiles = allFiles.filter(f => hasOldTokens(fs.readFileSync(f, 'utf8')));
console.log(`Found ${targetFiles.length} files with old tokens`);

// Token replacements for className strings
const tokenReplacements = [
  // Text colors
  ['text-primary', 'text-white'],
  ['text-on-surface-variant', 'text-neutral-400'],
  ['text-success', 'text-[#00ff66]'],
  ['text-destructive', 'text-red-500'],
  
  // Backgrounds
  ['bg-surface-container-low', 'bg-surface-container-lowest'],
  ['bg-blue-50', 'bg-[#262626]'],
  ['bg-success-bright/10', 'bg-[#00ff66]/10'],
  ['bg-destructive/10', 'bg-red-500/10'],
  
  // Borders
  ['border-success-bright/20', 'border-[#00ff66]/20'],
  ['border-destructive/20', 'border-red-500/20'],
  ['divide-outline-variant', 'divide-[#262626]'],
  ['border-outline-variant', 'border-[#262626]'],
  ['border-surface', 'border-[#262626]'],
  
  // Hover/opacity
  ['bg-surface-container-low/60', 'bg-obsidian-800/60'],
  ['hover:bg-surface-container', 'hover:bg-obsidian-800'],
  
  // Fix invalid classes
  ['text-neutral-400-foreground', 'text-neutral-400'],
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyClassNameReplacements(content) {
  let changed = false;
  let count = 0;
  
  for (const [oldToken, newToken] of tokenReplacements) {
    const regex = new RegExp(`\\b${escapeRegex(oldToken)}(?!\\d)`, 'g');
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, newToken);
      changed = true;
      count += matches.length;
    }
  }
  
  return { content, changed, count };
}

// Inline style replacements
const inlineStyleReplacements = [
  { pattern: /style=\{\{\s*color:\s*'text-white'\s*\}\}/g, replacement: 'className="text-white"' },
  { pattern: /style=\{\{\s*color:\s*'text-neutral-400'\s*\}\}/g, replacement: 'className="text-neutral-400"' },
  { pattern: /borderColor:\s*'border-\[#262626\]'/g, replacement: 'className="border-[#262626]"' },
];

function applyInlineStyleReplacements(content) {
  let changed = false;
  let count = 0;
  
  for (const repl of inlineStyleReplacements) {
    if (typeof repl.replacement === 'function') {
      content = content.replace(repl.pattern, (match, ...args) => {
        const newRepl = repl.replacement(match, ...args);
        if (newRepl !== match) {
          changed = true;
          count++;
        }
        return newRepl;
      });
    } else {
      const matches = content.match(repl.pattern);
      if (matches) {
        content = content.replace(repl.pattern, repl.replacement);
        changed = true;
        count += matches.length;
      }
    }
  }
  
  return { content, changed, count };
}

// Card wrapper replacements - only for page.tsx files that wrap whole content
function applyCardWrapperReplacements(content) {
  let changed = false;
  let count = 0;
  
  // Match: <Card className="p-6"> or <Card className="p-6 " or with other classes before p-6
  // We only replace if it's a top-level page wrapper, not inside other components
  // Pattern: <Card className="...p-6..." followed by content, then </Card>
  // This is tricky - let's be conservative and only replace exact <Card className="p-6">
  
  const cardPattern = /<Card\s+className="p-6"\s*>/g;
  const matches = content.match(cardPattern);
  if (matches) {
    content = content.replace(cardPattern, '<div className="glass-card rounded-xl p-6">');
    changed = true;
    count += matches.length;
  }
  
  // Also handle <Card className="p-6 " etc with trailing space
  const cardPattern2 = /<Card\s+className="p-6\s+"?>/g;
  const matches2 = content.match(cardPattern2);
  if (matches2) {
    content = content.replace(cardPattern2, '<div className="glass-card rounded-xl p-6">');
    changed = true;
    count += matches2.length;
  }
  
  // Handle closing Card tags that match opening ones
  // This is complex - we'll rely on manual review for edge cases
  
  return { content, changed, count };
}

let totalChanges = 0;
const updatedFiles = [];

for (const file of targetFiles) {
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;
  let fileChanges = 0;

  // 1. className replacements
  const cl = applyClassNameReplacements(content);
  content = cl.content;
  fileChanges += cl.count;

  // 2. inline style replacements
  const il = applyInlineStyleReplacements(content);
  content = il.content;
  fileChanges += il.count;

  // 3. Card wrapper replacements (only for page.tsx files to be conservative)
  if (file.endsWith('page.tsx')) {
    const card = applyCardWrapperReplacements(content);
    content = card.content;
    fileChanges += card.count;
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`Updated: ${path.relative(ROOT, file)} (${fileChanges} changes)`);
    totalChanges += fileChanges;
    updatedFiles.push(path.relative(ROOT, file));
  }
}

console.log(`\nTotal files updated: ${updatedFiles.length}`);
console.log(`Total changes: ${totalChanges}`);

// Write summary to file
fs.writeFileSync(path.join(ROOT, 'obsidian-flux-update-summary.txt'), 
  `Updated ${updatedFiles.length} files\nTotal changes: ${totalChanges}\n\nFiles:\n` + 
  updatedFiles.join('\n')
);
