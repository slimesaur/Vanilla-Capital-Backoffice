'use client';

import {
  useCallback,
  useRef,
  type PointerEventHandler,
  type RefObject,
} from 'react';

const SWIPE_THRESHOLD_PX = 48;

type Args = {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
};

/**
 * Horizontal pointer swipe (mouse drag + touch) on a surface. Ignores mostly-vertical moves.
 */
export function useCarouselSwipe(
  ref: RefObject<HTMLElement | null>,
  { onSwipeLeft, onSwipeRight }: Args
) {
  const startX = useRef(0);
  const startY = useRef(0);
  const activePointer = useRef<number | null>(null);

  const onPointerDown: PointerEventHandler<HTMLElement> = useCallback(
    (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      activePointer.current = e.pointerId;
      startX.current = e.clientX;
      startY.current = e.clientY;
      ref.current?.setPointerCapture(e.pointerId);
    },
    [ref]
  );

  const endSwipe: PointerEventHandler<HTMLElement> = useCallback(
    (e) => {
      if (activePointer.current !== e.pointerId) return;
      try {
        ref.current?.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      activePointer.current = null;

      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;
      if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
      if (Math.abs(dy) > Math.abs(dx) * 0.85) return;

      if (dx < 0) onSwipeLeft();
      else onSwipeRight();
    },
    [onSwipeLeft, onSwipeRight, ref]
  );

  const resetPointer: PointerEventHandler<HTMLElement> = useCallback(
    (e) => {
      if (activePointer.current === e.pointerId) {
        try {
          ref.current?.releasePointerCapture(e.pointerId);
        } catch {
          /* noop */
        }
        activePointer.current = null;
      }
    },
    [ref]
  );

  return {
    onPointerDown,
    onPointerUp: endSwipe,
    onPointerCancel: resetPointer,
    onLostPointerCapture: resetPointer,
  };
}
