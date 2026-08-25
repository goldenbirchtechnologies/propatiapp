"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Globe, MapPin, Settings, Check, X, Edit2, Trash2 } from "lucide-react";

interface Country {
  code: string;
  name: string;
  currency: string;
  locale: string;
  timezone: string;
  active: boolean;
  jurisdictions: { id: string; name: string; code: string | null; level: string }[];
  capabilities: { id: string; feature: string; enabled: boolean; available: boolean; note?: string }[];
  _count: { users: number; listings: number };
}

export default function CountriesAdminPage() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", currency: "", locale: "", timezone: "" });

  useEffect(() => {
    fetchCountries();
  }, []);

  async function fetchCountries() {
    try {
      const res = await fetch("/api/admin/countries");
      const data = await res.json();
      setCountries(data.countries || []);
    } catch (error) {
      console.error("Failed to fetch countries:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addCountry(e: React.FormEvent) {
    e.preventDefault();
    try {
      await fetch("/api/admin/countries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, active: false }),
      });
      setShowAdd(false);
      setForm({ code: "", name: "", currency: "", locale: "", timezone: "" });
      fetchCountries();
    } catch (error) {
      console.error("Failed to add country:", error);
    }
  }

  async function toggleActive(code: string, active: boolean) {
    try {
      await fetch(`/api/admin/countries/${code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      fetchCountries();
    } catch (error) {
      console.error("Failed to update country:", error);
    }
  }

  if (loading) return <div className="p-8 text-zinc-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Countries</h1>
          <p className="text-zinc-400">Manage supported countries, jurisdictions, and feature availability</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Add Country
        </button>
      </div>

      {showAdd && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Country</h2>
          <form onSubmit={addCountry} className="grid grid-cols-2 gap-4">
            <input placeholder="Code (e.g. GH)" value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2" />
            <input placeholder="Name (e.g. Ghana)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2" />
            <input placeholder="Currency (e.g. GHS)" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})} className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2" />
            <input placeholder="Locale (e.g. en-GH)" value={form.locale} onChange={e => setForm({...form, locale: e.target.value})} className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2" />
            <input placeholder="Timezone (e.g. Africa/Accra)" value={form.timezone} onChange={e => setForm({...form, timezone: e.target.value})} className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2" />
            <div className="flex gap-2">
              <button type="submit" className="rounded-lg bg-emerald-500 px-4 py-2 text-primary-foreground">Save</button>
              <button type="button" onClick={() => setShowAdd(false)} className="rounded-lg border border-zinc-800 px-4 py-2">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {countries.map(country => (
          <div key={country.code} className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-zinc-400" />
                <div>
                  <h3 className="font-semibold text-foreground">{country.name} ({country.code})</h3>
                  <p className="text-sm text-zinc-400">
                    {country.currency} · {country.locale} · {country.timezone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${country.active ? "bg-green-100 text-emerald-400" : "bg-gray-100 text-gray-600"}`}>
                  {country.active ? "Active" : "Inactive"}
                </span>
                <button onClick={() => toggleActive(country.code, country.active)} className="text-sm text-emerald-400 hover:underline">
                  {country.active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-zinc-400">Jurisdictions</p>
                <p className="font-medium">{country.jurisdictions.length}</p>
              </div>
              <div>
                <p className="text-zinc-400">Users</p>
                <p className="font-medium">{country._count?.users || 0}</p>
              </div>
              <div>
                <p className="text-zinc-400">Listings</p>
                <p className="font-medium">{country._count?.listings || 0}</p>
              </div>
            </div>

            {country.capabilities.length > 0 && (
              <div className="mt-4 border-t border-zinc-800 pt-4">
                <p className="text-sm font-medium text-foreground mb-2">Feature Capabilities</p>
                <div className="flex flex-wrap gap-2">
                  {country.capabilities.map(cap => (
                    <span key={cap.id} className={`text-xs px-2 py-1 rounded ${cap.enabled ? "bg-green-100 text-emerald-400" : cap.available ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                      {cap.feature}: {cap.enabled ? "live" : cap.available ? "soon" : "off"}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
