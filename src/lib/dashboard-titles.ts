const ROLE_LABELS: Record<string, string> = {
  landlord: 'Landlord',
  tenant: 'Tenant',
  agent: 'Agent',
  admin: 'Admin',
  accountant: 'Accountant',
  estate_manager: 'Estate Manager',
  'estate-manager': 'Estate Manager',
};

const TITLE_MAP: Array<[RegExp, string]> = [
  [/^\/dashboard\/landlord$/, 'Dashboard'],
  [/^\/dashboard\/landlord\/portfolio$/, 'Portfolio'],
  [/^\/dashboard\/landlord\/properties$/, 'My Properties'],
  [/^\/dashboard\/landlord\/properties\/new$/, 'Add Property'],
  [/^\/dashboard\/landlord\/properties\/[^/]+$/, 'Property Details'],
  [/^\/dashboard\/landlord\/properties\/[^/]+\/edit$/, 'Edit Property'],
  [/^\/dashboard\/landlord\/properties\/[^/]+\/publish$/, 'Publish Property'],
  [/^\/dashboard\/landlord\/listing\/new$/, 'List to Marketplace'],
  [/^\/dashboard\/landlord\/listing\/[^/]+$/, 'Marketplace Listing'],
  [/^\/dashboard\/landlord\/applications$/, 'Applications'],
  [/^\/dashboard\/landlord\/applications\/[^/]+$/, 'Application Details'],
  [/^\/dashboard\/landlord\/tenants$/, 'Tenants'],
  [/^\/dashboard\/landlord\/tenants\/[^/]+$/, 'Tenant Details'],
  [/^\/dashboard\/landlord\/leases$/, 'Leases & Agreements'],
  [/^\/dashboard\/landlord\/agreements$/, 'Agreements'],
  [/^\/dashboard\/landlord\/messages$/, 'Messages'],
  [/^\/dashboard\/landlord\/agents$/, 'Agent Invites'],
  [/^\/dashboard\/landlord\/maintenance$/, 'Maintenance & Turnover'],
  [/^\/dashboard\/landlord\/turnover$/, 'Turnover'],
  [/^\/dashboard\/landlord\/short-let$/, 'Short-let Requests'],
  [/^\/dashboard\/landlord\/financials$/, 'Financials'],
  [/^\/dashboard\/landlord\/financials\/forecasting$/, 'Financial Forecasting'],
  [/^\/dashboard\/landlord\/financials\/scenario-builder$/, 'Scenario Builder'],
  [/^\/dashboard\/landlord\/financials\/withdrawals$/, 'Withdrawals'],
  [/^\/dashboard\/landlord\/financials\/reports$/, 'Financial Reports'],
  [/^\/dashboard\/landlord\/revenue-forecast$/, 'Revenue Forecast'],
  [/^\/dashboard\/landlord\/revenue-forecast\/scenario-builder$/, 'Revenue Scenario Builder'],
  [/^\/dashboard\/landlord\/profile$/, 'Profile'],
  [/^\/dashboard\/landlord\/notifications$/, 'Notifications'],
  [/^\/dashboard\/landlord\/screening$/, 'Screening'],
  [/^\/dashboard\/landlord\/verify$/, 'Verify Property'],
];

function roleLabel(role?: string) {
  if (!role) return 'Dashboard';
  return ROLE_LABELS[role.toLowerCase()] || role.replace(/[_-]/g, ' ');
}

function titleCase(slug: string) {
  return slug
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getDashboardPageTitle(pathname: string, userRole?: string) {
  const matched = TITLE_MAP.find(([pattern]) => pattern.test(pathname));
  const role = roleLabel(userRole);
  if (matched) return `${matched[1]} - ${role}`;

  const match = pathname.match(/^\/dashboard\/[^/]+\/(.+)$/);
  if (!match) return `${role} Dashboard`;

  const parts = match[1].split('/').filter(Boolean);
  const last = parts[parts.length - 1];
  if (!last) return `${role} Dashboard`;
  return `${titleCase(last)} - ${role}`;
}
