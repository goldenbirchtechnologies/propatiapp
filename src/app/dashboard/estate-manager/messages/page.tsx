'use client';

import { useEffect, useState, useCallback } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { useActiveOrganization } from '@/contexts/ActiveOrganizationContext';
import { NoOrgState } from '@/components/organizations/NoOrgState';
import {
  Search, Plus, Send, Paperclip, Mic, Bold, Link2,
  Phone, FileText, Wallet, PanelLeft, CheckCheck,
  Building2, RefreshCw, Filter,
} from 'lucide-react';

// ─── Types ───
interface Conversation {
  id: string;
  subject: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  status: string;
  participants: Array<{ id: string; name: string; role: string }>;
  listing?: { id: string; title: string } | null;
  landlord?: { id: string; fullName: string | null } | null;
  tenant?: { id: string; fullName: string | null; email: string } | null;
  unreadCount: number;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  attachmentUrl: string | null;
  attachmentType: string | null;
  isRead: boolean;
  createdAt: string;
}

const CATEGORIES = ['All', 'Tenants', 'Landlords', 'Team'];

const CANNED_RESPONSES = [
  { label: 'Payment Acknowledgment', text: 'Rent settlement acknowledged and credited to your ledger. Official invoice receipt generated.' },
  { label: 'Maintenance Update', text: 'Routine MEP maintenance inspection is scheduled for your wing tomorrow between 11:00 AM and 1:00 PM.' },
  { label: 'Lease Renewal Stamp', text: 'Please find the LASRERA accredited lease renewal documentation ready for digital signature.' },
];

