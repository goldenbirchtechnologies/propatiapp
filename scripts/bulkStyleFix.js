// scripts/bulkStyleFix.js
const fs = require('fs');
const path = require('path');

// Directory to process
const ROOT = path.resolve(__dirname, '..', 'src', 'app', 'dashboard');

// Helper to walk directory recursively
function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, filelist);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      filelist.push(fullPath);
    }
  });
  return filelist;
}

// Replacement rules
const rules = [
  // Background colors
  {
    pattern: /\bbg-(black|zinc-950|zinc-900)\b/g,
    replacer: (match, p1) => `bg-white dark:bg-${p1}`,
  },
  // Specific custom hex backgrounds
  {
    pattern: /bg-\[#09090b\]/g,
    replacer: () => 'bg-[#F8FAFC] dark:bg-black',
  },
  {
    pattern: /bg-\[#121214\]/g,
    replacer: () => 'bg-[#F8FAFC] dark:bg-black',
  },
  // Border white opacity → add light border
  {
    pattern: /border-white\/\[0\.08\]/g,
    replacer: () => 'border-zinc-200 dark:border-white/[0.08]',
  },
  // Text colors – generic white to dark mode aware
  {
    pattern: /\btext-white\b/g,
    replacer: () => 'text-zinc-900 dark:text-white',
  },
  // Specific zinc text shades (300,400,500) → light/dark equivalents
  {
    pattern: /\btext-zinc-(300|400|500)\b/g,
    replacer: (match, p1) => {
      const map = { '300': '600', '400': '600', '500': '600' };
      return `text-zinc-${map[p1]} dark:text-zinc-400`;
    },
  },
];

let changedFiles = [];

const files = walk(ROOT);
files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  rules.forEach(({ pattern, replacer }) => {
    content = content.replace(pattern, replacer);
  });
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles.push(file);
  }
});

// Simple report
console.log('Bulk style fix applied. Files changed:');
changedFiles.forEach((f) => console.log(f));

// Save a JSON summary for later review
const summaryPath = path.join(__dirname, 'bulkStyleFixReport.json');
fs.writeFileSync(summaryPath, JSON.stringify({ changedFiles }, null, 2), 'utf8');
