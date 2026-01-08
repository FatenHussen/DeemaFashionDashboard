import { mergeClasses } from 'minimal-shared/utils';
import React, { useRef, useState, useEffect } from 'react';

export interface TooltipProps {
  title: React.ReactNode;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  arrow?: boolean;
  className?: string;
}

export function Tooltip({ title, children, placement = 'top', arrow, className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = 8;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - gap;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + gap;
        break;
      default:
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
    }

    setPosition({ top, left });
  };

  useEffect(() => {
    if (open) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
    return undefined;
  }, [open, placement]);

  const handleMouseEnter = () => setOpen(true);
  const handleMouseLeave = () => setOpen(false);

  return (
    <>
      {open && (
        <div
          ref={tooltipRef}
          className={mergeClasses([
            'fixed z-50 rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-lg',
            'pointer-events-none',
            className,
          ])}
          style={{ top: `${position.top}px`, left: `${position.left}px` }}
        >
          {title}
          {arrow && (
            <div
              className={mergeClasses([
                'absolute h-2 w-2 rotate-45 bg-gray-900',
                placement === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : undefined,
                placement === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : undefined,
                placement === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : undefined,
                placement === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : undefined,
              ])}
            />
          )}
        </div>
      )}
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </span>
    </>
  );
}

