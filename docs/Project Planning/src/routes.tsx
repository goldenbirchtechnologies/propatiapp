import { createBrowserRouter } from "react-router";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Public pages
import Landing from "./pages/public/Landing";
import Listings from "./pages/public/Listings";
import ListingDetail from "./pages/public/ListingDetail";
import { SignIn, SignUp, RolePicker } from "./pages/public/Auth";
import { Saved, Search, PrivacyPolicy, ComingSoon, PaymentSuccess, PaymentDeclined, AccountSuspended } from "./pages/public/Misc";

// Dashboard homes
import LandlordHome from "./pages/landlord/Home";
import TenantHome from "./pages/tenant/Home";
import AgentHome from "./pages/agent/Home";
import AdminHome from "./pages/admin/Home";
import EMHome from "./pages/estate-manager/Home";
import AccountantHome from "./pages/accountant/Home";

// Landlord subpages
import {
  LandlordProperties, LandlordPropertyDetail, LandlordListings, LandlordListingDetail,
  LandlordAddListing, LandlordTenants, LandlordTenantDetail, LandlordApplications, LandlordApplicationDetail,
  LandlordFinancials, LandlordFinancialReports, LandlordFinancialInvoices, LandlordFinancialOverdue, LandlordFinancialWithdrawals, LandlordFinancialForecasting,
  LandlordMaintenance, LandlordMessages, LandlordNotifications, LandlordProfile, LandlordVerification,
  LandlordInvoices, LandlordReceipts, LandlordStatements, LandlordLeases, LandlordAgreements, LandlordAgreementDetail, LandlordNewAgreement,
  LandlordPortfolio, LandlordRent, LandlordScreening, LandlordAgents, LandlordVacancies, LandlordShortLet,
  LandlordRevenueForecast, LandlordTurnover, LandlordCommercialLeases,
  SharedPayments, SharedNewPayment, SharedPaymentDetail, SharedPaymentReceipt,
} from "./pages/landlord/Subpages";

// Tenant subpages
import {
  TenantPayments, TenantPaymentsOverdue, TenantAutoPay, TenantPaymentMethodNew, TenantPaymentStatements, TenantPaymentSuccess,
  TenantMaintenance, TenantMaintenanceDetail, TenantNewMaintenance, TenantEmergencyMaintenance, TenantMaintenanceProtocol,
  TenantApplications, TenantAgreements, TenantAgreementDetail, TenantAgreementSign,
  TenantMessages, TenantNotifications, TenantProfile, TenantSaved, TenantInvoices, TenantReceipts,
  TenantScreening, TenantSearch, TenantSupport,
} from "./pages/tenant/Subpages";

// Agent subpages
import {
  AgentListings, AgentListingDetail, AgentClients, AgentClientDetail, AgentPipeline, AgentDeals, AgentDealDetail,
  AgentCommissions, AgentCommissionLedger, AgentPayments, AgentWithdrawals, AgentInvoices, AgentReceipts, AgentStatements,
  AgentVerifications, AgentLicenseVerification, AgentInspections, AgentNewInspection, AgentInspectionReport,
  AgentMarket, AgentSchedule, AgentMessages, AgentInvites, AgentReputation, AgentSell, AgentBuy, AgentProfile,
  AgentEarningsShortLet, AgentNewAgreement,
} from "./pages/agent/Subpages";

// Admin subpages
import {
  AdminUsers, AdminUserManagement, AdminProperties, AdminVerifications, AdminVerificationQueue, AdminQueueDetail,
  AdminTransactions, AdminEscrow, AdminWithdrawals, AdminPayments, AdminRevenue, AdminReports, AdminFlags,
  AdminDisputes, AdminDisputeDetail, AdminAgreements, AdminInvoices, AdminReceipts, AdminStatements,
  AdminAuditLogs, AdminAuditEventDetail, AdminSettings, AdminSettingsGlobal, AdminSettingsDashboard,
  AdminSettingsCountries, AdminSettingsRules, AdminSettingsMFA, AdminRolesVerificationOfficer,
  AdminProfile, AdminProfileSecurity, AdminOverview,
} from "./pages/admin/Subpages";

