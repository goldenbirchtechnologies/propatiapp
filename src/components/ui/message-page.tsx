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

  const showConversations = ['messages', 'unread', 'tenants', 'applicants', 'archived'].includes(activeTab);

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-white/[0.07]">
        <h1 className="text-lg font-bold text-white">Messages</h1>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* Conversation list */}
        <div className="w-72 flex-shrink-0 border-r border-white/[0.07] overflow-y-auto">
          <div className="p-3">
            <SearchInput placeholder="Search conversations…" />
          </div>
          <div className="px-3 pb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('messages')}
                  className={cn(
                    'flex-1 text-xs font-medium py-1.5 rounded-md transition-colors relative',
                    activeTab === 'messages' ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-400 hover:text-white'
                  )}
                >
                  All
                  {conversations.some((c) => c.unreadCount > 0) && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('unread')}
                  className={cn(
                    'flex-1 text-xs font-medium py-1.5 rounded-md transition-colors relative',
                    activeTab === 'unread' ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-400 hover:text-white'
                  )}
                >
                  Unread
                </button>
                <button
                  onClick={() => setActiveTab('tenants')}
                  className={cn(
                    'flex-1 text-xs font-medium py-1.5 rounded-md transition-colors relative',
                    activeTab === 'tenants' ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-400 hover:text-white'
                  )}
                >
                  Tenants
                </button>
                <button
                  onClick={() => setActiveTab('applicants')}
                  className={cn(
                    'flex-1 text-xs font-medium py-1.5 rounded-md transition-colors relative',
                    activeTab === 'applicants' ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-400 hover:text-white'
                  )}
                >
                  Applicants
                </button>
                <button
                  onClick={() => setActiveTab('archived')}
                  className={cn(
                    'flex-1 text-xs font-medium py-1.5 rounded-md transition-colors relative',
                    activeTab === 'archived' ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-400 hover:text-white'
                  )}
                >
                  Archived
                </button>
              </div>
              <Button
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                onClick={() => setShowNewConversation(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                + New
              </Button>
            </div>
          </div>
          {showConversations && (
            <div>
              {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={cn(
                      'w-full text-left px-4 py-3.5 hover:bg-white/[0.04] transition-colors border-l-2 group',
                      selectedId === conv.id ? 'bg-emerald-500/5 border-emerald-500' : 'border-transparent'
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {(conv.participant?.fullName || conv.subject || 'New Conversation').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-white text-sm font-medium truncate">
                              {conv.participant?.fullName || conv.subject || 'New Conversation'}
                            </span>
                            {conv.participant?.role && (
                              <span className={cn(
                                'text-[9px] px-1.5 py-0.5 rounded-full font-medium',
                                conv.participant.role === 'tenant' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                conv.participant.role === 'agent' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                conv.participant.role === 'landlord' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-zinc-800 text-zinc-400'
                              )}>
                                {conv.participant.role.charAt(0).toUpperCase() + conv.participant.role.slice(1)}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-600">
                            {formatTime(conv.lastMessageAt)}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-600 truncate mt-0.5">
                          {conv.lastMessage || conv.subject || 'No messages yet'}
                        </div>
                        {conv.propertyName && (
                          <div className="text-[9px] text-zinc-500 truncate mt-0.5">
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
              {conversations.length === 0 && (
                <div className="p-6 text-center text-xs text-zinc-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-3 text-zinc-600" />
                  <p className="mb-1 font-medium text-sm text-zinc-400">No conversations found</p>
                  <p className="text-[10px] text-zinc-600 mb-3">Select a conversation from the left, or start a new one below.</p>
                  <Button
                    size="sm"
                    onClick={() => setShowNewConversation(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Start New Conversation
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message thread */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="px-5 py-3 border-b border-white/[0.07] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {(selectedConversation.participant?.fullName || selectedConversation.subject || '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">
                      {selectedConversation.participant?.fullName || selectedConversation.subject || 'Conversation'}
                    </span>
                    {selectedConversation.participant?.role && (
                      <span className={cn(
                        'text-[9px] px-1.5 py-0.5 rounded-full font-medium',
                        selectedConversation.participant.role === 'tenant' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        selectedConversation.participant.role === 'agent' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        selectedConversation.participant.role === 'landlord' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-zinc-800 text-zinc-400'
                      )}>
                        {selectedConversation.participant.role.charAt(0).toUpperCase() + selectedConversation.participant.role.slice(1)}
                      </span>
                    )}
                  </div>
                  {selectedConversation.propertyName && (
                    <div className="text-zinc-500 text-xs mt-0.5">
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
                                : 'bg-zinc-900 border border-white/[0.08] text-zinc-200 rounded-bl-sm'
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
                  <div className="text-center text-xs text-zinc-600 py-8">No messages yet</div>
                )}
              </div>
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
            <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm p-4 text-center">
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
