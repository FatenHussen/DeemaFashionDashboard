import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { mergeClasses } from 'minimal-shared/utils';
import { Iconify } from '@/shared/components/iconify';
import { useLocation, useNavigate } from 'react-router';

// ----------------------------------------------------------------------

export type BackButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick' | 'children'
> & {
  /** Label override — defaults to i18n `common.back`. */
  label?: string;
  /** Fallback path if there's no history entry to go back to. */
  fallbackTo?: string;
  /** Hide when the current pathname matches any of these (exact match). */
  hideOnPaths?: string[];
  /** Custom click handler — when provided, replaces the default `navigate(-1)` behavior. */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

// ----------------------------------------------------------------------

export const BackButton = forwardRef<HTMLButtonElement, BackButtonProps>(function BackButton(
  {
    label,
    fallbackTo = '/dashboard',
    hideOnPaths = ['/dashboard'],
    onClick,
    className,
    type = 'button',
    ...other
  },
  ref
) {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (hideOnPaths.includes(pathname)) return null;

  const isRtl = i18n.dir() === 'rtl';
  const resolvedLabel = label ?? t('back', { defaultValue: 'Back' });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
      return;
    }
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackTo);
    }
  };

  return (
    <button
      ref={ref}
      type={type}
      onClick={handleClick}
      aria-label={resolvedLabel}
      className={mergeClasses([
        'group inline-flex items-center gap-1.5 rounded-full',
        'border border-border/60 bg-background/60 backdrop-blur-sm',
        'px-3 h-9 text-sm font-medium text-foreground/80',
        'shadow-sm transition-all duration-200',
        'hover:border-primary/40 hover:bg-primary/5 hover:text-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1',
        'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        className,
      ])}
      {...other}
    >
      <Iconify
        icon={isRtl ? 'solar:alt-arrow-right-line-duotone' : 'solar:alt-arrow-left-line-duotone'}
        width={18}
        className="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5"
      />
      <span className="truncate">{resolvedLabel}</span>
    </button>
  );
});
