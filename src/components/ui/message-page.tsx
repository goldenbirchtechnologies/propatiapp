"use client";

import { useState } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send } from "lucide-react";

const CONVERSATIONS = [
  { id: 1, name: "Emeka Nwosu", role: "Landlord", last: "I've reviewed the lease agreement and everything looks good.", time: "2m ago", unread: 2 },
  { id: 2, name: "Yetunde Afolabi", role: "Agent", last: "The viewing is confirmed for Thursday 3pm.", time: "1h ago", unread: 0 },
  { id: 3, name: "PROPATI Support", role: "Support", last: "Your verification has been approved!", time: "3h ago", unread: 1 },
  { id: 4, name: "Chidi Okafor", role: "Tenant", last: "Can we reschedule the inspection?", time: "Yesterday", unread: 0 },
  { id: 5, name: "Ngozi Eze", role: "Tenant", last: "The maintenance has been resolved, thank you.", time: "2 days ago", unread: 0 },
];

const MESSAGES: Record<number, Array<{ id: number; from: "me" | "them"; text: string; time: string }>> = {
  1: [
    { id: 1, from: "them", text: "Hi, I wanted to confirm the viewing for the 3BR apartment on Friday.", time: "10:30am" },
    { id: 2, from: "me", text: "Yes, confirmed! 2pm on Friday works perfectly. Please bring a valid ID and proof of income.", time: "10:35am" },
    { id: 3, from: "them", text: "Perfect. Will do. Also, are utilities included in the rent?", time: "10:37am" },
    { id: 4, from: "me", text: "Water is included. Electricity is metered separately. Generator is shared cost.", time: "10:42am" },
    { id: 5, from: "them", text: "Understood. Looking forward to it!", time: "10:43am" },
  ],
  2: [
    { id: 1, from: "them", text: "The viewing is confirmed for Thursday 3pm.", time: "9:00am" },
    { id: 2, from: "me", text: "Great, I'll be there.", time: "9:05am" },
  ],
  3: [
    { id: 1, from: "them", text: "Your verification has been approved!", time: "Yesterday" },
    { id: 2, from: "me", text: "Thank you!", time: "Yesterday" },
  ],
  4: [
    { id: 1, from: "them", text: "Can we reschedule the inspection?", time: "Yesterday" },
    { id: 2, from: "me", text: "Sure, what time works for you?", time: "Yesterday" },
  ],
  5: [
    { id: 1, from: "them", text: "The maintenance has been resolved, thank you.", time: "2 days ago" },
    { id: 2, from: "me", text: "You're welcome!", time: "2 days ago" },
  ],
};

export default function MessagePage() {
  const [selected, setSelected] = useState(CONVERSATIONS[0]);
  const [msg, setMsg] = useState("");
  const messages = MESSAGES[selected.id] || [];

  return (
    <div className="mx-auto flex h-[75vh] min-h-0 max-w-4xl w-full flex-col overflow-hidden border border-neutral-800 bg-black text-white shadow-none">
      <div className="border-b border-neutral-800 px-4 py-3">
        <PageHeader title="Messages" description="Manage your conversations." />
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* Conversation list */}
        <div className="w-72 flex-shrink-0 border-r border-white/[0.07] overflow-y-auto">
          <div className="p-3">
            <SearchInput placeholder="Search conversations…" />
          </div>
          {CONVERSATIONS.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelected(conv)}
              className={`w-full text-left px-4 py-3.5 hover:bg-white/[0.04] transition-colors ${
                selected.id === conv.id ? "bg-emerald-500/5 border-l-2 border-emerald-500" : "border-l-2 border-transparent"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs font-semibold">
                    {conv.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm font-medium">{conv.name}</span>
                    <span className="text-[10px] text-zinc-600">{conv.time}</span>
                  </div>
                  <div className="text-xs text-zinc-600 truncate mt-0.5">{conv.last}</div>
                </div>
                {conv.unread > 0 && (
                  <Badge className="flex-shrink-0 h-4 min-w-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center px-1">
                    {conv.unread}
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Message thread */}
        <div className="flex-1 flex flex-col">
          <div className="px-5 py-3 border-b border-white/[0.07] flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs font-semibold">
                {selected.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-white font-medium text-sm">{selected.name}</div>
              <div className="text-zinc-600 text-xs">{selected.role}</div>
            </div>
          </div>
          <ScrollArea className="flex-1 p-5">
            <div className="space-y-4">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : ""}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                      m.from === "me"
                        ? "bg-emerald-500 text-white rounded-br-sm"
                        : "bg-zinc-900 border border-white/[0.08] text-zinc-200 rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                    <div className={`text-[10px] mt-1 ${m.from === "me" ? "text-emerald-200" : "text-zinc-600"}`}>{m.time}</div>
                  </div>
                </div>
              ))}
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
                onKeyDown={(e) => { if (e.key === "Enter") setMsg(""); }}
              />
              <Button onClick={() => setMsg("")} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <Send className="size-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
