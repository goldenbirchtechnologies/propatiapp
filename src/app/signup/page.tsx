"use client";

import SignupForm from "@/components/signup-form";
import PropatiBoxLogo from "@/components/brand/PropatiBoxLogo";

export default function SignupPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-black p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="self-center">
          <PropatiBoxLogo size="sm" />
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
