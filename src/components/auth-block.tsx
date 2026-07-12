"use client"

import { useState } from "react"
import {
  RiGithubFill,
  RiGoogleFill,
  RiSparkling2Line,
} from "@remixicon/react"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Toaster } from "@/components/ui/sonner"

const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export default function AuthBlock() {
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    const result = signInSchema.safeParse(data)
    if (!result.success) {
      const next: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0]
        if (typeof key === "string" && !next[key]) {
          next[key] = issue.message
        }
      }
      setErrors(next)
      return
    }
    setErrors({})
    toast.promise(new Promise((resolve) => setTimeout(resolve, 1400)), {
      loading: "Signing you in…",
      success: "Welcome back to Acme!",
      error: "Sign-in failed. Please try again.",
    })
  }

  function clearError(name: string) {
    setErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  function handleSocial(provider: string) {
    toast.info(`Continuing with ${provider}`, {
      description: "Redirecting you to authenticate…",
    })
  }

  return (
    <>
      <Toaster />
      <section className="grid min-h-svh w-full grid-cols-1 bg-background text-foreground md:grid-cols-2">
        <div className="flex items-center justify-center px-6 py-12 sm:px-10">
          <Card className="w-full max-w-sm border-0 bg-transparent shadow-none ring-0">
            <CardHeader className="px-0">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Sign in to Acme
              </CardTitle>
              <CardDescription className="text-sm">
                Welcome back. Enter your details to continue.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-6 px-0">
              <form onSubmit={handleSubmit} noValidate>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      aria-invalid={!!errors.email}
                      onChange={() => clearError("email")}
                    />
                    <FieldError>{errors.email}</FieldError>
                  </Field>
                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Button
                        variant="link"
                        className="h-auto px-0 text-xs"
                        render={<a href="#" />}
                        nativeButton={false}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      aria-invalid={!!errors.password}
                      onChange={() => clearError("password")}
                    />
                    <FieldError>{errors.password}</FieldError>
                  </Field>

                  <Field orientation="horizontal">
                    <FieldLabel
                      htmlFor="remember"
                      className="font-normal text-muted-foreground"
                    >
                      <Checkbox
                        id="remember"
                        checked={remember}
                        onCheckedChange={(checked) =>
                          setRemember(checked === true)
                        }
                      />
                      Remember me
                    </FieldLabel>
                  </Field>

                  <Button type="submit" className="w-full">
                    Sign in
                  </Button>
                </FieldGroup>
              </form>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Separator className="flex-1" />
                Or
                <Separator className="flex-1" />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleSocial("Google")}
                >
                  <RiGoogleFill data-icon="inline-start" />
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleSocial("GitHub")}
                >
                  <RiGithubFill data-icon="inline-start" />
                  GitHub
                </Button>
              </div>
            </CardContent>

            <CardFooter className="justify-center px-0 text-sm text-muted-foreground">
              Don&apos;t have an account?
              <Button
                variant="link"
                className="px-1"
                render={<a href="#" />}
                nativeButton={false}
              >
                Sign up
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="dark relative hidden overflow-hidden border-l border-border bg-background text-foreground md:block">
          <div
            aria-hidden="true"
            className="absolute inset-0 [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.07]"
          />
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-24 size-80 rounded-full bg-foreground/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-32 -left-16 size-96 rounded-full bg-foreground/10 blur-3xl"
          />

          <div className="relative flex h-full flex-col justify-between p-12">
            <div className="flex items-center gap-2.5">
              <span className="grid grid-cols-2 gap-0.5" aria-hidden="true">
                <span className="size-2.5 bg-foreground" />
                <span className="size-2.5 bg-foreground" />
                <span className="size-2.5 bg-foreground" />
                <span className="size-2.5 bg-foreground" />
              </span>
              <span className="text-lg font-semibold tracking-tight">Acme</span>
            </div>

            <div className="max-w-md">
              <span className="inline-flex items-center gap-1.5 border border-foreground/30 bg-foreground/10 px-2.5 py-1 text-xs font-medium">
                <RiSparkling2Line
                  data-icon="inline-start"
                  className="size-3.5"
                  aria-hidden="true"
                />
                Trusted by 12,000+ teams
              </span>
              <h2 className="mt-6 text-4xl leading-tight font-bold tracking-tight">
                Build faster with blocks you can ship today.
              </h2>
              <p className="mt-4 text-base text-foreground/80">
                Drop-in, production-ready UI for your next product. One
                workspace for your whole team to design, build, and launch.
              </p>
            </div>

            <p className="text-sm text-foreground/70">
              &copy; 2026 Acme, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
