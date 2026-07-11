'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Send, MessageSquare, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
    id: string;
    fullName?: string | null;
    avatarUrl?: string | null;
    role?: string | null;
  };
  subject?: string | null;
  lastMessage?: { content: string; createdAt: string; isSentByMe: boolean } | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  status: string;
  participants?: any[];
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
    id: string;
    fullName?: string | null;
    avatarUrl?: string | null;
    role?: string | null;
  };
};

const ELEVATION_TOKENS: Record<string, string> = {
  elevation_1: 'var(--elevation-1)',
  elevation_2: 'var(--elevation-2)',
  elevation_3: 'var(--elevation-3)',
};

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
      const res = await fetch('/api/conversations');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load conversations');
      setConversations(json.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(conversationId: string) {
    setMessagesLoading(true);
    setMessages([]);
    try {
      const [convRes, msgRes] = await Promise.all([
        fetch(`/api/conversations/${conversationId}/mark-read`, { method: 'POST' }),
        fetch(`/api/conversations/${conversationId}/messages`),
      ]);
      const msgJson = await msgRes.json();
      if (!msgRes.ok) throw new Error(msgJson.error || 'Failed to load messages');
      setMessages(msgJson.data || []);
    } catch (err) {
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }

  useEffect(() => {
    loadConversations();
    const params = new URLSearchParams(window.location.search);
    const convoId = params.get('conversationId');
    if (convoId) setSelectedId(convoId);
  }, []);

  useEffect(() => {
    if (selectedId) loadMessages(selectedId);
  }, [selectedId]);

  async function handleSend() {
    if (!selectedId || !content.trim()) return;
    const prev = content;
    setContent('');
    setReplyToId(null);
    try {
      const res = await fetch(`/api/conversations/${selectedId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: prev.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to send');
      setMessages((m) => [...m, json.data]);
      loadConversations();
    } catch (err) {
      setContent(prev);
    }
  }

  async function handleNewConversation(formData: { participantId: string; subject: string; listingId?: string }) {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participants: [{ userId: formData.participantId, role: '' }, { userId: userId, role: userRole }],
          subject: formData.subject || 'New Conversation',
          listingId: formData.listingId || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create conversation');
      setNewOpen(false);
      setSelectedId(json.data.id);
      loadConversations();
    } catch (err) {
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

  return (
    <div className="space-y-6" style={ELEVATION_TOKENS.elevation_2 as any}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>Messages</h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>Unified inbox across your properties</p>
        </div>
        <Dialog open={newOpen} onOpenChange={setNewOpen}>
          <DialogTrigger asChild>
            <Button className="inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Conversation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Conversation</DialogTitle>
            </DialogHeader>
            <NewConversationForm userId={userId} userRole={userRole} onSubmit={handleNewConversation} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden" style={ELEVATION_TOKENS.elevation_1 as any}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
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
        </div>

        {error && (
          <div className="p-4">
            <Card className="p-4 border" style={{ borderColor: 'var(--border)' }}>
              <p style={{ color: 'var(--text)' }}>{error}</p>
            </Card>
          </div>
        )}

        {!selectedId ? (
          <ConversationList conversations={filtered} loading={loading} onSelect={setSelectedId} />
        ) : (
          <ConversationDetail
            conversationId={selectedId}
            messages={messages}
            loading={messagesLoading}
            onBack={() => setSelectedId(null)}
            content={content}
            onContentChange={setContent}
            onSend={handleSend}
          />
        )}
      </Card>
    </div>
  );
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
        <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No conversations</h3>
        <p style={{ color: 'var(--muted)' }}>Start a new conversation to begin messaging.</p>
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
            <Avatar src={conv.participant?.avatarUrl || ''} alt={conv.participant?.fullName || 'User'} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>
                  {conv.participant?.fullName || 'Conversation'}
                  {conv.listing?.title ? ` — ${conv.listing.title}` : ''}
                </p>
                {conv.unreadCount > 0 && (
                  <Badge variant="default" className="rounded-full px-2 py-0 text-xs" style={{ background: 'var(--accent)', color: '#fff' }}>
                    {conv.unreadCount}
                  </Badge>
                )}
              </div>
              <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{conv.lastMessage?.content || conv.subject || 'No messages yet'}</p>
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
            <Send className="w-4 h-4" /> Send
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isMe = message.senderId === message.sender?.id && message.sender?.id; // simplistic
  return (
    <div className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
      <Avatar src={message.sender?.avatarUrl || ''} alt={message.sender?.fullName || 'User'} className="w-8 h-8" />
      <div className={`max-w-[70%] rounded-lg px-3 py-2 ${isMe ? 'rounded-tr-none' : 'rounded-tl-none'}`} style={{ background: 'var(--elevation-2)', color: 'var(--text)' }}>
        <p className="text-xs mb-1 font-medium" style={{ color: 'var(--muted)' }}>{message.sender?.fullName || 'User'}</p>
        <p className="text-sm">{message.content}</p>
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
