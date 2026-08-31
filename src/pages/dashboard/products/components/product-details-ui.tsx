import type { ReactNode } from 'react';

import { Iconify } from '@/shared/components/iconify';
import {
  type DualCurrencyInput,
  resolveDualCurrencyDisplay,
} from '@/pages/dashboard/products/utils/dual-currency-display';

import { Box, Typography } from 'src/shared/ui';

// ----------------------------------------------------------------------

export function ProductDetailsPageShell({ children }: { children: ReactNode }) {
  return (
    <Box className="relative w-full overflow-x-hidden bg-background">
      <Box className="relative w-full px-3 pb-6 pt-2 sm:px-4 lg:px-5">{children}</Box>
    </Box>
  );
}

type SectionProps = {
  title: string;
  icon: string;
  children: ReactNode;
  headerRight?: ReactNode;
  accent?: 'default' | 'primary';
  className?: string;
};

export function ProductDetailsSection({
  title,
  icon,
  children,
  headerRight,
  accent = 'default',
  className,
}: SectionProps) {
  const accentBorder =
    accent === 'primary' ? 'border-primary/20 ring-1 ring-primary/10' : 'border-border/60';

  return (
    <Box
      className={`overflow-hidden rounded-2xl border bg-card shadow-sm ${accentBorder} ${className ?? ''}`}
    >
      <Box className="flex items-center justify-between gap-3 border-b border-border/50 bg-muted/20 px-4 py-2.5">
        <Box className="flex min-w-0 items-center gap-2.5">
          <Box className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
            <Iconify icon={icon} width={18} />
          </Box>
          <Typography variant="subtitle2" className="truncate font-semibold text-foreground">
            {title}
          </Typography>
        </Box>
        {headerRight}
      </Box>
      <Box className="p-3.5">{children}</Box>
    </Box>
  );
}

export function ProductDetailsFieldGrid({
  children,
  cols = 3,
}: {
  children: ReactNode;
  cols?: 2 | 3;
}) {
  const colCls =
    cols === 2
      ? 'grid grid-cols-1 gap-2 sm:grid-cols-2'
      : 'grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3';
  return <Box className={colCls}>{children}</Box>;
}

