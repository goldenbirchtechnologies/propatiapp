import { Link } from "react-router";
import { GenericNotificationsPage, GenericVerificationPage, WalletPage } from "../../components/GenericPage";
import { PageHeader } from "../../components/ui";

export const SharedNotifications = () => <GenericNotificationsPage />;
export const SharedWallet = () => <WalletPage />;
export const SharedVerification = () => <GenericVerificationPage />;

export function VerificationHome() {
  return (
    <div className="p-6 space-y-5 max-w-xl">
      <PageHeader title="Property Verification" description="Get the PROPATI Verified badge in 4 steps." />
      <div className="space-y-3">
        {[
          { step: 1, label: "Document Submission", desc: "Upload property documents and ownership proof", status: "completed", path: "/dashboard/verification/step1/documents" },
          { step: 2, label: "Identity Verification", desc: "Verify your identity with government-issued ID", status: "current", path: "/dashboard/verification/step2/identity" },
          { step: 3, label: "Video Verification", desc: "A short video call with our verification team", status: "pending", path: "/dashboard/verification/step3/video" },
          { step: 4, label: "Physical Inspection", desc: "An agent visits the property for physical inspection", status: "pending", path: "/dashboard/verification/step4/inspection" },
        ].map((s) => (
          <Link key={s.step} to={s.path} className="flex items-start gap-4 glass-card p-4 hover:border-white/15 transition-colors">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border-2 ${
              s.status === "completed" ? "bg-emerald-500 border-emerald-500 text-white" :
              s.status === "current" ? "border-emerald-500 text-emerald-400 bg-transparent" :
              "border-zinc-800 text-zinc-600 bg-transparent"
            }`}>
              {s.status === "completed" ? "✓" : s.step}
            </div>
            <div>
              <div className={`font-medium text-sm ${s.status === "pending" ? "text-zinc-500" : "text-white"}`}>{s.label}</div>
              <div className="text-zinc-600 text-xs mt-0.5">{s.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function VerificationGuide() {
  return (
    <div className="p-6 max-w-2xl">
      <PageHeader title="Verification Guide" breadcrumb={["Verification", "Guide"]} />
      <div className="space-y-4 mt-4">
        {[
          { title: "What documents do I need?", body: "You'll need: Title Deed or C of O, Survey Plan, Building Permit, and a government-issued ID (NIN Slip, Driver's License, or International Passport)." },
          { title: "How long does verification take?", body: "The entire process takes 3–5 working days: document review (1–2 days), identity check (instant), video call (scheduled within 24hrs), physical inspection (1–2 days)." },
          { title: "What happens after approval?", body: "Once approved, your listing gets the Verified badge, priority placement in search results, and eligibility for the Obsidian tier for premium listings." },
          { title: "What if my application is rejected?", body: "You'll receive a detailed reason by email. You can address the issues and reapply. Our support team is available to guide you through the process." },
        ].map((item) => (
          <div key={item.title} className="glass-card p-5">
            <div className="text-white font-semibold text-sm mb-2">{item.title}</div>
            <div className="text-zinc-500 text-sm leading-relaxed">{item.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VerificationChecklist() {
  return (
    <div className="p-6 max-w-xl">
      <PageHeader title="Verification Checklist" breadcrumb={["Verification", "Checklist"]} />
      <div className="glass-card p-6 mt-4 space-y-3">
        {[
          { label: "Title Deed / C of O", done: true },
          { label: "Survey Plan", done: true },
          { label: "Building Permit", done: false },
          { label: "NIN Slip", done: false },
          { label: "Utility Bill (proof of address)", done: true },
          { label: "Property Photos (min. 8)", done: false },
          { label: "Floor Plan", done: false },
        ].map((item) => (
          <label key={item.label} className="flex items-center gap-3 cursor-pointer">
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
              item.done ? "bg-emerald-500 border-emerald-500" : "border-zinc-700 bg-transparent"
            }`}>
              {item.done && <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </div>
            <span className={`text-sm ${item.done ? "text-zinc-400 line-through" : "text-white"}`}>{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

const verificationStepPage = (step: number, label: string, desc: string) => () => (
  <div className="p-6 max-w-xl">
    <PageHeader title={`Step ${step}: ${label}`} breadcrumb={["Verification", `Step ${step}`]} />
    <div className="glass-card p-6 mt-4 text-center">
      <p className="text-zinc-500 text-sm mb-5">{desc}</p>
      <div className="border-2 border-dashed border-zinc-800 rounded-xl p-8 mb-5 hover:border-zinc-600 transition-colors cursor-pointer">
        <div className="text-zinc-600 text-3xl mb-2">📎</div>
        <div className="text-zinc-500 text-sm">Upload document or complete step</div>
      </div>
      <Link
        to={step < 4 ? `/dashboard/verification/step${step + 1}/${["", "documents", "identity", "video", "inspection"][step + 1]}` : "/dashboard/verification/submitted"}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
      >
        Continue to Step {step + 1 <= 4 ? step + 1 : "Review"}
      </Link>
    </div>
  </div>
);

export const VerificationStep1 = verificationStepPage(1, "Documents", "Upload your property title deed, survey plan, and building permit.");
export const VerificationStep2 = verificationStepPage(2, "Identity", "Provide a government-issued ID to verify your identity.");
export const VerificationStep3 = verificationStepPage(3, "Video", "Schedule and complete a brief video verification call.");
export const VerificationStep4 = verificationStepPage(4, "Inspection", "A PROPATI agent will visit the property for physical inspection.");

export const VerificationSubmitted = () => (
  <div className="p-6 max-w-md mx-auto text-center">
    <div className="glass-card p-10 mt-6">
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
      </div>
      <h2 className="text-white font-bold text-xl mb-2">Verification Submitted!</h2>
      <p className="text-zinc-500 text-sm mb-6">Your application is under review. You'll receive an update within 3–5 working days.</p>
      <Link to="/dashboard/landlord" className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-900 border border-white/10 text-white text-sm font-medium rounded-lg hover:border-white/20 transition-colors">
        Back to Dashboard
      </Link>
    </div>
  </div>
);

export function DojahKYC() {
  return (
    <div className="p-6 max-w-xl">
      <PageHeader title="KYC Verification" breadcrumb={["Verification", "Dojah KYC"]} />
      <div className="glass-card p-6 mt-4 text-center">
        <p className="text-zinc-500 text-sm mb-5">Complete your KYC verification with Dojah to access all platform features.</p>
        <div className="glass-card-elevated p-6 mb-5">
          <p className="text-zinc-400 text-sm">Dojah KYC widget would render here.</p>
        </div>
        <button className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">
          Start KYC
        </button>
      </div>
    </div>
  );
}
