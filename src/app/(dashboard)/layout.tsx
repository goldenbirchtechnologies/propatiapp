import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isSupportedCountry } from "@/lib/countries";
import { RegionNotAvailable } from "@/components/layout/RegionNotAvailable";

export const dynamic = "force-dynamic";
export const fetchCache = "default";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const countryCode = (sessionClaims?.publicMetadata as Record<string, unknown> | undefined)?.countryCode as string | undefined;
  if (countryCode && !isSupportedCountry(countryCode)) {
    return <RegionNotAvailable countryCode={countryCode} />;
  }

  return <>{children}</>;
}
