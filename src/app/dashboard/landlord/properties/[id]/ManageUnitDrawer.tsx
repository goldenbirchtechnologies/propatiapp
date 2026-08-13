"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { DroppableArea } from "@/components/ui/droppable-area";
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
  Edit3,
  Save,
  ExternalLink,
  BarChart3,
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

function formatPriceLabel(listingType?: string) {
  const normalized = (listingType || "").toLowerCase();
  if (normalized.includes("short")) return "Nightly Rate";
  if (normalized.includes("sale")) return "Asking Price";
  return "Rent";
}

function formatPropertyType(value?: string) {
  if (!value) return "Apartment";
  const lowered = value.toLowerCase();
  const map: Record<string, string> = {
    apartment: "Apartment",
    studio: "Studio",
    commercial: "Commercial Space",
    shared: "Shared Room",
    office: "Office",
    shop: "Shop",
  };
  return map[lowered] || value;
}

function formatPricePeriod(value?: string | null) {
  if (!value) return "Per Month";
  const lowered = value.toLowerCase();
  const map: Record<string, string> = {
    month: "Per Month",
    per_month: "Per Month",
    year: "Per Year",
    per_year: "Per Year",
    night: "Per Night",
    per_night: "Per Night",
    bi_annually: "Bi-annually",
    total: "Total",
  };
  return map[lowered] || value;
}

