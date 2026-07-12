"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiBuilding2Line,
  RiCheckLine,
  RiMailLine,
  RiTeamLine,
  RiUserLine,
} from "@remixicon/react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Toaster } from "@/components/ui/sonner"

const steps = [
  { id: 1, title: "Profile", icon: RiUserLine },
  { id: 2, title: "Workspace", icon: RiBuilding2Line },
  { id: 3, title: "Invite", icon: RiTeamLine },
  { id: 4, title: "Done", icon: RiCheckLine },
] as const

type Prefs = {
  notifications: boolean
  weeklyDigest: boolean
  publicProfile: boolean
}

export default function OnboardingBlock() {
  const [step, setStep] = useState(1)
  const [firstName, setFirstName] = useState("Jordan")
  const [lastName, setLastName] = useState("Rivera")
  const [role, setRole] = useState("Product Designer")
  const [workspace, setWorkspace] = useState("Acme HQ")
  const [prefs, setPrefs] = useState<Prefs>({
    notifications: true,
    weeklyDigest: true,
    publicProfile: false,
  })
  const [invites, setInvites] = useState<string[]>([
    "casey@acme.com",
    "morgan@acme.com",
  ])
  const [inviteDraft, setInviteDraft] = useState("")
  const [finished, setFinished] = useState(false)

  const total = steps.length
  const isLast = step === total
  const progress = (step / total) * 100

  function next() {
    setStep((s) => Math.min(s + 1, total))
  }

  function back() {
    setStep((s) => Math.max(s - 1, 1))
  }

  function finish() {
    setFinished(true)
    toast.success("Welcome to Acme", {
      description: `Your workspace "${workspace}" is ready. ${invites.length} teammate${
        invites.length === 1 ? "" : "s"
      } invited.`,
    })
  }

  function addInvite() {
    const value = inviteDraft.trim()
    if (!value || invites.includes(value)) return
    setInvites((list) => [...list, value])
    setInviteDraft("")
  }

  function removeInvite(email: string) {
    setInvites((list) => list.filter((e) => e !== email))
  }

  function togglePref(key: keyof Prefs) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }))
  }

  return (
    <section className="flex w-full items-center justify-center bg-muted/30 px-6 py-16 text-foreground">
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader className="gap-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="grid grid-cols-2 gap-0.5" aria-hidden="true">
                <div className="size-2.5 bg-primary" />
                <div className="size-2.5 bg-primary" />
                <div className="size-2.5 bg-primary" />
                <div className="size-2.5 bg-primary" />
              </div>
              <span className="text-sm font-semibold tracking-tight">Acme</span>
            </div>
            <Badge variant="secondary">
              Step {step} of {total}
            </Badge>
          </div>

          <div className="space-y-3">
            <Progress
              value={progress}
              aria-label={`Step ${step} of ${total}`}
            />
            <ol className="flex items-center justify-between">
              {steps.map((s) => {
                const active = s.id === step
                const done = s.id < step
                const Icon = s.icon
                return (
                  <li key={s.id} className="flex flex-1 justify-center">
                    <button
                      type="button"
                      onClick={() => setStep(s.id)}
                      aria-current={active ? "step" : undefined}
                      className="group flex cursor-pointer flex-col items-center gap-1.5 text-center transition-opacity hover:opacity-80 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      <span
                        className={cn(
                          "flex size-8 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                          active &&
                            "border-primary bg-primary text-primary-foreground",
                          done &&
                            "border-primary/40 bg-primary/10 text-primary",
                          !active &&
                            !done &&
                            "border-border bg-background text-muted-foreground group-hover:border-primary/40 group-hover:text-foreground"
                        )}
                      >
                        {done ? (
                          <RiCheckLine className="size-4" />
                        ) : (
                          <Icon className="size-4" />
                        )}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          active ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {s.title}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>
        </CardHeader>

        <CardContent className="min-h-64">
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">
                  Tell us about you
                </h2>
                <p className="text-sm text-muted-foreground">
                  This is how teammates will see you across Acme.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="first-name">First name</FieldLabel>
                  <Input
                    id="first-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="last-name">Last name</FieldLabel>
                  <Input
                    id="last-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="role">Role</FieldLabel>
                <Input
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">
                  Workspace preferences
                </h2>
                <p className="text-sm text-muted-foreground">
                  Set up how your workspace behaves. Change these any time.
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="workspace">Workspace name</FieldLabel>
                <Input
                  id="workspace"
                  value={workspace}
                  onChange={(e) => setWorkspace(e.target.value)}
                />
              </Field>
              <div className="divide-y divide-border rounded-none border border-border">
                <PrefRow
                  id="pref-notifications"
                  label="Product notifications"
                  description="Get notified about activity in your workspace."
                  checked={prefs.notifications}
                  onChange={() => togglePref("notifications")}
                />
                <PrefRow
                  id="pref-digest"
                  label="Weekly digest"
                  description="A summary of what shipped, every Monday."
                  checked={prefs.weeklyDigest}
                  onChange={() => togglePref("weeklyDigest")}
                />
                <PrefRow
                  id="pref-public"
                  label="Public profile"
                  description="Let others outside your team find you."
                  checked={prefs.publicProfile}
                  onChange={() => togglePref("publicProfile")}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">
                  Invite your team
                </h2>
                <p className="text-sm text-muted-foreground">
                  Acme is better together. Add teammates by email.
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="invite">Email address</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    id="invite"
                    type="email"
                    placeholder="name@acme.com"
                    value={inviteDraft}
                    onChange={(e) => setInviteDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addInvite()
                      }
                    }}
                  />
                  <Button type="button" onClick={addInvite}>
                    Add
                  </Button>
                </div>
              </Field>
              <ul className="space-y-2">
                {invites.map((email) => (
                  <li
                    key={email}
                    className="flex items-center justify-between gap-3 rounded-none border border-border bg-card px-3 py-2"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-sm">
                      <RiMailLine className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{email}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeInvite(email)}
                      className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Remove
                    </button>
                  </li>
                ))}
                {invites.length === 0 && (
                  <li className="rounded-none border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                    No invites yet. Add a teammate above.
                  </li>
                )}
              </ul>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="flex size-12 items-center justify-center bg-primary/10 text-primary">
                  <RiCheckLine className="size-6" />
                </span>
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold tracking-tight">
                    You&apos;re all set
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Review your setup, then jump into your workspace.
                  </p>
                </div>
              </div>
              <div className="rounded-none border border-border bg-muted/40 p-4">
                <dl className="space-y-3 text-sm">
                  <SummaryRow
                    label="Name"
                    value={`${firstName} ${lastName}`.trim() || "Not set"}
                  />
                  <Separator />
                  <SummaryRow label="Role" value={role || "Not set"} />
                  <Separator />
                  <SummaryRow label="Workspace" value={workspace || "Not set"} />
                  <Separator />
                  <SummaryRow
                    label="Invites"
                    value={`${invites.length} teammate${
                      invites.length === 1 ? "" : "s"
                    }`}
                  />
                </dl>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={back}
            disabled={step === 1}
          >
            <RiArrowLeftLine data-icon="inline-start" className="size-4" />
            Back
          </Button>
          {isLast ? (
            <Button type="button" onClick={finish} disabled={finished}>
              {finished ? "All Set" : "Finish"}
              <RiCheckLine className="size-4" />
            </Button>
          ) : (
            <Button type="button" onClick={next}>
              Next
              <RiArrowRightLine className="size-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
      <Toaster />
    </section>
  )
}

function PrefRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
