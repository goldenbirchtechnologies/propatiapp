"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Search, Plus, Send, MessageSquare, MoreHorizontal, ArrowLeft, Phone, Calendar, Mail, Menu, Settings, User2, ChevronUp, SquarePen, ListFilter, MessageSquareDot, Star, CircleUserRound, CircleOff, Users, MessageSquareDashed, User, Brush, Camera, File, Image, Paperclip, Video, Smile, Mic, ChartBarIncreasing, UserRound, CircleFadingPlus, MessageCircle } from "lucide-react"

import { SidebarInset, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar } from "@/components/blocks/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CardDescription, CardTitle, Card } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const contactList = [
  {
    name: "Manoj Rayi",
    message: "Your Last Message Here",
    image: "https://github.com/rayimanoj8.png",
  },
  {
    name: "Anjali Kumar",
    message: "Hello, how are you?",
    image: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    name: "Ravi Teja",
    message: "Looking forward to the meeting.",
    image: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    name: "Sneha Reddy",
    message: "Can you send the report?",
    image: "https://randomuser.me/api/portraits/women/4.jpg",
  },
  {
    name: "Arjun Das",
    message: "Thank you for your help!",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
  },
  {
    name: "Priya Sharma",
    message: "Let's catch up soon.",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
  },
  {
    name: "Vikram Singh",
    message: "I will call you later.",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
  },
  {
    name: "Kavya Rao",
    message: "Did you receive my email?",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
  },
  {
    name: "Rahul Verma",
    message: "Meeting rescheduled to tomorrow.",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
  },
  {
    name: "Deepika Nair",
    message: "Happy birthday! Have a great day!",
    image: "https://randomuser.me/api/portraits/women/10.jpg",
  },
  {
    name: "Rohit Malhotra",
    message: "What's the update?",
    image: "https://randomuser.me/api/portraits/men/11.jpg",
  },
  {
    name: "Neha Gupta",
    message: "Hope you're doing well!",
    image: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    name: "Amit Yadav",
    message: "Let's finalize the project.",
    image: "https://randomuser.me/api/portraits/men/13.jpg",
  },
  {
    name: "Simran Kaur",
    message: "Good morning!",
    image: "https://randomuser.me/api/portraits/women/14.jpg",
  },
  {
    name: "Varun Chopra",
    message: "I'll send the documents soon.",
    image: "https://randomuser.me/api/portraits/men/15.jpg",
  },
  {
    name: "Meera Joshi",
    message: "How was your weekend?",
    image: "https://randomuser.me/api/portraits/women/16.jpg",
  },
  {
    name: "Karthik Reddy",
    message: "Please confirm the time.",
    image: "https://randomuser.me/api/portraits/men/17.jpg",
  },
  {
    name: "Pooja Sharma",
    message: "See you at the event!",
    image: "https://randomuser.me/api/portraits/women/18.jpg",
  },
  {
    name: "Sandeep Kumar",
    message: "Just checking in.",
    image: "https://randomuser.me/api/portraits/men/19.jpg",
  },
  {
    name: "Lavanya Patel",
    message: "Don't forget the meeting.",
    image: "https://randomuser.me/api/portraits/women/20.jpg",
  },
]

const menuItems = [
  { title: "Messages", url: "#", icon: MessageCircle },
  { title: "Phone", url: "#", icon: Phone },
  { title: "Status", url: "#", icon: CircleFadingPlus },
]

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
}

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
}

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
}

type Tab = 'all' | 'chats' | 'screening' | 'invites';

