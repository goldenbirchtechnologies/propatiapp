const fs = require('fs');
const path = require('path');
const glob = require('glob');

const root = process.cwd();

// File map: each entry has path, openBranchPattern (unique context to find the branch with unclosed EB), and orphanPattern (unique context to find the orphan closing tag)
const fixes = [
  {
    file: 'src/app/dashboard/estate-manager/units/[unitId]/page.tsx',
    openBranch: {
      before: '          <Skeleton className="h-64 rounded-xl" />\n        </div>\n      </DashboardShell>',
      after:  '          <Skeleton className="h-64 rounded-xl" />\n        </div>\n        </ErrorBoundary>\n      </DashboardShell>'
    },
    orphan: {
      before: '      </div>\n\n        </ErrorBoundary>\n</DashboardShell>\n  );\n}',
      after:  '      </div>\n\n</DashboardShell>\n  );\n}'
    }
  },
  {
    file: 'src/app/dashboard/estate-manager/tenants/page.tsx',
    openBranch: {
      before: '            <button onClick={retry} className="btn btn-secondary text-sm" style={{ padding: \'p-4 p-6\' }}>Retry</button>\n          </div>\n        </div>\n      </DashboardShell>',
      after:  '            <button onClick={retry} className="btn btn-secondary text-sm" style={{ padding: \'p-4 p-6\' }}>Retry</button>\n          </div>\n        </div>\n        </ErrorBoundary>\n      </DashboardShell>'
    },
    orphan: {
      before: '    \n        </ErrorBoundary>\n</DashboardShell>\n  );\n}',
      after:  '\n</DashboardShell>\n  );\n}'
    }
  },
  {
    file: 'src/app/dashboard/estate-manager/move-in/page.tsx',
    openBranch: {
      before: '              Retry\n            </button>\n          </div>\n        </section>\n      </DashboardShell>',
      after:  '              Retry\n            </button>\n          </div>\n        </section>\n        </ErrorBoundary>\n      </DashboardShell>'
    },
    orphan: {
      before: '      </div>\n    \n        </ErrorBoundary>\n</DashboardShell>\n  );\n}',
      after:  '      </div>\n\n</DashboardShell>\n  );\n}'
    }
  },
  {
    file: 'src/app/dashboard/estate-manager/maintenance/[id]/page.tsx',
    openBranch: {
      before: '          <Skeleton className="h-48 rounded-xl" />\n        </div>\n      </DashboardShell>',
      after:  '          <Skeleton className="h-48 rounded-xl" />\n        </div>\n        </ErrorBoundary>\n      </DashboardShell>'
    },
    orphan: {
      before: '      </div>\n    \n        </ErrorBoundary>\n</DashboardShell>\n  );\n}',
      after:  '      </div>\n\n</DashboardShell>\n  );\n}'
    }
  },
  {
    file: 'src/app/dashboard/estate-manager/lease-review/page.tsx',
    openBranch: {
      before: '            <button onClick={() => setError(null)} className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90">Retry</button>\n          </div>\n        </section>\n      </DashboardShell>',
      after:  '            <button onClick={() => setError(null)} className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90">Retry</button>\n          </div>\n        </section>\n        </ErrorBoundary>\n      </DashboardShell>'
    },
    orphan: {
      before: '      </div>\n    \n        </ErrorBoundary>\n</DashboardShell>\n  );\n}',
      after:  '      </div>\n\n</DashboardShell>\n  );\n}'
    }
  },
  {
    file: 'src/app/dashboard/estate-manager/lease-negotiation/page.tsx',
    openBranch: {
      before: '            <button onClick={() => setError(null)} className="px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90">Retry</button>\n          </div>\n        </div>\n      </DashboardShell>',
      after:  '            <button onClick={() => setError(null)} className="px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90">Retry</button>\n          </div>\n        </div>\n        </ErrorBoundary>\n      </DashboardShell>'
    },
    orphan: {
      before: '      </div>\n    \n        </ErrorBoundary>\n</DashboardShell>\n  );\n}',
      after:  '      </div>\n\n</DashboardShell>\n  );\n}'
    }
  },
  {
    file: 'src/app/dashboard/estate-manager/financials/page.tsx',
    openBranch: {
      before: '            <button onClick={retry} className="btn btn-secondary text-sm" style={{ padding: \'p-4 p-6\' }}>Retry</button>\n          </div>\n        </div>\n      </DashboardShell>',
      after:  '            <button onClick={retry} className="btn btn-secondary text-sm" style={{ padding: \'p-4 p-6\' }}>Retry</button>\n          </div>\n        </div>\n        </ErrorBoundary>\n      </DashboardShell>'
    },
    orphan: {
      before: '      </div>\n    \n        </ErrorBoundary>\n</DashboardShell>\n  );\n}',
      after:  '      </div>\n\n</DashboardShell>\n  );\n}'
    }
  },
  {
    file: 'src/app/dashboard/estate-manager/commercial-leases/page.tsx',
    openBranch: {
      before: '            <button onClick={() => setError(null)} className="px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90">Retry</button>\n          </div>\n        </div>\n      </DashboardShell>',
      after:  '            <button onClick={() => setError(null)} className="px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90">Retry</button>\n          </div>\n        </div>\n        </ErrorBoundary>\n      </DashboardShell>'
    },
    orphan: {
      before: '      </div>\n    \n        </ErrorBoundary>\n</DashboardShell>\n  );\n}',
      after:  '      </div>\n\n</DashboardShell>\n  );\n}'
    }
  },
  {
    file: 'src/app/dashboard/admin/disputes/[id]/page.tsx',
    openBranch: {
      before: '          <Link href="/dashboard/admin/disputes" className="text-blue-600 underline">Back to disputes</Link>\n        </div>\n      </DashboardShell>',
      after:  '          <Link href="/dashboard/admin/disputes" className="text-blue-600 underline">Back to disputes</Link>\n        </div>\n        </ErrorBoundary>\n      </DashboardShell>'
    },
    orphan: {
      before: '      </div>\n    \n        </ErrorBoundary>\n</DashboardShell>\n  );\n}',
      after:  '      </div>\n\n</DashboardShell>\n  );\n}'
    }
  }
];

let changes = 0;
for (const fix of fixes) {
  const fullPath = path.join(root, fix.file);
  let content = fs.readFileSync(fullPath, 'utf8');
  
  if (content.includes(fix.openBranch.before)) {
    content = content.replace(fix.openBranch.before, fix.openBranch.after);
    console.log('FIXED open branch: ' + fix.file);
    changes++;
  } else {
    console.log('WARNING: open branch pattern not found in ' + fix.file);
  }
  
  if (content.includes(fix.orphan.before)) {
    content = content.replace(fix.orphan.before, fix.orphan.after);
    console.log('FIXED orphan tag: ' + fix.file);
    changes++;
  } else {
    console.log('WARNING: orphan pattern not found in ' + fix.file);
  }
  
  fs.writeFileSync(fullPath, content, 'utf8');
}

console.log('Total changes: ' + changes);
