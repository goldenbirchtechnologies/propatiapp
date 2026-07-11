const fs = require('fs');
const path = require('path');

const REF_DIR = '/home/r2d2c3p0/NEWPROPATI_new/stitch_propati_real_estate_ui_marketplace/stitch_propati_real_estate_ui_marketplace/ui_design_reference';
const ROOT = '/home/r2d2c3p0/NEWPROPATI_new';

function stripHtml(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '')
             .replace(/<style[\s\S]*?<\/style>/gi, '')
             .replace(/<[^>]+>/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&nbsp;/g, ' ')
             .replace(/&quot;/g, '`')
             .replace(/&#(\d+);/g, '')
             .replace(/\s+/g, ' ').trim();
}

function extractTags(html, tag) {
  const re = new RegExp('<' + tag + '[^>]*>([^<]+)</' + tag + '>', 'gi');
  const matches = [];
  let m;
  while ((m = re.exec(html))) matches.push(m[1].trim());
  return matches;
}

function fileNameToTitle(name) {
  return name.replace(/_/g, ' ').replace(/ propati/g, '').replace(/\b\w/g, (c) => c.toUpperCase());
}

const mapping = [
  { name: 'add_payment_method_modal_propati_tenant_portal', route: 'src/app/dashboard/tenant/payments/methods/new', role: 'tenant', nav: 'TENANT_NAVIGATION' },
  { name: 'admin_console_propati_overview', route: 'src/app/dashboard/admin', role: 'admin', nav: 'ADMIN_NAVIGATION', maxLen: 600 },
  { name: 'admin_profile_security_settings_propati_admin', route: 'src/app/dashboard/admin/profile/security', role: 'admin', nav: 'ADMIN_NAVIGATION' },
  { name: 'agent_dashboard_propati', route: 'src/app/dashboard/agent', role: 'agent', nav: 'AGENT_NAVIGATION', maxLen: 600 },
  { name: 'agent_verification_portal_propati', route: 'src/app/dashboard/agent/verifications', role: 'agent', nav: 'AGENT_NAVIGATION' },
  { name: 'audit_event_detail_permission_update_propati_admin', route: 'src/app/dashboard/admin/audit/event-detail', role: 'admin', nav: 'ADMIN_NAVIGATION' },
  { name: 'auto_pay_configuration_propati_tenant_portal', route: 'src/app/dashboard/tenant/payments/auto-pay', role: 'tenant', nav: 'TENANT_NAVIGATION' },
  { name: 'automated_monthly_statement_propati_tenant_portal', route: 'src/app/dashboard/tenant/payments/statements', role: 'tenant', nav: 'TENANT_NAVIGATION' },
  { name: 'commercial_lease_shop_collection_propati_commercial_console', route: 'src/app/dashboard/landlord/commercial/leases', role: 'landlord', nav: 'LANDLORD_NAVIGATION' },
  { name: 'estate_manager_dashboard_propati', route: 'src/app/dashboard/estate-manager', role: 'estate_manager', nav: 'ESTATE_MANAGER_NAVIGATION', maxLen: 600 },
  { name: 'global_settings_configuration_propati_admin', route: 'src/app/dashboard/admin/settings/global', role: 'admin', nav: 'ADMIN_NAVIGATION' },
  { name: 'help_center_propati_marketplace', route: 'src/app/(public)/help-center', public: true },
  { name: 'inspection_report_mainland_regional_hq_propati_agent_portal', route: 'src/app/dashboard/agent/inspections/report', role: 'agent', nav: 'AGENT_NAVIGATION' },
  { name: 'join_propati_choose_your_role', route: 'src/app/(public)/join', public: true },
  { name: 'landlord_dashboard_propati', route: 'src/app/dashboard/landlord', role: 'landlord', nav: 'LANDLORD_NAVIGATION', maxLen: 600 },
  { name: 'lease_agreement_review_propati_commercial', route: 'src/app/dashboard/landlord/commercial/agreements/review', role: 'landlord', nav: 'LANDLORD_NAVIGATION' },
  { name: 'lease_negotiation_grade_a_serviced_office_propati_commercial', route: 'src/app/dashboard/landlord/commercial/leases/negotiation', role: 'landlord', nav: 'LANDLORD_NAVIGATION' },
  { name: 'maintenance_overview_propati_tenant_portal', route: 'src/app/dashboard/tenant/maintenance', role: 'tenant', nav: 'TENANT_NAVIGATION' },
  { name: 'maintenance_tracking_ac_repair_propati_tenant_portal', route: 'src/app/dashboard/tenant/maintenance/[id]', role: 'tenant', nav: 'TENANT_NAVIGATION' },
  { name: 'move_in_coordination_propati_commercial', route: 'src/app/dashboard/landlord/commercial/move-in', role: 'landlord', nav: 'LANDLORD_NAVIGATION' },
  { name: 'new_maintenance_request_propati_tenant_portal', route: 'src/app/dashboard/tenant/maintenance/new', role: 'tenant', nav: 'TENANT_NAVIGATION' },
  { name: 'office_site_inspection_propati_agent_portal', route: 'src/app/dashboard/agent/inspections/office', role: 'agent', nav: 'AGENT_NAVIGATION' },
  { name: 'overdue_payment_notice_propati_financials', route: 'src/app/dashboard/tenant/payments/overdue', role: 'tenant', nav: 'TENANT_NAVIGATION' },
  { name: 'payment_success_propati_tenant_portal', route: 'src/app/dashboard/tenant/payments/success', role: 'tenant', nav: 'TENANT_NAVIGATION' },
  { name: 'portfolio_analytics_dashboard_propati_owner_console', route: 'src/app/dashboard/estate-manager/portfolio/analytics', role: 'estate_manager', nav: 'ESTATE_MANAGER_NAVIGATION' },
  { name: 'post_new_listing_propati_landlord_dashboard', route: 'src/app/dashboard/landlord/listing/new', role: 'landlord', nav: 'LANDLORD_NAVIGATION' },
  { name: 'professional_license_upload_propati_agent_portal', route: 'src/app/dashboard/agent/verifications/license', role: 'agent', nav: 'AGENT_NAVIGATION' },
  { name: 'propati_nigeria_s_first_verified_property_marketplace', route: 'src/app/(public)/marketplace', public: true },
  { name: 'propati_verified_residential_commercial_marketplace', route: 'src/app/(public)/properties', public: true },
  { name: 'property_verification_step_1_documents_propati', route: 'src/app/verification/step1/documents', public: true },
  { name: 'property_verification_step_2_identity_propati', route: 'src/app/verification/step2/identity', public: true },
  { name: 'property_verification_step_4_inspection_propati', route: 'src/app/verification/step4/inspection', public: true },
  { name: 'property_verification_submitted_propati', route: 'src/app/verification/submitted', public: true },
  { name: 'refined_emergency_help_hub_propati_support', route: 'src/app/(public)/support', public: true },
  { name: 'refined_emergency_hotline_state_propati_maintenance', route: 'src/app/dashboard/tenant/maintenance/emergency', role: 'tenant', nav: 'TENANT_NAVIGATION' },
  { name: 'refined_emergency_protocol_propati_maintenance', route: 'src/app/dashboard/tenant/maintenance/protocol', role: 'tenant', nav: 'TENANT_NAVIGATION' },
  { name: 'refined_emergency_support_ui_propati_help_hub', route: 'src/app/(public)/support', public: true },
  { name: 'refined_revenue_forecasting_advanced_scenario_builder_propati_owner_console', route: 'src/app/dashboard/estate-manager/financials/scenario', role: 'estate_manager', nav: 'ESTATE_MANAGER_NAVIGATION' },
  { name: 'rent_collection_management_propati_landlord_console', route: 'src/app/dashboard/landlord/rent', role: 'landlord', nav: 'LANDLORD_NAVIGATION' },
  { name: 'revenue_forecast_report_with_digital_signature_propati_owner_console', route: 'src/app/dashboard/estate-manager/reports/revenue-signature', role: 'estate_manager', nav: 'ESTATE_MANAGER_NAVIGATION' },
  { name: 'revenue_forecasting_financial_projections_propati_owner_console', route: 'src/app/dashboard/estate-manager/financials', role: 'estate_manager', nav: 'ESTATE_MANAGER_NAVIGATION' },
  { name: 'role_permissions_verification_officer_propati_admin', route: 'src/app/dashboard/admin/roles/verification-officer', role: 'admin', nav: 'ADMIN_NAVIGATION' },
  { name: 'security_mfa_settings_propati', route: 'src/app/dashboard/admin/settings/mfa', role: 'admin', nav: 'ADMIN_NAVIGATION' },
  { name: 'short_let_revenue_dashboard_propati_agent_console', route: 'src/app/dashboard/agent/earnings/short-let', role: 'agent', nav: 'AGENT_NAVIGATION' },
  { name: 'system_audit_logs_propati_admin', route: 'src/app/dashboard/admin/audit/logs', role: 'admin', nav: 'ADMIN_NAVIGATION' },
  { name: 'system_settings_dashboard_propati_admin', route: 'src/app/dashboard/admin/settings/dashboard', role: 'admin', nav: 'ADMIN_NAVIGATION' },
  { name: 'tenant_dashboard_propati', route: 'src/app/dashboard/tenant', role: 'tenant', nav: 'TENANT_NAVIGATION', maxLen: 600 },
  { name: 'tenant_dashboard_propati_search_hub', route: 'src/app/dashboard/tenant/search', role: 'tenant', nav: 'TENANT_NAVIGATION' },
  { name: 'tenant_payment_portal_propati', route: 'src/app/dashboard/tenant/payments', role: 'tenant', nav: 'TENANT_NAVIGATION' },
  { name: 'tenant_support_center_propati_help_hub', route: 'src/app/dashboard/tenant/support', role: 'tenant', nav: 'TENANT_NAVIGATION' },
  { name: 'transactions_escrow_oversight_propati_admin', route: 'src/app/dashboard/admin/transactions/escrow', role: 'admin', nav: 'ADMIN_NAVIGATION' },
  { name: 'user_management_console_propati_admin', route: 'src/app/dashboard/admin/users/management', role: 'admin', nav: 'ADMIN_NAVIGATION' },
  { name: 'verification_checklist_propati_marketplace', route: 'src/app/verification/checklist', public: true },
  { name: 'verification_guide_propati_marketplace', route: 'src/app/verification/guide', public: true },
  { name: 'verification_queue_detail_the_obsidian_penthouse_propati_admin', route: 'src/app/dashboard/admin/verification/queue-detail/obsidian-penthouse', role: 'admin', nav: 'ADMIN_NAVIGATION' },
  { name: 'verified_properties_in_nigeria_propati_advanced_search', route: 'src/app/(public)/properties/advanced-search', public: true },
  { name: 'verified_properties_in_nigeria_propati_search', route: 'src/app/(public)/search', public: true },
  { name: 'withdrawals_fund_management_propati_financials', route: 'src/app/dashboard/admin/transactions/withdrawals', role: 'admin', nav: 'ADMIN_NAVIGATION' },
];

