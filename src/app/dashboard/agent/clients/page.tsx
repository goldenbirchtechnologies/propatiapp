'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { Users, Phone, Mail, Plus, Eye, Star } from 'lucide-react';

const mockClients = [
  { id: 'cl1', name: 'John Doe', phone: '0803 456 7890', type: 'Buyer', minBudget: 2000000, maxBudget: 5000000, lastContact: '2 hours ago' },
  { id: 'cl2', name: 'Mary Johnson', phone: '0806 123 4567', type: 'Renter', minBudget: 1500000, maxBudget: 3000000, lastContact: '1 day ago' },
  { id: 'cl3', name: 'Peter Okonkwo', phone: '0809 987 6543', type: 'Buyer', minBudget: 8000000, maxBudget: 15000000, lastContact: '3 days ago' },
  { id: 'cl4', name: 'Sarah Williams', phone: '0703 111 2222', type: 'Renter', minBudget: 1000000, maxBudget: 2000000, lastContact: '5 hours ago' },
];

export default function AgentClientsPage() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? mockClients : mockClients.filter((c) => c.type.toLowerCase() === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>My Clients</h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>Manage lead relationships and budgets</p>
        </div>
        <button className="btn btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add Client</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Total Clients</p><p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{mockClients.length}</p></div>
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Buyers</p><p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{mockClients.filter((c) => c.type === 'Buyer').length}</p></div>
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Renters</p><p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{mockClients.filter((c) => c.type === 'Renter').length}</p></div>
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Active</p><p className="text-2xl font-bold text-green-600">{mockClients.length}</p></div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 flex flex-wrap gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
          {['all', 'buyer', 'renter'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-sm font-medium border capitalize transition-colors ${filter === f ? 'bg-accent/10 text-accent border-accent/30' : 'border-transparent hover:bg-muted/50'}`}>{f}</button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="card-body text-center py-16"><Users className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} /><h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No clients</h3><p style={{ color: 'var(--muted)' }}>Add your first client.</p></div>
        ) : (
          <table className="w-full">
            <thead><tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Client</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Type</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Budget (₦)</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Last Contact</th>
              <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b transition-colors hover:bg-muted/30" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}><Users className="w-4 h-4" /></div>
                      <div><p className="font-medium text-sm" style={{ color: 'var(--text)' }}>{c.name}</p><p className="text-xs" style={{ color: 'var(--muted)' }}>{c.phone}</p></div>
                    </div>
                  </td>
                  <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>{c.type}</td>
                  <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>₦{c.minBudget.toLocaleString()} — ₦{c.maxBudget.toLocaleString()}</td>
                  <td className="p-4 text-sm" style={{ color: 'var(--muted)' }}>{c.lastContact}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 rounded-md hover:bg-muted/50"><Phone className="w-4 h-4" style={{ color: 'var(--muted)' }} /></button>
                      <button className="p-2 rounded-md hover:bg-muted/50"><Mail className="w-4 h-4" style={{ color: 'var(--muted)' }} /></button>
                      <button className="p-2 rounded-md hover:bg-muted/50"><Eye className="w-4 h-4" style={{ color: 'var(--muted)' }} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}