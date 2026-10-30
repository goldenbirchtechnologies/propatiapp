'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Search, Plus, Send, MessageSquare, MoreHorizontal, ArrowLeft, Phone, Calendar, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

async function withRetry<T>(fn: () => Promise<T>, tries = 2, label?: string): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      const retryable =
        message.includes('Failed to fetch') ||
        message.includes('NetworkError when attempting to fetch resource.') ||
        message.includes('Network request failed') ||
        message.includes('The network connection was lost') ||
        message.includes('server closed the connection unexpectedly') ||
        message.includes('P1001') ||
        message.includes('P1017') ||
        message.includes('P11000');
      if (!retryable || ++attempt >= tries) throw err;
      await new Promise((resolve) => setTimeout(resolve, attempt * 150));
    }
  }
}

type Conversation = {
  id: string;
  listingId?: string;
  listing?: {
    id?: string;
    title?: string | null;
    area?: string | null;
    state?: string | null;
    price?: number | null;
    listingType?: string | null;
    images?: Array<{ url: string }>;
  };
  participant?: {
    id?: string;
    fullName?: string | null;
    avatarUrl?: string | null;
    role?: string | null;
  };
  subject?: string | null;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  status: string;
  participants?: unknown[];
  propertyId?: string | null;
  orgId?: string | null;
};

type Message = {
  id: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  senderId: string;
  sender?: {
    id?: string;
    fullName?: string | null;
    avatarUrl?: string | null;
    role?: string | null;
  };
};

type ScreeningCall = {
  id: string;
  listingId: string;
  landlordId: string;
  tenantId: string;
  scheduledAt: string;
  status: string;
  notes?: string | null;
  createdAt: string;
  listing?: {
    id?: string;
    title?: string | null;
    area?: string | null;
    state?: string | null;
    images?: Array<{ url: string }>;
  };
};

type Invite = {
  id: string;
  email?: string | null;
  status?: string;
  sender?: { fullName?: string | null; email?: string } | null;
  invitedBy?: string | null;
  createdAt?: string | null;
  listingId?: string | null;
  listing?: { title?: string | null; address?: string | null } | null;
  orgId?: string | null;
  orgName?: string | null;
  assignments?: { listing?: { title?: string | null } }[];
};