function generateDashboardContent(name, html) {
  const title = fileNameToTitle(name);
  const h2s = extractTags(html, 'h2').slice(0, 5);
  const ps = extractTags(html, 'p').slice(0, 8);
  const buttons = extractTags(html, 'button').slice(0, 5).filter(b => b.length > 1 && b.length < 40);
  const clean = stripHtml(html).slice(0, 400);

  let sections = `      <div className="space-y-6">\n`;
  sections += `        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">\n`;
  sections += `          <h1 className="text-2xl font-bold text-foreground">${title}</h1>\n`;
  sections += `          <p className="text-muted-foreground mt-1">${clean.slice(0, 120)}${clean.length>120?'...':''}</p>\n`;
  sections += `        </section>\n`;

  if (h2s.length) {
    sections += `        <div className="grid gap-4 md:grid-cols-2">\n`;
    for (const h of h2s) {
      sections += `          <Card>\n            <CardHeader><CardTitle>${h}</CardTitle></CardHeader>\n            <CardContent><p className="text-sm text-muted-foreground">Content from ${name.replace(/ propati/g,'')}.</p></CardContent>\n          </Card>\n`;
    }
    sections += `        </div>\n`;
  }

  if (buttons.length) {
    sections += `        <div className="flex flex-wrap gap-2">\n`;
    for (const b of buttons) {
      const variant = b.toLowerCase().includes('delete') || b.toLowerCase().includes('danger') ? 'destructive' : 'default';
      sections += `          <Button variant="${variant}">${b}</Button>\n`;
    }
    sections += `        </div>\n`;
  }

  if (ps.length) {
    sections += `        <Card>\n          <CardContent className="pt-6">\n            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">\n`;
    for (const p of ps) {
      sections += `              <li>${p}</li>\n`;
    }
    sections += `            </ul>\n          </CardContent>\n        </Card>\n`;
  }

  sections += `        <Card>\n          <CardContent className="pt-6">\n            <p className="text-sm text-muted-foreground">This page was ported from the reference design: <strong>${name}.html</strong></p>\n          </CardContent>\n        </Card>\n`;
  sections += `      </div>\n`;
  return sections;
}

