"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  FileText,
  Home,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Megaphone,
  Pencil,
  Plus,
  Search,
  Star,
  Store,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ErrorDialog, SuccessDialog } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import FeeBreakdown from "./FeeBreakdown";
import ShortletDetails, { type ShortletDetailsValue } from "./ShortletDetails";

type ListingUnit = {
  id: string;
  listingId: string;
  unitNumber: string;
  buildingName: string | null;
  type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  sizeSqm: string | null;
  rent: string;
  cautionDeposit: string | null;
  serviceCharge: string | null;
  listingTitle: string;
  listingType: string;
  propertyType: string | null;
  address: string;
  area: string;
  state: string;
};
type Props = {
  listings: Array<{
    id: string;
    title: string;
    address: string;
    area: string;
    state: string;
    listingType: string;
    propertyType: string | null;
  }>;
  vacantUnits: ListingUnit[];
  registeredSpaces?: Array<{
    id: string;
    name: string;
    identifier: string;
    capacity: number | null;
    propertyId: string;
    property: { name: string; address: string; city: string; state: string; category: string };
    category: { spaceType: string };
  }>;
  initialUnitId?: string;
  initialSpaceId?: string;
  basePath?: string;
  newPropertyHref?: string;
  propertiesHref?: string;
  successHref?: string;
  publishBlocked?: boolean;
};
const schema = z.object({
  title: z.string().min(5, "Give the listing a clear title").max(100),
  description: z
    .string()
    .min(50, "Add at least 50 characters so buyers can understand the property")
    .max(5000),
  listingType: z.enum(["rent", "sale", "short_let", "share", "commercial"]),
  propertyType: z
    .enum([
      "apartment",
      "house",
      "duplex",
      "land",
      "office",
      "shop",
      "warehouse",
    ])
    .optional(),
  address: z.string().min(5, "Address is required"),
  area: z.string().min(2, "Area is required"),
  state: z.string().min(2),
  price: z.number().positive("Enter a price greater than 0"),
  pricePeriod: z.enum(["night", "month", "year", "total"]).optional(),
  cautionDeposit: z.number().nonnegative().optional(),
  serviceCharge: z.number().nonnegative().optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  toilets: z.number().int().nonnegative().optional(),
  sizeSqm: z.number().positive().optional(),
  furnished: z.boolean().default(false),
  amenities: z.array(z.string()).default([]),
});
type FormValues = z.infer<typeof schema>;
const categories = [
  { id: "rent", label: "Rent", description: "Long-term rental", icon: Home },
  {
    id: "sale",
    label: "Buy / sell",
    description: "Transfer ownership",
    icon: CircleDollarSign,
  },
  {
    id: "short_let",
    label: "Shortlet",
    description: "Nightly accommodation",
    icon: Star,
  },
  {
    id: "commercial",
    label: "Commercial",
    description: "Shop, office or business",
    icon: Store,
  },
  {
    id: "share",
    label: "Room share",
    description: "Shared accommodation",
    icon: BedDouble,
  },
] as const;
const amenities = [
  "Parking",
  "Water supply",
  "Security",
  "Electricity",
  "Generator",
  "Air conditioning",
  "Internet",
  "Swimming pool",
  "Gym",
  "Elevator",
  "Balcony",
  "Fitted kitchen",
];
const naira = (n: number) =>
  `₦${Number.isFinite(n) ? n.toLocaleString("en-NG") : "0"}`;
