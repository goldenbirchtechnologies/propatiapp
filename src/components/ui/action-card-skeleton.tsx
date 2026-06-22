import { cn } from "@/lib/utils";

// Simple skeleton for the action cards used in the admin dashboard
export const ActionCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-card p-4 sm:p-5 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  </div>
);