function generatePublicContent(name, html) {
  const title = fileNameToTitle(name);
  const h2s = extractTags(html, 'h2').slice(0, 5);
  const ps = extractTags(html, 'p').slice(0, 6);
  const clean = stripHtml(html).slice(0, 300);

  let sections = `      <div className="space-y-6">\n`;
  sections += `        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">\n`;
  sections += `          <h1 className="text-2xl font-bold text-foreground">${title}</h1>\n`;
  sections += `          <p className="text-muted-foreground mt-1">${clean.slice(0, 150)}${clean.length>150?'...':''}</p>\n`;
  sections += `        </section>\n`;

  for (const h of h2s) {
    sections += `        <section className="rounded-xl border border-border bg-background p-5">\n          <h2 className="text-xl font-semibold mb-2">${h}</h2>\n`;
    if (ps.length) {
      sections += `          <p className="text-muted-foreground">${ps.shift()}</p>\n`;
    } else {
      sections += `          <p className="text-muted-foreground">More details from reference design.</p>\n`;
    }
    sections += `        </section>\n`;
  }

  sections += `        <Card>\n          <CardContent className="pt-6">\n            <p className="text-sm text-muted-foreground">Ported from reference: <strong>${name}.html</strong></p>\n          </CardContent>\n        </Card>\n`;
  sections += `      </div>\n`;
  return sections;
}

