const fs = require('fs');
const path = require('path');

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Skip if already wrapped
  if (content.includes('<ErrorBoundary>') && content.includes('</ErrorBoundary>')) {
    return false;
  }
  if (!content.includes('DashboardShell')) {
    return false;
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

  // Wrap each DashboardShell block individually
  let changed = false;
  const regex = /(<DashboardShell[^>]*>)([\s\S]*?)(<\/DashboardShell>)/g;
  content = content.replace(regex, (match, open, inner, close) => {
    // Determine indentation from first non-empty line of inner
    const firstNonEmpty = inner.match(/(\s*)\S/);
    const indent = firstNonEmpty ? firstNonEmpty[1] : '      ';
    const wrapped = `${open}\n${indent}<ErrorBoundary>\n${inner}${indent}</ErrorBoundary>\n${close}`;
    changed = true;
    return wrapped;
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    return true;
  }
  return false;
}

const file = process.argv[2];
if (file) {
  const updated = processFile(file);
  console.log('Updated:', updated);
}