/** Compact label/value row — for pricing & dense sections */
export function ProductDetailsDenseRow({
  label,
  value,
  emptyLabel = '—',
  highlight,
}: {
  label: string;
  value: ReactNode;
  emptyLabel?: string;
  highlight?: boolean;
}) {
  const hasValue = value !== null && value !== undefined && value !== '';
  return (
    <Box
      className={`flex items-start justify-between gap-3 border-b border-border/40 py-2 last:border-b-0 ${
        highlight ? 'bg-primary/[0.04] -mx-4 px-4 rounded-lg border-b-0 mb-1' : ''
      }`}
    >
      <Typography variant="caption" className="shrink-0 pt-0.5 text-muted-foreground">
        {label}
      </Typography>
      <Typography
        variant="body2"
        component="div"
        className={`min-w-0 text-end tabular-nums ${highlight ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}
      >
        {hasValue ? value : emptyLabel}
      </Typography>
    </Box>
  );
}

/** SYP | USD on one row with a vertical divider */
export function ProductDetailsDualCurrencyLine({
  label,
  syp,
  usd,
  emphasis = false,
}: {
  label: string;
  syp: string;
  usd: string;
  emphasis?: boolean;
}) {
  const valueCls = emphasis
    ? 'text-lg font-bold tabular-nums text-foreground'
    : 'text-sm font-semibold tabular-nums text-foreground';

  return (
    <Box>
      <Typography variant="caption" className="mb-1 block font-medium text-muted-foreground">
        {label}
      </Typography>
      <Box
        className={`flex overflow-hidden rounded-lg border ${
          emphasis ? 'border-primary/25 bg-primary/[0.05]' : 'border-border/50 bg-muted/10'
        }`}
      >
        <Box className="flex min-w-0 flex-1 items-center justify-center border-e border-border/55 px-3 py-2.5">
          <Typography className={valueCls}>{syp}</Typography>
        </Box>
        <Box className="flex min-w-0 flex-1 items-center justify-center px-3 py-2.5">
          <Typography className={valueCls}>{usd}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

export function ProductDetailsPricingSummary({
  afterDiscountLabel,
  beforeDiscountLabel,
  afterDiscount,
  beforeDiscount,
}: {
  afterDiscountLabel: string;
  beforeDiscountLabel: string;
  afterDiscount: DualCurrencyInput;
  beforeDiscount: DualCurrencyInput;
}) {
  const after = resolveDualCurrencyDisplay(afterDiscount);
  const before = resolveDualCurrencyDisplay(beforeDiscount);

  return (
    <Box className="space-y-2.5 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.07] to-primary/[0.02] p-3">
      <ProductDetailsDualCurrencyLine
        label={afterDiscountLabel}
        syp={after.syp}
        usd={after.usd}
        emphasis
      />
      <ProductDetailsDualCurrencyLine
        label={beforeDiscountLabel}
        syp={before.syp}
        usd={before.usd}
      />
    </Box>
  );
}

/** Compact SYP | USD for dense rows */
export function ProductDetailsDualCurrencyInline({ input }: { input: DualCurrencyInput }) {
  const { syp, usd } = resolveDualCurrencyDisplay(input);
  return (
    <span className="inline-flex items-center gap-2 tabular-nums">
      <span>{syp}</span>
      <span className="h-3 w-px shrink-0 bg-border/70" aria-hidden />
      <span>{usd}</span>
    </span>
  );
}

export function ProductDetailsPricingPanel({
  summary,
  children,
}: {
  summary: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box className="space-y-2.5">
      {summary}
      <Box className="rounded-xl border border-border/45 bg-muted/10 px-3 py-0.5">{children}</Box>
    </Box>
  );
}

export function ProductDetailsField({
  label,
  value,
  emptyLabel = '—',
  className,
}: {
  label: string;
  value: ReactNode;
  emptyLabel?: string;
  className?: string;
}) {
  const hasValue = value !== null && value !== undefined && value !== '';
  return (
    <Box
      className={`rounded-lg border border-border/40 bg-muted/10 px-3 py-2 ${className ?? ''}`}
    >
      <Typography variant="caption" className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Typography>
      <Typography variant="body2" component="div" className="text-sm font-medium text-foreground">
        {hasValue ? value : emptyLabel}
      </Typography>
    </Box>
  );
}

export function ProductDetailsStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: ReactNode;
  icon?: string;
}) {
  return (
    <Box className="rounded-xl border border-border/50 bg-background/80 px-4 py-3 shadow-sm">
      <Box className="mb-1 flex items-center gap-1.5">
        {icon ? (
          <Iconify icon={icon} width={14} className="text-primary/80" />
        ) : null}
        <Typography variant="caption" className="text-muted-foreground">
          {label}
        </Typography>
      </Box>
      <Typography variant="h6" className="text-lg font-semibold tabular-nums text-foreground">
        {value}
      </Typography>
    </Box>
  );
}

export function ProductDetailsChip({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
}) {
  const toneCls = {
    neutral: 'border-border/60 bg-muted/40 text-muted-foreground',
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-300',
    danger: 'border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300',
    info: 'border-sky-500/30 bg-sky-500/10 text-sky-900 dark:text-sky-300',
    primary: 'border-violet-500/30 bg-violet-500/10 text-violet-900 dark:text-violet-300',
  }[tone];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${toneCls}`}
    >
      {children}
    </span>
  );
}

export function ProductDetailsMetricCell({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Box className="rounded-lg border border-border/40 bg-background/70 px-3 py-2.5">
      <Typography variant="caption" className="mb-0.5 block text-muted-foreground">
        {label}
      </Typography>
      <Typography variant="body2" component="div" className="font-medium tabular-nums text-foreground">
        {children}
      </Typography>
    </Box>
  );
}

export function ProductDetailsVariantCard({
  children,
  header,
  actions,
}: {
  children: ReactNode;
  header: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <Box className="overflow-hidden rounded-2xl border border-border/55 bg-card shadow-sm">
      <Box className="flex flex-col gap-3 border-b border-border/45 bg-muted/20 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <Box className="min-w-0 flex-1">{header}</Box>
        {actions ? <Box className="flex shrink-0 items-center gap-1">{actions}</Box> : null}
      </Box>
      <Box className="space-y-4 p-4 sm:p-5">{children}</Box>
    </Box>
  );
}

export function ProductDetailsTag({
  label,
  value,
  colorDot,
}: {
  label: string;
  value: ReactNode;
  colorDot?: string;
}) {
  return (
    <Box className="inline-flex items-center gap-2 rounded-lg border border-border/45 bg-muted/20 px-2.5 py-1.5 text-xs">
      <span className="font-medium text-muted-foreground">{label}</span>
      {colorDot ? (
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-full border border-black/10 shadow-sm"
            style={{ backgroundColor: colorDot }}
          />
          <span className="font-medium text-foreground">{value}</span>
        </span>
      ) : (
        <span className="font-medium text-foreground">{value}</span>
      )}
    </Box>
  );
}
