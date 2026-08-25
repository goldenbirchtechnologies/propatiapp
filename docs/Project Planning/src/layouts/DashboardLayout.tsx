import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { ChevronLeft, ChevronRight, Bell, Search, Settings, LogOut, Wallet, Menu, X } from "lucide-react";
import { navConfig } from "../data/navConfig";

const roleUsers: Record<string, { name: string; email: string; avatar?: string }> = {
  landlord: { name: "Emeka Nwosu", email: "emeka@propati.ng" },
  tenant: { name: "Chidi Okafor", email: "chidi@propati.ng" },
  agent: { name: "Yetunde Afolabi", email: "yetunde@propati.ng" },
  admin: { name: "Admin User", email: "admin@propati.ng" },
  "estate-manager": { name: "Aisha Mohammed", email: "aisha@propati.ng" },
  accountant: { name: "Temi Osei", email: "temi@propati.ng" },
  verification: { name: "Bola Adekunle", email: "bola@propati.ng" },
};

export default function DashboardLayout({ role }: { role: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const config = navConfig[role] ?? navConfig.landlord;
  const user = roleUsers[role] ?? roleUsers.landlord;
  const initials = user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-50 flex flex-col bg-zinc-950 border-r border-white/[0.07] transition-all duration-300 ${
          collapsed ? "w-[60px]" : "w-[240px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header */}
        <div className={`flex items-center gap-3 border-b border-white/[0.07] ${collapsed ? "px-3 py-4 justify-center" : "px-4 py-4"}`}>
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex-shrink-0 flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-white font-bold text-sm leading-none">PROPATI</div>
              <div className="text-zinc-500 text-[10px] mt-0.5 capitalize">{config.label} Portal</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {config.sections.map((section, si) => (
            <div key={si}>
              {section.title && !collapsed && (
                <div className="px-2 mb-1 text-[10px] text-zinc-600 uppercase tracking-widest font-semibold">
                  {section.title}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === `/dashboard/${role}` || item.path === `/dashboard/${role.split("-").join("-")}`}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors group relative ${
                        isActive
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                      } ${collapsed ? "justify-center" : ""}`
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon size={15} className="flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 leading-none">{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && item.badge && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User card */}
        <div className={`border-t border-white/[0.07] p-3 ${collapsed ? "flex justify-center" : ""}`}>
          {collapsed ? (
            <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-xs font-semibold">
              {initials}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-medium leading-none truncate">{user.name}</div>
                <div className="text-zinc-600 text-[10px] mt-0.5 truncate">{user.email}</div>
              </div>
              <Link to="/" className="text-zinc-600 hover:text-zinc-400 transition-colors">
                <LogOut size={13} />
              </Link>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute top-[72px] -right-3 w-6 h-6 rounded-full bg-zinc-900 border border-white/[0.10] text-zinc-500 hover:text-white items-center justify-center transition-colors"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 flex-shrink-0 border-b border-white/[0.07] bg-zinc-950 flex items-center justify-between px-4 gap-3">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-zinc-500 hover:text-white"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={18} />
            </button>
            <div className="hidden sm:block relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search…"
                className="pl-8 pr-3 py-1.5 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 placeholder:text-zinc-600 w-52 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Link to="/dashboard/wallet" className="p-2 text-zinc-500 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors" title="Wallet">
              <Wallet size={16} />
            </Link>
            <button className="relative p-2 text-zinc-500 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors" title="Notifications">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </button>
            <Link to={`/dashboard/${role}/settings`} className="p-2 text-zinc-500 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors" title="Settings">
              <Settings size={16} />
            </Link>
            <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 text-xs font-semibold flex items-center justify-center ml-1 cursor-pointer border-2 border-transparent hover:border-emerald-500 transition-colors">
              {initials}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-black">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
