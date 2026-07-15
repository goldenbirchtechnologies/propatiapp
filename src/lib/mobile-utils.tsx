'use client';

import { useEffect, useState, useRef, useCallback, ReactNode, CSSProperties } from 'react';

// ==================== RESPONSIVE BREAKPOINT CONSTANTS ====================

export const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const MOBILE_BREAKPOINT = BREAKPOINTS.md;
export const TABLET_BREAKPOINT = BREAKPOINTS.lg;

export type Breakpoint = keyof typeof BREAKPOINTS;

// ==================== TOUCH TARGET HELPER ====================

/**
 * Minimum touch target size following WCAG 2.5.5 (AAA) guidelines
 */
export const MIN_TOUCH_TARGET_SIZE = 44;
export const RECOMMENDED_TOUCH_TARGET_SIZE = 48;

/**
 * Ensures an element meets minimum touch target size
 * Returns inline styles to apply to the element
 */
export function getTouchTargetStyles(minSize: number = MIN_TOUCH_TARGET_SIZE): CSSProperties {
  return {
    minWidth: `${minSize}px`,
    minHeight: `${minSize}px`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}

/**
 * CSS class generator for touch targets
 */
export function touchTargetClass(minSize: number = MIN_TOUCH_TARGET_SIZE): string {
  return `inline-flex items-center justify-center min-w-[${minSize}px] min-h-[${minSize}px]`;
}

// ==================== RESPONSIVE HOOKS ====================

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
}

export function useIsTablet(): boolean {
  return useMediaQuery(
    `(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_BREAKPOINT - 1}px)`
  );
}

export function useIsDesktop(): boolean {
  return useMediaQuery(`(min-width: ${TABLET_BREAKPOINT}px)`);
}

// ==================== SWIPE GESTURE HANDLER ====================

export interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  minSwipeDistance?: number;
  maxSwipeTime?: number;
}

export interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export function useSwipe(config: SwipeConfig): SwipeHandlers {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    minSwipeDistance = 50,
    maxSwipeTime = 300,
  } = config;

  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchEnd.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return;

    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const deltaTime = Date.now() - touchStart.current.time;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Check if swipe was fast enough
    if (deltaTime > maxSwipeTime) return;

    // Horizontal swipe
    if (absDeltaX > absDeltaY && absDeltaX > minSwipeDistance) {
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }
    // Vertical swipe
    else if (absDeltaY > absDeltaX && absDeltaY > minSwipeDistance) {
      if (deltaY > 0) {
        onSwipeDown?.();
      } else {
        onSwipeUp?.();
      }
    }

    touchStart.current = null;
    touchEnd.current = null;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, minSwipeDistance, maxSwipeTime]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}

// ==================== BOTTOM SHEET COMPONENT ====================

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  snapPoints?: number[]; // Percentage heights: [25, 50, 90]
  initialSnapPoint?: number;
  className?: string;
  showHandle?: boolean;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [90],
  initialSnapPoint = 0,
  className = '',
  showHandle = true,
}: BottomSheetProps) {
  const [currentSnapPoint, setCurrentSnapPoint] = useState(initialSnapPoint);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const snapPointHeight = snapPoints[currentSnapPoint];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startY.current = e.touches[0].clientY;
    currentY.current = startY.current;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    currentY.current = e.touches[0].clientY;

    const deltaY = currentY.current - startY.current;
    if (sheetRef.current && deltaY > 0) {
      sheetRef.current.style.transform = `translateY(${deltaY}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaY = currentY.current - startY.current;
    const threshold = window.innerHeight * 0.2;

    if (sheetRef.current) {
      sheetRef.current.style.transform = '';
    }

    if (deltaY > threshold) {
      // Swipe down - close or snap to next lower point
      if (currentSnapPoint < snapPoints.length - 1) {
        setCurrentSnapPoint(currentSnapPoint + 1);
      } else {
        onClose();
      }
    } else if (deltaY < -threshold) {
      // Swipe up - snap to next higher point
      if (currentSnapPoint > 0) {
        setCurrentSnapPoint(currentSnapPoint - 1);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out ${className}`}
        style={{
          height: `${snapPointHeight}vh`,
          maxHeight: `${snapPointHeight}vh`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle */}
        {showHandle && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>
        )}

        {/* Title */}
        {title && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto h-full pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// ==================== MOBILE NAV DRAWER ====================

export interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  position?: 'left' | 'right';
  width?: string;
  className?: string;
}

export function MobileNavDrawer({
  isOpen,
  onClose,
  children,
  position = 'left',
  width = '280px',
  className = '',
}: MobileNavDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const swipeHandlers = useSwipe({
    onSwipeLeft: position === 'left' ? onClose : undefined,
    onSwipeRight: position === 'right' ? onClose : undefined,
  });

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`
          absolute top-0 bottom-0 bg-white shadow-2xl
          transition-transform duration-300 ease-out
          ${position === 'left' ? 'left-0' : 'right-0'}
          ${isOpen ? 'translate-x-0' : position === 'left' ? '-translate-x-full' : 'translate-x-full'}
          ${className}
        `}
        style={{ width }}
        {...swipeHandlers}
      >
        {children}
      </div>
    </div>
  );
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Check if device supports touch
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get safe area insets for devices with notches
 */
export function getSafeAreaInsets(): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const computedStyle = getComputedStyle(document.documentElement);

  return {
    top: parseInt(computedStyle.getPropertyValue('--sat') || '0'),
    right: parseInt(computedStyle.getPropertyValue('--sar') || '0'),
    bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0'),
    left: parseInt(computedStyle.getPropertyValue('--sal') || '0'),
  };
}

/**
 * Prevent body scroll (useful for modals/drawers)
 */
export function preventBodyScroll(prevent: boolean) {
  if (typeof document === 'undefined') return;

  if (prevent) {
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
  } else {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
}

/**
 * Detect iOS device
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown).MSStream;
}

/**
 * Detect Android device
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
}

/**
 * Get viewport height accounting for mobile browser chrome
 */
export function getViewportHeight(): number {
  if (typeof window === 'undefined') return 0;
  return window.innerHeight;
}

/**
 * Lock orientation (if supported)
 */
export async function lockOrientation(orientation: 'portrait' | 'landscape'): Promise<boolean> {
  if (typeof screen === 'undefined' || !screen.orientation || !(screen.orientation as unknown).lock) {
    return false;
  }

  try {
    await (screen.orientation as unknown).lock(orientation);
    return true;
  } catch (error) {
    console.warn('Orientation lock failed:', error);
    return false;
  }
}
