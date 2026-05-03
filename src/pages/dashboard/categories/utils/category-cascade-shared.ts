import type { CategoryListResponse } from '../types/category.types';

// ----------------------------------------------------------------------

/** Optional sub-dropdowns under the chosen root (main). */
export const MAX_CATEGORY_SUB_LEVELS = 5;

export function categoryListTotal(resp: CategoryListResponse | undefined): number {
  return resp?.data?.pagination?.total ?? 0;
}

/** Effective leaf category id from cascade (0 if main not chosen). */
export function leafCategoryIdFromCascade(mainCategoryId: number, subSelections: number[]): number {
  if (mainCategoryId <= 0) return 0;
  let effective = mainCategoryId;
  for (let i = 0; i < subSelections.length; i++) {
    const s = subSelections[i];
    if (s == null || s <= 0) break;
    effective = s;
  }
  return effective;
}