function InvitesList({ invites, loading, error, userRole, onAccept, onRemove, onRetry }: { invites: Invite[]; loading: boolean; error: string | null; userRole: string; onAccept: (id: string) => void; onRemove: (memberId: string, orgId: string) => void; onRetry: () => void }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return invites;
    return invites.filter((inv) => {
      const name = (inv.sender?.fullName || inv.email || '').toLowerCase();
      const listing = (inv.listing?.title || inv.listing?.address || '').toLowerCase();
      return name.includes(q) || listing.includes(q);
    });
  }, [invites, query]);

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 border" style={{ borderColor: 'var(--border)' }}>
            <div className="h-4 w-32 rounded mb-2" style={{ background: 'var(--muted)', opacity: 0.2 }} />
            <div className="h-3 w-48 rounded" style={{ background: 'var(--muted)', opacity: 0.1 }} />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card className="p-4 border" style={{ borderColor: 'var(--border)' }}>
          <p style={{ color: 'var(--text)' }}>{error}</p>
          <Button onClick={onRetry} className="mt-3">Retry</Button>
        </Card>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="card-body text-center py-16">
        <Mail className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
        <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No invites</h3>
        <p style={{ color: 'var(--muted)' }}>Pending invitations will appear here.</p>
      </div>
    );
  }

  return (
    <ScrollArea>
      <div>
        {filtered.map((inv) => {
          const label = inv.sender?.fullName || inv.email || 'Invitation';
          const subline = [inv.listing?.title, inv.listing?.address, inv.orgName].filter(Boolean).join(' · ') || 'Invitation';
          return (
            <div
              key={inv.id}
              className="w-full flex items-center gap-4 p-4 border-b transition-colors text-left hover:bg-zinc-900/30"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="rounded-full p-2" style={{ background: 'var(--surface-elevated)' }}>
                <Mail className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>{label}</p>
                  {inv.status && (
                    <Badge variant="default" className="rounded-full px-2 py-0 text-xs">{inv.status}</Badge>
                  )}
                </div>
                <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{subline}</p>
                {inv.createdAt && (
                  <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>
                    {new Date(inv.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {userRole === 'agent' && inv.status === 'pending' && (
                  <Button size="sm" onClick={() => onAccept(inv.id)}>Accept</Button>
                )}
                {userRole === 'estate_manager' && inv.orgId && (
                  <Button size="sm" variant="destructive" onClick={() => onRemove(inv.id, inv.orgId!)}>Remove</Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

const ELEVATION_TOKENS: Record<string, string> = {
  elevation_1: 'var(--elevation-1)',
  elevation_2: 'var(--elevation-2)',
  elevation_3: 'var(--elevation-3)',
};

const elevationStyle = (token?: string): CSSProperties => {
  if (!token) return {};
  if (token.startsWith('var(--')) {
    const varName = token.replace('var(', '').replace(')', '');
    const prop = varName.replace(/--/g, '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    if (prop === 'elevation1' || prop === 'elevation2' || prop === 'elevation3') {
      return { background: token };
    }
  }
  return {};
};

type Tab = 'all' | 'chats' | 'screening' | 'invites';

export default function UnifiedMessagesClient({ userId, userName, userRole }: { userId: string; userName: string; userRole: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [screeningCalls, setScreeningCalls] = useState<ScreeningCall[]>([]);
  const [screeningLoading, setScreeningLoading] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [invitesError, setInvitesError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('all');
  // Exact Zillow screenshot states
  const [filterOpen, setFilterOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [inboxValue, setInboxValue] = useState<'inbox' | 'archived'>('inbox');
  const [activePill, setActivePill] = useState<'viewAll' | 'inquiries' | 'tours' | 'applicants' | 'tenants'>('viewAll');
  const [propertySearch, setPropertySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'notReplied'>('all');

  const filtered = useMemo(() => {
    let out = conversations;
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter((c) => {
        const name = c.participant?.fullName?.toLowerCase() || '';
        const subj = c.subject?.toLowerCase() || '';
        const preview = c.lastMessage?.toLowerCase() || '';
        return name.includes(q) || subj.includes(q) || preview.includes(q);
      });
    }
    if (propertySearch.trim()) {
      const q = propertySearch.toLowerCase();
      out = out.filter((c) => {
        const title = c.listing?.title?.toLowerCase() || '';
        const area = c.listing?.area?.toLowerCase() || '';
        const state = c.listing?.state?.toLowerCase() || '';
        return title.includes(q) || area.includes(q) || state.includes(q);
      });
    }
    if (statusFilter === 'unread') out = out.filter((c) => c.unreadCount > 0);
    if (statusFilter === 'notReplied') out = out.filter((c) => !c.lastMessage || c.lastMessage.trim() === '');
    if (inboxValue === 'archived') out = out.filter((c) => c.status === 'archived');
    else out = out.filter((c) => c.status !== 'archived');
    // Pill filters - for now View All shows all, others filter by subject keywords
    if (activePill === 'inquiries') out = out.filter((c) => (c.subject || '').toLowerCase().includes('inquir'));
    if (activePill === 'tours') out = out.filter((c) => (c.subject || '').toLowerCase().includes('tour'));
    if (activePill === 'applicants') out = out.filter((c) => (c.subject || '').toLowerCase().includes('applic'));
    if (activePill === 'tenants') out = out.filter((c) => (c.participant?.role || '').toLowerCase().includes('tenant'));
    return out;
  }, [conversations, search, propertySearch, statusFilter, inboxValue, activePill]);

  async function loadConversations() {
    setLoading(true);
    setError(null);
    try {
      const res = await withRetry(() => fetch('/api/conversations'));
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load conversations');
      const data = Array.isArray(json.data) ? json.data : [];
      setConversations(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }

  async function loadScreening() {
    setScreeningLoading(true);
    try {
      const res = await withRetry(() => fetch('/api/screening-calls'));
      const json = await res.json();
      if (res.ok) setScreeningCalls(Array.isArray(json.data) ? json.data : []);
    } catch {
      // non-blocking
    } finally {
      setScreeningLoading(false);
    }
  }

  async function loadInvites() {
    if (userRole !== 'agent' && userRole !== 'estate_manager') return;
    setInvitesLoading(true);
    setInvitesError(null);
    try {
      if (userRole === 'agent') {
        const res = await withRetry(() => fetch('/api/agent-invites'));
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load invites');
        setInvites(Array.isArray(json.data) ? json.data : []);
      } else if (userRole === 'estate_manager') {
        const res = await withRetry(() => fetch('/api/dashboard/estate-manager/property-manager-invites'));
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load invites');
        setInvites(Array.isArray(json.data) ? json.data : []);
      }
    } catch (err: unknown) {
      setInvitesError(err instanceof Error ? err.message : 'Failed to load invites');
    } finally {
      setInvitesLoading(false);
    }
  }

  async function handleAcceptInvite(inviteId: string) {
    try {
      const res = await withRetry(() => fetch(`/api/agent-invites/${inviteId}/accept`, { method: 'POST' }));
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to accept invite');
      setInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
      loadConversations();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to accept invite');
    }
  }

  async function handleRemoveInvite(memberId: string, orgId: string) {
    try {
      const res = await withRetry(() => fetch(`/api/orgs/${orgId}/members/${memberId}`, { method: 'DELETE' }));
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to remove invite');
      setInvites((prev) => prev.filter((inv) => inv.id !== memberId));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to remove invite');
    }
  }

  async function markConversationRead(conversationId: string) {
    try {
      await withRetry(() => fetch(`/api/conversations/${conversationId}/mark-read`, { method: 'POST' }));
    } catch {
      // non-blocking read receipt
    }
  }

  async function loadMessages(conversationId: string) {
    setMessagesLoading(true);
    setMessages([]);
    try {
      const [convRes, msgRes] = await Promise.all([
        withRetry(() => fetch(`/api/conversations/${conversationId}/mark-read`, { method: 'POST' })),
        withRetry(() => fetch(`/api/conversations/${conversationId}/messages`)),
      ]);

      const msgJson = await msgRes.json();
      if (!msgRes.ok) throw new Error(msgJson.error || 'Failed to load messages');
      setMessages(Array.isArray(msgJson.data) ? msgJson.data : []);
      markConversationRead(conversationId).catch(() => {});
    } catch {
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }

  // WebSocket/real-time fallback: if socket initialization fails, keep using
  // REST polling (loadConversations / loadMessages) so the UI still updates.
  const isRealtimeFallback = false;

  useEffect(() => {
    loadConversations();
    loadScreening();
    loadInvites();
    const params = new URLSearchParams(window.location.search);
    const convoId = params.get('conversationId');
    if (convoId) setSelectedId(convoId);
  }, []);

  useEffect(() => {
    if (selectedId) loadMessages(selectedId);
  }, [selectedId]);
  async function handleSendMessage() {
    const trimmed = content.trim();
    if (!trimmed || !selectedId) return;
    const prev = content;
    setContent('');
    setReplyToId(null);
    try {
      const res = await withRetry(() => fetch(`/api/conversations/${selectedId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      }));
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to send');
      const payload = Array.isArray(json.data) ? json.data[0] : json.data;
      if (payload && payload.id) setMessages((m) => [...m, payload]);
      loadConversations();
    } catch {
      setContent(prev);
    }
  }

  async function handleNewConversation(formData: { participantId: string; subject: string; listingId?: string }) {
    try {
      const res = await withRetry(() => fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participants: [{ userId: formData.participantId, role: '' }, { userId, role: userRole }],
          subject: formData.subject || 'New Conversation',
          listingId: formData.listingId || null,
        }),
      }));
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create conversation');
      setNewOpen(false);
      const id = json?.data?.id;
      if (id) setSelectedId(id);
      loadConversations();
    } catch {
      // silent for now
    }
  }

  function formatTime(input: string | null | undefined) {
    if (!input) return '';
    const d = new Date(input);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000 && d.getDate() === now.getDate()) return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return d.toLocaleDateString('en-NG', { weekday: 'short' });
    return d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
  }

  const showList = activeTab !== 'screening' && activeTab !== 'invites' && !selectedId;
  const showDetail = activeTab !== 'screening' && activeTab !== 'invites' && !!selectedId;

  const tabs: { value: Tab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'chats', label: 'Chats' },
    { value: 'screening', label: 'Screening Calls' },
  ];
  if (userRole === 'agent' || userRole === 'estate_manager' || userRole === 'landlord') {
    tabs.push({ value: 'invites', label: 'Invites' });
  }

  const pillTabs = [
    { id: 'viewAll' as const, label: 'View All' },
    { id: 'inquiries' as const, label: 'Inquiries' },
    { id: 'tours' as const, label: 'Tours' },
    { id: 'applicants' as const, label: 'Applicants' },
    { id: 'tenants' as const, label: 'Tenants' },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Exact clone of screenshot - Messages header, full width, bold */}
      <div className="flex items-center justify-between gap-4 w-full">
        <h1 className="text-[34px] font-black tracking-tight text-zinc-900 dark:text-white leading-none">Messages</h1>
        <div className="flex items-center gap-3 relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg border-[1.5px] font-bold text-sm transition-colors',
              filterOpen
                ? 'border-blue-700 bg-blue-50 text-blue-700'
                : 'border-blue-700 bg-white text-blue-700 hover:bg-blue-50'
            )}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h4M3 12h4M3 18h4" />
              <path d="M8 6h3M8 12h3M8 18h3" />
              <path d="M13 6h8M13 12h8M13 18h8" />
              <circle cx="6" cy="6" r="1.6" fill="currentColor" />
              <circle cx="6" cy="12" r="1.6" fill="currentColor" />
              <circle cx="6" cy="18" r="1.6" fill="currentColor" />
            </svg>
            Filters
          </button>
          {filterOpen && (
            <div className="absolute right-0 top-[46px] w-[380px] bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-50">
              <div className="flex items-center gap-2 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                  <path d="M3 6h4M3 12h4M3 18h4" />
                  <path d="M8 6h3M8 12h3M8 18h3" />
                  <path d="M13 6h8M13 12h8M13 18h8" />
                  <circle cx="6" cy="6" r="1.6" fill="#64748b" />
                  <circle cx="6" cy="12" r="1.6" fill="#64748b" />
                  <circle cx="6" cy="18" r="1.6" fill="#64748b" />
                </svg>
                <span className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">Filter By</span>
              </div>
              <div className="p-4 space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by property address"
                    value={propertySearch}
                    onChange={(e) => setPropertySearch(e.target.value)}
                    className="w-full h-11 pl-4 pr-10 rounded-xl border border-zinc-300 bg-white text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                </div>
                <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-sm text-zinc-900">Status</span>
                    <button
                      onClick={() => setStatusFilter('all')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:text-blue-300"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={statusFilter === 'unread'}
                        onChange={() => setStatusFilter('unread')}
                        className="w-5 h-5 accent-blue-700"
                      />
                      <span className="text-sm text-zinc-900">Show unread only</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={statusFilter === 'notReplied'}
                        onChange={() => setStatusFilter('notReplied')}
                        className="w-5 h-5 accent-blue-700"
                      />
                      <span className="text-sm text-zinc-900">Not replied to</span>
                    </label>
                  </div>
                </div>
                <button onClick={() => setFilterOpen(false)} className="text-sm font-bold text-blue-700 hover:underline pt-2">
                  Close
                </button>
              </div>
            </div>
          )}
          <div className="relative">
            <button
              onClick={() => setInboxOpen(!inboxOpen)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-[1.5px] border-blue-700 bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm"
            >
              {inboxValue === 'inbox' ? 'Inbox' : 'Archived'}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={cn('transition-transform', inboxOpen && 'rotate-180')}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {inboxOpen && (
              <div className="absolute right-0 top-[46px] w-[160px] bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-50">
                <button
                  onClick={() => { setInboxValue('inbox'); setInboxOpen(false); }}
                  className={cn('w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-50', inboxValue === 'inbox' ? 'font-bold text-blue-700 bg-blue-50' : 'text-zinc-700')}
                >
                  Inbox
                </button>
                <button
                  onClick={() => { setInboxValue('archived'); setInboxOpen(false); }}
                  className={cn('w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-50', inboxValue === 'archived' ? 'font-bold text-blue-700 bg-blue-50' : 'text-zinc-700')}
                >
                  Archived
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pills - exact clone, full width */}
      <div className="flex items-center gap-2 flex-wrap w-full">
        {pillTabs.map((pill) => (
          <button
            key={pill.id}
            onClick={() => setActivePill(pill.id)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors',
              activePill === pill.id
                ? 'bg-blue-50 border-blue-700 text-blue-700'
                : 'bg-white border-zinc-300 text-zinc-900 hover:bg-zinc-50'
            )}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Full-width card */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm w-full">

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-500/10 border-b border-red-200 dark:border-red-500/20">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <Button onClick={loadConversations} size="sm" className="mt-2">Retry</Button>
          </div>
        )}

        {activeTab === 'invites' ? (
          <div className="p-4">
            <InvitesList invites={invites} loading={invitesLoading} error={invitesError} userRole={userRole} onAccept={handleAcceptInvite} onRemove={handleRemoveInvite} onRetry={loadInvites} />
          </div>
        ) : activeTab === 'screening' ? (
          <div className="p-4">
            <ScreeningCallsList calls={screeningCalls} loading={screeningLoading} />
          </div>
        ) : (
          <div className="flex min-h-[520px] flex-col lg:flex-row">
            {/* Left: conversation list */}
            <div className={`w-full lg:w-[320px] shrink-0 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 flex flex-col ${selectedId ? 'hidden lg:flex' : 'flex'}`}>
              <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="relative">
                  <Input type="text" placeholder="Search by name, property" value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10 pl-4 bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 rounded-xl" />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ConversationList conversations={filtered} loading={loading} onSelect={setSelectedId} selectedId={selectedId} />
              </div>
            </div>
            {/* Middle: thread */}
            <div className={`flex-1 min-w-0 flex flex-col bg-zinc-50 dark:bg-zinc-950/50 ${!selectedId ? 'hidden lg:flex' : 'flex'}`}>
              {selectedId ? (
                <ConversationDetail
                  conversationId={selectedId}
                  messages={messages}
                  loading={messagesLoading}
                  onBack={() => setSelectedId(null)}
                  content={content}
                  onContentChange={setContent}
                  onSend={handleSendMessage}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                    <MessageSquare className="w-6 h-6 text-zinc-400" />
                  </div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">Select a conversation</p>
                  <p className="text-xs text-zinc-500 mt-1">Choose from the list to view messages</p>
                </div>
              )}
            </div>
            {/* Right: details */}
            <div className="hidden xl:flex w-[300px] shrink-0 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-col">
              <div className="p-4 flex-1">
                {selectedId ? (
                  (() => {
                    const conv = conversations.find((c) => c.id === selectedId);
                    return conv ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conv.participant?.avatarUrl as string | undefined} alt={conv.participant?.fullName || 'User'} />
                            <AvatarFallback>{initials(conv.participant?.fullName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm text-zinc-900 dark:text-white">{conv.participant?.fullName || 'Conversation'}</p>
                            <p className="text-xs text-zinc-500">{conv.participant?.role || conv.listing?.title || ''}</p>
                          </div>
                        </div>
                        {conv.listing && (
                          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Property</p>
                            <p className="text-sm font-medium mt-1 text-zinc-900 dark:text-white line-clamp-2">{conv.listing.title}</p>
                            <p className="text-xs text-zinc-500">{[conv.listing.area, conv.listing.state].filter(Boolean).join(', ')}</p>
                          </div>
                        )}
                        <div className="text-xs text-zinc-500 space-y-1">
                          <p>Status: <span className="capitalize text-zinc-900 dark:text-white">{conv.status}</span></p>
                          {conv.lastMessageAt && <p>Last: {new Date(conv.lastMessageAt).toLocaleString('en-NG')}</p>}
                        </div>
                      </div>
                    ) : null;
                  })()
                ) : (
                  <div className="h-full flex flex-col gap-3">
                    <div className="h-6 w-24 bg-zinc-100 dark:bg-zinc-800 rounded" />
                    <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded" />
                    <div className="h-4 w-5/6 bg-zinc-100 dark:bg-zinc-800 rounded" />
                    <div className="mt-4 space-y-3">
                      <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800 rounded" />
                      <div className="h-10 w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                      <div className="h-10 w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScreeningStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    scheduled: { label: 'Scheduled', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    completed: { label: 'Completed', className: 'bg-primary/10 text-primary border-primary/20' },
    cancelled: { label: 'Cancelled', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
    missed: { label: 'Missed', className: 'bg-primary/10 text-[#4edea3] border-primary/20' },
  };
  const item = map[status] || { label: status, className: 'bg-zinc-900' };
  return <Badge className={item.className}>{item.label}</Badge>;
}

function ScreeningCallsList({ calls, loading }: { calls: ScreeningCall[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 border" style={{ borderColor: 'var(--border)' }}>
            <div className="h-4 w-32 rounded mb-2" style={{ background: 'var(--muted)', opacity: 0.2 }} />
            <div className="h-3 w-48 rounded" style={{ background: 'var(--muted)', opacity: 0.1 }} />
          </Card>
        ))}
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="card-body text-center py-16">
        <Phone className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
        <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No screening calls</h3>
        <p style={{ color: 'var(--muted)' }}>Upcoming screening calls will appear here.</p>
      </div>
    );
  }

  return (
    <ScrollArea>
      <div>
        {calls.map((call) => (
          <div
            key={call.id}
            className="w-full flex items-center gap-4 p-4 border-b transition-colors text-left"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="rounded-full p-2" style={{ background: 'var(--surface-elevated)' }}>
              <Phone className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>
                  {call.listing?.title || 'Screening Call'}
                </p>
                <ScreeningStatusBadge status={call.status} />
              </div>
              <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>
                {new Date(call.scheduledAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function initials(name: string | null | undefined) {
  if (!name) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0]?.[0]?.toUpperCase() || 'U';
}

function ConversationList({ conversations, loading, onSelect, selectedId }: { conversations: Conversation[]; loading: boolean; onSelect: (id: string) => void; selectedId?: string | null }) {
  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 border" style={{ borderColor: 'var(--border)' }}>
            <div className="h-4 w-32 rounded mb-2" style={{ background: 'var(--muted)', opacity: 0.2 }} />
            <div className="h-3 w-48 rounded" style={{ background: 'var(--muted)', opacity: 0.1 }} />
          </Card>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-10 h-10 flex items-center justify-center mb-4 text-zinc-400">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="3" y="6" width="18" height="12" rx="2" />
            <path d="M3 7l9 6 9-6" />
            <path d="M3 17l6-6M21 17l-6-6" opacity="0.5" />
          </svg>
        </div>
        <p className="text-sm text-zinc-900 dark:text-zinc-300 leading-relaxed max-w-[200px]">
          To get older conversations, try selecting a single property.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea>
      <div>
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`w-full flex items-center gap-4 p-4 border-b transition-colors text-left ${selectedId === conv.id ? 'bg-[var(--sovereign-container-bg)] dark:bg-primary/10 border-primary dark:border-primary/20' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800'}`}
          >
            <Avatar>
              <AvatarImage src={conv.participant?.avatarUrl as string | undefined} alt={conv.participant?.fullName || 'User'} />
              <AvatarFallback>{initials(conv.participant?.fullName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>
                  {conv.participant?.fullName || 'Conversation'}
                  {conv.listing?.title ? ` — ${conv.listing.title}` : ''}
                </p>
                {conv.unreadCount > 0 && (
                  <Badge variant="default" className="rounded-full px-2 py-0 text-xs">
                    {conv.unreadCount}
                  </Badge>
                )}
              </div>
              <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>
                {conv.lastMessage || conv.subject || 'No messages yet'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: 'var(--muted)' }}>{formatTime(conv.lastMessageAt)}</p>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}

function ConversationDetail({ conversationId, messages, loading, onBack, content, onContentChange, onSend }: { conversationId: string; messages: Message[]; loading: boolean; onBack: () => void; content: string; onContentChange: (v: string) => void; onSend: () => void }) {
  return (
    <div className="flex flex-col h-[60vh]">
      <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>Conversation</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>{conversationId}</p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Call">
          <Phone className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Schedule">
          <Calendar className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-3 border" style={{ borderColor: 'var(--border)', background: 'var(--elevation-1)' }}>
                <div className="h-3 w-32 rounded mb-2" style={{ background: 'var(--muted)', opacity: 0.2 }} />
                <div className="h-2 w-64 rounded" style={{ background: 'var(--muted)', opacity: 0.1 }} />
              </Card>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <p style={{ color: 'var(--muted)' }}>No messages yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
          </div>
        )}
      </ScrollArea>

      <Separator />
      <div className="p-3">
        <Textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Type a message..."
          rows={2}
          className="mb-2"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
        <div className="flex justify-end">
          <Button onClick={onSend} disabled={!content.trim()} className="inline-flex items-center gap-2">
            <Send className="w-4 h-4" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const senderName = message.sender?.fullName || message.sender?.role || 'User';
  return (
    <div className="flex gap-3">
      <Avatar>
        <AvatarImage src={message.sender?.avatarUrl as string | undefined} alt={senderName} />
        <AvatarFallback>{initials(senderName)}</AvatarFallback>
      </Avatar>
      <div className="max-w-[70%] rounded-lg px-3 py-2" style={{ background: 'var(--elevation-2)', color: 'var(--text)' }}>
        <p className="text-xs mb-1 font-medium" style={{ color: 'var(--muted)' }}>{senderName}</p>
        <p className="text-sm">{message.content || ''}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{formatTime(message.createdAt)}</p>
      </div>
    </div>
  );
}

function formatTime(input: string | null | undefined) {
  if (!input) return '';
  const d = new Date(input);
  return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
}

function NewConversationForm({ userId, userRole, onSubmit }: { userId: string; userRole: string; onSubmit: (data: { participantId: string; subject: string; listingId?: string }) => void }) {
  const [participantId, setParticipantId] = useState('');
  const [subject, setSubject] = useState('');
  const [listingId, setListingId] = useState('');
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">To</label>
        <Input placeholder="User ID" value={participantId} onChange={(e) => setParticipantId(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Subject</label>
        <Input placeholder="Conversation subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Listing (optional)</label>
        <Input placeholder="Listing ID" value={listingId} onChange={(e) => setListingId(e.target.value)} />
      </div>
      <Button className="w-full" onClick={() => onSubmit({ participantId, subject, listingId: listingId || undefined })}>
        Start Conversation
      </Button>
    </div>
  );
}
