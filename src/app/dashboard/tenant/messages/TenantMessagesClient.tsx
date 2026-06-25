'use client';

import { useState } from 'react';
import { Search, MessageSquare, Plus } from 'lucide-react';

type Conversation = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
};

export default function TenantMessagesClient({ initialConversations }: { initialConversations: Conversation[] }) {
  const [search, setSearch] = useState('');
  const filtered = search ? initialConversations.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.lastMessage.toLowerCase().includes(search.toLowerCase())) : initialConversations;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>Messages</h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>Chat with landlords, agents, and support</p>
        </div>
        <button className="btn btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> New Message</button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} />
            <input type="text" placeholder="Search conversations..." value={search} onChange={(e) => setSearch(e.target.value)} className="inp-field w-full pl-10" />
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="card-body text-center py-16">
            <MessageSquare className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
            <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No conversations</h3>
            <p style={{ color: 'var(--muted)' }}>Start a new conversation to begin messaging.</p>
          </div>
        ) : (
          <div>
            {filtered.map((conv) => (
              <div key={conv.id} className="flex items-center gap-4 p-4 border-b transition-colors hover:bg-muted/30 cursor-pointer" style={{ borderColor: 'var(--border)' }}>
                <div className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>{conv.name}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{conv.lastMessage}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{conv.time}</p>
                  {conv.unread > 0 && <span className="inline-flex items-center justify-center h-5 w-5 rounded-full text-xs font-bold text-white mt-1" style={{ background: 'var(--accent)' }}>{conv.unread}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
