"use client";

import SignupForm from "@/components/signup-form";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <span className="text-xl font-bold tracking-tight text-primary">
            PROPATI
          </span>
        </Link>
        <SignupForm />
      </div>
    </div>
  );
}
