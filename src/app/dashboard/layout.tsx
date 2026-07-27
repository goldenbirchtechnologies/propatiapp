export const dynamic = 'force-dynamic';

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
