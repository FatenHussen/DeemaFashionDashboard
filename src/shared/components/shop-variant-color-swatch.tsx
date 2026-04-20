import { cn } from '@/utils/utils';

import { hexForegroundOnBackground, normalizeHexColorForCss } from '@/utils/shop-variant-image';

// ----------------------------------------------------------------------

type ShopVariantColorSwatchProps = {
  hex: string;
  className?: string;
  /** Chip / list row */
  size?: 'sm' | 'md' | 'lg';
};

export function ShopVariantColorSwatch({ hex, className, size = 'md' }: ShopVariantColorSwatchProps) {
  const normalized = normalizeHexColorForCss(hex);
  const fg = hexForegroundOnBackground(normalized);
  const raw = hex.trim();
  const label = raw.startsWith('#') ? raw.toUpperCase() : `#${raw.toUpperCase().replace(/^#/, '')}`;

  const sizeClass =
    size === 'sm'
      ? 'h-4 min-w-[2.6rem] text-[7px]'
      : size === 'lg'
        ? 'h-8 min-w-[3.75rem] text-[10px]'
        : 'h-7 min-w-[3.25rem] text-[9px]';

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md border border-border/70 px-1 font-mono font-semibold leading-none tabular-nums',
        sizeClass,
        className
      )}
      style={{ backgroundColor: normalized, color: fg }}
      title={label}
    >
      {label}
    </span>
  );
}
