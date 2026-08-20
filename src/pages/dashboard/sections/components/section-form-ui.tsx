import type { CardShape, SectionLayout } from '@/pages/dashboard/sections/utils/section-layout';

import {
  CARD_SHAPES,
  SECTION_LAYOUTS,
} from '@/pages/dashboard/sections/utils/section-layout';

import { Box, Typography } from 'src/shared/ui';

// ----------------------------------------------------------------------

export function FormStep({
  n,
  title,
  hint,
  children,
}: {
  n: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <Box className="space-y-3">
      <Box className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {n}
        </span>
        <Box className="min-w-0 pt-0.5">
          <Typography variant="subtitle1" className="font-bold text-foreground leading-tight">
            {title}
          </Typography>
          {hint && (
            <Typography variant="body2" className="text-muted-foreground mt-0.5">
              {hint}
            </Typography>
          )}
        </Box>
      </Box>
      {children}
    </Box>
  );
}

export function ChoiceCard({
  active,
  disabled,
  onClick,
  children,
  className = '',
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl border p-4 text-start transition-all ${
        active
          ? 'border-primary bg-primary/[0.07] shadow-sm ring-2 ring-primary/25'
          : 'border-border/60 bg-card hover:border-border hover:bg-muted/30'
      } ${disabled && !active ? 'opacity-45 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

export { CARD_SHAPES, SECTION_LAYOUTS };
export type { CardShape, SectionLayout };

/** @deprecated Prefer CardShapePreview / LayoutPreview */
export const VARIANTS = CARD_SHAPES;
export type SectionVariant = CardShape;

/** Preview for section layout: slider / list / grid. */
export function LayoutPreview({ layout }: { layout: SectionLayout }) {
  if (layout === 'slider') {
    return (
      <Box className="flex h-14 items-center justify-center gap-1 px-1">
        <span className="text-xs text-muted-foreground">‹</span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-10 w-8 rounded-md border border-primary/35 bg-primary/20"
          />
        ))}
        <span className="text-xs text-muted-foreground">›</span>
      </Box>
    );
  }
  if (layout === 'list') {
    return (
      <Box className="flex h-14 flex-col justify-center gap-1 px-4">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-2.5 w-full rounded border border-primary/35 bg-primary/20" />
        ))}
      </Box>
    );
  }
  return (
    <Box className="mx-auto grid h-14 w-14 grid-cols-2 gap-1">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="rounded border border-primary/35 bg-primary/20" />
      ))}
    </Box>
  );
}

/** Preview for card shape inside the section. */
export function CardShapePreview({ shape }: { shape: CardShape }) {
  if (shape === 'horizontal') {
    return (
      <Box className="flex h-14 items-center justify-center px-3">
        <span className="h-8 w-full max-w-[7rem] rounded-md border border-primary/35 bg-primary/20" />
      </Box>
    );
  }
  if (shape === 'vertical') {
    return (
      <Box className="flex h-14 items-center justify-center">
        <span className="h-12 w-8 rounded-md border border-primary/35 bg-primary/20" />
      </Box>
    );
  }
  return (
    <Box className="flex h-14 items-center justify-center">
      <span className="h-10 w-10 rounded-md border border-primary/35 bg-primary/20" />
    </Box>
  );
}

/** @deprecated Use LayoutPreview or CardShapePreview */
export function VariantPreview({ variant }: { variant: SectionVariant }) {
  return <CardShapePreview shape={variant} />;
}
