'use client';

import { useState, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Upload, Image as ImageIcon, X, Info, Plus } from 'lucide-react';
import type { PhotoItem } from '../types';

export interface Step5Props {
  bedroomFurnishings?: string[];
  spaceImages?: PhotoItem[];
  onChange: (data: { bedroom_furnishings?: string[]; space_images?: PhotoItem[] }) => void;
}

const FURNISHING_OPTIONS = [
  'Wardrobe', 'Desk', 'TV', 'Safe', 'Air conditioning', 'Extra pillows',
  'Blankets', 'Heating', 'Mosquito net', 'Hangers',
];

export default function Step5RoomDetails({ bedroomFurnishings = [], spaceImages = [], onChange }: Step5Props) {
  const [selected, setSelected] = useState<string[]>(bedroomFurnishings);
  const [images, setImages] = useState<PhotoItem[]>(spaceImages);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const toggleFurnishing = (item: string) => {
    const next = selected.includes(item) ? selected.filter((x) => x !== item) : [...selected, item];
    setSelected(next);
    onChange({ bedroom_furnishings: next });
  };

  const processFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    const newImages: PhotoItem[] = Array.from(files).map((file, idx) => ({
      photo_id: `img_${Date.now()}_${idx}`,
      url: URL.createObjectURL(file),
      is_cover: images.length === 0 && idx === 0,
      order: images.length + idx,
    }));

    const progress: Record<string, number> = {};
    newImages.forEach((img) => { progress[img.photo_id] = 0; });

    let elapsed = 0;
    const tick = () => {
      elapsed += 1;
      const nextProgress: Record<string, number> = {};
      Object.keys(progress).forEach((id) => {
        const current = progress[id];
        nextProgress[id] = current < 100 ? Math.min(current + Math.floor(Math.random() * 18 + 8), 100) : 100;
      });
      setUploadProgress(nextProgress);
      if (elapsed < 6) {
        setTimeout(tick, 250);
      } else {
        setUploadProgress({});
        setUploading(false);
      }
    };
    tick();

    const next = [...images, ...newImages];
    setImages(next);
    onChange({ space_images: next });
  }, [images, onChange]);

  const removeImage = (photoId: string) => {
    const next = images.filter((p) => p.photo_id !== photoId);
    if (next.length > 0 && !next.some((p) => p.is_cover)) {
      next[0].is_cover = true;
    }
    setImages(next);
    onChange({ space_images: next });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">Step 05 / Compartment Hierarchy</span>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Room Builder & Fixture Inventory</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Catalogue specific rooms, luxury fittings, and ensuite dimensions.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <Plus className="size-4" /> Add Another Room
        </Button>
      </div>

      <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Bedroom furnishings</h3>
          <Button variant="ghost" size="sm" className="gap-1 text-zinc-600 dark:text-zinc-400">
            <Info className="size-4" /> Tips
          </Button>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">Select all furnishings available in the bedrooms.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {FURNISHING_OPTIONS.map((opt) => (
            <label
              key={opt}
              className={`flex items-center gap-2 rounded-xl border p-3 cursor-pointer transition ${
                selected.includes(opt)
                  ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-600/5'
                  : 'border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-white/20'
              }`}
            >
              <Checkbox checked={selected.includes(opt)} onCheckedChange={() => toggleFurnishing(opt)} />
              <span className="text-sm text-zinc-900 dark:text-white">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Space photos</h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">Upload photos of your property (you will need at least 5 in the next step).</p>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files); }}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition ${
            dragOver ? 'border-emerald-600 bg-emerald-600/5' : 'border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.04]'
          }`}
        >
          {images.length === 0 ? (
            <>
              <ImageIcon className="size-8 text-zinc-600 dark:text-zinc-400" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Drag and drop photos here, or click to browse</p>
            </>
          ) : (
            <div className="flex flex-wrap gap-2 justify-center">
              {images.map((img) => (
                <div key={img.photo_id} className="relative">
                  <img src={img.url} alt="" className="size-20 object-cover rounded-lg" />
                  <button type="button" onClick={() => removeImage(img.photo_id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full size-5 flex items-center justify-center">
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => processFiles(e.target.files)} />
        </div>
        {uploading && (
          <p className="text-xs text-zinc-600 dark:text-zinc-400">Uploading... {Object.values(uploadProgress).length ? '' : ''}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { level: 'LEVEL 2 · SUITE', title: 'Master Penthouse Suite', desc: '78 sqm with wraparound terrace, walk-in closet, jacuzzi & rainfall shower.', tag: 'En-suite Jacuzzi', val: 'King Size' },
          { level: 'LEVEL 1 · LIVING', title: 'Double-Height Living Salon', desc: '120 sqm floor-to-ceiling glass wall overlooking Ikoyi bridge waters.', tag: 'Motorized Drapes', val: 'Lounge Bay' },
          { level: 'LEVEL 1 · CULINARY', title: "Chef's Gourmet Kitchen", desc: 'Quartz center island, Miele induction suite, Sub-Zero refrigeration.', tag: 'Miele Fitted', val: 'Island Bar' },
          { level: 'LEVEL 2 · WING', title: 'Executive Diplomat Wing', desc: 'Private guest suite with dedicated security intercom lock and lagoon balcony.', tag: 'En-Suite Bath', val: 'Queen Size' },
        ].map((room) => (
          <div key={room.title} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl flex flex-col justify-between gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600">{room.level}</span>
                <button type="button" className="text-zinc-400 hover:text-red-500"><X className="size-4" /></button>
              </div>
              <div className="font-semibold text-sm text-zinc-900 dark:text-white">{room.title}</div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">{room.desc}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-white/[0.08] text-xs text-zinc-600 dark:text-zinc-400">
              <span>{room.tag}</span>
              <span className="font-mono font-semibold">{room.val}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function validate(_data: unknown): string[] {
  return [];
}

export function getData(): { bedroom_furnishings?: string[]; space_images?: PhotoItem[] } {
  return {};
}