// Estate Manager subpages
import {
  EMPortfolio, EMPortfolioAnalytics, EMPortfolioUnitDetail, EMUnits, EMUnitDetail,
  EMFinancials, EMScenario, EMScenarioBuilder, EMAnalytics, EMTenants, EMMaintenance, EMMaintenanceDetail,
  EMCollections, EMDisbursements, EMLedger, EMTeam, EMReports, EMRevenueSignature, EMAgreements,
  EMInvoices, EMReceipts, EMStatements, EMBilling, EMSubscription, EMProfile, EMMessages,
  EMTurnover, EMMoveIn, EMLeaseReview, EMLeaseNegotiation, EMCommercialLeases, EMBulkImport,
  EMServiceCharges, EMUtilities, EMInvitePropertyManager,
} from "./pages/estate-manager/Subpages";

// Accountant subpages
import {
  AccountantPayments, AccountantReports, AccountantReceipts, AccountantStatements, AccountantWithdrawals,
  AccountantMessages, AccountantProfile,
} from "./pages/accountant/Subpages";

// Shared & verification
import {
  VerificationHome, VerificationGuide, VerificationChecklist, VerificationStep1, VerificationStep2,
  VerificationStep3, VerificationStep4, VerificationSubmitted, DojahKYC, SharedWallet,
} from "./pages/shared/Subpages";

// GenericPage shared
import { WalletPage } from "./components/GenericPage";

