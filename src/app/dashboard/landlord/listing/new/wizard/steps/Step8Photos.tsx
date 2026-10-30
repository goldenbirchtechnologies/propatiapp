'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Star, Image as ImageIcon, CloudUpload } from 'lucide-react';
import type { PhotoItem } from '../types';

export interface Step8Props {
  value?: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
}

export default function Step8Photos({ value = [], onChange }: Step8Props) {
  const [dragOver, setDragOver] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    setShowUpload(false);
    setUploading(true);
    setProgress(0);

    const newPhotos: PhotoItem[] = Array.from(files).map((file, idx) => ({
      photo_id: `photo_${Date.now()}_${idx}`,
      url: URL.createObjectURL(file),
      is_cover: value.length === 0 && idx === 0,
      order: value.length + idx,
    }));

    let p = 0;
    const tick = () => {
      p = Math.min(p + Math.floor(Math.random() * 18 + 8), 100);
      setProgress(p);
      if (p < 100) {
        setTimeout(tick, 200);
      } else {
        setUploading(false);
      }
    };
    tick();

    onChange([...value, ...newPhotos]);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [value, onChange]);

  const setCover = (photoId: string) => {
    onChange(value.map((p) => ({ ...p, is_cover: p.photo_id === photoId })));
  };

  const removePhoto = (photoId: string) => {
    const next = value.filter((p) => p.photo_id !== photoId);
    if (next.length > 0 && !next.some((p) => p.is_cover)) {
      next[0].is_cover = true;
    }
    onChange(next);
  };

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  useEffect(() => {
    if (showUpload) {
      setTimeout(openFilePicker, 0);
    }
  }, [showUpload]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold tracking-wider uppercase text-primary dark:text-[#4edea3]">Step 08 / Architectural Gallery</span>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Media & High-Resolution Asset Library</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Arrange gallery order and designate primary hero syndicate thumbnail.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-600 dark:text-zinc-400">Storage: {value.length} of 20 used</span>
          <Button variant="outline" className="border-zinc-200 dark:border-white/[0.08]">Bulk Upload Zip</Button>
        </div>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files); }}
        className={`w-full p-10 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all border-2 border-dashed ${
          dragOver ? 'border-primary bg-primary/5' : 'border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.04]'
        }`}
        onClick={openFilePicker}
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
          <CloudUpload className="size-8" />
        </div>
        <div className="font-semibold text-zinc-900 dark:text-white">Drag & Drop Architectural High-Resolution RAW/JPEG</div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mt-1">Minimum 2400x1600px. High dynamic range photos. Max 25MB per asset.</p>
        <span className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium shadow-sm">Select From Computer</span>
        <input ref={inputRef} type="file" multiple accept="image/*" className="sr-only" onChange={(e) => processFiles(e.target.files)} />
      </div>

      {uploading && (
        <div className="text-xs text-zinc-600 dark:text-zinc-400">Uploading... {progress}%</div>
      )}

      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {value.map((photo, idx) => (
            <div key={photo.photo_id} className="relative group rounded-xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08]">
              <div className="h-36 w-full overflow-hidden">
                <img src={photo.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              {photo.is_cover && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-primary text-white text-xs font-semibold">COVER HERO</div>
              )}
              {!photo.is_cover && (
                <button type="button" onClick={() => setCover(photo.photo_id)} className="absolute top-2 left-2 px-2 py-0.5 rounded bg-white/80 dark:bg-zinc-900/80 text-xs font-medium text-zinc-700 dark:text-zinc-300 opacity-0 group-hover:opacity-100 transition">Set cover</button>
              )}
              <button type="button" onClick={() => removePhoto(photo.photo_id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-red-500 text-white rounded-full size-6 flex items-center justify-center">
                <X className="size-3" />
              </button>
              <div className="p-2 flex items-center justify-between text-xs text-zinc-900 dark:text-white">
                <span className="truncate">{String(idx + 1).padStart(2, '0')}_photo.jpg</span>
                <ImageIcon className="size-4 text-zinc-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!showUpload && value.length === 0 && null}
    </div>
  );
}

export function validate(_data: unknown): string[] {
  return [];
}

export function getData(): { photos?: PhotoItem[] } {
  return {};
}