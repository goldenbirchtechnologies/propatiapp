'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
  Search, Shield, BadgeCheck, Headset, Bell, Download, Phone, ChevronRight,
  Building2, Landmark, CheckCheck, SquarePen, Lock, FileText, Building, MoreVertical,
  Paperclip, Image as ImageIcon, Link2, Send, X, FileDown,
} from 'lucide-react';
import {
  useConversations,
  useConversation,
  useSendMessage,
  useMarkAsRead,
  useDeleteConversation,
  useCreateConversation,
} from '@/hooks/useMessages';

// ─── Types (aligned with useMessages hook) ────────────────────────────────────
type Conversation = {
  id: string;
  subject: string | null;
  listingId: string | null;
  propertyId: string | null;
  orgId: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  propertyName: string | null;
  participant: {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
    role: string | null;
  } | null;
  listing?: {
    id?: string | null;
    title?: string | null;
    area?: string | null;
    state?: string | null;
    images?: Array<{ url: string }>;
  } | null;
};

type Message = {
  id: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  readAt?: string | null;
  senderId: string;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
  sender: {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
    role: string | null;
  };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function initials(name: string | null | undefined) {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

function formatTime(input: string | null | undefined) {
  if (!input) return '';
  const d = new Date(input);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000 && d.getDate() === now.getDate())
    return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) + ' WAT';
  if (diff < 604800000) return d.toLocaleDateString('en-NG', { weekday: 'short' });
  return d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
}

function formatDateSeparator(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (isToday) return 'Today, ' + d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
  if (isYesterday) return 'Yesterday, ' + d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
  return d.toLocaleDateString('en-NG', { weekday: 'long', month: 'short', day: 'numeric' });
}

