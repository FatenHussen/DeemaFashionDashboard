import type { ReactNode } from 'react';

import { normalizeHexColorForCss } from '@/utils/shop-variant-image';

import { Typography } from 'src/shared/ui';

import { attributeValueLabel, type CategoryAttributeValueRef } from '../utils/variant-combinations';

// ----------------------------------------------------------------------

export const variantInputCls =
  'w-full h-9 rounded-lg border border-border/50 bg-background px-2.5 text-sm text-foreground shadow-sm transition-colors hover:border-primary/20 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10';

export function variantFieldInputClass(error?: boolean) {
  return error
    ? `${variantInputCls} border-destructive focus:ring-destructive/20`
    : variantInputCls;
}

export function VariantFieldLabel({
  children,
  optionalLabel,
}: {
  children: ReactNode;
  optionalLabel?: string;
}) {
  return (
    <Typography
      variant="caption"
      component="span"
      className="mb-1 flex items-center gap-1 text-[11px] font-medium text-muted-foreground"
    >
      {children}
      {optionalLabel ? (
        <span className="font-normal text-muted-foreground/65">({optionalLabel})</span>
      ) : null}
    </Typography>
  );
}

/** Small color circle for attribute pickers (name + dot). */
export function ColorAttributeDot({ hex }: { hex?: string | null }) {
  const raw = hex != null ? String(hex).trim() : '';
  if (!raw) {
    return (
      <span
        className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-dashed border-border/60 bg-muted/40"
        aria-hidden
      />
    );
  }
  return (
    <span
      className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-black/10 shadow-sm ring-1 ring-black/[0.04]"
      style={{ backgroundColor: normalizeHexColorForCss(raw) }}
      aria-hidden
    />
  );
}

export function ColorAttributeOption({ hex, label }: { hex?: string | null; label: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5 py-0.5">
      <ColorAttributeDot hex={hex} />
      <span className="min-w-0 truncate text-sm text-foreground">{label}</span>
    </span>
  );
}

type AttributeRef = CategoryAttributeValueRef;

/** Inline attribute chain: Yellow · XL (text only — no color dots) */
export function VariantAttributeChain({
  valueRefs,
}: {
  valueRefs: AttributeRef[];
  /** @deprecated Color dots removed — kept for call-site compatibility */
  resolveHex?: (val: AttributeRef) => string | null;
}) {
  if (valueRefs.length === 0) return null;

  return (
    <span className="inline-flex min-w-0 flex-wrap items-center gap-x-1 text-sm text-foreground">
      {valueRefs.map((val, idx) => {
        const label = attributeValueLabel(val.name) || String(val.id);
        return (
          <span key={val.id} className="inline-flex items-center">
            {idx > 0 ? (
              <span className="mx-1.5 text-muted-foreground/40 select-none" aria-hidden>
                ·
              </span>
            ) : null}
            <span className="font-medium">{label}</span>
          </span>
        );
      })}
    </span>
  );
}

export function VariantStatusBadge({
  active,
  activeLabel,
  inactiveLabel,
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${
        active
          ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
          : 'border border-border/60 bg-muted/60 text-muted-foreground'
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
