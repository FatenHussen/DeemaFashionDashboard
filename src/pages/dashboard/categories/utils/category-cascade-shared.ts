import type { CategoryData, CategoryListResponse } from '../types/category.types';

// ----------------------------------------------------------------------

/** Optional sub-dropdowns under the chosen root (main). */
export const MAX_CATEGORY_SUB_LEVELS = 5;

export function categoryListTotal(resp: CategoryListResponse | undefined): number {
  return resp?.data?.pagination?.total ?? 0;
}

/**
 * Last selected cascade id (root / parent / leaf). 0 if main is not chosen.
 * Empty or 0 sub-selections stop the walk — they do not force a leaf.
 */
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

/** Root / main category: `is_root` or `parent_id === null`. */
export function isRootCategory(
  cat: Pick<CategoryData, 'is_root' | 'parent_id'> | undefined | null
): boolean {
  if (!cat) return false;
  if (cat.is_root === true) return true;
  if (cat.is_root === false) return false;
  return cat.parent_id == null || Number(cat.parent_id) === 0;
}

/** Show the next cascade select when the selected category has children. Not a save requirement. */
export function categoryHasChildren(
  cat: Pick<CategoryData, 'has_children' | 'children_count'> | undefined
): boolean {
  if (!cat) return false;
  if (cat.has_children === true) return true;
  if ((cat.children_count ?? 0) > 0) return true;
  if (cat.has_children === false) return false;
  return false;
}