// 404
function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-center px-4">
      <div>
        <div className="text-8xl font-black text-zinc-900 mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-zinc-500 mb-6">The page you're looking for doesn't exist.</p>
        <a href="/" className="px-5 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors">
          Back to home
        </a>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  // ─── Public ───────────────────────────────────────────────────────────────
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: "listings", element: <Listings /> },
      { path: "listings/:id", element: <ListingDetail /> },
      { path: "saved", element: <Saved /> },
      { path: "search", element: <Search /> },
      { path: "privacy-policy", element: <PrivacyPolicy /> },
    ],
  },

  // Auth (no public layout — standalone)
  { path: "/sign-in", element: <SignIn /> },
  { path: "/sign-up", element: <SignUp /> },
  { path: "/signup", element: <RolePicker /> },
  { path: "/coming-soon", element: <ComingSoon /> },
  { path: "/account/suspended", element: <AccountSuspended /> },
  { path: "/payment/success", element: <PaymentSuccess /> },
  { path: "/payment/declined", element: <PaymentDeclined /> },

  // ─── Landlord Dashboard ───────────────────────────────────────────────────
  {
    path: "/dashboard/landlord",
    element: <DashboardLayout role="landlord" />,
    children: [
      { index: true, element: <LandlordHome /> },
      { path: "properties", element: <LandlordProperties /> },
      { path: "properties/new", element: <LandlordAddListing /> },
      { path: "properties/:id", element: <LandlordPropertyDetail /> },
      { path: "properties/:id/edit", element: <LandlordAddListing /> },
      { path: "listings", element: <LandlordListings /> },
      { path: "listing/new", element: <LandlordAddListing /> },
      { path: "listing/:id", element: <LandlordListingDetail /> },
      { path: "tenants", element: <LandlordTenants /> },
      { path: "tenants/:id", element: <LandlordTenantDetail /> },
      { path: "applications", element: <LandlordApplications /> },
      { path: "applications/:id", element: <LandlordApplicationDetail /> },
      { path: "financials", element: <LandlordFinancials /> },
      { path: "financials/reports", element: <LandlordFinancialReports /> },
      { path: "financials/invoices", element: <LandlordFinancialInvoices /> },
      { path: "financials/overdue", element: <LandlordFinancialOverdue /> },
      { path: "financials/withdrawals", element: <LandlordFinancialWithdrawals /> },
      { path: "financials/forecasting", element: <LandlordFinancialForecasting /> },
      { path: "financials/scenario-builder", element: <LandlordRevenueForecast /> },
      { path: "maintenance", element: <LandlordMaintenance /> },
      { path: "messages", element: <LandlordMessages /> },
      { path: "notifications", element: <LandlordNotifications /> },
      { path: "portfolio", element: <LandlordPortfolio /> },
      { path: "rent", element: <LandlordRent /> },
      { path: "rents", element: <LandlordRent /> },
      { path: "leases", element: <LandlordLeases /> },
      { path: "agreements", element: <LandlordAgreements /> },
      { path: "agreements/new", element: <LandlordNewAgreement /> },
      { path: "agreement", element: <LandlordAgreementDetail /> },
      { path: "profile", element: <LandlordProfile /> },
      { path: "verification", element: <LandlordVerification /> },
      { path: "screening", element: <LandlordScreening /> },
      { path: "agents", element: <LandlordAgents /> },
      { path: "vacancies", element: <LandlordVacancies /> },
      { path: "turnover", element: <LandlordTurnover /> },
      { path: "short-let", element: <LandlordShortLet /> },
      { path: "invoices", element: <LandlordInvoices /> },
      { path: "receipts", element: <LandlordReceipts /> },
      { path: "statements", element: <LandlordStatements /> },
      { path: "revenue-forecast", element: <LandlordRevenueForecast /> },
      { path: "revenue-forecast/scenario-builder", element: <LandlordRevenueForecast /> },
      { path: "payments", element: <SharedPayments /> },
      { path: "payments/new", element: <SharedNewPayment /> },
      { path: "payments/:id", element: <SharedPaymentDetail /> },
      { path: "payments/:id/receipt", element: <SharedPaymentReceipt /> },
      { path: "commercial/leases", element: <LandlordCommercialLeases /> },
    ],
  },

  // ─── Tenant Dashboard ─────────────────────────────────────────────────────
  {
    path: "/dashboard/tenant",
    element: <DashboardLayout role="tenant" />,
    children: [
      { index: true, element: <TenantHome /> },
      { path: "payments", element: <TenantPayments /> },
      { path: "payments/overdue", element: <TenantPaymentsOverdue /> },
      { path: "payments/auto-pay", element: <TenantAutoPay /> },
      { path: "payments/methods/new", element: <TenantPaymentMethodNew /> },
      { path: "payments/methods/:id", element: <TenantPaymentMethodNew /> },
      { path: "payments/statements", element: <TenantPaymentStatements /> },
      { path: "payments/success", element: <TenantPaymentSuccess /> },
      { path: "maintenance", element: <TenantMaintenance /> },
      { path: "maintenance/new", element: <TenantNewMaintenance /> },
      { path: "maintenance/:id", element: <TenantMaintenanceDetail /> },
      { path: "maintenance/emergency", element: <TenantEmergencyMaintenance /> },
      { path: "maintenance/protocol", element: <TenantMaintenanceProtocol /> },
      { path: "applications", element: <TenantApplications /> },
      { path: "applications/:id", element: <TenantApplications /> },

      { path: "agreements", element: <TenantAgreements /> },
      { path: "agreements/:id", element: <TenantAgreementDetail /> },
      { path: "agreements/:id/sign", element: <TenantAgreementSign /> },
      { path: "messages", element: <TenantMessages /> },
      { path: "notifications", element: <TenantNotifications /> },
      { path: "profile", element: <TenantProfile /> },
      { path: "saved", element: <TenantSaved /> },
      { path: "invoices", element: <TenantInvoices /> },
      { path: "receipts", element: <TenantReceipts /> },
      { path: "screening", element: <TenantScreening /> },
      { path: "search", element: <TenantSearch /> },
      { path: "support", element: <TenantSupport /> },
    ],
  },

  // ─── Agent Dashboard ──────────────────────────────────────────────────────
  {
    path: "/dashboard/agent",
    element: <DashboardLayout role="agent" />,
    children: [
      { index: true, element: <AgentHome /> },
      { path: "listings", element: <AgentListings /> },
      { path: "listings/:id", element: <AgentListingDetail /> },
      { path: "clients", element: <AgentClients /> },
      { path: "clients/:id", element: <AgentClientDetail /> },
      { path: "pipeline", element: <AgentPipeline /> },
      { path: "deals", element: <AgentDeals /> },
      { path: "deals/:id", element: <AgentDealDetail /> },
      { path: "commissions", element: <AgentCommissions /> },
      { path: "commission-ledger", element: <AgentCommissionLedger /> },
      { path: "payments", element: <AgentPayments /> },
      { path: "withdrawals", element: <AgentWithdrawals /> },
      { path: "invoices", element: <AgentInvoices /> },
      { path: "receipts", element: <AgentReceipts /> },
      { path: "statements", element: <AgentStatements /> },
      { path: "verifications", element: <AgentVerifications /> },
      { path: "verifications/license", element: <AgentLicenseVerification /> },
      { path: "inspections", element: <AgentInspections /> },
      { path: "inspections/new", element: <AgentNewInspection /> },
      { path: "inspections/report", element: <AgentInspectionReport /> },
      { path: "market", element: <AgentMarket /> },
      { path: "schedule", element: <AgentSchedule /> },
      { path: "messages", element: <AgentMessages /> },
      { path: "invites", element: <AgentInvites /> },
      { path: "reputation", element: <AgentReputation /> },
      { path: "sell", element: <AgentSell /> },
      { path: "buy", element: <AgentBuy /> },
      { path: "profile", element: <AgentProfile /> },
      { path: "earnings/short-let", element: <AgentEarningsShortLet /> },
      { path: "agreements/new", element: <AgentNewAgreement /> },
    ],
  },

  // ─── Admin Dashboard ──────────────────────────────────────────────────────
  {
    path: "/dashboard/admin",
    element: <DashboardLayout role="admin" />,
    children: [
      { index: true, element: <AdminHome /> },
      { path: "overview", element: <AdminOverview /> },
      { path: "users", element: <AdminUsers /> },
      { path: "users/management", element: <AdminUserManagement /> },
      { path: "properties", element: <AdminProperties /> },
      { path: "verifications", element: <AdminVerifications /> },
      { path: "verification", element: <AdminVerificationQueue /> },
      { path: "verification/queue-detail/obsidian-penthouse", element: <AdminQueueDetail /> },
      { path: "payments", element: <AdminPayments /> },
      { path: "transactions", element: <AdminTransactions /> },
      { path: "transactions/escrow", element: <AdminEscrow /> },
      { path: "transactions/withdrawals", element: <AdminWithdrawals /> },
      { path: "revenue", element: <AdminRevenue /> },
      { path: "reports", element: <AdminReports /> },
      { path: "flags", element: <AdminFlags /> },
      { path: "disputes", element: <AdminDisputes /> },
      { path: "disputes/:id", element: <AdminDisputeDetail /> },
      { path: "agreements", element: <AdminAgreements /> },
      { path: "invoices", element: <AdminInvoices /> },
      { path: "receipts", element: <AdminReceipts /> },
      { path: "statements", element: <AdminStatements /> },
      { path: "audit/logs", element: <AdminAuditLogs /> },
      { path: "audit/event-detail", element: <AdminAuditEventDetail /> },
      { path: "settings", element: <AdminSettings /> },
      { path: "settings/global", element: <AdminSettingsGlobal /> },
      { path: "settings/dashboard", element: <AdminSettingsDashboard /> },
      { path: "settings/countries", element: <AdminSettingsCountries /> },
      { path: "settings/rules", element: <AdminSettingsRules /> },
      { path: "settings/mfa", element: <AdminSettingsMFA /> },
      { path: "roles/verification-officer", element: <AdminRolesVerificationOfficer /> },
      { path: "profile", element: <AdminProfile /> },
      { path: "profile/security", element: <AdminProfileSecurity /> },
    ],
  },

  // ─── Estate Manager Dashboard ─────────────────────────────────────────────
  {
    path: "/dashboard/estate-manager",
    element: <DashboardLayout role="estate-manager" />,
    children: [
      { index: true, element: <EMHome /> },
      { path: "portfolio", element: <EMPortfolio /> },
      { path: "portfolio/analytics", element: <EMPortfolioAnalytics /> },
      { path: "portfolio/:unitId", element: <EMPortfolioUnitDetail /> },
      { path: "units", element: <EMUnits /> },
      { path: "units/:unitId", element: <EMUnitDetail /> },
      { path: "financials", element: <EMFinancials /> },
      { path: "financials/scenario", element: <EMScenario /> },
      { path: "financials/scenario-builder", element: <EMScenarioBuilder /> },
      { path: "analytics", element: <EMAnalytics /> },
      { path: "tenants", element: <EMTenants /> },
      { path: "maintenance", element: <EMMaintenance /> },
      { path: "maintenance/:id", element: <EMMaintenanceDetail /> },
      { path: "collections", element: <EMCollections /> },
      { path: "disbursements", element: <EMDisbursements /> },
      { path: "ledger", element: <EMLedger /> },
      { path: "team", element: <EMTeam /> },
      { path: "reports", element: <EMReports /> },
      { path: "reports/revenue-signature", element: <EMRevenueSignature /> },
      { path: "agreements", element: <EMAgreements /> },
      { path: "invoices", element: <EMInvoices /> },
      { path: "receipts", element: <EMReceipts /> },
      { path: "statements", element: <EMStatements /> },
      { path: "billing", element: <EMBilling /> },
      { path: "subscription", element: <EMSubscription /> },
      { path: "profile", element: <EMProfile /> },
      { path: "messages", element: <EMMessages /> },
      { path: "turnover", element: <EMTurnover /> },
      { path: "move-in", element: <EMMoveIn /> },
      { path: "lease-review", element: <EMLeaseReview /> },
      { path: "lease-negotiation", element: <EMLeaseNegotiation /> },
      { path: "commercial-leases", element: <EMCommercialLeases /> },
      { path: "bulk-import", element: <EMBulkImport /> },
      { path: "service-charges", element: <EMServiceCharges /> },
      { path: "utilities", element: <EMUtilities /> },
      { path: "invite-property-manager", element: <EMInvitePropertyManager /> },
    ],
  },

  // ─── Accountant Dashboard ─────────────────────────────────────────────────
  {
    path: "/dashboard/accountant",
    element: <DashboardLayout role="accountant" />,
    children: [
      { index: true, element: <AccountantHome /> },
      { path: "payments", element: <AccountantPayments /> },
      { path: "reports", element: <AccountantReports /> },
      { path: "receipts", element: <AccountantReceipts /> },
      { path: "statements", element: <AccountantStatements /> },
      { path: "withdrawals", element: <AccountantWithdrawals /> },
      { path: "messages", element: <AccountantMessages /> },
      { path: "profile", element: <AccountantProfile /> },
    ],
  },

  // ─── Wallet (shared, needs a role-wrapped layout or standalone) ───────────
  {
    path: "/dashboard/wallet",
    element: <DashboardLayout role="landlord" />,
    children: [{ index: true, element: <SharedWallet /> }],
  },

  // ─── Verification flow ────────────────────────────────────────────────────
  {
    path: "/dashboard/verification",
    element: <DashboardLayout role="verification" />,
    children: [
      { index: true, element: <VerificationHome /> },
      { path: "guide", element: <VerificationGuide /> },
      { path: "checklist", element: <VerificationChecklist /> },
      { path: "step1/documents", element: <VerificationStep1 /> },
      { path: "step2/identity", element: <VerificationStep2 /> },
      { path: "step3/video", element: <VerificationStep3 /> },
      { path: "step4/inspection", element: <VerificationStep4 /> },
      { path: "dojah-kyc", element: <DojahKYC /> },
      { path: "submitted", element: <VerificationSubmitted /> },
    ],
  },

  // 404
  { path: "*", element: <NotFound /> },
]);
