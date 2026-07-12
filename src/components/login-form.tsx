"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
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

export default function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/dashboard";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function resolve() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) setReady(true);
          return;
        }
        const data = await res.json();
        const role = data?.user?.role;
        if (!cancelled) setReady(true);
        if (!role) return;
        const paths: Record<string, string> = {
          landlord: "/dashboard/landlord",
          tenant: "/dashboard/tenant",
          agent: "/dashboard/agent",
          admin: "/admin",
          estate_manager: "/dashboard/estate-manager",
          realtor: "/dashboard/realtor",
        };
        const mapped = paths[role] || "/dashboard/tenant";
        if (window.location.pathname === "/login") {
          router.replace(mapped);
        }
      } catch {
        if (!cancelled) setReady(true);
      }
    }
    resolve();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="border-0 bg-transparent shadow-none ring-0">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Checking your account...</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <FieldDescription className="text-center">Loading sign-in...</FieldDescription>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-0 bg-transparent shadow-none ring-0">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your PROPATI account</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <SignIn
              appearance={{
                elements: {
                  formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
                  card: "shadow-lg border border-border rounded-xl",
                  headerTitle: "font-bold text-xl text-foreground",
                  headerSubtitle: "text-muted-foreground",
                },
              }}
              routing="path"
              path="/login"
              redirectUrl={redirectUrl}
              signUpUrl="/signup"
            />
          </FieldGroup>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Protected by PROPATI auth. Issues signing in?{" "}
        <Button variant="link" className="px-0" asChild>
          <a href="/signup">Create an account</a>
        </Button>
      </FieldDescription>
    </div>
  );
}
