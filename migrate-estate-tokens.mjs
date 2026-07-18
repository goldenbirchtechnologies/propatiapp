import fs from 'fs';
import path from 'path';

const ROOT = '/home/r2d2c3p0/NEWPROPATI_new';
const TARGET_DIR = path.join(ROOT, 'src/app/dashboard/estate-manager');

function findTargetFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findTargetFiles(fullPath));
    } else if (/\.(tsx?)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

function hasMaterialTokens(content) {
  return /bg-surface-container-|text-on-surface-variant|border-outline-variant|bg-surface-container-lowest|bg-surface-container-high|on-primary-container|secondary-container|on-secondary-fixed|primary-container/.test(content);
}

const allFiles = findTargetFiles(TARGET_DIR);
const targetFiles = allFiles.filter(f => hasMaterialTokens(fs.readFileSync(f, 'utf8')));

console.log(`Found ${targetFiles.length} files with material-like tokens`);

const tokenReplacements = [
  ['bg-surface-container-lowest', 'bg-background'],
  ['bg-surface-container-high', 'bg-muted'],
  ['bg-surface-container-low', 'bg-surface'],
  ['bg-surface-container', 'bg-surface'],
  ['text-on-surface-variant', 'text-muted-foreground'],
  ['border-outline-variant', 'border-border'],
  ['on-primary-container', 'text-primary-foreground'],
  ['secondary-container', 'bg-secondary'],
  ['on-secondary-fixed', 'text-secondary-foreground'],
  ['primary-container', 'bg-primary'],
];

function replaceTokens(str) {
  let result = str;
  for (const [oldToken, newToken] of tokenReplacements) {
    result = result.replace(new RegExp(`\\b${oldToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?!\\d)`, 'g'), newToken);
  }
  return result;
}

let totalChanges = 0;

function applyClassNameReplacements(content) {
  let changed = false;
  let count = 0;
  for (const [oldToken, newToken] of tokenReplacements) {
    const regex = new RegExp(`\\b${oldToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?!\\d)`, 'g');
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
  // Simple color conversions
  { pattern: /style=\{\{\s*color:\s*'text-on-surface-variant'\s*\}\}/g, replacement: 'className="text-muted-foreground"' },
  { pattern: /style=\{\{\s*color:\s*'text-on-surface-variant',\s*marginTop:\s*'mt-1'\s*\}\}/g, replacement: 'className="text-muted-foreground" style={{ marginTop: \'mt-1\' }}' },
  { pattern: /style=\{\{\s*color:\s*'text-on-surface-variant',\s*opacity:\s*0\.5\s*\}\}/g, replacement: 'className="text-muted-foreground" style={{ opacity: 0.5 }}' },
  { pattern: /style=\{\{\s*borderColor:\s*'border-outline-variant'\s*\}\}/g, replacement: 'className="border-border"' },
  { pattern: /style=\{\{\s*borderColor:\s*'border-outline-variant',\s*animation:\s*'skel-pulse[^']*'\s*\}\}/g, replacement: (match) => {
    const animMatch = match.match(/animation:\s*'([^']+)'/);
    const anim = animMatch ? animMatch[1] : '';
    return `className="border-border" style={{ animation: '${anim}' }}`;
  }},
  // Skeleton background replacements
  { pattern: /style=\{\{\s*background:\s*'border-outline-variant'\s*\}\}/g, replacement: 'className="border-border"' },
  { pattern: /style=\{\{\s*height:\s*(\d+),\s*width:\s*([^,]+),\s*background:\s*'border-outline-variant'\s*\}\}/g, replacement: (match, h, w) => `className="border-border" style={{ height: ${h}, width: ${w} }}` },
  // Background + color
  { pattern: /style=\{\{\s*background:\s*'bg-surface-container-low',\s*color:\s*'text-primary'\s*\}\}/g, replacement: 'className="bg-surface text-primary"' },
  // Tertiary patterns
  { pattern: /style=\{\{\s*color:\s*'text-primary'\s*\}\}/g, replacement: 'className="text-primary"' },
  // marginTop without token
  { pattern: /style=\{\{\s*marginTop:\s*'var\(--space-vs\)'\s*\}\}/g, replacement: (match) => match },
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

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`Updated: ${path.relative(ROOT, file)} (${fileChanges} changes)`);
    totalChanges += fileChanges;
  }
}

console.log(`\nTotal changes: ${totalChanges}`);
