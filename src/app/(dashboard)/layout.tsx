import Link from 'next/link';
import { 
  Home, Menu, X, User, LogOut, LayoutDashboard, Search, 
  Building2, Shield, MessageSquare, Settings, Bell, DollarSign, 
  FileText, Wrench, AlertTriangle, Users, Flag, CreditCard 
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth, useUser } from '@clerk/nextjs';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Properties', href: '/dashboard/properties', icon: Building2 },
  { name: 'Rent Collection', href: '/dashboard/rent', icon: DollarSign },
  { name: 'Verification', href: '/dashboard/verification', icon: Shield },
  { name: 'Agreements', href: '/dashboard/agreements', icon: FileText },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
];

const tenantNavigation = [
  { name: 'Find Property', href: '/tenant/search', icon: Search },
  { name: 'My Applications', href: '/tenant/applications', icon: FileText },
  { name: 'Payments', href: '/tenant/payments', icon: DollarSign },
  { name: 'Agreements', href: '/tenant/agreements', icon: FileText },
  { name: 'Maintenance', href: '/tenant/maintenance', icon: Wrench },
  { name: 'Messages', href: '/tenant/messages', icon: MessageSquare },
  { name: 'Profile', href: '/tenant/profile', icon: User },
];

const agentNavigation = [
  { name: 'Pipeline', href: '/agent/pipeline', icon: Building2 },
  { name: 'My Listings', href: '/agent/listings', icon: Home },
  { name: 'Inspections', href: '/agent/inspections', icon: Shield },
  { name: 'Commissions', href: '/agent/commissions', icon: DollarSign },
  { name: 'Profile', href: '/agent/profile', icon: User },
];

const adminNavigation = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Verification Queue', href: '/admin/verification', icon: Shield },
  { name: 'Flags & Reports', href: '/admin/flags', icon: Flag },
  { name: 'Disputes', href: '/admin/disputes', icon: AlertTriangle },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Revenue', href: '/admin/revenue', icon: DollarSign },
];

const emNavigation = [
  { name: 'Portfolio', href: '/estate-manager/portfolio', icon: Building2 },
  { name: 'Rent Ledger', href: '/estate-manager/ledger', icon: DollarSign },
  { name: 'Maintenance', href: '/estate-manager/maintenance', icon: Wrench },
  { name: 'Team', href: '/estate-manager/team', icon: Users },
  { name: 'Reports', href: '/estate-manager/reports', icon: FileText },
  { name: 'Billing', href: '/estate-manager/billing', icon: CreditCard },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine user role from Clerk metadata (would be synced in real app)
  const userRole = (user?.publicMetadata?.role as string) || 'tenant';

  const getNavigation = () => {
    switch (userRole) {
      case 'landlord':
      case 'estate_manager':
        return navigation;
      case 'tenant':
        return tenantNavigation;
      case 'agent':
        return agentNavigation;
      case 'admin':
        return adminNavigation;
      default:
        return navigation;
    }
  };

  const navItems = getNavigation();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
              <Home className="h-6 w-6" />
              PROPATI
            </Link>
            <button
              className="lg:hidden p-2 rounded-md text-muted-foreground hover:bg-accent"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.imageUrl || ''} alt={user?.fullName || ''} />
                    <AvatarFallback>{user?.fullName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left truncate">
                    <p className="font-medium truncate">{user?.fullName || 'User'}</p>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {userRole.replace('_', ' ')}
                    </Badge>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => window.location.href = `/api/auth/sign-out?redirect_url=/`}
                  className="text-destructive focus:text-destructive flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 lg:px-8">
          <button
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:bg-accent"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1" />

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
              3
            </span>
          </Button>

          {/* User Menu (mobile fallback) */}
          <div className="lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.imageUrl || ''} alt={user?.fullName || ''} />
                    <AvatarFallback>{user?.fullName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => window.location.href = `/api/auth/sign-out?redirect_url=/`}
                  className="text-destructive focus:text-destructive flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}