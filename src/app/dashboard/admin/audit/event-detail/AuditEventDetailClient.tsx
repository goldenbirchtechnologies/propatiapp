'use client';

import AppIcon from '@/components/icons/app-icon';

export default function AuditEventDetailClient() {
  return (
    <>
      {/* Ported from audit_event_detail_permission_update_propati_admin.html */}

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-sm text-label-sm text-zinc-400 mb-md">
        <a className="hover:text-white" href="#">Home</a>
        <AppIcon name="chevron_right" className="lucide" />
        <a className="hover:text-white" href="#">Audit Logs</a>
        <AppIcon name="chevron_right" className="lucide" />
        <span className="text-white font-bold">Event #EV-9821</span>
      </nav>

      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div className="space-y-sm">
          <div className="flex items-center gap-sm">
            <span className="px-sm py-xs bg-zinc-950 text-white font-label-sm rounded-lg uppercase tracking-wider">RBAC</span>
            <div className="flex items-center gap-xs px-sm py-xs bg-tertiary-container text-tertiary-fixed font-label-sm rounded-full">
              <span className="lucide text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <AppIcon name="Verified Immutable" className="lucide" />
            </div>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-white tracking-tight">Event Detail: Permission Update</h2>
        </div>
        <div className="flex items-center gap-sm">
          <button className="flex items-center gap-sm px-lg h-11 border border-[#262626] text-white font-label-md rounded-xl hover:bg-obsidian-800-lowest transition-all active:scale-95">
            <AppIcon name="download" className="lucide" />
            Export JSON
          </button>
          <button className="flex items-center gap-sm px-lg h-11 bg-emerald-500 text-white font-label-md rounded-xl hover:bg-emerald-500/90 shadow-md transition-all active:scale-95">
            <AppIcon name="flag" className="lucide" />
            Flag for Review
          </button>
        </div>
      </section>

      {/* Metadata Summary Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-gutter bg-obsidian-800/30 border border-[#262626] p-lg rounded-xl shadow-sm mb-lg">
        <div className="flex flex-col gap-xs">
          <span className="text-label-sm text-neutral-400">Administrator</span>
          <div className="flex items-center gap-sm mt-xs">
            <img
              className="w-10 h-10 rounded-full object-cover ring-2 ring-surface-container-high"
              data-alt="A professional portrait of a West African male administrator in a clean-cut corporate attire, set against a blurred modern office background with high-key lighting. The style is professional and trustworthy, reflecting a high-security fintech environment."
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC70xn2f3s3ytMUkkwMiesnbYx9CktoNe1hoctJ-VjdX55c9j5cf3UdyUbkT7UfujPVJOkVUHO3idHG44TJyAcLTXw-F0rCBT52MZqgPGRRo6KcvufW7sXk6mskfR0I-yhmaZFJCIOxxBpLj3DRx3E-aCEe-Xohuppfft_3QjeE8y51FJH4WQthENaD21JN0n02X6ctoi_pTMckcE_DvHy8suRKCMpXykOERTJzV_g6PHlXYqbE-e451-sbg-FrGB6ZX_uXRSSSOzA"
            />
            <span className="font-body-md font-bold">Ade Ben-G.</span>
          </div>
        </div>
        <div className="flex flex-col gap-xs">
          <span className="text-label-sm text-neutral-400">Timestamp</span>
          <div className="flex items-center gap-sm mt-xs text-white">
            <AppIcon name="schedule" className="lucide" />
            <span className="font-body-md font-medium">
              Oct 27, 2023 - 14:22:10 <span className="text-label-sm opacity-60">WAT</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-xs">
          <span className="text-label-sm text-neutral-400">Origin IP</span>
          <div className="flex items-center gap-sm mt-xs text-white">
            <AppIcon name="location_on" className="lucide" />
            <span className="font-body-md font-medium">
              192.168.1.1 <span className="text-label-sm opacity-60">(Lagos, NG)</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-xs">
          <span className="text-label-sm text-neutral-400">Action</span>
          <div className="flex items-center gap-sm mt-xs text-white">
            <AppIcon name="edit_note" className="lucide" />
            <span className="font-body-md font-medium">Modified &quot;Verification Officer&quot; Role</span>
          </div>
        </div>
      </section>

      {/* Main Workspace: Diff & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Change Diff Code Container */}
        <section className="lg:col-span-8 flex flex-col h-full bg-obsidian-800/30 border border-[#262626] rounded-xl overflow-hidden shadow-sm">
          <div className="bg-zinc-900 p-md border-b border-[#262626] flex justify-between items-center">
            <div className="flex items-center gap-md">
              <AppIcon name="code" className="lucide" />
              <h3 className="font-label-md text-white uppercase tracking-wider font-bold">JSON Payload Diff</h3>
            </div>
            <div className="flex gap-sm">
              <div className="w-3 h-3 rounded-full bg-error/40"></div>
              <div className="w-3 h-3 rounded-full bg-secondary/40"></div>
              <div className="w-3 h-3 rounded-full bg-tertiary-fixed-dim/40"></div>
            </div>
          </div>
          <div className="p-lg font-label-md overflow-x-auto">
            <div className="min-w-[600px] bg-surface rounded-lg p-md border border-[#262626]/30 space-y-1">
              <div className="text-neutral-400/40">{'{'}</div>
              <div className="pl-4 text-neutral-400/70">&quot;role&quot;: &quot;Verification Officer&quot;,</div>
              <div className="pl-4 text-neutral-400/70">&quot;module&quot;: &quot;Identity_Verification&quot;,</div>
              <div className="pl-4 text-neutral-400/70">&quot;permissions&quot;: {'{'}</div>
              {/* Removed Line */}
              <div className="pl-8 flex items-center gap-md diff-removed py-1 px-2 rounded -mx-2">
                <span className="w-4 text-center opacity-30">-</span>
                <span className="flex-1">&quot;verification.approve&quot;: <span className="font-bold">false</span>,</span>
              </div>
              {/* Added Line */}
              <div className="pl-8 flex items-center gap-md diff-added py-1 px-2 rounded -mx-2">
                <span className="w-4 text-center opacity-30">+</span>
                <span className="flex-1">&quot;verification.approve&quot;: <span className="font-bold">true</span>,</span>
              </div>
              <div className="pl-8 text-neutral-400/70">&quot;verification.reject&quot;: true,</div>
              <div className="pl-8 text-neutral-400/70">&quot;document.view&quot;: true</div>
              <div className="pl-4 text-neutral-400/40">{'}'},</div>
              <div className="pl-4 text-neutral-400/70">&quot;updated_at&quot;: &quot;2023-10-27T14:22:10Z&quot;</div>
              <div className="text-neutral-400/40">{'}'}</div>
            </div>
          </div>
          <div className="mt-auto p-md bg-obsidian-800/30 text-label-sm text-neutral-400/70 italic flex items-center gap-sm">
            <AppIcon name="info" className="lucide" />
            Hash SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
          </div>
        </section>

        {/* Contextual Timeline Sidebar */}
        <aside className="space-y-lg">
          <div className="bg-obsidian-800/30 border border-[#262626] p-lg rounded-xl shadow-sm h-full">
            <h3 className="font-headline-sm text-headline-sm text-white mb-lg">Related Activity</h3>
            <p className="text-body-sm text-neutral-400 mb-xl">
              Activity within 1-hour window for Admin <span className="font-bold">Ade Ben-G.</span>
            </p>
            <div className="relative space-y-xl pl-6 border-l-2 border-[#262626]/30">
              {/* Timeline Item 1 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-secondary-container ring-4 ring-surface-container-lowest"></div>
                <div className="flex flex-col gap-1">
                  <span className="text-label-sm font-bold text-white">14:15:02 WAT</span>
                  <p className="text-body-sm text-white">Initiated session login from 192.168.1.1</p>
                  <span className="text-label-sm text-neutral-400/60">System Security Log</span>
                </div>
              </div>
              {/* Timeline Item 2 (Current) */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-surface-container-lowest"></div>
                <div className="flex flex-col gap-1 p-md bg-primary-fixed/30 rounded-lg -mx-2 border border-primary-fixed">
                  <div className="flex justify-between items-start">
                    <span className="text-label-sm font-bold text-white">14:22:10 WAT</span>
                    <span className="px-xs py-[2px] bg-emerald-500 text-white text-[10px] rounded uppercase font-bold">Current</span>
                  </div>
                  <p className="text-body-sm text-white">Modified &quot;Verification Officer&quot; Role Permissions</p>
                </div>
              </div>
              {/* Timeline Item 3 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-secondary-container ring-4 ring-surface-container-lowest"></div>
                <div className="flex flex-col gap-1">
                  <span className="text-label-sm font-bold text-white">14:38:55 WAT</span>
                  <p className="text-body-sm text-white">Updated Property #PR-2201 verification status</p>
                  <span className="text-label-sm text-neutral-400/60">Property Management</span>
                </div>
              </div>
              {/* Timeline Item 4 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-secondary-container ring-4 ring-surface-container-lowest"></div>
                <div className="flex flex-col gap-1">
                  <span className="text-label-sm font-bold text-white">14:55:12 WAT</span>
                  <p className="text-body-sm text-white">Session Terminated (Manual Logout)</p>
                  <span className="text-label-sm text-neutral-400/60">System Security Log</span>
                </div>
              </div>
            </div>
            <button className="w-full mt-xl py-md text-label-md font-bold text-white hover:text-secondary transition-colors border-t border-[#262626]/30 flex items-center justify-center gap-sm">
              View Full Admin Audit Trail
              <AppIcon name="arrow_forward" className="lucide" />
            </button>
          </div>

          {/* Integrity Badge Large */}
          <div className="glass-panel p-lg rounded-xl flex items-center gap-lg">
            <div className="w-16 h-16 rounded-full bg-tertiary-container/10 flex items-center justify-center text-tertiary-container border-2 border-dashed border-tertiary-container/30">
              <span className="lucide text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
            </div>
            <div>
              <h4 className="font-headline-sm text-white">System Integrity Guaranteed</h4>
              <p className="text-body-sm text-neutral-400 mt-1">
                This entry is cryptographically signed and archived on a write-once read-many (WORM) storage layer.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
