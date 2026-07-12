"use client";

import { SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Search, Handshake, Building } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field";

type Role = "landlord" | "tenant" | "agent" | "estate_manager";

const roles: {
  id: Role;
  label: string;
  subtitle: string;
  Icon: React.ElementType;
}[] = [
  { id: "landlord", label: "Landlord", subtitle: "I own properties", Icon: Building2 },
  { id: "tenant", label: "Tenant", subtitle: "I'm looking for a home", Icon: Search },
  { id: "agent", label: "Agent", subtitle: "I help people find homes", Icon: Handshake },
  { id: "estate_manager", label: "Estate Manager", subtitle: "I manage property portfolios", Icon: Building },
];

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showClerk, setShowClerk] = useState(false);

  function handleContinue() {
    if (!selectedRole) return;
    sessionStorage.setItem("propati_pending_role", selectedRole);
    setShowClerk(true);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-0 bg-transparent shadow-none ring-0">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>Choose your role to get started</CardDescription>
        </CardHeader>
        <CardContent>
          {!showClerk ? (
            <FieldGroup>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((role) => (
                  <Button
                    key={role.id}
                    variant={selectedRole === role.id ? "default" : "outline"}
                    className="flex flex-col items-center justify-center gap-2 py-4 h-auto"
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <role.Icon className="size-5" />
                    <span className="text-sm font-medium">{role.label}</span>
                    <span className="text-[11px] text-muted-foreground">{role.subtitle}</span>
                  </Button>
                ))}
              </div>
              <FieldDescription className="text-center">Select one role to continue.</FieldDescription>
              <Button type="button" className="w-full" disabled={!selectedRole} onClick={handleContinue}>
                Continue
              </Button>
            </FieldGroup>
          ) : (
            <FieldGroup>
              <SignUp
                appearance={{
                  elements: {
                    formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
                    card: "shadow-lg border border-border rounded-xl",
                    headerTitle: "font-bold text-xl text-foreground",
                    headerSubtitle: "text-muted-foreground",
                  },
                }}
                routing="path"
                path="/signup"
                fallbackRedirectUrl="/onboarding"
                signInUrl="/login"
              />
            </FieldGroup>
          )}
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By continuing you agree to our{" "}
        <Link href="#" className="underline">Terms of Service</Link>{" "}
        and{" "}
        <Link href="#" className="underline">Privacy Policy</Link>
        . Already have an account?{" "}
        <Button variant="link" className="px-0" asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </FieldDescription>
    </div>
  );
}