function Section({
  id,
  icon: Icon,
  title,
  hint,
  children,
}: {
  id: string;
  icon: typeof Home;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-xl border border-zinc-200 bg-white dark:border-white/[0.08] dark:bg-zinc-900"
    >
      <div className="flex items-start gap-3 border-b border-zinc-200 px-5 py-4 dark:border-white/[0.08]">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {hint}
          </p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function AddListingClient({
  listings: _listings,
  vacantUnits,
  registeredSpaces = [],
  initialUnitId = "",
  initialSpaceId = "",
  basePath = "/dashboard/landlord",
  newPropertyHref,
  propertiesHref,
  successHref,
  publishBlocked = false,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedUnitId, setSelectedUnitId] = useState(initialUnitId);
  const [selectedSpaceId, setSelectedSpaceId] = useState(initialSpaceId);
  const [query, setQuery] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorDialog, setErrorDialog] = useState<string | null>(null);
  const [successRoute, setSuccessRoute] = useState<string | null>(null);
  const [showShortletDetails, setShowShortletDetails] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [shortletDetails, setShortletDetails] = useState<ShortletDetailsValue>(
    {},
  );
  const [images, setImages] = useState<
    { id: string; url: string; file: File }[]
  >([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      title: "",
      description: "",
      listingType: "rent",
      propertyType: "apartment",
      address: "",
      area: "",
      state: "Lagos",
      price: 0,
      pricePeriod: "month",
      bedrooms: 0,
      bathrooms: 0,
      toilets: 0,
      furnished: false,
      amenities: [],
    },
  });
  const type = useWatch({ control: form.control, name: "listingType" });
  const values = useWatch({ control: form.control });
  const unit = vacantUnits.find((item) => item.id === selectedUnitId);
  // Every listing starts from one property-register inventory selector.
  // The API still accepts unitId and spaceId so existing records remain compatible.
  const needsUnit = true;
  const filteredUnits = useMemo(
    () =>
      vacantUnits.filter((item) =>
        `${item.listingTitle} ${item.area} ${item.unitNumber}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [vacantUnits, query],
  );
  const filteredSpaces = useMemo(
    () => registeredSpaces.filter((item) => `${item.property.name} ${item.name} ${item.identifier} ${item.property.city}`.toLowerCase().includes(query.toLowerCase())),
    [registeredSpaces, query],
  );
  const hasSelectedInventory = Boolean(selectedUnitId || selectedSpaceId);
  const shortletReady =
    type !== "short_let" ||
    (images.length >= 5 &&
      Boolean(shortletDetails.privacy_type) &&
      Boolean(shortletDetails.guests_count) &&
      Boolean(shortletDetails.beds_count));
  const completed = [
    Boolean(hasSelectedInventory || !needsUnit),
    Boolean(values.title && (values.description?.length ?? 0) >= 50),
    Boolean(values.address && values.area),
    Boolean(values.price && values.price > 0),
    type === "short_let" ? shortletReady : images.length > 0,
  ].filter(Boolean).length;
  const readiness = Math.round((completed / 5) * 100);
  const stepIds = useMemo(
    () => [
      "category",
      "property",
      "media",
      "details",
      "pricing",
      ...(type === "short_let" ? ["shortlet-details"] : []),
      "location",
      "features",
      "marketing",
    ],
    [type],
  );
  const progressStep =
    currentStep <= 3 ? 0 : currentStep <= 6 ? 1 : currentStep <= 7 ? 2 : 3;

  // The form is intentionally presented as one continuous page. Keep the
  // footer navigation in sync when the user reaches a section by scrolling
  // directly to it instead of using the footer button.
  useEffect(() => {
    let frame = 0;
    const syncStepToViewport = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const anchor = 180;
        let visibleStep = 0;
        stepIds.forEach((id, index) => {
          const section = document.getElementById(id);
          if (section && section.getBoundingClientRect().top <= anchor) {
            visibleStep = index;
          }
        });
        setCurrentStep((previous) => (previous === visibleStep ? previous : visibleStep));
      });
    };

    syncStepToViewport();
    window.addEventListener("scroll", syncStepToViewport, { passive: true });
    window.addEventListener("resize", syncStepToViewport);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", syncStepToViewport);
      window.removeEventListener("resize", syncStepToViewport);
    };
  }, [stepIds]);

  useEffect(() => {
    const raw = window.localStorage.getItem("propatibox:list-draft");
    if (raw) {
      try {
        const draft = JSON.parse(raw);
        form.reset(draft.values);
        setSelectedUnitId(draft.selectedUnitId || "");
        setShortletDetails(draft.shortletDetails || {});
        setShowShortletDetails(Boolean(draft.showShortletDetails));
        setSavedAt(draft.savedAt || null);
      } catch {
        /* stale drafts are safe to ignore */
      }
    }
  }, [form]);
  useEffect(() => {
    if (!unit) return;
    form.setValue("title", unit.listingTitle);
    form.setValue(
      "listingType",
      (unit.listingType || "rent") as FormValues["listingType"],
    );
    form.setValue(
      "propertyType",
      (unit.propertyType || "apartment") as FormValues["propertyType"],
    );
    form.setValue("address", unit.address);
    form.setValue("area", unit.area);
    form.setValue("state", unit.state || "Lagos");
    form.setValue("price", Number(unit.rent || 0));
    form.setValue(
      "cautionDeposit",
      unit.cautionDeposit ? Number(unit.cautionDeposit) : undefined,
    );
    form.setValue(
      "serviceCharge",
      unit.serviceCharge ? Number(unit.serviceCharge) : undefined,
    );
    form.setValue("bedrooms", unit.bedrooms ?? 0);
    form.setValue("bathrooms", unit.bathrooms ?? 0);
    form.setValue("sizeSqm", unit.sizeSqm ? Number(unit.sizeSqm) : undefined);
  }, [unit, form]);
  useEffect(() => {
    if (type === "short_let") form.setValue("pricePeriod", "night");
    else if (form.getValues("pricePeriod") === "night")
      form.setValue("pricePeriod", type === "sale" ? "total" : "month");
  }, [type, form]);
  useEffect(() => {
    // Shortlet-specific fields should be available immediately after the
    // category is selected, including when the user scrolls instead of using
    // the footer navigation.
    setShowShortletDetails(type === "short_let");
  }, [type]);
  const saveLocal = () => {
    const now = new Date().toISOString();
    window.localStorage.setItem(
      "propatibox:list-draft",
      JSON.stringify({
        values: form.getValues(),
        selectedUnitId,
        selectedSpaceId,
        shortletDetails,
        showShortletDetails,
        savedAt: now,
      }),
    );
    setSavedAt(now);
    toast({
      title: "Draft saved",
      description: "Your progress is stored on this device.",
    });
  };
  const addFiles = (list: FileList | File[]) => {
    const all = Array.from(list);
    const valid = all
      .filter(
        (file) =>
          file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024,
      )
      .slice(0, 10 - images.length);
    setImages((prev) => [
      ...prev,
      ...valid.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        url: URL.createObjectURL(file),
        file,
      })),
    ]);
    if (valid.length < all.length)
      toast({
        title: "Some photos were skipped",
        description: "Use JPG, PNG or WebP images under 10MB each.",
        variant: "destructive",
      });
  };
  const uploadImages = async (listingId: string) => {
    for (const [index, item] of images.entries()) {
      const body = new FormData();
      body.append("file", item.file);
      body.append("setCover", String(index === 0));
      await fetch(`/api/listings/${listingId}/images`, {
        method: "POST",
        body,
      });
    }
  };
  const goToNext = async () => {
    const stepId = stepIds[currentStep];
    let valid = true;
    if (stepId === "property") valid = !needsUnit || Boolean(selectedUnitId);
    if (stepId === "media")
      valid = type === "short_let" ? images.length >= 5 : images.length > 0;
    if (stepId === "details") valid = await form.trigger(["title"]);
    if (stepId === "pricing") valid = await form.trigger(["price"]);
    if (stepId === "location") valid = await form.trigger(["address", "area"]);
    if (stepId === "marketing") valid = await form.trigger(["description"]);
    if (stepId === "shortlet-details") valid = shortletReady;
    if (!valid) {
      toast({
        title: "Complete this step first",
        description:
          stepId === "property"
            ? "Select available property inventory."
            : stepId === "media"
              ? type === "short_let"
                ? "Add at least 5 photos."
                : "Add a cover photo."
              : "Fill in the required fields marked in red.",
        variant: "destructive",
      });
      document
        .getElementById(stepId)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const nextIndex = Math.min(currentStep + 1, stepIds.length - 1);
    if (stepIds[nextIndex] === "shortlet-details") setShowShortletDetails(true);
    setCurrentStep(nextIndex);
    window.setTimeout(
      () =>
        document
          .getElementById(stepIds[nextIndex])
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      0,
    );
  };
  const submit = async (status: "active" | "draft") => {
    const valid = await form.trigger();
    if (!valid || (needsUnit && !hasSelectedInventory) || !shortletReady) {
      toast({
        title: "A few details are missing",
        description:
          type === "short_let" && images.length < 5
            ? "Shortlet listings need at least 5 photos."
            : needsUnit && !hasSelectedInventory
              ? "Choose available property inventory first."
              : "Review the highlighted fields before continuing.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const base = form.getValues();
      const payload =
        type === "short_let"
          ? {
              listingType: "short_let",
              status,
              title: base.title.slice(0, 50),
              description: shortletDetails.stay_description || base.description,
              amenities: base.amenities,
              address: base.address,
              location: {
                formatted_address: base.address,
                coordinates: shortletDetails.location
                  ? {
                      lat: shortletDetails.location.lat,
                      lng: shortletDetails.location.lng,
                    }
                  : { lat: 6.5244, lng: 3.3792 },
                show_precise_location:
                  shortletDetails.location?.show_precise_location ?? true,
              },
              property_structure:
                shortletDetails.property_structure ?? "apartment",
              privacy_type: shortletDetails.privacy_type ?? "entire_place",
              floor_plan: {
                guests_count: shortletDetails.guests_count ?? 1,
                bedrooms_count: base.bedrooms ?? 0,
                beds_count: shortletDetails.beds_count ?? base.bedrooms ?? 1,
                bathrooms_count:
                  base.bathrooms && base.bathrooms >= 0.5
                    ? base.bathrooms
                    : 0.5,
              },
              photos: images.map((image, index) => ({
                photo_id: image.id,
                url: image.url,
                is_cover: index === 0,
                order: index,
              })),
              house_rules: shortletDetails.house_rules,
              highlights: shortletDetails.highlights,
              bedroom_furnishings: shortletDetails.bedroom_furnishings,
              booking_model: shortletDetails.booking_model,
              pricing: {
                currency: "NGN",
                base_price: base.price,
                weekend_pricing: shortletDetails.weekend_pricing,
              },
              discounts: shortletDetails.discounts,
              safety_disclosures: shortletDetails.safety_disclosures,
              unitId: selectedUnitId || undefined,
              spaceId: selectedSpaceId || undefined,
            }
          : {
              ...base,
              status,
              unitId: selectedUnitId || undefined,
              spaceId: selectedSpaceId || undefined,
              amenities: base.amenities || [],
            };
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok)
        throw new Error(
          data?.message || data?.error || "We could not save this listing.",
        );
      if (images.length) await uploadImages(data.id);
      window.localStorage.removeItem("propatibox:list-draft");
      setSuccessRoute(successHref ?? `${basePath}/properties/${data.id}`);
    } catch (error) {
      setErrorDialog(
        error instanceof Error
          ? error.message
          : "We could not save this listing.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  if (!vacantUnits.length && !registeredSpaces.length)
    return (
      <div className="mx-auto max-w-3xl py-10">
        <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center dark:border-white/[0.08] dark:bg-zinc-900">
          <Building2 className="mx-auto h-10 w-10 text-emerald-600" />
          <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-white">
            Register property inventory before listing
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
            List to Marketplace uses your property register to prevent duplicate
            records. Add a property with at least one available space to continue.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild>
              <Link href={newPropertyHref ?? `${basePath}/properties/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Add property
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={propertiesHref ?? `${basePath}/properties`}>
                View properties
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  return (
    <div className="min-h-full pb-28 text-zinc-900 dark:text-white">
      <header className="border-b border-zinc-200 bg-white px-4 py-5 dark:border-white/[0.08] dark:bg-zinc-950 sm:px-6">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <Link href={basePath} className="hover:text-emerald-600">
              Landlord dashboard
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span>List to Marketplace</span>
          </div>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                List to Marketplace
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
                Create a clear, verified listing from a vacant unit in your
                property register.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500">
                {savedAt
                  ? `Saved ${new Date(savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : "Not saved yet"}
              </span>
              <Button variant="outline" size="sm" onClick={saveLocal}>
                <Check className="mr-2 h-4 w-4" />
                Save draft
              </Button>
            </div>
          </div>
          <nav
            aria-label="Listing progress"
            className="mt-6 flex max-w-3xl items-center gap-2 overflow-x-auto pb-1"
          >
            {[
              "Property details",
              "Pricing & terms",
              "Features",
              "Review & publish",
            ].map((step, index) => (
              <div
                key={step}
                className="flex min-w-max items-center gap-2 text-xs"
              >
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold ${index <= progressStep ? "bg-emerald-600 text-white" : "border border-zinc-300 text-zinc-500 dark:border-zinc-700"}`}
                >
                  {index + 1}
                </span>
                <span className={index === progressStep ? "font-medium" : "text-zinc-500"}>
                  {step}
                </span>
                {index < 3 && (
                  <span className="mx-1 h-px w-8 bg-zinc-200 dark:bg-zinc-800" />
                )}
              </div>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto grid max-w-[1320px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          <Section
            id="category"
            icon={Store}
            title="What are you listing?"
            hint="The category controls the fields, pricing language and publishing checks."
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {categories.map(({ id, label, description, icon: Icon }) => {
                const active = type === id;
                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => form.setValue("listingType", id)}
                    className={`rounded-lg border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${active ? "border-emerald-600 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-500/10" : "border-zinc-200 hover:border-emerald-400 dark:border-zinc-800"}`}
                    aria-pressed={active}
                  >
                    <Icon
                      className={`h-5 w-5 ${active ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500"}`}
                    />
                    <span className="mt-3 block text-sm font-semibold">
                      {label}
                    </span>
                    <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
                      {description}
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>
          <Section
            id="property"
            icon={Building2}
            title="Select property inventory"
            hint="Choose one available space from your property register."
          >
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by property, area or unit"
                className="pl-9"
              />
            </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {filteredUnits.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => { setSelectedUnitId(item.id); setSelectedSpaceId(""); }}
                    className={`flex items-start gap-3 rounded-lg border p-3 text-left transition ${selectedUnitId === item.id ? "border-emerald-600 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-500/10" : "border-zinc-200 hover:border-emerald-400 dark:border-zinc-800"}`}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-zinc-100 dark:bg-zinc-800">
                      <Building2 className="h-4 w-4 text-zinc-500" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {item.listingTitle}
                      </span>
                      <span className="mt-0.5 block text-xs text-zinc-500">
                        Unit {item.unitNumber} · {item.area}, {item.state}
                      </span>
                      <span className="mt-1 block text-xs text-emerald-700 dark:text-emerald-400">
                        Available · {item.bedrooms ?? 0} bed ·{" "}
                        {item.bathrooms ?? 0} bath
                      </span>
                    </span>
                    {selectedUnitId === item.id && (
                      <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-emerald-600" />
                    )}
                  </button>
                ))}
                {filteredSpaces.map((item) => (
                  <button type="button" key={item.id} onClick={() => { setSelectedSpaceId(item.id); setSelectedUnitId(""); form.setValue("title", `${item.property.name} - ${item.name}`); form.setValue("address", item.property.address); form.setValue("area", item.property.city); form.setValue("state", item.property.state); }} className={`flex items-start gap-3 rounded-lg border p-3 text-left transition ${selectedSpaceId === item.id ? "border-emerald-600 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-500/10" : "border-zinc-200 hover:border-emerald-400 dark:border-zinc-800"}`}>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"><Store className="h-4 w-4" /></span><span className="min-w-0"><span className="block truncate text-sm font-medium">{item.property.name}</span><span className="mt-0.5 block text-xs text-zinc-500">{item.category.spaceType} · {item.identifier}</span><span className="mt-1 block text-xs text-emerald-700 dark:text-emerald-400">Available · {item.property.city}, {item.property.state}</span></span>{selectedSpaceId === item.id && <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-emerald-600" />}
                  </button>
                ))}
              </div>
              {!filteredUnits.length && !filteredSpaces.length && (
                <p className="mt-3 text-sm text-zinc-500">No available property inventory matches that search.</p>
              )}
            {unit && (
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Prefilled from{" "}
                {unit.listingTitle}, unit {unit.unitNumber}. You can adjust the
                editable marketing fields below.
              </div>
            )}
          </Section>
          <Section
            id="media"
            icon={ImageIcon}
            title="Photos"
            hint="Add up to 10 images. The first image is used as the marketplace cover."
          >
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                addFiles(event.dataTransfer.files);
              }}
              className="rounded-lg border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700"
            >
              <Upload className="mx-auto h-6 w-6 text-emerald-600" />
              <p className="mt-2 text-sm font-medium">
                Drop photos here or browse your files
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                JPG, PNG or WebP · up to 10MB each · {images.length}/10 added
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => fileInput.current?.click()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Choose photos
              </Button>
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(event) => {
                  if (event.target.files) addFiles(event.target.files);
                  event.currentTarget.value = "";
                }}
              />
            </div>
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      if (dragIndex === null || dragIndex === index) return;
                      setImages((current) => {
                        const next = [...current];
                        const [moved] = next.splice(dragIndex, 1);
                        next.splice(index, 0, moved);
                        return next;
                      });
                      setDragIndex(null);
                    }}
                    className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800"
                  >
                    <img
                      src={image.url}
                      alt={`Listing photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {index === 0 && (
                      <span className="absolute left-2 top-2 rounded bg-zinc-950/75 px-2 py-1 text-[10px] font-medium text-white">
                        <Star className="mr-1 inline h-3 w-3" />
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      aria-label={`Remove photo ${index + 1}`}
                      onClick={() =>
                        setImages((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                      className="absolute right-2 top-2 rounded bg-white/90 p-1.5 text-zinc-700 opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>
          <Section
            id="details"
            icon={FileText}
            title="Property details"
            hint="We prefilled registered information where possible. Edit only the details buyers need to see."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="field-label">
                  Listing title <span className="text-red-600">Required</span>
                </span>
                <Input
                  {...form.register("title")}
                  placeholder="e.g. Bright 3-bed apartment in Lekki Phase 1"
                />
                {form.formState.errors.title && (
                  <span className="field-error">
                    {form.formState.errors.title.message}
                  </span>
                )}
              </label>
              <label>
                <span className="field-label">Property type</span>
                <select
                  {...form.register("propertyType")}
                  className="field-select"
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="duplex">Duplex</option>
                  <option value="land">Land</option>
                  <option value="office">Office</option>
                  <option value="shop">Shop</option>
                  <option value="warehouse">Warehouse</option>
                </select>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <label>
                  <span className="field-label">Beds</span>
                  <Input
                    type="number"
                    min="0"
                    {...form.register("bedrooms", { valueAsNumber: true })}
                  />
                </label>
                <label>
                  <span className="field-label">Baths</span>
                  <Input
                    type="number"
                    min="0"
                    {...form.register("bathrooms", { valueAsNumber: true })}
                  />
                </label>
                <label>
                  <span className="field-label">Toilets</span>
                  <Input
                    type="number"
                    min="0"
                    {...form.register("toilets", { valueAsNumber: true })}
                  />
                </label>
              </div>
              <label>
                <span className="field-label">Floor area (sqm)</span>
                <Input
                  type="number"
                  min="0"
                  {...form.register("sizeSqm", { valueAsNumber: true })}
                />
              </label>
              <label>
                <span className="field-label">Furnishing</span>
                <select
                  {...form.register("furnished", {
                    setValueAs: (value) => value === "true",
                  })}
                  className="field-select"
                >
                  <option value="false">Unfurnished</option>
                  <option value="true">Furnished</option>
                </select>
              </label>
            </div>
          </Section>
          <Section
            id="pricing"
            icon={CircleDollarSign}
            title={`${type === "sale" ? "Sale" : type === "short_let" ? "Shortlet" : type === "commercial" ? "Commercial" : type === "share" ? "Room share" : "Rental"} pricing & terms`}
            hint="Charges are shown separately so everyone knows what is due and who pays it."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="field-label">
                  {type === "sale"
                    ? "Asking price"
                    : type === "short_let"
                      ? "Nightly rate"
                      : "Price"}{" "}
                  <span className="text-red-600">Required</span>
                </span>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-zinc-500">
                    ₦
                  </span>
                  <Input
                    type="number"
                    min="0"
                    className="pl-7"
                    {...form.register("price", { valueAsNumber: true })}
                  />
                </div>
                {form.formState.errors.price && (
                  <span className="field-error">
                    {form.formState.errors.price.message}
                  </span>
                )}
              </label>
              <label>
                <span className="field-label">Payment frequency</span>
                <select
                  {...form.register("pricePeriod")}
                  className="field-select"
                >
                  {type === "short_let" ? (
                    <option value="night">Per night</option>
                  ) : type === "sale" ? (
                    <option value="total">One-time purchase</option>
                  ) : (
                    <>
                      <option value="month">Per month</option>
                      <option value="year">Per year</option>
                    </>
                  )}
                </select>
              </label>
              {type !== "sale" && (
                <>
                  <label>
                    <span className="field-label">Refundable deposit</span>
                    <Input
                      type="number"
                      min="0"
                      {...form.register("cautionDeposit", {
                        valueAsNumber: true,
                      })}
                    />
                  </label>
                  <label>
                    <span className="field-label">Service charge</span>
                    <Input
                      type="number"
                      min="0"
                      {...form.register("serviceCharge", {
                        valueAsNumber: true,
                      })}
                    />
                  </label>
                </>
              )}
              <div className="md:col-span-2">
                <FeeBreakdown
                  monthlyRent={values.price ?? 0}
                  pricePeriod={values.pricePeriod}
                  listingType={type}
                />
              </div>
            </div>
          </Section>
          {type === "short_let" && showShortletDetails && (
            <ShortletDetails
              value={shortletDetails}
              onChange={setShortletDetails}
            />
          )}
          <Section
            id="location"
            icon={MapPin}
            title="Location"
            hint="Use the registered property address. Choose what should be visible publicly."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="field-label">
                  Street address <span className="text-red-600">Required</span>
                </span>
                <Input
                  aria-invalid={Boolean(form.formState.errors.address)}
                  {...form.register("address")}
                />
                {form.formState.errors.address && (
                  <span className="field-error">
                    {form.formState.errors.address.message}
                  </span>
                )}
              </label>
              <label>
                <span className="field-label">
                  Area / neighbourhood{" "}
                  <span className="text-red-600">Required</span>
                </span>
                <Input
                  aria-invalid={Boolean(form.formState.errors.area)}
                  {...form.register("area")}
                />
                {form.formState.errors.area && (
                  <span className="field-error">
                    {form.formState.errors.area.message}
                  </span>
                )}
              </label>
              <label>
                <span className="field-label">State</span>
                <Input {...form.register("state")} />
              </label>
            </div>
          </Section>
          <Section
            id="features"
            icon={Home}
            title="Amenities & features"
            hint="Select what is genuinely available at this property."
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {amenities.map((amenity) => {
                const active = (values.amenities || []).includes(amenity);
                return (
                  <button
                    type="button"
                    key={amenity}
                    onClick={() =>
                      form.setValue(
                        "amenities",
                        active
                          ? (values.amenities || []).filter(
                              (item) => item !== amenity,
                            )
                          : [...(values.amenities || []), amenity],
                      )
                    }
                    className={`rounded-md border px-3 py-2 text-left text-sm ${active ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-300" : "border-zinc-200 dark:border-zinc-800"}`}
                  >
                    <span className="mr-2 inline-block h-3 w-3 rounded-sm border align-[-1px]" />
                    {amenity}
                  </button>
                );
              })}
            </div>
          </Section>
          <Section
            id="marketing"
            icon={Megaphone}
            title="Marketing information"
            hint="Be specific about the home, the neighbourhood and what makes it a good fit."
          >
            <label>
              <span className="field-label">
                Description <span className="text-red-600">Required</span>
              </span>
              <Textarea
                rows={6}
                maxLength={5000}
                placeholder="Describe the property, light, layout, access, neighbourhood and nearby landmarks…"
                {...form.register("description")}
              />
              <span className="mt-1 block text-right text-xs text-zinc-500">
                {values.description?.length || 0}/5,000
              </span>
              {form.formState.errors.description && (
                <span className="field-error">
                  {form.formState.errors.description.message}
                </span>
              )}
            </label>
          </Section>
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-white/[0.08] dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Listing readiness</h2>
                <span className="text-sm font-semibold text-emerald-600">
                  {readiness}%
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all"
                  style={{ width: `${readiness}%` }}
                />
              </div>
              <div className="mt-4 space-y-3">
                {[
                  ["Property selected", Boolean(hasSelectedInventory || !needsUnit)],
                  [
                    "Property details",
                    Boolean(values.title && (values.description?.length ?? 0) >= 50),
                  ],
                  ["Location", Boolean(values.address && values.area)],
                  ["Pricing", Boolean(values.price && values.price > 0)],
                  ["Cover photo", images.length > 0],
                ].map(([label, ok]) => (
                  <div
                    key={String(label)}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span
                      className={`grid h-4 w-4 place-items-center rounded-full ${ok ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" : "border border-zinc-300 text-transparent dark:border-zinc-700"}`}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                    <span
                      className={
                        ok
                          ? "text-zinc-700 dark:text-zinc-300"
                          : "text-zinc-500"
                      }
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("pricing")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="mt-5 flex items-center gap-1 text-xs font-medium text-emerald-600"
              >
                Preview financial breakdown <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            {unit && (
              <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-white/[0.08] dark:bg-zinc-900">
                <p className="text-xs font-medium text-zinc-500">
                  Selected unit
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {unit.listingTitle}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Unit {unit.unitNumber} · {unit.area}, {unit.state}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-zinc-200 pt-3 text-xs dark:border-zinc-800">
                  <span>
                    <BedDouble className="mb-1 h-3.5 w-3.5 text-zinc-500" />
                    {unit.bedrooms ?? 0} beds
                  </span>
                  <span>
                    <Bath className="mb-1 h-3.5 w-3.5 text-zinc-500" />
                    {unit.bathrooms ?? 0} baths
                  </span>
                  <span>
                    <CircleDollarSign className="mb-1 h-3.5 w-3.5 text-zinc-500" />
                    {naira(Number(unit.rent))}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("property")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-emerald-600"
                >
                  <Pencil className="h-3 w-3" />
                  Change unit
                </button>
              </div>
            )}
          </div>
        </aside>
      </main>
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-white/[0.08] dark:bg-zinc-950/95">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-3">
          <p className="hidden text-xs text-zinc-500 sm:block">
            {publishBlocked
              ? "Onboarding is incomplete; this will remain a draft."
              : `${completed}/5 readiness checks complete`}
          </p>
          <div className="ml-auto flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {completed < 5 ||
            (type === "short_let" && !showShortletDetails) ? (
              <Button type="button" onClick={goToNext}>
                {type === "short_let" && !showShortletDetails
                  ? "Next: shortlet details"
                  : "Next"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => submit(publishBlocked ? "draft" : "active")}
                disabled={submitting}
              >
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {publishBlocked ? "Save draft" : "Review & publish"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      <ErrorDialog
        open={Boolean(errorDialog)}
        onOpenChange={(open) => !open && setErrorDialog(null)}
        title="Could not save listing"
        description={errorDialog || "Review the listing details and try again."}
      />
      <SuccessDialog
        open={Boolean(successRoute)}
        onOpenChange={(open) => !open && setSuccessRoute(null)}
        onAction={() => successRoute && router.push(successRoute)}
        title={publishBlocked ? "Draft saved" : "Listing published"}
        description={
          publishBlocked
            ? "Your listing is saved as a draft while onboarding is completed."
            : "Your listing is now ready for the next marketplace step."
        }
        actionLabel="View listing"
      />
    </div>
  );
}
