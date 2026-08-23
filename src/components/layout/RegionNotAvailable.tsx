import { Globe, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface RegionNotAvailableProps {
  countryCode: string;
}

export function RegionNotAvailable({ countryCode }: RegionNotAvailableProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Globe className="h-8 w-8 text-amber-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Region Not Available</h1>
        <p className="text-muted-foreground mb-6">
          PROPATI is currently available in Nigeria only. Your account is registered in region code: <strong>{countryCode}</strong>.
        </p>
        <Link href="/" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground">
          <ArrowLeft className="h-4 w-4" /> Return Home
        </Link>
      </div>
    </div>
  );
}
