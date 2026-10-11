'use client';

import { useEffect, useState, useMemo } from 'react';
import { SearchInput } from '@/components/ui/search-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Send, MessageSquare, Plus, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useConversations,
  useConversation,
  useSendMessage,
  useMarkAsRead,
  useDeleteMessage,
  useDeleteConversation,
} from '@/hooks/useMessages';

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
  senderId: string;
  sender: {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
    role: string | null;
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

type Tab = 'messages' | 'unread' | 'tenants' | 'applicants' | 'archived';

export default function MessagePage({ userId, userName, userRole }: { userId: string; userName: string; userRole: string }) {
  const [activeTab, setActiveTab] = useState<Tab>('messages');
  const [activePill, setActivePill] = useState<'viewAll' | 'inquiries' | 'tours' | 'applicants' | 'tenants'>('viewAll');
  const [filterOpen, setFilterOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [inboxValue, setInboxValue] = useState<'inbox' | 'archived'>('inbox');
  const [propertySearch, setPropertySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'notReplied'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [creatingConversation, setCreatingConversation] = useState(false);

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
  }, [messagesData, selectedId]);

  const sendMessageMutation = useSendMessage(selectedId || '', { id: userId, fullName: userName, role: userRole });
  const markAsReadMutation = useMarkAsRead();
  const deleteMessageMutation = useDeleteMessage();
  const deleteConversationMutation = useDeleteConversation();

  const [senderProfile, setSenderProfile] = useState<{ id: string; fullName: string; role: string | null; avatarUrl: string | null } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteConversationId, setDeleteConversationId] = useState<string | null>(null);


  // Live conversation list refresh
  useEffect(() => {
    const interval = setInterval(() => {
      refetchConversations();
    }, 15000);
    return () => clearInterval(interval);
  }, [refetchConversations]);

  // Refresh messages when selected conversation changes
  useEffect(() => {
    if (!selectedId) return;
    refetchMessages();
    markAsReadMutation.mutate(selectedId);
  }, [selectedId]);


  async function handleSend() {
    const trimmed = msg.trim();
    if (!trimmed || !selectedId) return;
    const prev = msg;
    setMsg('');
    try {
      await sendMessageMutation.mutateAsync({ content: trimmed });
      refetchConversations();
    } catch {
      setMsg(prev);
    }
  }

  async function handleCreateConversation() {
    const email = newParticipantEmail.trim();
    if (!email) return;
    setCreatingConversation(true);
    try {
      const participants = [
        { userId: userId, role: userRole },
        { userId: email, role: 'tenant' },
      ];
      const subject = newSubject.trim() || 'New Conversation';
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participants, subject }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to start conversation');
      const conversation = json.data;
      setSelectedId(conversation.id);
      setShowNewConversation(false);
      setNewParticipantEmail('');
      setNewSubject('');
      refetchConversations();
    } catch {
      // silent
    } finally {
      setCreatingConversation(false);
    }
  }

  async function handleAcceptInvite(inviteId: string) {
    try {
      const res = await fetch(`/api/agent-invites/${inviteId}/accept`, { method: 'POST' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = (json as any)?.error || 'Failed to accept invite';
        throw new Error(detail);
      }
      setInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
      loadInvites();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to accept invite';
      console.error('Failed to accept invite:', error);
      alert(message);
    }
  }

  async function handleRemoveInvite(memberId: string, orgId: string) {
    try {
      const res = await fetch(`/api/orgs/${orgId}/members/${memberId}`, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as any)?.error || 'Failed to remove invite');
      setInvites((prev) => prev.filter((inv) => inv.id !== memberId));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove invite';
      console.error('Failed to remove invite:', error);
      alert(message);
    }
  }

  async function handleInviteMessage(inv: Invite) {
    setActiveTab('messages');
    setMessagingLoading(true);
    try {
      const subject = inv.listing?.title ? `Inquiry about ${inv.listing.title}` : 'New Conversation';
      const participants = [
        { userId, role: userRole },
        ...(inv.sender?.email ? [{ userId: inv.sender.email, role: 'landlord' }] : []),
      ];

      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participants,
          subject,
          listingId: inv.listingId || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to start conversation');
      const conversation = json.data;
      setSelectedId(conversation.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start conversation';
      console.error('handleInviteMessage error:', error);
      alert(message);
    } finally {
      setMessagingLoading(false);
    }
  }

  function formatTime(input: string | null | undefined) {
    if (!input) return '';
    const d = new Date(input);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000 && d.getDate() === now.getDate())
      return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return d.toLocaleDateString('en-NG', { weekday: 'short' });
    return d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
  }

  const filteredConversations = useMemo(() => {
    let out = conversations;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
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
    if (statusFilter === 'unread') out = out.filter((c) => (c.unreadCount || 0) > 0);
    if (statusFilter === 'notReplied') out = out.filter((c) => !c.lastMessage || c.lastMessage.trim() === '');
    if (inboxValue === 'archived') out = out.filter((c) => c.status === 'archived');
    else out = out.filter((c) => c.status !== 'archived');
    if (activePill === 'inquiries') out = out.filter((c) => (c.subject || '').toLowerCase().includes('inquir'));
    if (activePill === 'tours') out = out.filter((c) => (c.subject || '').toLowerCase().includes('tour'));
    if (activePill === 'applicants') out = out.filter((c) => (c.subject || '').toLowerCase().includes('applic'));
    if (activePill === 'tenants') out = out.filter((c) => (c.participant?.role || '').toLowerCase().includes('tenant'));
    // activeTab legacy mapping for backwards compat if still used elsewhere
    if (activeTab === 'unread') out = out.filter((c) => (c.unreadCount || 0) > 0);
    if (activeTab === 'tenants') out = out.filter((c) => (c.participant?.role || '').toLowerCase().includes('tenant'));
    if (activeTab === 'applicants') out = out.filter((c) => (c.subject || '').toLowerCase().includes('applic'));
    if (activeTab === 'archived') out = out.filter((c) => c.status === 'archived');
    return out;
  }, [conversations, searchQuery, propertySearch, statusFilter, inboxValue, activePill, activeTab]);

  const showConversations = true;

  const pillTabs = [
    { id: 'viewAll' as const, label: 'View All' },
    { id: 'inquiries' as const, label: 'Inquiries' },
    { id: 'tours' as const, label: 'Tours' },
    { id: 'applicants' as const, label: 'Applicants' },
    { id: 'tenants' as const, label: 'Tenants' },
  ];

  return (
    <div className="w-full space-y-4 p-4 md:p-6">
      {/* Exact clone - full width bold header */}
      <div className="flex items-center justify-between gap-4 w-full">
        <h1 className="text-[34px] font-black tracking-tight text-zinc-900 dark:text-white leading-none">Messages</h1>
        <div className="flex items-center gap-3 relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg border-[1.5px] font-bold text-sm transition-colors',
              filterOpen ? 'border-blue-700 bg-blue-50 text-blue-700' : 'border-blue-700 bg-white text-blue-700 hover:bg-blue-50'
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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" className="absolute right-3 top-1/2 -translate-y-1/2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M16 16l4 4" />
                  </svg>
                </div>
                <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-sm text-zinc-900">Status</span>
                    <button onClick={() => setStatusFilter('all')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Clear</button>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="status" checked={statusFilter === 'unread'} onChange={() => setStatusFilter('unread')} className="w-5 h-5 accent-blue-700" />
                      <span className="text-sm text-zinc-900">Show unread only</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="status" checked={statusFilter === 'notReplied'} onChange={() => setStatusFilter('notReplied')} className="w-5 h-5 accent-blue-700" />
                      <span className="text-sm text-zinc-900">Not replied to</span>
                    </label>
                  </div>
                </div>
                <button onClick={() => setFilterOpen(false)} className="text-sm font-bold text-blue-700 hover:underline pt-2">Close</button>
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
                <button onClick={() => { setInboxValue('inbox'); setInboxOpen(false); }} className={cn('w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-50', inboxValue === 'inbox' ? 'font-bold text-blue-700 bg-blue-50' : 'text-zinc-700')}>Inbox</button>
                <button onClick={() => { setInboxValue('archived'); setInboxOpen(false); }} className={cn('w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-50', inboxValue === 'archived' ? 'font-bold text-blue-700 bg-blue-50' : 'text-zinc-700')}>Archived</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pills - full width, exact clone */}
      <div className="flex items-center gap-2 flex-wrap w-full">
        {pillTabs.map((pill) => (
          <button
            key={pill.id}
            onClick={() => setActivePill(pill.id)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors',
              activePill === pill.id ? 'bg-blue-50 border-blue-700 text-blue-700' : 'bg-white border-zinc-300 text-zinc-900 hover:bg-zinc-50'
            )}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Full-width card - bichrome, covers width */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm w-full">
        <div className="flex min-h-[520px] flex-col lg:flex-row">
          {/* Left: conversation list - exact clone */}
          <div className="w-full lg:w-[320px] shrink-0 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search by name, property"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 pl-4 bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 rounded-xl"
                />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" className="absolute right-3 top-1/2 -translate-y-1/2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M16 16l4 4" />
                </svg>
              </div>
            </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              <div>
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={cn(
                      'w-full text-left px-4 py-3.5 transition-colors border-b border-zinc-200 dark:border-zinc-800 group',
                      selectedId === conv.id ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 bg-white dark:bg-zinc-900'
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {(conv.participant?.fullName || conv.subject || 'New Conversation').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-zinc-900 dark:text-white text-sm font-medium truncate">
                              {conv.participant?.fullName || conv.subject || 'New Conversation'}
                            </span>
                            {conv.participant?.role && (
                              <span className={cn(
                                'text-[9px] px-1.5 py-0.5 rounded-full font-medium',
                                conv.participant.role === 'tenant' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                conv.participant.role === 'agent' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                conv.participant.role === 'landlord' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                              )}>
                                {conv.participant.role.charAt(0).toUpperCase() + conv.participant.role.slice(1)}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-500">
                            {formatTime(conv.lastMessageAt)}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-500 truncate mt-0.5">
                          {conv.lastMessage || conv.subject || 'No messages yet'}
                        </div>
                        {conv.propertyName && (
                          <div className="text-[9px] text-zinc-500 dark:text-zinc-500 truncate mt-0.5">
                            {conv.propertyName}
                          </div>
                        )}
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConversationId(conv.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full p-1 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-zinc-500 hover:text-red-400" />
                      </button>
                    </div>
                  </button>
                ))}
              {filteredConversations.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-10 h-10 flex items-center justify-center mb-4 text-zinc-400">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <rect x="3" y="6" width="18" height="12" rx="2" />
                      <path d="M3 7l9 6 9-6" />
                    </svg>
                  </div>
                  <p className="text-sm text-zinc-900 dark:text-zinc-300 leading-relaxed max-w-[200px]">To get older conversations, try selecting a single property.</p>
                </div>
              )}
              </div>
            )}
          </div>

        {/* Message thread - bichrome */}
        <div className="flex-1 min-w-0 flex flex-col bg-zinc-50 dark:bg-zinc-950/50">
          {selectedConversation ? (
            <>
              <div className="px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {(selectedConversation.participant?.fullName || selectedConversation.subject || '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-900 dark:text-white font-medium text-sm">
                      {selectedConversation.participant?.fullName || selectedConversation.subject || 'Conversation'}
                    </span>
                    {selectedConversation.participant?.role && (
                      <span className={cn(
                        'text-[9px] px-1.5 py-0.5 rounded-full font-medium',
                        selectedConversation.participant.role === 'tenant' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        selectedConversation.participant.role === 'agent' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        selectedConversation.participant.role === 'landlord' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                      )}>
                        {selectedConversation.participant.role.charAt(0).toUpperCase() + selectedConversation.participant.role.slice(1)}
                      </span>
                    )}
                  </div>
                  {selectedConversation.propertyName && (
                    <div className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
                      {selectedConversation.propertyName}
                    </div>
                  )}
                  {!selectedConversation.propertyName && selectedConversation.participant?.role && (
                    <div className="text-zinc-600 text-xs capitalize">
                      {selectedConversation.participant.role}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {messages.map((m) => {
                  const isOwn = m.senderId === userId;
                  return (
                    <div key={m.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
                      <div className="flex items-end gap-2 max-w-xs lg:max-w-md">
                        {!isOwn && m.sender && (
                          <button
                            type="button"
                            onClick={() => setSenderProfile({ id: m.sender!.id, fullName: m.sender!.fullName || 'User', role: m.sender!.role, avatarUrl: m.sender!.avatarUrl })}
                            className="h-8 w-8 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-xs font-semibold flex-shrink-0 hover:bg-zinc-700"
                          >
                            {(m.sender.fullName || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </button>
                        )}
                        <div className="relative">
                          <div
                            className={cn(
                              'max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm',
                              isOwn
                                ? 'bg-emerald-500 text-white rounded-br-sm'
                                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 rounded-bl-sm'
                            )}
                          >
                            {m.content}
                            <div
                              className={cn(
                                'text-[10px] mt-1',
                                isOwn ? 'text-emerald-200' : 'text-zinc-600'
                              )}
                            >
                              {formatTime(m.createdAt)}
                            </div>
                          </div>
                          {isOwn && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(m.id)}
                              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-neutral-900 border border-neutral-700 p-1 hover:bg-red-500 hover:border-red-500"
                            >
                              <Trash2 className="h-3 w-3 text-neutral-300 hover:text-white" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {messages.length === 0 && (
                  <div className="text-center text-xs text-zinc-500 dark:text-zinc-500 py-8">No messages yet</div>
                )}
              </div>
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Type a message…"
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    className="flex-1 bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSend();
                    }}
                  />
                  <Button onClick={handleSend} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    <Send className="size-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-500 dark:text-zinc-400 text-sm p-4 text-center bg-zinc-50 dark:bg-zinc-950/50">
              <div className="text-center">
                <p className="mb-4">No conversation selected</p>
                <Button
                  onClick={() => setShowNewConversation(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start a new conversation
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* New Conversation Modal */}
      {showNewConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-lg border border-neutral-800 bg-black p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white">New Conversation</h2>
              <button onClick={() => setShowNewConversation(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Participant email</label>
                <Input
                  placeholder="user@example.com"
                  value={newParticipantEmail}
                  onChange={(e) => setNewParticipantEmail(e.target.value)}
                  className="bg-black border-neutral-800 text-white placeholder:text-zinc-600"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Subject</label>
                <Input
                  placeholder="Conversation subject"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="bg-black border-neutral-800 text-white placeholder:text-zinc-600"
                />
              </div>
              <Button
                onClick={handleCreateConversation}
                disabled={creatingConversation}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                {creatingConversation ? 'Starting...' : 'Start Conversation'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sender Profile Popup */}
      <Dialog open={!!senderProfile} onOpenChange={(open) => !open && setSenderProfile(null)}>
        <DialogContent className="sm:max-w-sm border-neutral-800 bg-black">
          <DialogHeader>
            <DialogTitle className="text-white">Profile</DialogTitle>
          </DialogHeader>
          {senderProfile && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-sm font-semibold">
                  {(senderProfile.fullName || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{senderProfile.fullName}</p>
                  <p className="text-zinc-500 text-xs capitalize">{senderProfile.role || 'User'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm border-neutral-800 bg-black">
          <DialogHeader>
            <DialogTitle className="text-white">Delete message?</DialogTitle>
          </DialogHeader>
          <p className="text-zinc-400 text-sm">This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)} className="text-white">Cancel</Button>
            <Button
              onClick={() => {
                if (!selectedId || !deleteTarget) return;
                deleteMessageMutation.mutate({ conversationId: selectedId, messageId: deleteTarget });
                setDeleteTarget(null);
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Conversation Confirmation */}
      <Dialog open={!!deleteConversationId} onOpenChange={(open) => !open && setDeleteConversationId(null)}>
        <DialogContent className="sm:max-w-sm border-neutral-800 bg-black">
          <DialogHeader>
            <DialogTitle className="text-white">Delete conversation?</DialogTitle>
          </DialogHeader>
          <p className="text-zinc-400 text-sm">This will remove the conversation and its messages permanently.</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteConversationId(null)} className="text-white">Cancel</Button>
            <Button
              onClick={() => {
                if (!deleteConversationId) return;
                deleteConversationMutation.mutate(deleteConversationId);
                if (selectedId === deleteConversationId) setSelectedId(null);
                setDeleteConversationId(null);
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
