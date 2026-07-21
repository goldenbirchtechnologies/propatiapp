"use client";

import { useSearchParams } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
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
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/dashboard";

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your PROPATI account</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <SignIn
              appearance={{
                elements: {
                  formButtonPrimary: 'btn-primary',
                  card: 'shadow-lg border border-border rounded-xl p-6',
                  headerTitle: 'font-bold text-xl text-foreground',
                  headerSubtitle: 'text-muted-foreground',
                },
              }}
              routing="path"
              path="/sign-in"
              fallbackRedirectUrl={redirectUrl}
            />
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
}
