import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { mergeClasses } from 'minimal-shared/utils';

export interface DrawerProps {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  anchor?: 'left' | 'right' | 'top' | 'bottom';
  width?: string;
  className?: string;
  disableBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
  slotProps?: {
    backdrop?: {
      invisible?: boolean;
    };
  };
}

const anchorClasses = {
  left: 'left-0 top-0 bottom-0',
  right: 'right-0 top-0 bottom-0',
  top: 'top-0 left-0 right-0',
  bottom: 'bottom-0 left-0 right-0',
};

export function Drawer({
  open,
  onClose,
  children,
  anchor = 'right',
  width = '360px',
  className,
  disableBackdropClick,
  disableEscapeKeyDown,
  slotProps,
}: DrawerProps) {
  useEffect(() => {
    if (!open || disableEscapeKeyDown) {
      return undefined;
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose, disableEscapeKeyDown]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const isVertical = anchor === 'left' || anchor === 'right';
  const drawerStyle = isVertical ? { width } : { height: width };

  const content = (
    <div
      className="fixed inset-0 z-50"
      onClick={!disableBackdropClick && onClose ? onClose : undefined}
    >
      {!slotProps?.backdrop?.invisible && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true" />
      )}
      <div
        className={mergeClasses([
          'fixed z-10 bg-background shadow-xl transition-transform',
          anchorClasses[anchor],
          className,
        ])}
        style={drawerStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