function InvitesList({ invites, loading, error, userRole, onAccept, onRemove, onRetry }: { invites: Invite[]; loading: boolean; error: string | null; userRole: string; onAccept: (id: string) => void; onRemove: (memberId: string, orgId: string) => void; onRetry: () => void }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return invites
    return invites.filter((inv) => {
      const name = (inv.sender?.fullName || inv.email || '').toLowerCase()
      const listing = (inv.listing?.title || inv.listing?.address || '').toLowerCase()
      return name.includes(q) || listing.includes(q)
    })
  }, [invites, query])

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
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <Card className="p-4 border" style={{ borderColor: 'var(--border)' }}>
          <p style={{ color: 'var(--text)' }}>{error}</p>
          <Button onClick={onRetry} className="mt-3">Retry</Button>
        </Card>
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="card-body text-center py-16">
        <Mail className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
        <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No invites</h3>
        <p style={{ color: 'var(--muted)' }}>Pending invitations will appear here.</p>
      </div>
    )
  }

  return (
    <ScrollArea>
      <div>
        {filtered.map((inv) => {
          const label = inv.sender?.fullName || inv.email || 'Invitation'
          const subline = [inv.listing?.title, inv.listing?.address, inv.orgName].filter(Boolean).join(' · ') || 'Invitation'
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
          )
        })}
      </div>
    </ScrollArea>
  )
}

function ScreeningCallsList({ calls, loading }: { calls: Invite[]; loading: boolean }) {
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
    )
  }

  if (calls.length === 0) {
    return (
      <div className="card-body text-center py-16">
        <Phone className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
        <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No screening calls</h3>
        <p style={{ color: 'var(--muted)' }}>Upcoming screening calls will appear here.</p>
      </div>
    )
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
                <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full px-2 py-0 text-xs">Scheduled</Badge>
              </div>
              <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>
                {call.createdAt ? new Date(call.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : ''}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
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
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="card-body text-center py-16">
        <MessageSquare className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
        <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No messages yet</h3>
        <p style={{ color: 'var(--muted)' }}>Your completed conversations will appear here.</p>
      </div>
    )
  }

  return (
    <ScrollArea>
      <div>
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className="w-full flex items-center gap-4 p-4 border-b transition-colors text-left hover:bg-zinc-900/30"
            style={{ borderColor: 'var(--border)' }}
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
  )
}

function MessageBubble({ message }: { message: Message }) {
  const senderName = message.sender?.fullName || message.sender?.role || 'User'
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
  )
}

function formatTime(input: string | null | undefined) {
  if (!input) return ''
  const d = new Date(input)
  return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
}

function initials(name: string | null | undefined) {
  if (!name) return 'U'
  const parts = name.trim().split(' ').filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0]?.[0]?.toUpperCase() || 'U'
}

function NewConversationForm({ userId, userRole, onSubmit }: { userId: string; userRole: string; onSubmit: (data: { participantId: string; subject: string; listingId?: string }) => void }) {
  const [participantId, setParticipantId] = useState('')
  const [subject, setSubject] = useState('')
  const [listingId, setListingId] = useState('')
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
  )
}

