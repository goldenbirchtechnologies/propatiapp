'use client';

import { useEffect, useState } from 'react';
import { SearchInput } from '@/components/ui/search-input';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Mail, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  participant: {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
    role: string | null;
  } | null;
  listing?: {
    id?: string;
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

type Tab = 'messages' | 'invites';

export default function MessagePage({ userId, userName, userRole }: { userId: string; userName: string; userRole: string }) {
  const [activeTab, setActiveTab] = useState<Tab>('messages');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [messagingLoading, setMessagingLoading] = useState(false);

  const selectedConversation = conversations.find((c) => c.id === selectedId) || null;

  async function loadConversations() {
    setLoading(true);
    try {
      const res = await fetch('/api/conversations');
      const json = await res.json();
      if (res.ok) setConversations(Array.isArray(json.data) ? json.data : []);
    } catch {
      // keep previous state
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(conversationId: string) {
    setLoading(true);
    setMessages([]);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      const json = await res.json();
      if (res.ok) setMessages(Array.isArray(json.data) ? json.data : []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadInvites() {
    if (userRole !== 'agent' && userRole !== 'estate_manager') return;
    setInvitesLoading(true);
    try {
      const endpoint =
        userRole === 'agent'
          ? '/api/agent-invites'
          : '/api/dashboard/estate-manager/property-manager-invites';
      const res = await fetch(endpoint);
      const json = await res.json();
      if (res.ok) setInvites(Array.isArray(json.data) ? json.data : []);
    } catch {
      setInvites([]);
    } finally {
      setInvitesLoading(false);
    }
  }

  useEffect(() => {
    loadConversations();
    loadInvites();
  }, []);

  useEffect(() => {
    if (selectedId) loadMessages(selectedId);
  }, [selectedId]);

  async function handleSend() {
    const trimmed = msg.trim();
    if (!trimmed || !selectedId) return;
    const prev = msg;
    setMsg('');
    try {
      const res = await fetch(`/api/conversations/${selectedId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to send');
      const payload = Array.isArray(json.data) ? json.data[0] : json.data;
      if (payload && payload.id) setMessages((m) => [...m, payload]);
      loadConversations();
    } catch {
      setMsg(prev);
    }
  }

  async function handleAcceptInvite(inviteId: string) {
    try {
      await fetch(`/api/agent-invites/${inviteId}/accept`, { method: 'POST' });
      setInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
      loadConversations();
    } catch {
      // silent
    }
  }

  async function handleRemoveInvite(memberId: string, orgId: string) {
    try {
      await fetch(`/api/orgs/${orgId}/members/${memberId}`, { method: 'DELETE' });
      setInvites((prev) => prev.filter((inv) => inv.id !== memberId));
    } catch {
      // silent
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
      setConversations((prev) => [conversation, ...prev]);
      setSelectedId(conversation.id);
    } catch {
      // silent
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

  const showConversations = activeTab === 'messages';
  const showInvites = activeTab === 'invites';

  return (
    <div className="mx-auto flex h-full w-full flex-col overflow-hidden border border-neutral-800 bg-black text-white shadow-none">
      <div className="border-b border-neutral-800 px-4 py-3">
        <PageHeader title="Messages" description="Manage your conversations and invitations." />
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 border-r border-white/[0.07] overflow-y-auto">
          <div className="p-3">
            <SearchInput placeholder="Search..." />
          </div>
          <div className="px-3 pb-2 flex gap-1 border-b border-white/[0.07]">
            <button
              onClick={() => setActiveTab('messages')}
              className={cn(
                'flex-1 text-xs font-medium py-1.5 rounded-md transition-colors',
                activeTab === 'messages' ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-400 hover:text-white'
              )}
            >
              Messages
            </button>
            {(userRole === 'agent' || userRole === 'estate_manager' || userRole === 'landlord') && (
              <button
                onClick={() => setActiveTab('invites')}
                className={cn(
                  'flex-1 text-xs font-medium py-1.5 rounded-md transition-colors',
                  activeTab === 'invites' ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-400 hover:text-white'
                )}
              >
                Invites
              </button>
            )}
          </div>
          {showConversations && (
            <div>
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={cn(
                    'w-full text-left px-4 py-3 hover:bg-white/[0.04] transition-colors border-l-2',
                    selectedId === conv.id ? 'bg-emerald-500/5 border-emerald-500' : 'border-transparent'
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs font-semibold">
                        {(conv.participant?.fullName || '?').split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-white text-sm font-medium truncate">{conv.participant?.fullName || conv.subject || 'Conversation'}</span>
                        <span className="text-[10px] text-zinc-600 flex-shrink-0">{formatTime(conv.lastMessageAt)}</span>
                      </div>
                      <div className="text-xs text-zinc-600 truncate mt-0.5">{conv.lastMessage || conv.subject || 'No messages yet'}</div>
                    </div>
                    {conv.unreadCount > 0 && (
                      <Badge className="flex-shrink-0 h-4 min-w-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center px-1">
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
              {conversations.length === 0 && !loading && (
                <div className="p-4 text-center text-xs text-zinc-600">No conversations yet</div>
              )}
            </div>
          )}
          {showInvites && (
            <div>
              {invitesLoading && (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 rounded-md bg-zinc-900/50 animate-pulse" />
                  ))}
                </div>
              )}
              {!invitesLoading &&
                invites.map((inv) => (
                  <div
                    key={inv.id}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors border-l-2 border-transparent"
                  >
                    <div className="rounded-full p-2 bg-zinc-900">
                      <Mail className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-white text-sm font-medium truncate">
                          {inv.sender?.fullName || inv.email || 'Invitation'}
                        </p>
                        {inv.status && (
                          <Badge variant="default" className="rounded-full px-2 py-0 text-xs">
                            {inv.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-zinc-600 truncate">
                        {[inv.listing?.title, inv.listing?.address, inv.orgName].filter(Boolean).join(' · ') || 'Invitation'}
                      </p>
                      {inv.createdAt && (
                        <p className="text-[10px] text-zinc-700 truncate">
                          {new Date(inv.createdAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleInviteMessage(inv)}
                        title="Message about this invite"
                        aria-label="Message about this invite"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      {userRole === 'agent' && inv.status === 'pending' && (
                        <Button size="sm" onClick={() => handleAcceptInvite(inv.id)}>
                          Accept
                        </Button>
                      )}
                      {userRole === 'estate_manager' && inv.orgId && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveInvite(inv.id, inv.orgId!)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              {!invitesLoading && invites.length === 0 && (
                <div className="p-4 text-center text-xs text-zinc-600">No invites</div>
              )}
            </div>
          )}
        </div>

        {/* Message thread */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="px-5 py-3 border-b border-white/[0.07] flex items-center gap-3">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs font-semibold">
                    {(selectedConversation.participant?.fullName || '?').split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-white font-medium text-sm">
                    {selectedConversation.participant?.fullName || selectedConversation.subject || 'Conversation'}
                  </div>
                  <div className="text-zinc-600 text-xs">{selectedConversation.participant?.role || ''}</div>
                </div>
              </div>
              <ScrollArea className="flex-1 p-5">
                <div className="space-y-4">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.senderId === userId ? 'justify-end' : ''}`}>
                      <div
                        className={cn(
                          'max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm',
                          m.senderId === userId
                            ? 'bg-emerald-500 text-white rounded-br-sm'
                            : 'bg-zinc-900 border border-white/[0.08] text-zinc-200 rounded-bl-sm'
                        )}
                      >
                        {m.content}
                        <div
                          className={cn(
                            'text-[10px] mt-1',
                            m.senderId === userId ? 'text-emerald-200' : 'text-zinc-600'
                          )}
                        >
                          {formatTime(m.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && !loading && (
                    <div className="text-center text-xs text-zinc-600 py-8">No messages yet</div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-4 border-t border-white/[0.07]">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Type a message…"
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    className="flex-1 bg-black border-neutral-800 text-white placeholder:text-zinc-600"
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
            <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">
              {messagingLoading ? 'Starting conversation...' : 'Select a conversation to start messaging'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