export default function MessagesPage() {
  const { organization, loading: orgLoading } = useActiveOrganization();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (!organization) return;
    let cancelled = false;
    setLoading(true);
    fetch('/api/dashboard/estate-manager/conversations', { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) {
          const raw = json?.data ?? [];
          setConversations(raw.map((c: any) => ({
            id: c.id,
            subject: c.subject,
            lastMessage: c.lastMessage,
            lastMessageAt: c.lastMessageAt,
            status: c.status,
            participants: c.participants ?? [],
            listing: c.listing ?? null,
            landlord: c.landlord ?? null,
            tenant: c.tenant ?? null,
            unreadCount: c.unreadCount ?? 0,
          })));
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [organization]);

  const loadMessages = useCallback((convoId: string) => {
    setActiveConvoId(convoId);
    fetch(`/api/dashboard/estate-manager/conversations/${convoId}/messages`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        const raw = json?.data ?? [];
        setMessages(raw.map((m: any) => ({
          id: m.id,
          conversationId: m.conversationId,
          senderId: m.senderId,
          senderName: m.senderName,
          content: m.content,
          attachmentUrl: m.attachmentUrl,
          attachmentType: m.attachmentType,
          isRead: m.isRead,
          createdAt: m.createdAt,
        })));
      })
      .catch(() => {});
  }, []);

  const sendMessage = async () => {
    if (!draft.trim() || !activeConvoId) return;
    setSending(true);
    try {
      const res = await fetch(`/api/dashboard/estate-manager/conversations/${activeConvoId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: draft.trim() }),
      });
      if (res.ok) {
        const json = await res.json();
        const msg = json?.data;
        if (msg) {
          setMessages((prev) => [...prev, {
            id: msg.id,
            conversationId: msg.conversationId,
            senderId: msg.senderId,
            senderName: msg.senderName,
            content: msg.content,
            attachmentUrl: msg.attachmentUrl,
            attachmentType: msg.attachmentType,
            isRead: msg.isRead,
            createdAt: msg.createdAt,
          }]);
        }
        setDraft('');
      }
    } catch {
      // send failed silently
    } finally {
      setSending(false);
    }
  };

  if (orgLoading) return <NoOrgState title="Loading organization…" />;
  if (!organization) return <NoOrgState title="No Organization" description="Select or create an organization to view messages." />;

  const filtered = conversations.filter((c) => {
    if (category !== 'All') {
      const roleMap: Record<string, string> = { Tenants: 'tenant', Landlords: 'landlord', Team: 'team' };
      const role = roleMap[category];
      if (role && !c.participants.some((p) => p.role === role)) return false;
    }
    if (query) {
      const q = query.toLowerCase();
      const hay = [c.subject ?? '', c.lastMessage ?? '', c.tenant?.fullName ?? '', c.landlord?.fullName ?? '', c.listing?.title ?? ''].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const activeConvo = conversations.find((c) => c.id === activeConvoId);
  const activeName = activeConvo?.tenant?.fullName ?? activeConvo?.landlord?.fullName ?? activeConvo?.subject ?? 'Conversation';

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
      <ErrorBoundary>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h1 className="font-heading text-2xl font-bold text-zinc-900 dark:text-white">Messages & Comms Ledger</h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Encrypted operational communications with tenants, landlords, and field technicians.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">
                <Filter className="h-[18px] w-[18px]" /> Filter
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--sovereign-hover)]">
                <Plus className="h-[18px] w-[18px]" /> New Conversation
              </button>
            </div>
          </div>

          {/* 3-Pane Layout */}
          <div className="flex h-[700px] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {/* Pane 1: Conversation List */}
            <div className="w-full flex-shrink-0 flex-col border-r border-zinc-200 bg-zinc-50/60 lg:flex lg:w-[350px] dark:border-zinc-800 dark:bg-zinc-900/60">
              <div className="space-y-3 p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search channels & contacts…"
                    className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-primary focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-1 overflow-x-auto">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`whitespace-nowrap rounded px-3 py-1 text-[11px] font-semibold transition-colors ${
                        category === cat
                          ? 'bg-primary text-white'
                          : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {cat} {cat === 'All' ? `(${conversations.length})` : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 space-y-1 overflow-y-auto p-2">
                {loading ? (
                  <div className="p-4 text-center">
                    <RefreshCw className="mx-auto h-5 w-5 animate-spin text-zinc-400" />
                    <p className="mt-2 text-xs text-zinc-500">Loading conversations…</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="p-4 text-center text-sm text-zinc-500">No conversations found</div>
                ) : (
                  filtered.map((c) => {
                    const name = c.tenant?.fullName ?? c.landlord?.fullName ?? c.subject ?? 'Unknown';
                    const isActive = c.id === activeConvoId;
                    return (
                      <button
                        key={c.id}
                        onClick={() => loadMessages(c.id)}
                        className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors ${
                          isActive
                            ? 'bg-white shadow-sm dark:bg-zinc-800'
                            : 'hover:bg-white/80 dark:hover:bg-zinc-800/60'
                        }`}
                      >
                        <div className="relative flex-shrink-0">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--sovereign-container-bg)] text-sm font-semibold text-[var(--sovereign-hover)] dark:bg-primary/30 dark:text-[#4edea3]">
                            {name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          {c.unreadCount > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                              {c.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{name}</span>
                            {c.lastMessageAt && (
                              <span className="text-[10px] text-zinc-500">
                                {new Date(c.lastMessageAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                            {c.lastMessage ?? 'No messages yet'}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Pane 2: Message Thread */}
            <div className="hidden flex-1 flex-col lg:flex">
              {activeConvo ? (
                <>
                  {/* Thread Header */}
                  <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--sovereign-container-bg)] text-sm font-semibold text-[var(--sovereign-hover)] dark:bg-primary/30 dark:text-[#4edea3]">
                        {activeName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-zinc-900 dark:text-white">{activeName}</span>
                          <span className="rounded bg-[var(--sovereign-container-bg)] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[var(--sovereign-hover)] dark:bg-primary/10 dark:text-[#4edea3]">
                            {activeConvo.tenant ? 'Tenant' : activeConvo.landlord ? 'Landlord' : 'Team'}
                          </span>
                        </div>
                        {activeConvo.listing && (
                          <span className="text-xs text-zinc-500">{activeConvo.listing.title}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800">
                        <Phone className="h-5 w-5" />
                      </button>
                      <button className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 md:flex dark:text-zinc-300 dark:hover:bg-zinc-800">
                        <FileText className="h-4 w-4" /> Lease Profile
                      </button>
                      <button className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 lg:flex dark:text-zinc-300 dark:hover:bg-zinc-800">
                        <Wallet className="h-4 w-4" /> Ledger
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 space-y-4 overflow-y-auto bg-zinc-50/40 px-6 py-4 dark:bg-zinc-900/40">
                    {messages.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                        No messages yet. Start the conversation.
                      </div>
                    ) : (
                      messages.map((m) => {
                        const isMe = m.senderId === 'me';
                        return (
                          <div key={m.id} className={`flex items-start gap-3 ${isMe ? 'justify-end' : ''}`}>
                            {!isMe && (
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--sovereign-container-bg)] text-xs font-semibold text-[var(--sovereign-hover)] dark:bg-primary/30 dark:text-[#4edea3]">
                                {m.senderName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                              </div>
                            )}
                            <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                              <div className={`rounded-xl p-4 text-sm leading-relaxed ${
                                isMe
                                  ? 'rounded-tr-sm bg-primary text-white'
                                  : 'rounded-tl-sm bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white'
                              }`}>
                                <p>{m.content}</p>
                                {m.attachmentUrl && (
                                  <div className="mt-2 flex items-center gap-2 rounded-lg bg-black/10 p-2">
                                    <Paperclip className="h-4 w-4" />
                                    <span className="text-xs">Attachment</span>
                                  </div>
                                )}
                              </div>
                              <div className={`mt-1 flex items-center gap-1 px-1 text-[10px] text-zinc-500 ${isMe ? 'justify-end' : ''}`}>
                                {new Date(m.createdAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                                {isMe && <CheckCheck className="h-3 w-3 text-primary" />}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Compose */}
                  <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="mb-2 flex items-center gap-2 overflow-x-auto">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Templates:</span>
                      {CANNED_RESPONSES.map((cr) => (
                        <button
                          key={cr.label}
                          onClick={() => setDraft(cr.text)}
                          className="whitespace-nowrap rounded bg-zinc-100 px-2.5 py-1 text-[11px] text-zinc-700 transition-colors hover:bg-[var(--sovereign-container-bg)] hover:text-[var(--sovereign-hover)] dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-primary/30"
                        >
                          {cr.label}
                        </button>
                      ))}
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-700 dark:bg-zinc-800">
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                        placeholder={`Write a message to ${activeName}…`}
                        rows={2}
                        className="w-full resize-none bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
                      />
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1 text-zinc-500">
                          <button className="rounded p-1.5 transition-colors hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700">
                            <Paperclip className="h-5 w-5" />
                          </button>
                          <button className="rounded p-1.5 transition-colors hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700">
                            <Mic className="h-5 w-5" />
                          </button>
                          <div className="mx-1 h-4 w-px bg-zinc-300 dark:bg-zinc-600" />
                          <button className="rounded p-1.5 transition-colors hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700">
                            <Bold className="h-5 w-5" />
                          </button>
                          <button className="rounded p-1.5 transition-colors hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700">
                            <Link2 className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="hidden text-[10px] text-zinc-500 sm:inline">Encrypted Channel</span>
                          <button
                            onClick={sendMessage}
                            disabled={!draft.trim() || sending}
                            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--sovereign-hover)] disabled:opacity-40"
                          >
                            <Send className="h-4 w-4" /> Send
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                    <PanelLeft className="h-8 w-8 opacity-50" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Select a conversation</h3>
                  <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
                    Choose a conversation from the list to view and respond to messages.
                  </p>
                </div>
              )}
            </div>

            {/* Pane 3: Context Drawer */}
            <div className="hidden w-[300px] flex-shrink-0 flex-col space-y-4 overflow-y-auto border-l border-zinc-200 bg-zinc-50/70 p-4 xl:flex dark:border-zinc-800 dark:bg-zinc-900/70">
              {activeConvo ? (
                <>
                  <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary dark:text-[#4edea3]">Unit Summary</span>
                      <span className="rounded bg-[var(--sovereign-container-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--sovereign-hover)] dark:bg-primary/10 dark:text-[#4edea3]">
                        {activeConvo.status}
                      </span>
                    </div>
                    {activeConvo.listing && (
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
                          <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                          <span className="block text-sm font-semibold text-zinc-900 dark:text-white">{activeConvo.listing.title}</span>
                          <span className="text-xs text-zinc-500">Property</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Participants</span>
                    </div>
                    {activeConvo.participants.map((p) => (
                      <div key={p.id} className="flex items-center gap-2 rounded-lg bg-white p-2.5 shadow-sm dark:bg-zinc-800">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
                          {p.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <span className="block truncate text-sm font-medium text-zinc-900 dark:text-white">{p.name}</span>
                          <span className="text-[10px] capitalize text-zinc-500">{p.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                  Select a conversation to view details
                </div>
              )}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
