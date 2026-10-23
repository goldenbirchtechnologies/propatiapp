'use client';

import { useEffect, useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  useConversations,
  useConversation,
  useSendMessage,
  useMarkAsRead,
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

function initials(name: string | null | undefined) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
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

export default function MessagePage({ userId, userName, userRole }: { userId: string; userName: string; userRole: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

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
  const deleteConversationMutation = useDeleteConversation();

  useEffect(() => {
    const interval = setInterval(() => {
      refetchConversations();
    }, 15000);
    return () => clearInterval(interval);
  }, [refetchConversations]);

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
      refetchMessages();
    } catch {
      setMsg(prev);
    }
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
    return out.filter((c) => c.status !== 'archived');
  }, [conversations, searchQuery]);

  const unreadCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <div className="pl-0 min-h-screen">
      <main className="w-full pt-0 px-4 pb-6">
        <div className="flex flex-col w-full gap-4">
          <div className="grid grid-cols-12 gap-4 h-[calc(100vh-6rem)] min-h-[640px]">
            {/* LEFT COLUMN: Conversation List */}
            <div className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden h-full border border-zinc-200 dark:border-zinc-800">
              <div className="p-4 pb-2 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-zinc-900 dark:text-white">Messages</h1>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">{unreadCount} Unread</span>
                    )}
                  </div>
                </div>
                <div className="relative w-full">
                  <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400 text-[18px]">search</span>
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations, tenants, properties..."
                    className="pl-8 h-9 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedId(conv.id)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg transition-all relative flex flex-col gap-1.5 border',
                        selectedId === conv.id
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
                          : 'bg-white dark:bg-zinc-900 border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative shrink-0">
                            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                              {initials(conv.participant?.fullName || conv.subject)}
                            </div>
                            {conv.unreadCount > 0 && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
                            )}
                          </div>
                          <div className="min-w-0 flex flex-col">
                            <span className="text-sm font-semibold text-zinc-900 dark:text-white truncate leading-tight">
                              {conv.participant?.fullName || conv.subject || 'New Conversation'}
                            </span>
                            {conv.propertyName && (
                              <span className="text-xs text-emerald-600 font-medium truncate">{conv.propertyName}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0 gap-1">
                          <span className="text-[11px] text-zinc-500">{formatTime(conv.lastMessageAt)}</span>
                          {conv.unreadCount > 0 && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1 pl-11">
                        {conv.lastMessage || conv.subject || 'No messages yet'}
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    <p className="text-sm text-zinc-500">No conversations yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* CENTER COLUMN: Active Thread */}
            <div className="col-span-12 lg:col-span-8 xl:col-span-6 flex flex-col bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden h-full border border-zinc-200 dark:border-zinc-800">
              {selectedConversation ? (
                <>
                  <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-800/60 flex items-center justify-between shadow-sm shrink-0 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shadow-sm">
                          {initials(selectedConversation.participant?.fullName || selectedConversation.subject)}
                        </div>
                      </div>
                      <div className="min-w-0 flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-zinc-900 dark:text-white truncate">
                            {selectedConversation.participant?.fullName || selectedConversation.subject || 'New Conversation'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 flex-wrap">
                          {selectedConversation.propertyName && (
                            <>
                              <span className="text-xs text-emerald-600 font-semibold">{selectedConversation.propertyName}</span>
                              <span className="text-zinc-400">•</span>
                            </>
                          )}
                          <span className="text-xs">{selectedConversation.participant?.role || ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {messages.length > 0 ? (
                      messages.map((m) => {
                        const isOwn = m.senderId === userId;
                        return (
                          <div
                            key={m.id}
                            className={cn('flex items-start gap-2 max-w-xl', isOwn && 'ml-auto flex-row-reverse')}
                          >
                            <div
                              className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-1',
                                isOwn ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'
                              )}
                            >
                              {initials(m.sender?.fullName)}
                            </div>
                            <div className={cn('flex flex-col gap-1 min-w-0', isOwn && 'items-end')}>
                              <div
                                className={cn(
                                  'p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed',
                                  isOwn
                                    ? 'rounded-tr-sm bg-emerald-600 text-white'
                                    : 'rounded-tl-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                                )}
                              >
                                {m.content}
                              </div>
                              <span className="text-[11px] text-zinc-500 px-1">{formatTime(m.createdAt)}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mb-3">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <rect x="3" y="6" width="18" height="12" rx="2" />
                            <path d="M3 7l9 6 9-6" />
                          </svg>
                        </div>
                        <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-1">No messages yet</h2>
                        <p className="text-sm text-zinc-500 max-w-sm">Start the conversation below.</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-white dark:bg-zinc-900 shadow-sm flex flex-col gap-2 shrink-0 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-2 flex flex-col gap-2">
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
                        placeholder={`Write a message to ${selectedConversation.participant?.fullName || 'participant'}...`}
                        className="w-full bg-transparent border-0 resize-none text-sm text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none p-1"
                      />
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1 text-zinc-400" />
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500 hidden sm:inline">Press ↵ to send</span>
                          <button
                            onClick={handleSend}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <span>Send</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M22 2L11 13" />
                              <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mb-3">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <rect x="3" y="6" width="18" height="12" rx="2" />
                      <path d="M3 7l9 6 9-6" />
                    </svg>
                  </div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-1">No Active Conversation Selected</h2>
                  <p className="text-sm text-zinc-500 max-w-sm">
                    Select a conversation from the list on the left to review dialogues.
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Context */}
            <div className="col-span-12 xl:col-span-3 hidden xl:flex flex-col gap-4 overflow-y-auto">
              {selectedConversation && (
                <>
                  <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-zinc-500 font-bold">Participant</span>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-sm">
                        {initials(selectedConversation.participant?.fullName || selectedConversation.subject)}
                      </div>
                      <div className="min-w-0 flex flex-col">
                        <span className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                          {selectedConversation.participant?.fullName || selectedConversation.subject}
                        </span>
                        <span className="text-xs text-zinc-500 truncate">{selectedConversation.participant?.role || ''}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 pt-1 text-xs text-zinc-500">
                      {selectedConversation.propertyName && (
                        <div className="flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          </svg>
                          <span className="truncate">{selectedConversation.propertyName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}