'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Star, Image as ImageIcon } from 'lucide-react';
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

  // Auto-open the file picker once the upload area appears
  useEffect(() => {
    if (showUpload) {
      // Next frame so the input is mounted
      setTimeout(openFilePicker, 0);
    }
  }, [showUpload]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Add some photos of your place</h2>
      <p className="text-sm text-muted-foreground">You need at least 5 photos. The first photo will be your cover photo.</p>

      {!showUpload ? (
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <ImageIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{value.length} photo{value.length !== 1 ? 's' : ''} uploaded</p>
              <p className="text-xs text-muted-foreground">{value.length < 5 ? `${5 - value.length} more needed` : 'Minimum met'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-xs hover:bg-muted"
          >
            <Upload className="size-4" />
            Add photos
          </button>
        </div>
      ) : (
        <Card className="p-4 space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files); }}
            className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition ${
              dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/30'
            }`}
            onClick={openFilePicker}
          >
            <ImageIcon className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Drag and drop photos here, or click to browse</p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/*"
              className="sr-only"
              onChange={(e) => processFiles(e.target.files)}
            />
          </div>

          {uploading && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {value.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {value.map((photo) => (
                <div key={photo.photo_id} className="relative group">
                  <img
                    src={photo.url}
                    alt=""
                    className="w-24 h-24 object-cover rounded-md border-2"
                    style={{ borderColor: photo.is_cover ? 'rgb(var(--color-primary))' : undefined }}
                  />
                  {photo.is_cover && (
                    <div className="absolute top-1 left-1">
                      <Star className="size-4 text-yellow-500 fill-yellow-500" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removePhoto(photo.photo_id); }}
                    className="absolute top-1 right-1 bg-destructive text-red-500-foreground rounded-full size-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="size-3" />
                  </button>
                  {!photo.is_cover && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setCover(photo.photo_id); }}
                      className="absolute bottom-1 right-1 bg-background/80 rounded-full size-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      title="Set as cover"
                    >
                      <Star className="size-3 text-muted-foreground" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{value.length} photo{value.length !== 1 ? 's' : ''} uploaded</span>
            <div className="flex items-center gap-2">
              {value.length < 5 && <Badge variant="outline" className="text-xs">{5 - value.length} more needed</Badge>}
              {value.length >= 5 && <Badge variant="default" className="text-xs">Minimum met</Badge>}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setShowUpload(false); }} disabled={uploading}>
              Done
            </Button>
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setShowUpload(false); }} disabled={uploading}>
              Close
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export function validate(data: unknown): string[] {
  const errors: string[] = [];
  const photos = Array.isArray(data) ? data : [];
  if (photos.length < 5) {
    errors.push(`At least 5 photos are required (${photos.length} uploaded)`);
  }
  return errors;
}

export function getData(): { value: PhotoItem[] } {
  return { value: [] };
}
