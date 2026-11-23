"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheck, SlidersHorizontal, Sparkles } from "lucide-react";

export type ShortletDetailsValue = {
  property_structure?: string;
  privacy_type?: string;
  guests_count?: number;
  beds_count?: number;
  weekend_pricing?: number;
  booking_model?: string;
  bedroom_furnishings?: string[];
  house_rules?: string[];
  highlights?: string[];
  stay_description?: string;
  discounts?: Record<string, number | boolean>;
  safety_disclosures?: {
    exterior_security_camera_present: boolean;
    noise_decibel_monitor_present: boolean;
    weapons_on_property: boolean;
  };
  location?: { lat: number; lng: number; show_precise_location: boolean };
};

const furnishingOptions = [
  "Wardrobe",
  "Desk",
  "TV",
  "Safe",
  "Air conditioning",
  "Extra pillows",
  "Blankets",
  "Mosquito net",
  "Hangers",
];
const ruleOptions = [
  "No smoking",
  "No pets",
  "No parties or events",
  "No loud music after 10pm",
  "No overnight guests",
  "CCTV surveillance",
  "No illegal activities",
];
const highlightOptions = [
  "Peaceful",
  "Unique",
  "Family-friendly",
  "Stylish",
  "Central",
  "Spacious",
];

export default function ShortletDetails({
  value,
  onChange,
}: {
  value: ShortletDetailsValue;
  onChange: (next: ShortletDetailsValue) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const patch = (next: Partial<ShortletDetailsValue>) =>
    onChange({ ...value, ...next });
  const toggle = (
    key: "bedroom_furnishings" | "house_rules" | "highlights",
    item: string,
    limit?: number,
  ) => {
    const current = value[key] ?? [];
    const next = current.includes(item)
      ? current.filter((entry) => entry !== item)
      : limit && current.length >= limit
        ? current
        : [...current, item];
    patch({ [key]: next });
  };
  const discounts = value.discounts ?? {};
  const safety = value.safety_disclosures ?? {
    exterior_security_camera_present: false,
    noise_decibel_monitor_present: false,
    weapons_on_property: false,
  };
  return (
    <section
      id="shortlet-details"
      className="scroll-mt-24 rounded-xl border border-emerald-200 bg-emerald-50/40 dark:border-emerald-500/20 dark:bg-emerald-500/5"
    >
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span>
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            Shortlet stay details
          </span>
          <span className="mt-1 block text-xs text-zinc-600 dark:text-zinc-400">
            The extra information guests need before booking.
          </span>
        </span>
        <SlidersHorizontal className="h-4 w-4 text-zinc-500" />
      </button>
      {expanded && (
        <div className="space-y-5 border-t border-emerald-200 px-5 py-5 dark:border-emerald-500/20">
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="field-label">Property structure</span>
              <select
                className="field-select"
                value={value.property_structure ?? "apartment"}
                onChange={(e) => patch({ property_structure: e.target.value })}
              >
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="bed_and_breakfast">Bed & breakfast</option>
                <option value="hotel">Hotel</option>
                <option value="barn">Barn / warehouse</option>
                <option value="tent">Tent / glamping</option>
              </select>
            </label>
            <label>
              <span className="field-label">Privacy type</span>
              <select
                className="field-select"
                value={value.privacy_type ?? "entire_place"}
                onChange={(e) => patch({ privacy_type: e.target.value })}
              >
                <option value="entire_place">Entire place</option>
                <option value="private_room">Private room</option>
                <option value="shared_room">Shared room</option>
              </select>
            </label>
            <label>
              <span className="field-label">Maximum guests</span>
              <Input
                type="number"
                min="1"
                max="50"
                value={value.guests_count ?? 1}
                onChange={(e) =>
                  patch({ guests_count: Number(e.target.value) })
                }
              />
            </label>
            <label>
              <span className="field-label">Beds</span>
              <Input
                type="number"
                min="1"
                max="100"
                value={value.beds_count ?? 1}
                onChange={(e) => patch({ beds_count: Number(e.target.value) })}
              />
            </label>
            <label>
              <span className="field-label">Latitude</span>
              <Input
                type="number"
                step="any"
                placeholder="6.5244"
                value={value.location?.lat ?? ""}
                onChange={(e) =>
                  patch({
                    location: {
                      lat: Number(e.target.value),
                      lng: value.location?.lng ?? 3.3792,
                      show_precise_location:
                        value.location?.show_precise_location ?? true,
                    },
                  })
                }
              />
            </label>
            <label>
              <span className="field-label">Longitude</span>
              <Input
                type="number"
                step="any"
                placeholder="3.3792"
                value={value.location?.lng ?? ""}
                onChange={(e) =>
                  patch({
                    location: {
                      lat: value.location?.lat ?? 6.5244,
                      lng: Number(e.target.value),
                      show_precise_location:
                        value.location?.show_precise_location ?? true,
                    },
                  })
                }
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-emerald-600"
              checked={value.location?.show_precise_location ?? true}
              onChange={(e) =>
                patch({
                  location: {
                    lat: value.location?.lat ?? 6.5244,
                    lng: value.location?.lng ?? 3.3792,
                    show_precise_location: e.target.checked,
                  },
                })
              }
            />
            Show precise location to guests
          </label>
          <div>
            <p className="field-label">Bedroom furnishings</p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {furnishingOptions.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggle("bedroom_furnishings", item)}
                  className={`rounded-md border px-3 py-2 text-left text-xs ${value.bedroom_furnishings?.includes(item) ? "border-emerald-600 bg-white dark:bg-zinc-900" : "border-zinc-200 dark:border-zinc-800"}`}
                >
                  {value.bedroom_furnishings?.includes(item) ? "✓ " : ""}
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="field-label">House rules</p>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {ruleOptions.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggle("house_rules", item)}
                  className={`rounded-md border px-3 py-2 text-left text-xs ${value.house_rules?.includes(item) ? "border-emerald-600 bg-white dark:bg-zinc-900" : "border-zinc-200 dark:border-zinc-800"}`}
                >
                  {value.house_rules?.includes(item) ? "✓ " : ""}
                  {item}
                </button>
              ))}
            </div>
          </div>
          <label>
            <span className="field-label">Guest-facing stay description</span>
            <Textarea
              rows={4}
              placeholder="Describe the rooms, check-in experience and what guests should know…"
              value={String(
                (value as ShortletDetailsValue & { stay_description?: string })
                  .stay_description ?? "",
              )}
              onChange={(e) =>
                onChange({
                  ...value,
                  stay_description: e.target.value,
                } as ShortletDetailsValue)
              }
            />
          </label>
          <div>
            <p className="field-label">
              Highlights{" "}
              <span className="font-normal text-zinc-500">
                (choose up to 2)
              </span>
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {highlightOptions.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggle("highlights", item, 2)}
                  className={`rounded-md border px-3 py-2 text-left text-xs ${value.highlights?.includes(item) ? "border-emerald-600 bg-white dark:bg-zinc-900" : "border-zinc-200 dark:border-zinc-800"}`}
                >
                  {value.highlights?.includes(item) ? "✓ " : ""}
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="field-label">Booking model</span>
              <select
                className="field-select"
                value={value.booking_model ?? "review_first_3_then_instant"}
                onChange={(e) => patch({ booking_model: e.target.value })}
              >
                <option value="review_first_3_then_instant">
                  Review first 3 bookings, then instant book
                </option>
                <option value="instant_book">Instant book</option>
              </select>
            </label>
            <label>
              <span className="field-label">Weekend / peak rate</span>
              <Input
                type="number"
                min="0"
                value={value.weekend_pricing ?? ""}
                onChange={(e) =>
                  patch({
                    weekend_pricing: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
              />
            </label>
          </div>
          <div>
            <p className="field-label">Discounts</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              {[
                ["weekly_percentage", "Weekly"],
                ["monthly_percentage", "Monthly"],
                ["last_minute_percentage", "Last minute"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-xs">
                  <span>{label}</span>
                  <Input
                    className="h-9"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0%"
                    value={
                      discounts[key] === undefined ? "" : String(discounts[key])
                    }
                    onChange={(e) =>
                      patch({
                        discounts: {
                          ...discounts,
                          [key]: e.target.value ? Number(e.target.value) : 0,
                        },
                      })
                    }
                  />
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="field-label">Safety disclosures</p>
            <div className="mt-2 space-y-2">
              {[
                [
                  "exterior_security_camera_present",
                  "Exterior security cameras present",
                ],
                [
                  "noise_decibel_monitor_present",
                  "Noise decibel monitor present",
                ],
                ["weapons_on_property", "Weapons on property"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    className="accent-emerald-600"
                    checked={Boolean(safety[key as keyof typeof safety])}
                    onChange={(e) =>
                      patch({
                        safety_disclosures: {
                          ...safety,
                          [key]: e.target.checked,
                        },
                      })
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-white/70 p-3 text-xs text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-400">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            Keep safety disclosures and house rules accurate. Guests see these
            before booking.
          </div>
        </div>
      )}
    </section>
  );
}
