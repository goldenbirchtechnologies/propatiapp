'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'bottom-sheet' | 'drawer';
  showClose?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  footer?: React.ReactNode;
}

interface BottomSheetProps extends Omit<ModalProps, 'variant'> {
  snapPoints?: ('bottom' | 'center' | 'top')[];
  defaultSnapPoint?: 'bottom' | 'center' | 'top';
  showDragIndicator?: boolean;
  disableDrag?: boolean;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onOpenChange, children, title, description, size = 'md', variant = 'default', showClose = true, closeOnOverlayClick = true, closeOnEscape = true, className, contentClassName, headerClassName, footerClassName, footer }, ref) => {
    const sizeClasses = {
      sm: 'max-w-[380px]',
      md: 'max-w-[500px]',
      lg: 'max-w-[680px]',
      xl: 'max-w-[880px]',
      full: 'max-w-[95vw]',
    };

    const handleOverlayClick = (event: React.MouseEvent) => {
      if (closeOnOverlayClick && event.target === event.currentTarget) {
        onOpenChange(false);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    return (
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-zinc-950/55 supports-[backdrop-filter]:backdrop-blur-[3px]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          )}
          onClick={handleOverlayClick}
        />
        <DialogPrimitive.Content
          ref={ref as unknown}
          className={cn(
            'fixed z-50 bg-background border border-border/90',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            variant === 'default' && 'rounded-[1.125rem] shadow-[0_8px_30px_rgb(0,0,0,0.14)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[min(90dvh,52rem)] overflow-hidden',
            variant === 'bottom-sheet' && 'bottom-0 left-0 right-0 rounded-t-[1.125rem] shadow-[0_-8px_30px_rgb(0,0,0,0.14)] max-h-[92dvh]',
            variant === 'drawer' && 'right-0 top-0 bottom-0 rounded-l-[1.125rem] shadow-[-8px_0_30px_rgb(0,0,0,0.14)] h-full max-h-full',
            sizeClasses[size],
            className
          )}
          onKeyDown={handleKeyDown}
        >
          <div className={cn('flex flex-col', contentClassName)}>
            {(title || description || showClose) && (
              <div className={cn('flex items-start justify-between gap-4 border-b border-border/70 px-5 py-4 sm:px-6', headerClassName)}>
                <div className="flex-1">
                  {title && (
                    <DialogPrimitive.Title className="font-heading text-[1.0625rem] font-semibold leading-6 tracking-[-0.01em]" style={{ color: 'var(--text)' }}>
                      {title}
                    </DialogPrimitive.Title>
                  )}
                  {description && (
                    <DialogPrimitive.Description className="mt-1 text-[0.8125rem] leading-5" style={{ color: 'var(--muted)' }}>
                      {description}
                    </DialogPrimitive.Description>
                  )}
                </div>
                {showClose && (
                  <DialogPrimitive.Close asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </DialogPrimitive.Close>
                )}
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {children}
            </div>
            {footer && (
              <div className={cn('flex flex-col-reverse items-stretch justify-end gap-2 border-t border-border/70 bg-muted/20 p-4 sm:flex-row sm:items-center sm:px-6', footerClassName)}>
                {footer}
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    );
  }
);
Modal.displayName = 'Modal';

const BottomSheet = React.forwardRef<HTMLDialogElement, BottomSheetProps>(
  ({
    open,
    onOpenChange,
    children,
    title,
    description,
    snapPoints = ['bottom', 'center', 'top'],
    defaultSnapPoint = 'bottom',
    showDragIndicator = true,
    disableDrag = false,
    showClose = true,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    className,
    contentClassName,
    headerClassName,
    footer,
  }, ref) => {
    const [snapPoint, setSnapPoint] = React.useState(defaultSnapPoint);
    const [dragOffset, setDragOffset] = React.useState(0);
    const [isDragging, setIsDragging] = React.useState(false);
    const startY = React.useRef(0);

    const snapPointHeights = {
      bottom: '35vh',
      center: '60vh',
      top: '90vh',
    };

    const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
      if (disableDrag) return;
      setIsDragging(true);
      startY.current = 'touches' in e ? e.touches[0].clientY : e.clientY;
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleDragMove, { passive: false });
      document.addEventListener('touchend', handleDragEnd);
    };

    const handleDragMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const delta = startY.current - clientY;
      setDragOffset((prev) => Math.max(-500, Math.min(500, prev + delta)));
      startY.current = clientY;
    };

    const handleDragEnd = () => {
      if (!isDragging) return;
      setIsDragging(false);
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);

      // Snap to nearest point
      const heights = snapPoints.map((p) => parseInt(snapPointHeights[p]));
      const currentHeight = parseInt(snapPointHeights[snapPoint]) - dragOffset;
      const nearest = heights.reduce((prev, curr) => Math.abs(curr - currentHeight) < Math.abs(prev - currentHeight) ? curr : prev);
      const nearestPoint = snapPoints[heights.indexOf(nearest)];
      setSnapPoint(nearestPoint);
      setDragOffset(0);
    };

    const handleOverlayClick = (event: React.MouseEvent) => {
      if (closeOnOverlayClick && event.target === event.currentTarget) {
        onOpenChange(false);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    const currentHeight = snapPointHeights[snapPoint];
    const transform = isDragging ? `translateY(${dragOffset}px)` : '';

    return (
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-zinc-950/55 supports-[backdrop-filter]:backdrop-blur-[3px]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          )}
          onClick={handleOverlayClick}
        />
        <DialogPrimitive.Content
          ref={ref as unknown}
          className={cn(
            'fixed z-50 bottom-0 left-0 right-0 bg-background border-t border-border',
            'rounded-t-[1.125rem] shadow-[0_-8px_30px_rgb(0,0,0,0.14)] max-h-[92dvh]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
            className
          )}
          onKeyDown={handleKeyDown}
          style={{ height: `calc(${currentHeight} + env(safe-area-inset-bottom))`, transform }}
        >
          <div className={cn('flex flex-col h-full', contentClassName)}>
            {(showDragIndicator || title || description || showClose) && (
              <div
                className={cn(
                  'flex items-center justify-between gap-4 border-b border-border/70 px-5 py-4',
                  'touch-none select-none',
                  headerClassName
                )}
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart as unknown}
              >
                {showDragIndicator && (
                  <div className="flex-1 flex justify-center">
                    <div className="w-10 h-1.5 bg-muted rounded-full" />
                  </div>
                )}
                <div className="flex-1">
                  {title && (
                    <DialogPrimitive.Title className="font-heading text-lg font-semibold text-center" style={{ color: 'var(--text)' }}>
                      {title}
                    </DialogPrimitive.Title>
                  )}
                  {description && (
                    <DialogPrimitive.Description className="text-sm mt-1 text-center" style={{ color: 'var(--muted)' }}>
                      {description}
                    </DialogPrimitive.Description>
                  )}
                </div>
                {showClose && (
                  <DialogPrimitive.Close asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </DialogPrimitive.Close>
                )}
              </div>
            )}
            <div className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                  {children}
                </div>
              </ScrollArea>
            </div>
            {footer && (
              <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
                {footer}
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    );
  }
);
BottomSheet.displayName = 'BottomSheet';