export const Home = ({ userId, userName, userRole }: { userId: string; userName: string; userRole: string }) => {
  const { toggleSidebar } = useSidebar()
  type ContactItem = { name: string; message: string; image: string }
  const [currentChat, setCurrentChat] = useState<ContactItem | Conversation | null>(contactList[0])

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [search, setSearch] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newOpen, setNewOpen] = useState(false)
  const [replyToId, setReplyToId] = useState<string | null>(null)
  const [screeningCalls, setScreeningCalls] = useState<Invite[]>([])
  const [screeningLoading, setScreeningLoading] = useState(false)
  const [invites, setInvites] = useState<Invite[]>([])
  const [invitesLoading, setInvitesLoading] = useState(false)
  const [invitesError, setInvitesError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('all')

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations
    const q = search.toLowerCase()
    return conversations.filter((c) => {
      const name = c.participant?.fullName?.toLowerCase() || ''
      const subj = c.subject?.toLowerCase() || ''
      const preview = c.lastMessage?.content?.toLowerCase() || ''
      return name.includes(q) || subj.includes(q) || preview.includes(q)
    })
  }, [conversations, search])

  async function loadConversations() {
    setLoading(true)
    setError(null)
    try {
      const res = await withRetry(() => fetch('/api/conversations'))
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load conversations')
      const data = Array.isArray(json.data) ? json.data : []
      setConversations(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  async function loadScreening() {
    setScreeningLoading(true)
    try {
      const res = await withRetry(() => fetch('/api/screening-calls'))
      const json = await res.json()
      if (res.ok) setScreeningCalls(Array.isArray(json.data) ? json.data : [])
    } catch {
      // non-blocking
    } finally {
      setScreeningLoading(false)
    }
  }

  async function loadInvites() {
    if (userRole !== 'agent' && userRole !== 'estate_manager') return
    setInvitesLoading(true)
    setInvitesError(null)
    try {
      if (userRole === 'agent') {
        const res = await withRetry(() => fetch('/api/agent-invites'))
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to load invites')
        setInvites(Array.isArray(json.data) ? json.data : [])
      } else if (userRole === 'estate_manager') {
        const res = await withRetry(() => fetch('/api/dashboard/estate-manager/property-manager-invites'))
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to load invites')
        setInvites(Array.isArray(json.data) ? json.data : [])
      }
    } catch (err: unknown) {
      setInvitesError(err instanceof Error ? err.message : 'Failed to load invites')
    } finally {
      setInvitesLoading(false)
    }
  }

  async function handleAcceptInvite(inviteId: string) {
    try {
      const res = await withRetry(() => fetch(`/api/agent-invites/${inviteId}/accept`, { method: 'POST' }))
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to accept invite')
      setInvites((prev) => prev.filter((inv) => inv.id !== inviteId))
      loadConversations()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to accept invite')
    }
  }

  async function handleRemoveInvite(memberId: string, orgId: string) {
    try {
      const res = await withRetry(() => fetch(`/api/orgs/${orgId}/members/${memberId}`, { method: 'DELETE' }))
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to remove invite')
      setInvites((prev) => prev.filter((inv) => inv.id !== memberId))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to remove invite')
    }
  }

  async function markConversationRead(conversationId: string) {
    try {
      await withRetry(() => fetch(`/api/conversations/${conversationId}/mark-read`, { method: 'POST' }))
    } catch {
      // non-blocking read receipt
    }
  }

  async function loadMessages(conversationId: string) {
    setMessagesLoading(true)
    setMessages([])
    try {
      const msgRes = await withRetry(() => fetch(`/api/conversations/${conversationId}/messages`))
      const msgJson = await msgRes.json()
      if (!msgRes.ok) throw new Error(msgJson.error || 'Failed to load messages')
      setMessages(Array.isArray(msgJson.data) ? msgJson.data : [])
      markConversationRead(conversationId).catch(() => {})
    } catch {
      setMessages([])
    } finally {
      setMessagesLoading(false)
    }
  }

  useEffect(() => {
    loadConversations()
    loadScreening()
    loadInvites()
    const params = new URLSearchParams(window.location.search)
    const convoId = params.get('conversationId')
    if (convoId) setSelectedId(convoId)
  }, [])

  useEffect(() => {
    if (selectedId) loadMessages(selectedId)
  }, [selectedId])

  async function handleSendMessage() {
    const trimmed = content.trim()
    if (!trimmed || !selectedId) return
    const prev = content
    setContent('')
    setReplyToId(null)
    try {
      const res = await withRetry(() => fetch(`/api/conversations/${selectedId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      }))
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to send')
      const payload = Array.isArray(json.data) ? json.data[0] : json.data
      if (payload && payload.id) setMessages((m) => [...m, payload])
      loadConversations()
    } catch {
      setContent(prev)
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
      }))
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create conversation')
      setNewOpen(false)
      const id = json?.data?.id
      if (id) setSelectedId(id)
      loadConversations()
    } catch {
      // silent for now
    }
  }

  const showList = activeTab !== 'screening' && activeTab !== 'invites' && !selectedId
  const showDetail = activeTab !== 'screening' && activeTab !== 'invites' && !!selectedId

  const tabs: { value: Tab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'chats', label: 'Chats' },
    { value: 'screening', label: 'Screening Calls' },
  ]
  if (userRole === 'agent' || userRole === 'estate_manager' || userRole === 'landlord') {
    tabs.push({ value: 'invites', label: 'Invites' })
  }

  return (
    <>
      <Sidebar variant="floating" collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigate</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={toggleSidebar} asChild>
                    <span>
                      <Menu />
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Settings /> Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <User2 /> {userName || 'User'}
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem>
                    <a href="https://github.com/rayimanoj8/">Account</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Back Up</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <ResizablePanelGroup direction="horizontal" className="h-screen">
          <ResizablePanel defaultSize={25} minSize={20} className="flex-grow">
            <div className="flex flex-col h-screen border ml-1">
              <div className="h-10 px-2 py-4 flex items-center">
                <p className="ml-1">Chats</p>
                <div className="flex justify-end w-full">
                  <Dialog open={newOpen} onOpenChange={setNewOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <SquarePen />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>New Conversation</DialogTitle>
                      </DialogHeader>
                      <NewConversationForm userId={userId} userRole={userRole} onSubmit={handleNewConversation} />
                    </DialogContent>
                  </Dialog>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <ListFilter />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>Filter Chats By</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <MessageSquareDot /> Unread
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Star /> Favorites
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CircleUserRound /> Contacts
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CircleOff /> Non Contacts
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <Users /> Groups
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquareDashed /> Drafts
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="relative px-2 py-4">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" />
                <Input
                  placeholder="Search or start new chat"
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <ScrollArea className="flex-grow">
                {filtered.map((conv, index) => (
                  <button
                    key={conv.id}
                    onClick={() => { setCurrentChat(conv); setSelectedId(conv.id) }}
                    className="px-4 w-full py-2 hover:bg-secondary cursor-pointer text-left"
                  >
                    <div className="flex flex-row gap-2">
                      <Avatar className="size-12">
                        <AvatarImage src={conv.participant?.avatarUrl as string | undefined} />
                        <AvatarFallback>{initials(conv.participant?.fullName)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <CardTitle>{conv.participant?.fullName || 'Conversation'}{conv.listing?.title ? ` — ${conv.listing.title}` : ''}</CardTitle>
                        <CardDescription>{conv.lastMessage?.content || conv.subject || 'No messages yet'}</CardDescription>
                      </div>
                    </div>
                  </button>
                ))}
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize={75} minSize={40}>
            <div className="flex flex-col justify-between h-screen ml-1 pb-2">
              {(() => {
                const avatarSrc = currentChat ? ('image' in currentChat ? currentChat.image : (currentChat as Conversation).participant?.avatarUrl as string | undefined) : undefined
                const chatTitle = currentChat ? ('name' in currentChat ? currentChat.name : (currentChat as Conversation).participant?.fullName || 'Conversation') : 'Chat'
                return (
                  <div className="h-16 border-b flex items-center px-3">
                    <Avatar className="size-12">
                      <AvatarImage src={avatarSrc} />
                      <AvatarFallback>PR</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 ml-2">
                      <CardTitle>{chatTitle}</CardTitle>
                      <CardDescription>{selectedId ? 'Conversation' : 'Contact Info'}</CardDescription>
                    </div>
                    <div className="flex-grow flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Video />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Phone />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Search />
                      </Button>
                    </div>
                  </div>
                )
              })()}

              <ScrollArea className="flex-grow px-3 py-2">
                {messagesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 w-3/4 rounded-lg" style={{ background: 'var(--muted)', opacity: 0.1 }} />
                    ))}
                  </div>
                ) : selectedId ? (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <MessageBubble key={msg.id} message={msg} />
                    ))}
                  </div>
                ) : (
                  <div className="card-body text-center py-16">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
                    <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>Select a conversation</h3>
                    <p style={{ color: 'var(--muted)' }}>Choose a chat from the list to start messaging.</p>
                  </div>
                )}
              </ScrollArea>

              <div className="flex h-10 pt-2 border-t">
                <Button variant="ghost" size="icon">
                  <Smile />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" size="icon">
                      <Paperclip />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Image /> Photos & Videos
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Camera /> Camera
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <File /> Document
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <UserRound /> Contact
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ChartBarIncreasing /> Poll
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Brush /> Drawing
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Input
                  className="flex-grow border-0"
                  placeholder="Type a message"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <Button variant="ghost" size="icon" onClick={handleSendMessage}>
                  <Send />
                </Button>
                <Button variant="ghost" size="icon">
                  <Mic />
                </Button>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </SidebarInset>
    </>
  )
}
