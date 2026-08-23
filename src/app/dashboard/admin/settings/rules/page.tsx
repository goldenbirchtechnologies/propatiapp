"use client";

import { useState, useEffect } from "react";
import { Plus, FileText, Shield, Clock } from "lucide-react";

interface Rule {
  id: string;
  name: string;
  ruleType: string;
  countryId: string;
  priority: number;
  active: boolean;
}

interface ComplianceEvent {
  id: string;
  title: string;
  eventType: string;
  deadline: string;
  status: string;
}

interface DocTemplate {
  id: string;
  name: string;
  countryId: string;
  version: number;
  language: string;
  active: boolean;
}

export default function RulesEnginePage() {
  const [tab, setTab] = useState<"rules" | "compliance" | "templates">("rules");
  const [rules, setRules] = useState<Rule[]>([]);
  const [events, setEvents] = useState<ComplianceEvent[]>([]);
  const [templates, setTemplates] = useState<DocTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [tab]);

  async function fetchData() {
    setLoading(true);
    try {
      if (tab === "rules") {
        const res = await fetch("/api/admin/rules");
        const data = await res.json();
        setRules(data.rules || []);
      } else if (tab === "compliance") {
        const res = await fetch("/api/admin/compliance-events");
        const data = await res.json();
        setEvents(data.events || []);
      } else {
        const res = await fetch("/api/admin/document-templates");
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleRule(id: string, active: boolean) {
    await fetch(`/api/admin/rules/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    fetchData();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Rules Engine</h1>
        <p className="text-muted-foreground">Manage jurisdiction rules, compliance events, and document templates</p>
      </div>

      <div className="flex gap-2 border-b border-border">
        <button onClick={() => setTab("rules")} className={`px-4 py-2 font-medium ${tab === "rules" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>
          <Shield className="inline-block mr-2 h-4 w-4" /> Rules
        </button>
        <button onClick={() => setTab("compliance")} className={`px-4 py-2 font-medium ${tab === "compliance" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>
          <Clock className="inline-block mr-2 h-4 w-4" /> Compliance
        </button>
        <button onClick={() => setTab("templates")} className={`px-4 py-2 font-medium ${tab === "templates" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>
          <FileText className="inline-block mr-2 h-4 w-4" /> Templates
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-muted-foreground">Loading...</div>
      ) : (
        <>
          {tab === "rules" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground">
                  <Plus className="h-4 w-4" /> Add Rule
                </button>
              </div>
              {rules.length === 0 ? (
                <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
                  No rules configured. Add your first jurisdiction rule.
                </div>
              ) : (
                rules.map(rule => (
                  <div key={rule.id} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{rule.name}</h3>
                        <p className="text-sm text-muted-foreground">{rule.ruleType} · Priority: {rule.priority}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${rule.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                          {rule.active ? "Active" : "Inactive"}
                        </span>
                        <button onClick={() => toggleRule(rule.id, rule.active)} className="text-sm text-primary hover:underline">
                          {rule.active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "compliance" && (
            <div className="space-y-4">
              {events.length === 0 ? (
                <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">No compliance events.</div>
              ) : (
                events.map(event => (
                  <div key={event.id} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">{event.eventType} · Due: {new Date(event.deadline).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${event.status === "completed" ? "bg-green-100 text-green-700" : event.status === "overdue" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "templates" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground">
                  <Plus className="h-4 w-4" /> Add Template
                </button>
              </div>
              {templates.length === 0 ? (
                <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">No document templates configured.</div>
              ) : (
                templates.map(tpl => (
                  <div key={tpl.id} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{tpl.name}</h3>
                        <p className="text-sm text-muted-foreground">v{tpl.version} · {tpl.language}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${tpl.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {tpl.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
