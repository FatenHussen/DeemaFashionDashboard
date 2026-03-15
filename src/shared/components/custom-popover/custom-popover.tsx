import type { CustomPopoverProps } from './types';

import { createPortal } from 'react-dom';
import { useRef, useState, useEffect } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

import { Arrow } from './styles';
import { calculateAnchorOrigin } from './utils';

// ----------------------------------------------------------------------

export function CustomPopover({
  open,
  onClose,
  children,
  anchorEl,
  slotProps,
  className,
  anchorOrigin: anchorOriginProp,
  transformOrigin: transformOriginProp,
  disableBackdropClick,
  disableEscapeKeyDown,
}: CustomPopoverProps) {
  const { arrow: arrowProps, paper: paperProps } = slotProps ?? {};
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const arrowSize = arrowProps?.size ?? 14;
  const arrowOffset = arrowProps?.offset ?? 17;
  const arrowPlacement = arrowProps?.placement ?? 'top-right';

  const { paperStyles, anchorOrigin, transformOrigin } = calculateAnchorOrigin(arrowPlacement);

  const finalAnchorOrigin = anchorOriginProp || anchorOrigin;
  const finalTransformOrigin = transformOriginProp || transformOrigin;

  useEffect(() => {
    if (!open || !anchorEl) {
      return () => {
        // No cleanup needed when not open
      };
    }

    const updatePosition = () => {
      if (!anchorEl || !popoverRef.current) return;

      const anchorRect = anchorEl.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();

      // Use viewport coordinates - popover is inside a fixed container
      let top = 0;
      let left = 0;

      // Calculate vertical position based on anchor origin
      if (finalAnchorOrigin.vertical === 'top') {
        top = anchorRect.bottom + 8; // Add small gap
      } else if (finalAnchorOrigin.vertical === 'bottom') {
        top = anchorRect.top - popoverRect.height - 8; // Add small gap
      } else {
        // center
        top = anchorRect.top + anchorRect.height / 2 - popoverRect.height / 2;
      }

      // Calculate horizontal position based on anchor origin
      if (finalAnchorOrigin.horizontal === 'left') {
        left = anchorRect.left;
      } else if (finalAnchorOrigin.horizontal === 'right') {
        left = anchorRect.right - popoverRect.width;
      } else {
        // center
        left = anchorRect.left + anchorRect.width / 2 - popoverRect.width / 2;
      }

      setPosition({ top, left });
    };

    // Use double rAF to ensure DOM is laid out and popover has dimensions
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(updatePosition);
    });

    // Re-run after a tick in case initial dimensions were 0
    const timeoutId = setTimeout(updatePosition, 16);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, anchorEl, finalAnchorOrigin]);

  useEffect(() => {
    if (!open || disableEscapeKeyDown) {
      return () => {
        // No cleanup needed when not open or escape disabled
      };
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose, disableEscapeKeyDown]);

  if (!open || !anchorEl) return null;

  const content = (
    <div
      className="fixed inset-0 z-50"
      onClick={!disableBackdropClick && onClose ? onClose : undefined}
    >
      <div
        ref={popoverRef}
        className={mergeClasses([
          'absolute z-10 rounded-lg bg-background shadow-lg',
          'overflow-visible',
          '[&_ul]:min-w-[140px] [&_li]:gap-2',
          className,
          paperProps?.className,
        ])}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          ...paperStyles,
          ...paperProps?.style,
        }}
        onClick={(e) => e.stopPropagation()}
        {...paperProps}
      >
        {!arrowProps?.hide && (
          <Arrow
            size={arrowSize}
            offset={arrowOffset}
            placement={arrowPlacement}
            className={arrowProps?.className}
          />
        )}

        {children}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
