import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { mergeClasses } from 'minimal-shared/utils';

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  fullWidth?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  className?: string;
  disableBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
}

const maxWidthClasses = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function Modal({
  open,
  onClose,
  children,
  fullWidth,
  maxWidth = 'sm',
  className,
  disableBackdropClick,
  disableEscapeKeyDown,
}: ModalProps) {
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

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4"
      onClick={!disableBackdropClick && onClose ? onClose : undefined}
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />
      <div
        className={mergeClasses([
          'relative z-10 w-full rounded-lg bg-background shadow-xl',
          maxWidth ? maxWidthClasses[maxWidth] : '',
          fullWidth ? 'w-full' : '',
          className,
        ])}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
