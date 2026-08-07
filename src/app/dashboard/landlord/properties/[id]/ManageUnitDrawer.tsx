"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import {
  Building2,
  CheckCircle2,
  X,
  Plus,
  FileText,
  Calendar,
  Wrench,
  Users,
  Settings2,
  Rocket,
  Image as ImageIcon,
  Trash2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

type Unit = {
  id: string;
  unitNumber: string;
  buildingName: string | null;
  type: string;
  listingType: string;
  pricePeriod: string | null;
  rent: number;
  cautionDeposit: number | null;
  serviceCharge: number | null;
  status: string;
  occupancy: string;
  isListed: boolean;
  bedrooms: number;
  bathrooms: number;
  sizeSqm: number | null;
};

type Listing = {
  id: string;
  title: string;
};

type ManageUnitDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: Unit;
  listing: Listing;
};

function formatCurrency(value: number) {
  return `₦${Number(value).toLocaleString()}`;
}

function formatListingType(value?: string) {
  const map: Record<string, string> = {
    rent: "For Rent",
    sale: "For Sale",
    short_let: "Short-Let",
    share: "Shared",
    commercial: "Commercial",
    unlisted: "Unlisted",
  };
  if (!value) return "For Rent";
  return map[value] || value;
}

export default function ManageUnitDrawer({ open, onOpenChange, unit, listing }: ManageUnitDrawerProps) {
  const [activeTab, setActiveTab] = useState<string>("specs");

  const tabs = [
    { id: "specs", label: "Unit Specs & Pricing", icon: <Settings2 className="h-4 w-4" /> },
    { id: "occupancy", label: "Occupancy & Lease", icon: <Users className="h-4 w-4" /> },
    { id: "marketplace", label: "Marketplace Listing", icon: <Rocket className="h-4 w-4" /> },
    { id: "maintenance", label: "Maintenance & Logs", icon: <Wrench className="h-4 w-4" /> },
  ];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-outline-variant p-4">
          <div>
            <h2 className="font-headline-sm text-headline-sm font-bold text-primary">
              Manage Unit {unit.unitNumber}
            </h2>
            <p className="text-xs text-on-surface-variant">{listing.title}</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2 border-b border-outline-variant px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-on-surface-variant"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "specs" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">
                    Unit Number
                  </label>
                  <p className="font-medium text-primary">Unit {unit.unitNumber}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">
                    Type
                  </label>
                  <p className="font-medium text-primary">{unit.type}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">
                    Bedrooms
                  </label>
                  <p className="font-medium text-primary">{unit.bedrooms}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">
                    Bathrooms
                  </label>
                  <p className="font-medium text-primary">{unit.bathrooms}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">
                    Size
                  </label>
                  <p className="font-medium text-primary">{unit.sizeSqm ? `${unit.sizeSqm} sqm` : "N/A"}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">
                    Listing Intent
                  </label>
                  <span className="tag bg-muted text-foreground border-outline-variant">
                    {formatListingType(unit.listingType)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">
                    Rent
                  </label>
                  <p className="font-medium text-primary">{formatCurrency(unit.rent)}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">
                    Price Period
                  </label>
                  <p className="font-medium text-primary">{unit.pricePeriod || "month"}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">
                    Caution Deposit
                  </label>
                  <p className="font-medium text-primary">{unit.cautionDeposit ? formatCurrency(Number(unit.cautionDeposit)) : "N/A"}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">
                    Service Charge
                  </label>
                  <p className="font-medium text-primary">{unit.serviceCharge ? formatCurrency(Number(unit.serviceCharge)) : "N/A"}</p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">
                  Unit Photos
                </label>
                <div className="mt-2 rounded-lg border border-dashed border-outline-variant p-6 text-center text-sm text-muted-foreground">
                  Unit-specific photo uploads will appear here.
                </div>
              </div>
            </div>
          )}

          {activeTab === "occupancy" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${
                    unit.occupancy === "VACANT"
                      ? "bg-success/10 text-success border-success/20"
                      : unit.occupancy === "OCCUPIED"
                        ? "bg-muted text-muted-foreground border-outline-variant"
                        : "bg-warning/10 text-warning border-warning/20"
                  }`}
                >
                  {unit.occupancy}
                </span>
                <span className="tag bg-muted text-muted-foreground border-outline-variant">
                  {unit.status}
                </span>
              </div>

              {unit.occupancy === "VACANT" ? (
                <div className="space-y-2">
                  <Button asChild>
                    <Link href={`/dashboard/landlord/properties/${listing.id}/units/${unit.id}/leases/new`}>
                      <Plus className="w-4 h-4 mr-2" />
                      Move In Tenant
                    </Link>
                  </Button>
                  <p className="text-xs text-muted-foreground">Create a new lease for this unit.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4">
                    <p className="text-sm font-medium text-primary">Current Tenant</p>
                    <p className="text-xs text-muted-foreground">Tenant details will appear here.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">
                        Lease Start
                      </p>
                      <p className="text-sm text-primary">--</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">
                        Lease End
                      </p>
                      <p className="text-sm text-primary">--</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">
                        Days Remaining
                      </p>
                      <p className="text-sm text-primary">--</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">
                        Outstanding Rent
                      </p>
                      <p className="text-sm text-primary">--</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/landlord/leases?unitId=${unit.id}`}>View Lease Agreement</Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      Send Payment Reminder
                    </Button>
                    <Button variant="outline" size="sm">
                      Initiate Notice to Vacate
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "marketplace" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Marketplace Status</p>
                  <p className="text-xs text-muted-foreground">
                    {unit.isListed ? "This unit is visible on the marketplace." : "This unit is not listed."}
                  </p>
                </div>
                <span className={`tag ${unit.isListed ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-outline-variant"}`}>
                  {unit.isListed ? "Listed" : "Unlisted"}
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">
                  Listing Title
                </label>
                <p className="text-sm text-primary">
                  {listing.title} — Unit {unit.unitNumber}
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">
                  Marketing Description
                </label>
                <p className="text-sm text-muted-foreground">Unit-specific promotional copy will appear here.</p>
              </div>

              {unit.listingType === "short_let" && (
                <div className="space-y-2">
                  <p className="text-xs font-label-md uppercase tracking-wider text-on-surface-variant">
                    Short-Let Rules
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Minimum stay and availability calendar controls will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "maintenance" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-primary">Maintenance History</h3>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Log Ticket
                </Button>
              </div>
              <div className="rounded-lg border border-outline-variant p-6 text-center text-sm text-muted-foreground">
                No maintenance tickets yet.
              </div>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
