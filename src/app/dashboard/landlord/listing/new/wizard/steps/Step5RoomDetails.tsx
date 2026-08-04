'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Image as ImageIcon, Info } from 'lucide-react';
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

  const toggleFurnishing = (item: string) => {
    const next = selected.includes(item) ? selected.filter((x) => x !== item) : [...selected, item];
    setSelected(next);
    onChange({ bedroom_furnishings: next });
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newImages: PhotoItem[] = Array.from(files).map((file, idx) => ({
      photo_id: `img_${Date.now()}_${idx}`,
      url: URL.createObjectURL(file),
      is_cover: images.length === 0 && idx === 0,
      order: images.length + idx,
    }));
    const next = [...images, ...newImages];
    setImages(next);
    onChange({ space_images: next });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Bedroom furnishings</h2>
        <p className="text-sm text-muted-foreground">Select all furnishings available in the bedrooms.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FURNISHING_OPTIONS.map((opt) => (
            <label
              key={opt}
              className={`flex items-center gap-2 rounded-md border p-3 cursor-pointer transition ${
                selected.includes(opt)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/40'
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
        <p className="text-sm text-muted-foreground">Upload photos of your property (you will need at least 5 in the next step).</p>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition ${
            dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/30'
          }`}
        >
          {images.length === 0 ? (
            <>
              <ImageIcon className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Drag and drop photos here, or click to browse</p>
            </>
          ) : (
            <div className="flex flex-wrap gap-2">
              {images.map((img) => (
                <img key={img.photo_id} src={img.url} alt="" className="size-20 object-cover rounded-md" />
              ))}
            </div>
          )}
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            id="space-photos"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Label htmlFor="space-photos" className="cursor-pointer flex items-center gap-1 text-sm text-primary">
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
