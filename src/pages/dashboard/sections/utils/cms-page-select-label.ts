import type { Page } from '../types/page-section.types';

import { formatTranslated, type TranslatedValue } from 'src/utils/format-translated';

// ----------------------------------------------------------------------

type CmsPageLike = Pick<Page, 'slug'> & { title?: TranslatedValue; id?: number };

/**
 * Display label for CMS page pickers across the dashboard.
 * Uses bilingual `title` when the API returns `{ ar, en }`, otherwise falls back to string title or slug.
 */
export function cmsPageSelectLabel(page: CmsPageLike): string {
  const slug = typeof page.slug === 'string' ? page.slug.trim() : '';
  const fromTitle = formatTranslated(page.title as TranslatedValue, '');
  if (fromTitle) return fromTitle;
  if (slug) return slug;
  if (page.id != null) {
    const n = Number(page.id);
    if (Number.isFinite(n)) return String(n);
  }
  return '';
}
