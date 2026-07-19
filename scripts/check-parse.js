const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');

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

const errors = [];

walk(path.join(ROOT, 'src/app/dashboard'), (file) => {
  const code = fs.readFileSync(file, 'utf8');
  if (!code.includes('DashboardShell')) return;
  if (!code.includes('<ErrorBoundary>')) return;
  try {
    parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
  } catch (e) {
    errors.push({ file: path.relative(ROOT, file), message: e.message });
  }
});

console.log('Parse errors:', errors.length);
errors.forEach(e => console.log(`  ${e.file}: ${e.message}`));
