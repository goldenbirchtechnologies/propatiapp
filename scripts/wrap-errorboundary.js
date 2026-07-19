const fs = require('fs');
const path = require('path');

const ROOT = '/home/r2d2c3p0/NEWPROPATI_new';

function walk(dir, callback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, callback);
    } else if (entry.isFile() && entry.name === 'page.tsx') {
      callback(full);
    }
  }
}

const modified = [];
const skipped = [];

walk(path.join(ROOT, 'src/app/dashboard'), (file) => {
  let content = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file);

  if (!content.includes('DashboardShell')) {
    skipped.push({ file: rel, reason: 'no DashboardShell' });
    return;
  }

  // Skip if already wrapped in JSX
  if (content.includes('<ErrorBoundary>') && content.includes('</ErrorBoundary>')) {
    skipped.push({ file: rel, reason: 'already wrapped' });
    return;
  }

  // Add import if missing
  const importLine = "import { ErrorBoundary } from '@/components/error/ErrorBoundary';";
  if (!content.includes(importLine)) {
    const dsImportMatch = content.match(/import\s+(?:\{\s*DashboardShell\s*\}|DashboardShell)\s+from\s+'@\/components\/layout\/DashboardShell';?\n/);
    if (dsImportMatch) {
      const idx = content.indexOf(dsImportMatch[0]) + dsImportMatch[0].length;
      content = content.slice(0, idx) + importLine + '\n' + content.slice(idx);
    }
  }

  let changed = false;
  content = content.replace(/(<DashboardShell[^>]*>)([\s\S]*?)(<\/DashboardShell>)/g, (match, open, inner, close) => {
    const firstNonEmpty = inner.match(/(\s*)\S/);
    const indent = firstNonEmpty ? firstNonEmpty[1] : '      ';
    const wrapped = `${open}\n${indent}<ErrorBoundary>\n${inner}${indent}</ErrorBoundary>\n${close}`;
    changed = true;
    return wrapped;
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    modified.push(rel);
  } else {
    skipped.push({ file: rel, reason: 'no change made' });
  }
});

console.log('Modified files:', modified.length);
modified.forEach(f => console.log('  ' + f));
console.log('Skipped files:', skipped.length);
skipped.forEach(s => console.log(`  ${s.file}: ${s.reason}`));