export default function ManageUnitDrawer({ open, onOpenChange, unit, listing }: ManageUnitDrawerProps) {
  const [activeTab, setActiveTab] = useState<string>("specs");
  const [editingSpecs, setEditingSpecs] = useState(false);
  const [savingSpecs, setSavingSpecs] = useState(false);
  const [specsSaved, setSpecsSaved] = useState(false);
  const [unitPhotos, setUnitPhotos] = useState<File[]>([]);
  const [marketplaceTitle, setMarketplaceTitle] = useState(`${listing.title} — Unit ${unit.unitNumber}`);
  const [marketingDescription, setMarketingDescription] = useState("");
  const [minimumStay, setMinimumStay] = useState("1");
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [checkOutTime, setCheckOutTime] = useState("12:00");
  const [instantBooking, setInstantBooking] = useState(true);
  const [cautionDeposit, setCautionDeposit] = useState(String(unit.cautionDeposit ?? ""));

  const priceLabel = formatPriceLabel(unit.listingType);
  const isShortLet = (unit.listingType || "").toLowerCase().includes("short");
  const isForRent = (unit.listingType || "").toLowerCase().includes("rent");

  const tabs = [
    { id: "specs", label: "Unit Specs & Pricing", icon: <Settings2 className="h-4 w-4" /> },
    { id: "occupancy", label: "Occupancy & Lease", icon: <Users className="h-4 w-4" /> },
    { id: "marketplace", label: "Marketplace Listing", icon: <Rocket className="h-4 w-4" /> },
    { id: "maintenance", label: "Maintenance & Logs", icon: <Wrench className="h-4 w-4" /> },
  ];

  const handleSaveSpecs = async () => {
    setSavingSpecs(true);
    try {
      const res = await fetch(`/api/orgs/${listing.id}/units/${unit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitNumber: unit.unitNumber,
          type: unit.type,
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
          sizeSqm: unit.sizeSqm,
          listingType: unit.listingType,
          pricePeriod: unit.pricePeriod,
          rent: unit.rent,
          cautionDeposit: unit.cautionDeposit,
          serviceCharge: unit.serviceCharge,
        }),
      });
      if (!res.ok) throw new Error("Failed to save specs");
      setSpecsSaved(true);
      setEditingSpecs(false);
      setTimeout(() => setSpecsSaved(false), 2000);
    } catch (error) {
      console.error("Save specs failed:", error);
    } finally {
      setSavingSpecs(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-outline-variant p-4">
          <div>
            <h2 className="font-headline-sm text-headline-sm font-bold text-white">
              Manage Unit {unit.unitNumber}
            </h2>
            <p className="text-xs text-neutral-400">{formatPropertyType(listing.title)}</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2 border-b border-outline-variant px-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id ? "border-white text-white" : "border-transparent text-neutral-400"
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
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">Unit Specs & Pricing</h3>
                <div className="flex items-center gap-2">
                  {specsSaved && <span className="text-xs text-success">Changes saved</span>}
                  {editingSpecs ? (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => setEditingSpecs(false)} disabled={savingSpecs}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveSpecs} disabled={savingSpecs}>
                        <Save className="mr-2 h-4 w-4" />
                        {savingSpecs ? "Saving..." : "Save"}
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setEditingSpecs(true)}>
                      <Edit3 className="mr-2 h-4 w-4" /> Edit Specs
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                    Unit Number
                  </label>
                  {editingSpecs ? (
                    <input
                      className="mt-1 w-full rounded-lg border border-outline-variant bg-background p-2 text-sm"
                      value={unit.unitNumber}
                      onChange={(e) => {
                            // In a real implementation, update unit state here
                          }}
                    />
                  ) : (
                    <p className="font-medium text-white">Unit {unit.unitNumber}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                    Type
                  </label>
                  {editingSpecs ? (
                    <select
                      className="mt-1 w-full rounded-lg border border-outline-variant bg-background p-2 text-sm"
                      defaultValue={unit.type}
                    >
                      <option value="apartment">Apartment</option>
                      <option value="studio">Studio</option>
                      <option value="commercial">Commercial Space</option>
                      <option value="shared">Shared Room</option>
                    </select>
                  ) : (
                    <p className="font-medium text-white">{formatPropertyType(unit.type)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                    Bedrooms
                  </label>
                  {editingSpecs ? (
                    <input
                      type="number"
                      className="mt-1 w-full rounded-lg border border-outline-variant bg-background p-2 text-sm"
                      defaultValue={unit.bedrooms}
                    />
                  ) : (
                    <p className="font-medium text-white">{unit.bedrooms}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                    Bathrooms
                  </label>
                  {editingSpecs ? (
                    <input
                      type="number"
                      className="mt-1 w-full rounded-lg border border-outline-variant bg-background p-2 text-sm"
                      defaultValue={unit.bathrooms}
                    />
                  ) : (
                    <p className="font-medium text-white">{unit.bathrooms}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                    Size
                  </label>
                  {editingSpecs ? (
                    <input
                      type="number"
                      className="mt-1 w-full rounded-lg border border-outline-variant bg-background p-2 text-sm"
                      defaultValue={unit.sizeSqm ?? ""}
                    />
                  ) : (
                    <p className="font-medium text-white">{unit.sizeSqm ? `${unit.sizeSqm} sqm` : "N/A"}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                    Listing Intent
                  </label>
                  {editingSpecs ? (
                    <select
                      className="mt-1 w-full rounded-lg border border-outline-variant bg-background p-2 text-sm"
                      defaultValue={unit.listingType}
                    >
                      <option value="rent">For Rent</option>
                      <option value="short_let">Short-Let</option>
                      <option value="sale">For Sale</option>
                      <option value="unlisted">Unlisted</option>
                    </select>
                  ) : (
                    <span className="tag bg-muted text-foreground border-outline-variant">
                      {formatListingType(unit.listingType)}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                    {priceLabel}
                  </label>
                  {editingSpecs ? (
                    <input
                      type="number"
                      className="mt-1 w-full rounded-lg border border-outline-variant bg-background p-2 text-sm"
                      defaultValue={unit.rent}
                    />
                  ) : (
                    <p className="font-medium text-white">{formatCurrency(unit.rent)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                    Price Period
                  </label>
                  {editingSpecs ? (
                    <select
                      className="mt-1 w-full rounded-lg border border-outline-variant bg-background p-2 text-sm"
                      defaultValue={unit.pricePeriod || "month"}
                    >
                      <option value="month">Per Month</option>
                      <option value="year">Per Year</option>
                      <option value="night">Per Night</option>
                      <option value="bi_annually">Bi-annually</option>
                      <option value="total">Total</option>
                    </select>
                  ) : (
                    <p className="font-medium text-white">{formatPricePeriod(unit.pricePeriod)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                    Caution Deposit
                  </label>
                  {editingSpecs ? (
                    <input
                      type="number"
                      className="mt-1 w-full rounded-lg border border-outline-variant bg-background p-2 text-sm"
                      defaultValue={unit.cautionDeposit ?? ""}
                    />
                  ) : (
                    <p className="font-medium text-white">{unit.cautionDeposit ? formatCurrency(Number(unit.cautionDeposit)) : "N/A"}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                    Service Charge
                  </label>
                  {editingSpecs ? (
                    <input
                      type="number"
                      className="mt-1 w-full rounded-lg border border-outline-variant bg-background p-2 text-sm"
                      defaultValue={unit.serviceCharge ?? ""}
                    />
                  ) : (
                    <p className="font-medium text-white">{unit.serviceCharge ? formatCurrency(Number(unit.serviceCharge)) : "N/A"}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                  Unit Photos
                </label>
                <div className="mt-2">
                  <DroppableArea
                    accept="image/*"
                    multiple
                    maxFiles={10}
                    onFilesSelected={(files) => setUnitPhotos((prev) => [...prev, ...files])}
                    files={unitPhotos.map((file) => ({ file, progress: 0, status: "pending" as const }))}
                    onRemoveFile={(index) => setUnitPhotos((prev) => prev.filter((_, i) => i !== index))}
                  />
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
                {isShortLet && unit.occupancy === "VACANT" && (
                  <span className="text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                    Short-Let
                  </span>
                )}
              </div>

              {isShortLet ? (
                <div className="space-y-3">
                  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4">
                    <p className="text-sm font-medium text-primary mb-2">Quick Actions</p>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm">
                        <Link href={`/dashboard/landlord/properties/${listing.id}/bookings/new?unitId=${unit.id}`}>
                          <Plus className="mr-2 h-4 w-4" /> Add Booking
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/landlord/short-let`}>
                          <Calendar className="mr-2 h-4 w-4" /> Block Dates
                        </Link>
                      </Button>
                      <Button variant="secondary" size="sm" asChild>
                        <Link href={`/dashboard/landlord/short-let`}>
                          <ExternalLink className="mr-2 h-4 w-4" /> Open Short-let Calendar
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4">
                    <p className="text-sm font-medium text-primary mb-2">Current / Next Stay</p>
                    <p className="text-xs text-muted-foreground">No guest currently checked in. Next check-in: Aug 12</p>
                  </div>

                  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4">
                    <p className="text-sm font-medium text-primary mb-2">Occupancy History</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BarChart3 className="h-4 w-4" />
                      <span>85% occupied this month</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Last stay ended Aug 2, 2026</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
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
                          <p className="text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                            Lease Start
                          </p>
                          <p className="text-sm text-white">--</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                            Lease End
                          </p>
                          <p className="text-sm text-white">--</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                            Days Remaining
                          </p>
                          <p className="text-sm text-white">--</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                            Outstanding Rent
                          </p>
                          <p className="text-sm text-white">--</p>
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

              <div className="flex gap-2">
                {unit.isListed ? (
                  <Button variant="destructive" size="sm" asChild>
                    <Link href={`/dashboard/landlord/properties/${listing.id}/units/${unit.id}/unlist`}>
                      Take Off Marketplace
                    </Link>
                  </Button>
                ) : (
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/landlord/properties/${listing.id}/units/${unit.id}/list`}>
                      <Rocket className="mr-2 h-4 w-4" /> List to Marketplace
                    </Link>
                  </Button>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                  Listing Headline
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-outline-variant bg-background p-2 text-sm"
                  defaultValue={marketplaceTitle}
                  onChange={(e) => setMarketplaceTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                  Marketing Description
                </label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-outline-variant bg-background p-2 text-sm"
                  rows={4}
                  placeholder="Describe the unit features, furnishings, nearby landmarks, and what makes this stay special."
                  defaultValue={marketingDescription}
                  onChange={(e) => setMarketingDescription(e.target.value)}
                />
              </div>

              {isShortLet && (
                <div className="space-y-3 rounded-xl border border-outline-variant p-4">
                  <p className="text-xs font-label-md uppercase tracking-wider text-neutral-400">
                    Short-Let Listing Controls
                  </p>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                        Minimum Stay
                      </label>
                      <select
                        className="mt-1 w-full rounded-lg border border-outline-variant bg-background p-2 text-sm"
                        value={minimumStay}
                        onChange={(e) => setMinimumStay(e.target.value)}
                      >
                        <option value="1">1 Night</option>
                        <option value="2">2 Nights</option>
                        <option value="3">3 Nights</option>
                        <option value="7">7 Nights</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                        Check-in
                      </label>
                      <input
                        type="time"
                        className="mt-1 w-full rounded-lg border border-outline-variant bg-background p-2 text-sm"
                        value={checkInTime}
                        onChange={(e) => setCheckInTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                        Check-out
                      </label>
                      <input
                        type="time"
                        className="mt-1 w-full rounded-lg border border-outline-variant bg-background p-2 text-sm"
                        value={checkOutTime}
                        onChange={(e) => setCheckOutTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                        Instant Booking
                      </label>
                      <select
                        className="mt-1 w-full rounded-lg border border-outline-variant bg-background p-2 text-sm"
                        value={instantBooking ? "instant" : "approval"}
                        onChange={(e) => setInstantBooking(e.target.value === "instant")}
                      >
                        <option value="instant">Enabled</option>
                        <option value="approval">Require Approval</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                        Caution Deposit
                      </label>
                      <input
                        type="number"
                        className="mt-1 w-full rounded-lg border border-outline-variant bg-background p-2 text-sm"
                        value={cautionDeposit}
                        onChange={(e) => setCautionDeposit(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-label-md uppercase tracking-wider text-neutral-400">
                  Listing Media Preview
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-dashed border-outline-variant p-4 text-center text-xs text-muted-foreground">
                    Unit photos will appear here.
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <ImageIcon className="h-4 w-4" /> Set as Cover Photo
                </Button>
              </div>

              <Button variant="secondary" size="sm" className="gap-2" asChild>
                <Link href={`/dashboard/landlord/short-let`}>
                  <Calendar className="h-4 w-4" /> Open Short-let Calendar
                </Link>
              </Button>
            </div>
          )}

          {activeTab === "maintenance" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">Maintenance History</h3>
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
