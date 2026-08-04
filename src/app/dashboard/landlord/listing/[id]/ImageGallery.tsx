'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Grid, ChevronLeft, ChevronRight, X } from 'lucide-react';

type Props = {
  images: string[];
};

export default function ImageGallery({ images }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const hasImages = images.length > 0;

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setIsOpen(true);
  };

  const goTo = (direction: 'prev' | 'next') => {
    setActiveIndex((prev) => {
      if (direction === 'prev') return prev === 0 ? images.length - 1 : prev - 1;
      return prev === images.length - 1 ? 0 : prev + 1;
    });
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-2xl overflow-hidden h-[380px] md:h-[450px]">
        {hasImages ? (
          <>
            <div className="md:col-span-2 relative h-full">
              <Image
                src={images[0]}
                alt="Main property view"
                fill
                priority
                className="object-cover hover:scale-[1.01] transition-transform duration-300 cursor-pointer"
                onClick={() => openLightbox(0)}
              />
            </div>
            <div className="hidden md:flex flex-col gap-3 h-full">
              <div className="relative flex-1">
                <Image
                  src={images[1] || images[0]}
                  alt="Interior view"
                  fill
                  className="object-cover hover:scale-[1.01] transition-transform duration-300 cursor-pointer"
                  onClick={() => openLightbox(1)}
                />
              </div>
              <div className="relative flex-1">
                <Image
                  src={images[2] || images[0]}
                  alt="Room view"
                  fill
                  className="object-cover hover:scale-[1.01] transition-transform duration-300 cursor-pointer"
                  onClick={() => openLightbox(2)}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="md:col-span-3 flex items-center justify-center bg-surface-container text-on-surface-variant">
            No images available
          </div>
        )}
      </div>

      {hasImages && images.length > 3 && (
        <button
          onClick={() => openLightbox(0)}
          className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-gray-800 text-xs font-semibold px-4 py-2 rounded-lg shadow hover:bg-white flex items-center gap-2 transition"
        >
          <Grid className="w-4 h-4" />
          View all photos
        </button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent showCloseButton={false} className="max-w-5xl bg-transparent border-0 shadow-none p-0">
          <div className="relative w-full aspect-video">
            <Image
              src={images[activeIndex] || images[0]}
              alt={`Photo ${activeIndex + 1}`}
              fill
              className="object-contain rounded-lg"
            />
          </div>
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => goTo('prev')}
              className="btn btn-outline btn-sm inline-flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>
            <span className="text-sm text-muted-foreground">
              {activeIndex + 1} / {images.length}
            </span>
            <button
              onClick={() => goTo('next')}
              className="btn btn-outline btn-sm inline-flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 btn btn-ghost btn-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