const Drawer = React.forwardRef<HTMLDialogElement, ModalProps>(
  ({ open, onOpenChange, children, title, description, size = 'lg', showClose = true, closeOnOverlayClick = true, closeOnEscape = true, className, contentClassName, headerClassName, footerClassName, footer }, ref) => {
    const handleOverlayClick = (event: React.MouseEvent) => {
      if (closeOnOverlayClick && event.target === event.currentTarget) {
        onOpenChange(false);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    const sizeClasses = {
      sm: 'w-72',
      md: 'w-96',
      lg: 'w-[400px]',
      xl: 'w-[480px]',
      full: 'w-full',
    };

    return (
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-zinc-950/55 supports-[backdrop-filter]:backdrop-blur-[3px]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          )}
          onClick={handleOverlayClick}
        />
        <DialogPrimitive.Content
          ref={ref as unknown}
          className={cn(
            'fixed z-50 right-0 top-0 bottom-0 bg-background border-l border-border/90 rounded-l-[1.125rem]',
            'shadow-[-8px_0_30px_rgb(0,0,0,0.14)]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
            sizeClasses[size],
            className
          )}
          onKeyDown={handleKeyDown}
        >
          <div className={cn('flex flex-col h-full', contentClassName)}>
            {(title || description || showClose) && (
              <div className={cn('flex items-start justify-between gap-4 border-b border-border/70 px-5 py-4 sm:px-6', headerClassName)}>
                <div className="flex-1">
                  {title && (
                    <DialogPrimitive.Title className="font-heading text-lg font-semibold" style={{ color: 'var(--text)' }}>
                      {title}
                    </DialogPrimitive.Title>
                  )}
                  {description && (
                    <DialogPrimitive.Description className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                      {description}
                    </DialogPrimitive.Description>
                  )}
                </div>
                {showClose && (
                  <DialogPrimitive.Close asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </DialogPrimitive.Close>
                )}
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {children}
            </div>
            {footer && (
              <div className={cn('flex flex-col-reverse items-stretch justify-end gap-2 border-t border-border/70 bg-muted/20 p-4 sm:flex-row sm:items-center sm:px-6', footerClassName)}>
                {footer}
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    );
  }
);
Drawer.displayName = 'Drawer';

export { Modal, BottomSheet, Drawer };

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'default',
  isLoading = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onConfirm: () => Promise<void> | void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'default' | 'destructive';
  isLoading?: boolean;
}) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} onClick={handleConfirm} disabled={isLoading} loading={isLoading}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel = 'OK',
  isLoading = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onConfirm: () => void;
  confirmLabel?: string;
  isLoading?: boolean;
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="sm"
      footer={
        <Button onClick={() => { onConfirm(); onOpenChange(false); }} disabled={isLoading} loading={isLoading}>
          {confirmLabel}
        </Button>
      }
    />
  );
}
