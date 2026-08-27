"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  Attachment,
  AttachmentMedia,
} from "@/components/ui/attachment";
import {
  Bubble,
  BubbleContent,
  Message,
  MessageContent,
} from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

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

const DEMO_MESSAGES = [
  {
    id: "m1",
    senderId: "other",
    sender: { fullName: "Alice", avatarUrl: null, role: "agent" },
    content: "Hey there! What's up?",
    createdAt: "2026-08-27T09:00:00.000Z",
  },
  {
    id: "m2",
    senderId: "me",
    sender: { fullName: "You", avatarUrl: null, role: "tenant" },
    content: "I already checked the logs.",
    createdAt: "2026-08-27T09:01:00.000Z",
  },
  {
    id: "m3",
    senderId: "other",
    sender: { fullName: "Alice", avatarUrl: null, role: "agent" },
    content: "The install failure is coming from the workspace package.",
    createdAt: "2026-08-27T09:02:00.000Z",
  },
  {
    id: "m4",
    senderId: "other",
    sender: { fullName: "Alice", avatarUrl: null, role: "agent" },
    content: "Here's the image. Can you add it to the PDF? Use it for the cover page.",
    createdAt: "2026-08-27T09:03:00.000Z",
    attachments: [
      {
        url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&auto=format&fit=crop&q=80",
        name: "cover.png",
      },
    ],
  },
  {
    id: "m5",
    senderId: "me",
    sender: { fullName: "You", avatarUrl: null, role: "tenant" },
    content: "Done. Here's the PDF with the image added as the cover page.",
    createdAt: "2026-08-27T09:04:00.000Z",
  },
  {
    id: "m6",
    senderId: "other",
    sender: { fullName: "Alice", avatarUrl: null, role: "agent" },
    content: "Send the report to the team. Ping @shadcn if you need help.",
    createdAt: "2026-08-27T09:05:00.000Z",
  },
];

export default function MessageConversation({ className }: { className?: string }) {
  const [messages, setMessages] = useState(DEMO_MESSAGES);
  const [content, setContent] = useState("");

  const handleSend = () => {
    if (!content.trim()) return;
    const next = {
      id: `m-${Date.now()}`,
      senderId: "me",
      sender: { fullName: "You", avatarUrl: null, role: "tenant" },
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, next]);
    setContent("");
  };

  const participantName = "Alice";
  const status: StatusType = "online";

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
        <ScrollArea
          aria-label="Conversation transcript"
          className="flex h-full max-h-full flex-col gap-6 bg-black p-4"
          role="log"
        >
          {messages.map((msg) => {
            const isMe = msg.senderId === "me";
            return (
              <Message key={msg.id} align={isMe ? "end" : "start"}>
                <MessageContent>
                  {msg.attachments?.length ? (
                    <Attachment orientation="vertical">
                      <AttachmentMedia variant="image">
                        <img
                          src={msg.attachments[0].url}
                          alt={msg.attachments[0].name || "attachment"}
                        />
                      </AttachmentMedia>
                    </Attachment>
                  ) : null}
                  <Bubble variant={isMe ? undefined : "muted"}>
                    <BubbleContent>{msg.content}</BubbleContent>
                  </Bubble>
                </MessageContent>
              </Message>
            );
          })}
        </ScrollArea>
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
            className="border-neutral-800 bg-black text-white placeholder:text-neutral-500"
          />
          <Button
            onClick={handleSend}
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
