import type { FilterConfig } from '../types/page-section.types';

/**
 * Visibility filters (`show_when`) shown in the admin form.
 * On category CMS pages, `category_id` is implicit — the page is already tied to one category.
 */
export function visiblePageShowWhenFilters(
  pageFilters: Record<string, FilterConfig>,
  isCategoryPage: boolean
): Record<string, FilterConfig> {
  if (!isCategoryPage) return pageFilters;
  return Object.fromEntries(
    Object.entries(pageFilters).filter(([key]) => key !== 'category_id')
  );
}

/** Whether the "When should it show?" step/section should render at all. */
export function shouldShowPageVisibilityStep(
  pageFilters: Record<string, FilterConfig>,
  isCategoryPage: boolean
): boolean {
  return Object.keys(visiblePageShowWhenFilters(pageFilters, isCategoryPage)).length > 0;
}
