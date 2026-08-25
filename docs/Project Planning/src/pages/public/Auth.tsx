import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Building2, Home, Users, BriefcaseIcon, ChevronRight, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Btn } from "../../components/ui";

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg">PROPATI</span>
          </Link>
        </div>
        <div className="glass-card p-8">
          <h1 className="text-xl font-bold text-white mb-1">{title}</h1>
          <p className="text-sm text-zinc-500 mb-6">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your PROPATI account">
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="dark-input w-full px-3 py-2.5 text-sm focus:outline-none"
          />
        </div>
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-xs text-zinc-400">Password</label>
            <a href="#" className="text-xs text-emerald-400 hover:text-emerald-300">Forgot password?</a>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="dark-input w-full px-3 py-2.5 pr-10 text-sm focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate("/dashboard/landlord")}
        className="mt-5 w-full py-2.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
      >
        Sign in
      </button>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800" /></div>
        <div className="relative flex justify-center">
          <span className="bg-zinc-950 px-3 text-xs text-zinc-600">or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {["Google", "Apple"].map((provider) => (
          <button key={provider} className="py-2.5 text-sm text-zinc-300 border border-zinc-800 rounded-lg hover:border-zinc-600 hover:text-white transition-colors">
            {provider}
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-zinc-600 mt-5">
        No account?{" "}
        <Link to="/signup" className="text-emerald-400 hover:text-emerald-300">Create one free</Link>
      </p>
    </AuthShell>
  );
}

export function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  return (
    <AuthShell title="Create your account" subtitle="Join 120,000+ Nigerians on PROPATI">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">First name</label>
            <input type="text" placeholder="Emeka" className="dark-input w-full px-3 py-2.5 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Last name</label>
            <input type="text" placeholder="Okafor" className="dark-input w-full px-3 py-2.5 text-sm focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Email address</label>
          <input type="email" placeholder="you@example.com" className="dark-input w-full px-3 py-2.5 text-sm focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Phone number</label>
          <input type="tel" placeholder="+234 800 000 0000" className="dark-input w-full px-3 py-2.5 text-sm focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 characters"
              className="dark-input w-full px-3 py-2.5 pr-10 text-sm focus:outline-none"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400">
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs text-zinc-600 mt-3">
        By creating an account you agree to our{" "}
        <a href="#" className="text-emerald-400">Terms</a> and{" "}
        <a href="#" className="text-emerald-400">Privacy Policy</a>.
      </p>

      <button
        onClick={() => navigate("/signup")}
        className="mt-4 w-full py-2.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
      >
        Create account
      </button>

      <p className="text-center text-xs text-zinc-600 mt-4">
        Already have an account?{" "}
        <Link to="/sign-in" className="text-emerald-400 hover:text-emerald-300">Sign in</Link>
      </p>
    </AuthShell>
  );
}

const roles = [
  {
    id: "landlord",
    label: "Landlord",
    desc: "I own property and want to list, manage, and collect rent",
    icon: Home,
    path: "/dashboard/landlord",
    features: ["Property management", "Rent collection", "Tenant screening"],
  },
  {
    id: "tenant",
    label: "Tenant",
    desc: "I'm looking for a verified property to rent or buy",
    icon: Users,
    path: "/dashboard/tenant",
    features: ["Verified listings", "Online payments", "Maintenance requests"],
  },
  {
    id: "agent",
    label: "Agent",
    desc: "I'm a licensed real estate agent or broker",
    icon: BriefcaseIcon,
    path: "/dashboard/agent",
    features: ["Commission tracking", "CRM tools", "Deal pipeline"],
  },
  {
    id: "estate-manager",
    label: "Estate Manager",
    desc: "I manage multiple properties or an estate on behalf of owners",
    icon: Building2,
    path: "/dashboard/estate-manager",
    features: ["Portfolio overview", "Collections", "Team management"],
  },
];

export function RolePicker() {
  const [selected, setSelected] = useState("");
  const navigate = useNavigate();

  const selectedRole = roles.find((r) => r.id === selected);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg">PROPATI</span>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">What best describes you?</h1>
          <p className="text-zinc-500 text-sm">Choose your role to access your personalized dashboard</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelected(role.id)}
              className={`text-left p-5 rounded-2xl border transition-all ${
                selected === role.id
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                  : "bg-zinc-950 border-zinc-800 hover:border-zinc-600"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  selected === role.id ? "bg-emerald-500/20" : "bg-zinc-900"
                }`}>
                  <role.icon size={18} className={selected === role.id ? "text-emerald-400" : "text-zinc-500"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm mb-0.5 ${selected === role.id ? "text-emerald-400" : "text-white"}`}>
                    {role.label}
                  </div>
                  <div className="text-xs text-zinc-500 leading-relaxed">{role.desc}</div>
                  {selected === role.id && (
                    <div className="mt-2 space-y-1">
                      {role.features.map((f) => (
                        <div key={f} className="flex items-center gap-1.5 text-xs text-emerald-400/70">
                          <CheckCircle size={10} />
                          {f}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selected === role.id && <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => selectedRole && navigate(selectedRole.path)}
          disabled={!selected}
          className={`w-full py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors ${
            selected ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-zinc-900 text-zinc-600 cursor-not-allowed"
          }`}
        >
          Continue as {selectedRole?.label ?? "…"}
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
