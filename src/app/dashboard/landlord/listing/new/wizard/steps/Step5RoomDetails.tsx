'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Upload, Image as ImageIcon, X, Info } from 'lucide-react';
import type { PhotoItem } from '../types';

export interface Step5Props {
  bedroomFurnishings?: string[];
  spaceImages?: PhotoItem[];
  onChange: (data: { bedroom_furnishings?: string[]; space_images?: PhotoItem[] }) => void;
}

const FURNISHING_OPTIONS = [
  'Wardrobe',
  'Desk',
  'TV',
  'Safe',
  'Air conditioning',
  'Extra pillows',
  'Blankets',
  'Heating',
  'Mosquito net',
  'Hangers',
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
    newImages.forEach((img) => {
      progress[img.photo_id] = 0;
    });

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
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Bedroom furnishings</h2>
          <Button variant="ghost" size="sm" className="gap-1">
            <Info className="size-4" />
            Tips
          </Button>
        </div>
        <p className="text-sm text-zinc-500">Select all furnishings available in the bedrooms.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FURNISHING_OPTIONS.map((opt) => (
            <label
              key={opt}
              className={`flex items-center gap-2 rounded-md border p-3 cursor-pointer transition ${
                selected.includes(opt)
                  ? 'border-white/[0.08] bg-primary/5'
                  : 'border-white/[0.08] hover:border-white/40'
              }`}
            >
              <Checkbox
                checked={selected.includes(opt)}
                onCheckedChange={() => toggleFurnishing(opt)}
              />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Space photos</h2>
        <p className="text-sm text-zinc-500">
          Upload photos of your property (you will need at least 5 in the next step).
        </p>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files); }}
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition ${
            dragOver ? 'border-white/[0.08] bg-primary/5' : 'border-muted-foreground/30'
          }`}
        >
          {images.length === 0 ? (
            <>
              <ImageIcon className="size-8 text-zinc-500" />
              <p className="text-sm text-zinc-500">Drag and drop photos here, or click to browse</p>
            </>
          ) : (
            <div className="flex flex-wrap gap-2">
              {images.map((img) => (
                <div key={img.photo_id} className="relative">
                  <img src={img.url} alt="" className="size-20 object-cover rounded-md" />
                  <button
                    type="button"
                    onClick={() => removeImage(img.photo_id)}
                    className="absolute -top-2 -right-2 bg-destructive text-red-500-foreground rounded-full size-5 flex items-center justify-center"
                  >
                    <X className="size-3" />
                  </button>
                  {uploading && uploadProgress[img.photo_id] !== undefined && (
                    <div className="absolute inset-0 bg-background/70 rounded-md flex items-center justify-center">
                      <span className="text-xs font-medium">{uploadProgress[img.photo_id]}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            id="space-photos"
            onChange={(e) => processFiles(e.target.files)}
          />
          <Label htmlFor="space-photos" className="cursor-pointer flex items-center gap-1 text-sm text-white">
            <Upload className="size-4" /> Upload photos
          </Label>
        </div>
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