function rolePill(role: string | null | undefined): { label: string; className: string } {
  switch ((role || '').toLowerCase()) {
    case 'landlord':
      return { label: 'Verified Landlord', className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' };
    case 'agent':
      return { label: 'Agent', className: 'bg-zinc-100 dark:bg-white/[0.08] text-zinc-700 dark:text-zinc-300' };
    case 'estate_manager':
      return { label: 'Estate Manager', className: 'bg-zinc-100 dark:bg-white/[0.08] text-zinc-700 dark:text-zinc-300' };
    case 'legal':
    case 'lawyer':
      return { label: 'Legal Counsel', className: 'bg-zinc-100 dark:bg-white/[0.08] text-zinc-700 dark:text-zinc-300' };
    case 'admin':
      return { label: 'Operations', className: 'bg-zinc-100 dark:bg-white/[0.08] text-zinc-700 dark:text-zinc-300' };
    default:
      return { label: role ? role.replace(/_/g, ' ') : 'Contact', className: 'bg-zinc-100 dark:bg-white/[0.08] text-zinc-700 dark:text-zinc-300' };
  }
}

function channelForConv(c: Conversation): 'landlord' | 'mep' | 'legal' {
  const r = (c.participant?.role || '').toLowerCase();
  if (['landlord', 'agent'].includes(r)) return 'landlord';
  if (['estate_manager', 'maintenance', 'facility', 'mep'].includes(r)) return 'mep';
  if (['legal', 'lawyer', 'admin', 'accountant', 'escrow'].includes(r)) return 'legal';
  // Fallback: infer from subject/propertyName
  const hay = `${c.subject || ''} ${c.propertyName || ''}`.toLowerCase();
  if (hay.includes('mep') || hay.includes('maintenance') || hay.includes('mnt-') || hay.includes('facility')) return 'mep';
  if (hay.includes('legal') || hay.includes('lea-') || hay.includes('deed') || hay.includes('escrow')) return 'legal';
  return 'landlord';
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MessagePage({ userId, userName, userRole }: { userId: string; userName: string; userRole: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | 'landlord' | 'mep' | 'legal'>('all');
  const [subTab, setSubTab] = useState<'all' | 'unread' | 'archived'>('all');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newContent, setNewContent] = useState('');
  const [pendingAttachment, setPendingAttachment] = useState<{ name: string; size: string } | null>(null);
  const [quickSnippet, setQuickSnippet] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversationsData, refetch: refetchConversations } = useConversations();
  const conversations: Conversation[] = useMemo(() => {
    const source = Array.isArray((conversationsData as any)?.data) ? (conversationsData as any).data : [];
    return source;
  }, [conversationsData]);

  const selectedConversation = conversations.find((c) => c.id === selectedId) || null;

  const { data: messagesData, refetch: refetchMessages } = useConversation(selectedId || '', !!selectedId);
  const messages: Message[] = useMemo(() => {
    const raw = (messagesData as any)?.data;
    const source = Array.isArray(raw) ? raw : [];
    return source;
  }, [messagesData]);

  const sendMessageMutation = useSendMessage(selectedId || '', { id: userId, fullName: userName, role: userRole });
  const markAsReadMutation = useMarkAsRead();
  const deleteConversationMutation = useDeleteConversation();
  const createConversationMutation = useCreateConversation();

  // Poll conversations
  useEffect(() => {
    const interval = setInterval(() => refetchConversations(), 15000);
    return () => clearInterval(interval);
  }, [refetchConversations]);

  // Mark read + scroll on select
  useEffect(() => {
    if (!selectedId) return;
    refetchMessages();
    markAsReadMutation.mutate(selectedId);
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Quick snippet -> append to composer
  useEffect(() => {
    if (!quickSnippet) return;
    setMsg((prev) => (prev ? prev + '\n' + quickSnippet : quickSnippet));
    setQuickSnippet('');
  }, [quickSnippet]);

  async function handleSend() {
    const trimmed = msg.trim();
    if (!trimmed || !selectedId) return;
    const prev = msg;
    setMsg('');
    setPendingAttachment(null);
    try {
      await sendMessageMutation.mutateAsync({ content: trimmed });
      refetchConversations();
      refetchMessages();
    } catch {
      setMsg(prev);
      toast({ title: 'Failed to send', variant: 'destructive' });
    }
  }

  async function handleCreateConversation() {
    if (!newSubject.trim() || !newContent.trim()) {
      toast({ title: 'Subject and message required', variant: 'destructive' });
      return;
    }
    try {
      const res: any = await createConversationMutation.mutateAsync({
        subject: newSubject.trim(),
        content: newContent.trim(),
      } as any);
      const newId = res?.id || res?.data?.id;
      toast({ title: 'Conversation created' });
      setShowNewConversation(false);
      setNewSubject('');
      setNewContent('');
      refetchConversations();
      if (newId) setSelectedId(newId);
    } catch (e: any) {
      toast({ title: e?.message || 'Failed to create conversation', variant: 'destructive' });
    }
  }

  // ── Filtering ────────────────────────────────────────────────────────────
  const filteredConversations = useMemo(() => {
    let out = conversations;
    // Channel filter
    if (channelFilter !== 'all') out = out.filter((c) => channelForConv(c) === channelFilter);
    // Sub-tab
    if (subTab === 'unread') out = out.filter((c) => (c.unreadCount || 0) > 0);
    if (subTab === 'archived') out = out.filter((c) => c.status === 'archived');
    else out = out.filter((c) => c.status !== 'archived' || subTab === 'archived');
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      out = out.filter((c) => {
        const name = c.participant?.fullName?.toLowerCase() || '';
        const subj = c.subject?.toLowerCase() || '';
        const preview = c.lastMessage?.toLowerCase() || '';
        return name.includes(q) || subj.includes(q) || preview.includes(q);
      });
    }
    return out;
  }, [conversations, searchQuery, channelFilter, subTab]);

  const counts = useMemo(() => {
    const all = conversations.filter((c) => c.status !== 'archived').length;
    const landlord = conversations.filter((c) => channelForConv(c) === 'landlord' && c.status !== 'archived').length;
    const mep = conversations.filter((c) => channelForConv(c) === 'mep' && c.status !== 'archived').length;
    const legal = conversations.filter((c) => channelForConv(c) === 'legal' && c.status !== 'archived').length;
    const unread = conversations.filter((c) => (c.unreadCount || 0) > 0 && c.status !== 'archived').length;
    return { all, landlord, mep, legal, unread };
  }, [conversations]);

  // Group messages by date for separators
  const groupedMessages = useMemo(() => {
    const groups: Array<{ date: string; messages: Message[] }> = [];
    let currentDate = '';
    let currentGroup: Message[] = [];
    for (const m of messages) {
      const d = new Date(m.createdAt).toDateString();
      if (d !== currentDate) {
        if (currentGroup.length) groups.push({ date: currentDate, messages: currentGroup });
        currentDate = d;
        currentGroup = [m];
      } else {
        currentGroup.push(m);
      }
    }
    if (currentGroup.length) groups.push({ date: currentDate, messages: currentGroup });
    return groups;
  }, [messages]);

  return (
    <div className="flex flex-col w-full gap-4">
      {/* Breadcrumb + trust pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer uppercase tracking-wider text-[11px] font-semibold">Dashboard</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer uppercase tracking-wider text-[11px] font-semibold">Communications</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-zinc-900 dark:text-white font-semibold uppercase tracking-wider text-[11px]">Messages</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-white/[0.08] px-2.5 py-1 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
            <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            NDPR &amp; LASRERA Encrypted Channel
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            <BadgeCheck className="h-3.5 w-3.5" />
            Verified Corporate Tenancy
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Messages &amp; Communications</h1>
          <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">Direct, audited messaging with property managers, landlords, and estate compliance legal officers.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="h-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/[0.08]" onClick={() => toast({ title: 'Audit export coming soon', description: 'NDPR-compliant export will be available shortly.' })}>
            <FileDown className="mr-1.5 h-4 w-4" />
            Audit Export
          </Button>
          <Button variant="outline" size="sm" className="h-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/[0.08]" asChild>
            <a href="tel:+234180076837">
              <Phone className="mr-1.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              24/7 Concierge Desk
            </a>
          </Button>
        </div>
      </div>

      {/* Channel Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {[
          { id: 'all' as const, label: 'All Channels', count: counts.all },
          { id: 'landlord' as const, label: 'Landlords & Lessors', count: counts.landlord },
          { id: 'mep' as const, label: 'Facility & MEP', count: counts.mep },
          { id: 'legal' as const, label: 'Legal & Escrow', count: counts.legal },
        ].map((pill) => {
          const active = channelFilter === pill.id;
          return (
            <button
              key={pill.id}
              onClick={() => setChannelFilter(pill.id)}
              className={cn(
                'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
                active
                  ? 'bg-emerald-600 text-white shadow-sm dark:bg-emerald-600'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08]'
              )}
            >
              <span>{pill.label}</span>
              <span className={cn('rounded-full px-1.5 py-0.5 text-[11px] font-bold', active ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-white/[0.08] text-zinc-700 dark:text-zinc-300')}>
                {pill.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Chat Hub — 780px Stitch container, bichrome */}
      <div className="flex w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 shadow-sm" style={{ height: '780px', minHeight: '640px' }}>
        {/* LEFT: Conversation List */}
        <div className="flex w-[360px] min-w-[320px] lg:w-[390px] shrink-0 flex-col bg-zinc-50/60 dark:bg-white/[0.03] border-r border-zinc-200 dark:border-white/[0.08]">
          {/* List Top Bar & Search */}
          <div className="flex flex-col gap-3 bg-white dark:bg-zinc-900 p-4">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations, tickets..."
                className="h-10 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-white/[0.08] pl-9 pr-14 text-sm"
              />
              <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded bg-zinc-200 dark:bg-white/[0.08] px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-600 dark:text-zinc-400">⌘K</kbd>
            </div>
            {/* Filter Sub-Tabs */}
            <div className="flex items-center gap-1 rounded-lg bg-zinc-100 dark:bg-white/[0.06] p-0.5">
              <button
                onClick={() => setSubTab('all')}
                className={cn('flex-1 rounded-md py-1.5 text-center text-sm font-semibold transition-colors', subTab === 'all' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white')}
              >
                All
              </button>
              <button
                onClick={() => setSubTab('unread')}
                className={cn('flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-center text-sm transition-colors', subTab === 'unread' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm font-semibold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white')}
              >
                <span>Unread</span>
                {counts.unread > 0 && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">{counts.unread}</span>}
              </button>
              <button
                onClick={() => setSubTab('archived')}
                className={cn('flex-1 rounded-md py-1.5 text-center text-sm transition-colors', subTab === 'archived' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm font-semibold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white')}
              >
                Archived
              </button>
            </div>
          </div>

          {/* Conversations Scroll List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const active = selectedId === conv.id;
                const pill = rolePill(conv.participant?.role);
                const ch = channelForConv(conv);
                // Icon/avatar variant per Stitch: landlord photo, MEP photo, TA initials, corporate_fare, account_balance
                const avatarVariant = (() => {
                  if (conv.participant?.avatarUrl) return 'photo' as const;
                  if (ch === 'mep') return 'mep' as const;
                  if (ch === 'legal') return 'legal' as const;
                  if (!conv.participant?.fullName || conv.subject?.toLowerCase().includes('concierge') || conv.subject?.toLowerCase().includes('desk')) return 'ops' as const;
                  if (conv.subject?.toLowerCase().includes('billing') || conv.subject?.toLowerCase().includes('paystack')) return 'billing' as const;
                  return 'initials' as const;
                })();

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={cn(
                      'relative flex w-full items-start gap-3 p-4 text-left transition-colors',
                      active ? 'bg-white dark:bg-zinc-800' : 'hover:bg-white/60 dark:hover:bg-white/[0.04]'
                    )}
                  >
                    {active && <span className="absolute bottom-0 left-0 top-0 w-1 bg-emerald-500" />}
                    <span className="relative shrink-0">
                      {conv.participant?.avatarUrl ? (
                        <img src={conv.participant.avatarUrl} alt={conv.participant.fullName || ''} className="h-12 w-12 rounded-full object-cover shadow-sm" />
                      ) : avatarVariant === 'legal' ? (
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-sm font-bold text-zinc-700 dark:text-zinc-300">{initials(conv.participant?.fullName || conv.subject)}</span>
                      ) : avatarVariant === 'ops' ? (
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"><Building2 className="h-6 w-6" /></span>
                      ) : avatarVariant === 'billing' ? (
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"><Landmark className="h-6 w-6" /></span>
                      ) : (
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-sm font-bold text-zinc-700 dark:text-zinc-300">{initials(conv.participant?.fullName || conv.subject)}</span>
                      )}
                      {active && <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-zinc-900 bg-emerald-500" />}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-center justify-between gap-1">
                        <span className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{conv.participant?.fullName || conv.subject || 'New Conversation'}</span>
                        <span className={cn('shrink-0 text-[11px] font-semibold', active ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500')}>{formatTime(conv.lastMessageAt)}</span>
                      </span>
                      <span className="mt-0.5 flex items-center gap-1">
                        <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase', pill.className)}>{pill.label}</span>
                        {conv.propertyName && <span className="truncate text-[11px] text-zinc-500">• {conv.propertyName}</span>}
                        {!conv.propertyName && conv.listing?.title && <span className="truncate text-[11px] text-zinc-500">• {conv.listing.title}</span>}
                      </span>
                      <span className={cn('mt-1 line-clamp-1 text-xs', active ? 'font-medium text-zinc-900 dark:text-white' : 'text-zinc-500')}>{conv.lastMessage || conv.subject || 'No messages yet'}</span>
                    </span>
                    <span className="shrink-0 pt-1">
                      {(conv.unreadCount || 0) > 0 ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">{conv.unreadCount}</span>
                      ) : (
                        <span className="text-zinc-400"><CheckCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /></span>
                      )}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <p className="text-sm text-zinc-500">{subTab === 'unread' ? 'No unread conversations.' : subTab === 'archived' ? 'No archived conversations.' : searchQuery ? 'No matching conversations.' : 'No conversations yet.'}</p>
                {!searchQuery && subTab === 'all' && <p className="mt-1 text-xs text-zinc-400">Start a new conversation below.</p>}
              </div>
            )}
          </div>

          {/* Left Column Footer */}
          <div className="flex flex-col gap-2 bg-white dark:bg-zinc-900 p-4">
            <Button onClick={() => setShowNewConversation(true)} className="h-10 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm">
              <SquarePen className="mr-2 h-4 w-4" />
              New Conversation
            </Button>
            <span className="flex items-center justify-center gap-1 text-[11px] font-medium text-zinc-500">
              <Lock className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              End-to-End Encrypted via NDPA 2023 Protocol
            </span>
          </div>
        </div>

        {/* RIGHT: Active Chat Window */}
        <div className="flex flex-1 flex-col bg-white dark:bg-zinc-900">
          {selectedConversation ? (
            <>
              {/* Active Chat Header */}
              <div className="flex items-center justify-between gap-3 bg-white dark:bg-zinc-900 px-4 py-3 shadow-sm border-b border-zinc-200 dark:border-white/[0.08]">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="relative shrink-0">
                    {selectedConversation.participant?.avatarUrl ? (
                      <img src={selectedConversation.participant.avatarUrl} alt={selectedConversation.participant.fullName || ''} className="h-11 w-11 rounded-full object-cover shadow-sm" />
                    ) : (
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-sm font-bold text-zinc-700 dark:text-zinc-300">{initials(selectedConversation.participant?.fullName || selectedConversation.subject)}</span>
                    )}
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-900 bg-emerald-500" />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-bold text-zinc-900 dark:text-white">{selectedConversation.participant?.fullName || selectedConversation.subject || 'New Conversation'}</span>
                      <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Lessor</span>
                    </span>
                    <span className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
                      <span className="truncate">{selectedConversation.participant?.role ? selectedConversation.participant.role.replace(/_/g, ' ') : ''}{selectedConversation.propertyName ? ` • ${selectedConversation.propertyName}` : selectedConversation.listing?.title ? ` • ${selectedConversation.listing.title}` : ''}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Active Now</span>
                    </span>
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <Button variant="outline" size="sm" className="hidden h-9 sm:inline-flex bg-zinc-50 dark:bg-white/[0.06] border-zinc-200 dark:border-white/[0.08]" asChild>
                    <Link href="/dashboard/tenant/agreements"><FileText className="mr-1.5 h-4 w-4 text-zinc-500" />Lease Agreement</Link>
                  </Button>
                  {selectedConversation.listingId && (
                    <Button variant="outline" size="sm" className="hidden h-9 md:inline-flex bg-zinc-50 dark:bg-white/[0.06] border-zinc-200 dark:border-white/[0.08]" asChild>
                      <Link href={`/listings/${selectedConversation.listingId}`}><Building className="mr-1.5 h-4 w-4 text-zinc-500" />Property Dossier</Link>
                    </Button>
                  )}
                  <Button variant="outline" size="icon" className="h-9 w-9 bg-zinc-50 dark:bg-white/[0.06] border-zinc-200 dark:border-white/[0.08]" asChild>
                    <a href="tel:+2348039201923"><Phone className="h-4 w-4" /></a>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => toast({ title: 'More options', description: 'Archive, block, and delete are available in the conversation menu.' })}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </span>
              </div>

              {/* Messages Scrollable History */}
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-white dark:bg-zinc-900 p-4 lg:p-6">
                {groupedMessages.length > 0 ? (
                  groupedMessages.map((group) => (
                    <div key={group.date} className="flex flex-col gap-4">
                      <span className="flex justify-center">
                        <span className="rounded-full bg-zinc-100 dark:bg-white/[0.08] px-4 py-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">{formatDateSeparator(group.messages[0].createdAt)}</span>
                      </span>
                      {group.messages.map((m) => {
                        const isOwn = m.senderId === userId;
                        const isAttachment = !!m.attachmentUrl;
                        // Attachment card (Stitch: secondary-container/20)
                        if (isAttachment && isOwn) {
                          return (
                            <div key={m.id} className="flex max-w-md flex-col gap-1 self-end">
                              <div className="flex items-center justify-between gap-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 p-3">
                                <span className="flex min-w-0 items-center gap-3">
                                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500 text-white"><FileText className="h-5 w-5" /></span>
                                  <span className="flex min-w-0 flex-col">
                                    <span className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{m.attachmentUrl?.split('/').pop() || 'Attachment'}</span>
                                    <span className="text-xs text-zinc-600 dark:text-zinc-400">{m.attachmentType || 'Document'} • Signed</span>
                                  </span>
                                </span>
                                <a href={m.attachmentUrl || '#'} target="_blank" rel="noopener noreferrer" className="shrink-0 p-2 text-emerald-600 dark:text-emerald-400 hover:text-zinc-900 dark:hover:text-white"><Download className="h-5 w-5" /></a>
                              </div>
                              {m.content && <span className="self-end rounded-2xl rounded-tr-sm bg-emerald-600 px-4 py-3 text-sm leading-relaxed text-white shadow-sm">{m.content}</span>}
                              <span className="self-end pr-1 text-[11px] text-zinc-500">{formatTime(m.createdAt)} • <span className="inline-flex items-center gap-0.5 font-medium text-emerald-600 dark:text-emerald-400"><CheckCheck className="h-3 w-3" /> Read</span></span>
                            </div>
                          );
                        }
                        if (isOwn) {
                          return (
                            <div key={m.id} className="flex max-w-2xl flex-col items-end gap-1 self-end">
                              <span className="rounded-2xl rounded-tr-sm bg-emerald-600 px-4 py-3 text-sm leading-relaxed text-white shadow-sm">{m.content}</span>
                              <span className="flex items-center gap-1 pr-1 text-[11px] text-zinc-500">{formatTime(m.createdAt)} • <span className="inline-flex items-center gap-0.5 font-medium text-emerald-600 dark:text-emerald-400"><CheckCheck className="h-3 w-3" /> Read</span></span>
                            </div>
                          );
                        }
                        return (
                          <div key={m.id} className="flex max-w-2xl items-start gap-2">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 mt-1">{initials(m.sender?.fullName)}</span>
                            <span className="flex flex-col gap-1">
                              <span className="flex items-center gap-2"><span className="text-sm font-semibold text-zinc-900 dark:text-white">{m.sender?.fullName || 'Participant'}</span><span className="text-[11px] text-zinc-500">{formatTime(m.createdAt)}</span></span>
                              <span className="rounded-2xl rounded-tl-sm bg-zinc-100 dark:bg-zinc-800 px-4 py-3 text-sm leading-relaxed text-zinc-900 dark:text-white">{m.content}</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-white/[0.06] text-zinc-400 mb-3"><FileText className="h-8 w-8" /></span>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">No messages yet</p>
                    <p className="mt-1 max-w-sm text-sm text-zinc-500">Start the conversation below. Messages are auditable and encrypted per NDPA 2023.</p>
                  </div>
                )}
                {/* Typing indicator (live when mutation pending) */}
                {sendMessageMutation.isPending && (
                  <span className="flex items-center gap-2 pl-10 text-xs text-zinc-500">
                    <span className="flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-white/[0.08] px-3 py-1.5">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:0.4s]" />
                    </span>
                    Sending…
                  </span>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Composer */}
              <div className="flex flex-col gap-2 bg-zinc-50/70 dark:bg-white/[0.03] p-4 border-t border-zinc-200 dark:border-white/[0.08]">
                {pendingAttachment && (
                  <span className="flex items-center justify-between rounded-lg bg-white dark:bg-zinc-800 px-3 py-1.5 text-sm border border-zinc-200 dark:border-white/[0.08]">
                    <span className="flex items-center gap-2 truncate"><ImageIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /><span className="truncate font-medium text-zinc-900 dark:text-white">Attachment ready: {pendingAttachment.name} ({pendingAttachment.size})</span></span>
                    <button type="button" onClick={() => setPendingAttachment(null)} className="p-1 text-zinc-500 hover:text-red-600"><X className="h-4 w-4" /></button>
                  </span>
                )}
                <span className="flex flex-col gap-2 rounded-xl bg-white dark:bg-zinc-900 p-2 shadow-sm border border-zinc-200 dark:border-white/[0.08]">
                  <textarea
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    rows={2}
                    placeholder={`Type your message to ${selectedConversation.participant?.fullName || 'participant'}... (Shift+Enter for newline)`}
                    className="w-full resize-none bg-transparent px-2 py-1 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none"
                  />
                  <span className="flex items-center justify-between gap-2 pt-1">
                    <span className="flex items-center gap-1 text-zinc-500">
                      <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setPendingAttachment({ name: f.name, size: `${(f.size / 1024).toFixed(1)} KB` });
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }} />
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-white/[0.06] hover:text-zinc-900 dark:hover:text-white" title="Attach Files"><Paperclip className="h-5 w-5" /></button>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-white/[0.06] hover:text-zinc-900 dark:hover:text-white" title="Attach Media"><ImageIcon className="h-5 w-5" /></button>
                      <button type="button" onClick={() => toast({ title: 'Link a formal record', description: 'Paste a listing, agreement, or invoice link to attach it as a formal record.' })} className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-white/[0.06] hover:text-zinc-900 dark:hover:text-white" title="Link Formal Record"><Link2 className="h-5 w-5" /></button>
                      <span className="hidden sm:flex items-center pl-2">
                        <select value={quickSnippet} onChange={(e) => setQuickSnippet(e.target.value)} className="h-8 rounded-lg bg-zinc-100 dark:bg-white/[0.08] px-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none">
                          <option value="">Quick Snippets…</option>
                          <option value="Payment remittance confirmation — kindly confirm receipt of the transfer.">Payment remittance confirmation</option>
                          <option value="Requesting gate pass & access authorization for the scheduled visit.">Gate pass &amp; access authorization</option>
                          <option value="Facility maintenance sign-off — work completed satisfactorily.">Facility maintenance sign-off</option>
                        </select>
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="hidden text-[11px] text-zinc-500 md:inline">Enter ↵ to send</span>
                      <Button onClick={handleSend} disabled={!msg.trim() || sendMessageMutation.isPending} className="h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm">
                        <span>Send</span>
                        <Send className="ml-1.5 h-4 w-4" />
                      </Button>
                    </span>
                  </span>
                </span>
                <p className="text-center text-[11px] text-zinc-500">Messages sent through PropatiBox are auditable records under the Lagos State Tenancy Law 2011 and NDPA 2023.</p>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-white/[0.06] text-zinc-400 mb-3"><FileText className="h-8 w-8" /></span>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">No Active Conversation Selected</h2>
              <p className="mt-1 max-w-sm text-sm text-zinc-500">Select a conversation from the list on the left to review dialogues, or start a new one.</p>
              <Button onClick={() => setShowNewConversation(true)} className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white"><SquarePen className="mr-2 h-4 w-4" />New Conversation</Button>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal (Stitch: same density as hub) */}
      {showNewConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowNewConversation(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-xl border border-zinc-200 dark:border-white/[0.08]">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">New Conversation</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Start an audited channel with your landlord, facility, or legal desk. Messages are NDPR-encrypted and retained per Lagos Tenancy Law.</p>
            <div className="mt-4 flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Subject</span>
                <Input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="e.g. FIRS e-TCC for PH-02 extension" className="bg-zinc-50 dark:bg-zinc-800" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Message</span>
                <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} rows={4} placeholder="Type your message…" className="w-full rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewConversation(false)}>Cancel</Button>
              <Button onClick={handleCreateConversation} disabled={createConversationMutation.isPending} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                {createConversationMutation.isPending ? 'Creating…' : 'Create & Send'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
