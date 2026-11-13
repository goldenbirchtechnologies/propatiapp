import { cn } from "@/lib/utils";

// Simple skeleton for the action cards used in the admin dashboard
export const ActionCardSkeleton = () => (
  <div className="bg-card text-card-foreground rounded-lg shadow-card p-4 sm:p-5 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-muted rounded-lg"></div>
      <div className="flex-1">
        <div className="h-5 bg-muted rounded w-32 mb-2"></div>
        <div className="h-3 bg-muted rounded w-full"></div>
      </div>
    </div>
  </div>
);