function hasClientComponentImport(content) {
  return /import\s+.*Client\.tsx['"]/.test(content);
}

let stats = { created: 0, updated: 0, skipped: 0 };

for (const item of mapping) {
  const htmlPath = path.join(REF_DIR, item.name + '.html');
  if (!fs.existsSync(htmlPath)) {
    console.log('SKIP (no html): ' + item.name);
    stats.skipped++;
    continue;
  }

  const html = fs.readFileSync(htmlPath, 'utf8');
  const pagePath = path.join(ROOT, item.route, 'page.tsx');

  if (fs.existsSync(pagePath)) {
    const content = fs.readFileSync(pagePath, 'utf8');
    const lines = content.split('\n').length;
    if (lines > 150 || hasClientComponentImport(content)) {
      console.log('SKIP (rich/wrapper): ' + item.route);
      stats.skipped++;
      continue;
    }
  }

  fs.mkdirSync(path.dirname(pagePath), { recursive: true });

  let content = '';
  if (item.public) {
    content = `import { Metadata } from 'next';\nimport { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';\n\n`;
    content += `export const metadata: Metadata = {\n  title: '${fileNameToTitle(item.name)}',\n  description: '${fileNameToTitle(item.name)} page',\n};\n\n`;
    content += `export default function ${item.name.replace(/[^a-zA-Z]/g,'')}Page() {\n  return (\n    <section className="container mx-auto py-12">\n${generatePublicContent(item.name, html)}    </section>\n  );\n}\n`;
  } else {
    const navConst = item.nav || 'TENANT_NAVIGATION';
    const role = item.role || 'tenant';
    content = `'use client';\n\nimport { useUser } from '@clerk/nextjs';\nimport { DashboardShell } from '@/components/layout/DashboardShell';\nimport { ${navConst} } from '@/lib/navigation';\nimport { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';\nimport { Button } from '@/components/ui/button';\nimport { Badge } from '@/components/ui/badge';\n\n`;
    content += `export default function ${item.name.replace(/[^a-zA-Z]/g,'')}Page() {\n  const { user } = useUser();\n\n  return (\n    <DashboardShell\n      navigation={${navConst}}\n      userRole="${role}"\n      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || '${role.charAt(0).toUpperCase()+role.slice(1)}'}\n      userAvatar={user?.imageUrl}\n    >\n${generateDashboardContent(item.name, html)}    </DashboardShell>\n  );\n}\n`;
  }

  fs.writeFileSync(pagePath, content, 'utf8');
  console.log((fs.existsSync(pagePath) && content.split('\n').length > 0 ? 'UPDATED' : 'CREATED') + ': ' + item.route);
  const action = fs.existsSync(pagePath) && content.split('\n').length > 0 ? 'updated' : 'created';
  // Since we just wrote it, it's created or overwritten
  if (action === 'created') stats.created++; else stats.updated++;
}

console.log('\\nStats:', stats);
