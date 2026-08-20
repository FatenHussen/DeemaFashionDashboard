/** Section display mode — how the whole section is arranged. */
export const SECTION_LAYOUTS = ['slider', 'list', 'grid'] as const;
export type SectionLayout = (typeof SECTION_LAYOUTS)[number];

/** Card shape inside the section. */
export const CARD_SHAPES = ['horizontal', 'vertical', 'square'] as const;
export type CardShape = (typeof CARD_SHAPES)[number];

/** @deprecated Use SECTION_LAYOUTS / CARD_SHAPES. Kept for gradual migration. */
export const VARIANTS = CARD_SHAPES;
export type SectionVariant = CardShape;

/**
 * Normalize API values after the layout/variant split.
 * Legacy records used `variant` for section layout (horizontal/vertical/square).
 */
export function normalizeLayoutAndCardShape(input: {
  layout?: string | null;
  variant?: string | null;
}): { layout: SectionLayout; variant: CardShape } {
  const layoutRaw = String(input.layout ?? '').trim();
  const variantRaw = String(input.variant ?? '').trim();

  const hasLayout = (SECTION_LAYOUTS as readonly string[]).includes(layoutRaw);
  const hasCardShape = (CARD_SHAPES as readonly string[]).includes(variantRaw);

  if (hasLayout) {
    return {
      layout: layoutRaw as SectionLayout,
      variant: hasCardShape ? (variantRaw as CardShape) : 'horizontal',
    };
  }

  // Legacy: variant meant section layout
  if (variantRaw === 'horizontal') return { layout: 'slider', variant: 'horizontal' };
  if (variantRaw === 'vertical') return { layout: 'list', variant: 'horizontal' };
  if (variantRaw === 'square') return { layout: 'grid', variant: 'square' };

  return { layout: 'slider', variant: 'horizontal' };
}
