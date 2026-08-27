"use client";

import { cn } from "@/lib/utils";
import { getConversations, getMessages, sendMessage } from "@/app/actions/messaging";
import type { Conversation, Message as MessageType } from "@/app/actions/messaging";
import { useEffect, useMemo, useState } from "react";
import { Send } from "lucide-react";
import {
  Bubble,
  BubbleContent,
  Message,
  MessageContent,
  MessageFooter,
} from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Copy,
  MoreHorizontal,
  RefreshCcw,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type StatusType = "online" | "dnd" | "offline";

function StatusBadge({ status }: { status: StatusType }) {
  const colors: Record<StatusType, string> = {
    online: "bg-emerald-500",
    dnd: "bg-red-500",
    offline: "bg-neutral-500",
  };

  return (
    <span
      aria-label={status}
      className={cn(
        "inline-block size-2.5 rounded-full border-2 border-black",
        colors[status]
      )}
      title={status.charAt(0).toUpperCase() + status.slice(1)}
    />
  );
}

function UserActionsMenu() {
  return (
    <Button
      aria-label="User actions"
      className="border-neutral-700 text-neutral-200 hover:bg-neutral-800"
      size="icon"
      type="button"
      variant="outline"
    >
      <span className="text-xs">•••</span>
    </Button>
  );
}

function MessageActions({ isMe }: { isMe: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Message actions"
          className="size-7 rounded bg-background hover:bg-accent"
          size="icon"
          type="button"
          variant="ghost"
        >
          <MoreHorizontal aria-hidden="true" className="size-3.5" focusable="false" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="w-40 rounded-lg bg-popover p-1 shadow-xl"
      >
        <div className="flex flex-col gap-1">
          <Button
            aria-label="Copy"
            className="w-full justify-start gap-2 rounded px-2 py-1 text-xs"
            size="sm"
            type="button"
            variant="ghost"
          >
            <Copy aria-hidden="true" className="size-3" focusable="false" />
            <span>Copy</span>
          </Button>
          {isMe ? (
            <Button
              aria-label="Retry"
              className="w-full justify-start gap-2 rounded px-2 py-1 text-xs"
              size="sm"
              type="button"
              variant="ghost"
            >
              <RefreshCcw aria-hidden="true" className="size-3" focusable="false" />
              <span>Retry</span>
            </Button>
          ) : (
            <>
              <Button
                aria-label="Like"
                className="w-full justify-start gap-2 rounded px-2 py-1 text-xs"
                size="sm"
                type="button"
                variant="ghost"
              >
                <ThumbsUp aria-hidden="true" className="size-3" focusable="false" />
                <span>Like</span>
              </Button>
              <Button
                aria-label="Dislike"
                className="w-full justify-start gap-2 rounded px-2 py-1 text-xs"
                size="sm"
                type="button"
                variant="ghost"
              >
                <ThumbsDown aria-hidden="true" className="size-3" focusable="false" />
                <span>Dislike</span>
              </Button>
            </>
          )}
          {isMe ? (
            <Button
              aria-label="Delete"
              className="w-full justify-start gap-2 rounded px-2 py-1 text-destructive text-xs"
              size="sm"
              type="button"
              variant="ghost"
            >
              <Trash2 aria-hidden="true" className="size-3" focusable="false" />
              <span>Delete</span>
            </Button>
          ) : null}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function MessageConversation({
  className,
  userId,
  userName,
  userRole,
}: {
  className?: string;
  userId: string;
  userName: string;
  userRole: string;
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadConversations() {
      try {
        const data = await getConversations(userId, userRole);
        if (active) {
          setConversations(data as Conversation[]);
          if (data.length > 0) {
            setCurrentConversation(data[0] as Conversation);
          }
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load conversations");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadConversations();

    return () => {
      active = false;
    };
  }, [userId, userRole]);

  useEffect(() => {
    let active = true;

    async function loadMessages() {
      if (!currentConversation?.id) return;
      setLoading(true);
      try {
        const data = await getMessages(currentConversation.id);
        if (active) {
          setMessages(data);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load messages");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadMessages();

    return () => {
      active = false;
    };
  }, [currentConversation?.id]);

  const handleSend = async () => {
    if (!content.trim() || !currentConversation?.id || sending) return;
    setSending(true);
    try {
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: MessageType = {
        id: tempId,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        isRead: false,
        senderId: userId,
        sender: {
          id: userId,
          fullName: userName,
          avatarUrl: null,
          role: userRole,
        },
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setContent("");

      const saved = await sendMessage(currentConversation.id, userId, optimisticMessage.content);
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? saved : msg))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const participantName =
    (currentConversation?.participant as { fullName?: string } | null)?.fullName ||
    currentConversation?.subject ||
    "Conversation";

  const participantAvatar =
    (currentConversation?.participant as { avatarUrl?: string } | null)?.avatarUrl ||
    null;

  const status: StatusType = "offline";

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messages]);

  return (
    <Card
      className={cn(
        "mx-auto flex h-[75vh] min-h-0 max-w-2xl w-full grow flex-col overflow-hidden border-neutral-800 bg-black text-white shadow-none",
        className
      )}
    >
      <CardHeader className="sticky top-0 z-10 flex flex-row items-center justify-between gap-2 border-b border-neutral-800 bg-black px-4 py-2">
        <div className="flex items-center gap-3 pt-1">
          <div className="relative">
            <div className="flex size-8 items-center justify-center rounded-full bg-neutral-800 text-xs text-neutral-400">
              {participantName[0]}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="font-semibold text-base text-white">{participantName}</div>
            <div className="flex items-center gap-1 text-neutral-400 text-xs">
              <StatusBadge status={status} /> {status}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <UserActionsMenu />
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 p-0">
        {error ? (
          <div className="p-4 text-sm text-red-400">{error}</div>
        ) : loading && messages.length === 0 ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 w-32 rounded bg-neutral-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <ScrollArea
            aria-label="Conversation transcript"
            className="flex h-full max-h-full flex-col gap-6 bg-black p-4"
            role="log"
          >
            {sortedMessages.map((msg) => {
              const isMe = msg.senderId === userId;
              const senderName = msg.sender?.fullName || msg.sender?.role || "User";
              return (
                <Message key={msg.id} align={isMe ? "end" : "start"} className="group/message">
                  <MessageContent>
                    <Bubble variant={isMe ? undefined : "muted"}>
                      <BubbleContent>{msg.content}</BubbleContent>
                    </Bubble>
                    <MessageFooter className="gap-1">
                      <time
                        aria-label={`Sent at ${new Date(msg.createdAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}`}
                        className="text-neutral-500 text-xs"
                        dateTime={msg.createdAt}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString("en-NG", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                      <div className="opacity-0 transition-all group-hover:opacity-100">
                        <MessageActions isMe={isMe} />
                      </div>
                    </MessageFooter>
                  </MessageContent>
                </Message>
              );
            })}
          </ScrollArea>
        )}
      </CardContent>

      <div className="border-t border-neutral-800 p-4">
        <div className="flex gap-2">
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            disabled={sending || !currentConversation}
            className="border-neutral-800 bg-black text-white placeholder:text-neutral-500"
          />
          <Button
            onClick={handleSend}
            disabled={sending || !currentConversation}
            className="bg-emerald-500 text-black hover:bg-emerald-400"
          >
            <Send className="size-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
