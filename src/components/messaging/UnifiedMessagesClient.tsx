'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Search, Plus, Send, MessageSquare, MoreHorizontal, ArrowLeft, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  lastMessage?: { content: string; createdAt: string; isSentByMe: boolean } | null;
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

type Tab = 'all' | 'chats' | 'screening';

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
  const [activeTab, setActiveTab] = useState<Tab>('all');

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) => {
      const name = c.participant?.fullName?.toLowerCase() || '';
      const subj = c.subject?.toLowerCase() || '';
      const preview = c.lastMessage?.content?.toLowerCase() || '';
      return name.includes(q) || subj.includes(q) || preview.includes(q);
    });
  }, [conversations, search]);

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

  const showList = activeTab !== 'screening' && !selectedId;
  const showDetail = activeTab !== 'screening' && !!selectedId;

  const tabs: { value: Tab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'chats', label: 'Chats' },
    { value: 'screening', label: 'Screening Calls' },
  ];

  return (
    <div className="space-y-6" style={elevationStyle(ELEVATION_TOKENS.elevation_2)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>Messages</h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
            {isRealtimeFallback ? 'Real-time updates unavailable' : 'Unified inbox across your properties'}
          </p>
        </div>
        {activeTab === 'chats' || activeTab === 'all' ? (
          <Dialog open={newOpen} onOpenChange={setNewOpen}>
            <DialogTrigger asChild>
              <Button className="inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Conversation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Conversation</DialogTitle>
              </DialogHeader>
              <NewConversationForm userId={userId} userRole={userRole} onSubmit={handleNewConversation} />
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      <Card className="overflow-hidden" style={elevationStyle(ELEVATION_TOKENS.elevation_1)}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-1 sm:gap-2 border-b border-border overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => {
                    setActiveTab(tab.value);
                    if (tab.value === 'screening') setSelectedId(null);
                  }}
                  className={cn(
                    'inline-flex items-center justify-center whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                    activeTab === tab.value
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {(activeTab === 'all' || activeTab === 'chats') && (
              <div className="relative max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} />
                <Input
                  type="text"
                  placeholder="Search conversations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4">
            <Card className="p-4 border" style={{ borderColor: 'var(--border)' }}>
              <p style={{ color: 'var(--text)' }}>{error}</p>
              <Button onClick={loadConversations} className="mt-3">Retry</Button>
            </Card>
          </div>
        )}

        {activeTab === 'screening' ? (
          <ScreeningCallsList calls={screeningCalls} loading={screeningLoading} />
        ) : showList ? (
          <ConversationList conversations={filtered} loading={loading} onSelect={setSelectedId} />
        ) : showDetail && selectedId ? (
          <ConversationDetail
            conversationId={selectedId}
            messages={messages}
            loading={messagesLoading}
            onBack={() => setSelectedId(null)}
            content={content}
            onContentChange={setContent}
            onSend={handleSendMessage}
          />
        ) : null}
      </Card>
    </div>
  );
}

function ScreeningStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    scheduled: { label: 'Scheduled', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    completed: { label: 'Completed', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    cancelled: { label: 'Cancelled', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
    missed: { label: 'Missed', className: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  };
  const item = map[status] || { label: status, className: 'bg-muted' };
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

function ConversationList({ conversations, loading, onSelect }: { conversations: Conversation[]; loading: boolean; onSelect: (id: string) => void }) {
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
      <div className="card-body text-center py-16">
        <MessageSquare className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
        <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No messages yet</h3>
        <p style={{ color: 'var(--muted)' }}>Your completed conversations will appear here.</p>
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
            className="w-full flex items-center gap-4 p-4 border-b transition-colors text-left hover:bg-muted/30"
            style={{ borderColor: 'var(--border)' }}
          >
            <Avatar>
              <AvatarImage src={conv.participant?.avatarUrl} alt={conv.participant?.fullName || 'User'} />
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
                {conv.lastMessage?.content || conv.subject || 'No messages yet'}
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
        <AvatarImage src={message.sender?.avatarUrl} alt={senderName} />
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
