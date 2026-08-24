"use client";

import { ReactNode } from "react";
import { Clock, XCircle } from "lucide-react";

interface FeatureGateProps {
  feature: string;
  countryCode: string;
  children: ReactNode;
  fallback?: "hidden" | "coming-soon" | "disabled";
}

export function FeatureGate({ feature, countryCode, children, fallback = "coming-soon" }: FeatureGateProps) {
  // This is a server-safe placeholder; actual feature check happens server-side
  // For client-side, use the useFeature hook
  return <>{children}</>;
}

export function ComingSoonBadge({ feature, note }: { feature: string; note?: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
      <Clock className="h-3 w-3" />
      {feature} coming soon{note ? ` — ${note}` : ""}
    </div>
  );
}

export function FeatureDisabledBadge({ feature }: { feature: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
      <XCircle className="h-3 w-3" />
      {feature} not available
    </div>
  );
}
