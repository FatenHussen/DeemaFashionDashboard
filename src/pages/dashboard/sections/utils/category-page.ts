/** Flags the pages API sends for auto-generated category pages. */
export type CategoryPageFlags = {
  is_category_page?: boolean;
  can_delete_page?: boolean;
  can_edit_metadata?: boolean;
  category_id?: number | null;
  delete_page_via?: string;
};

function positiveId(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** True when this CMS page belongs to a category and must follow it. */
export function isCategoryCmsPage(page?: CategoryPageFlags | null): boolean {
  if (!page) return false;
  if (page.is_category_page) return true;
  if (page.can_delete_page === false || page.can_edit_metadata === false) return true;
  return positiveId(page.category_id) != null;
}

/** Title/slug (and page variables) may be edited only when the API allows it. */
export function canEditPageMetadata(page?: CategoryPageFlags | null): boolean {
  if (!page) return true;
  if (page.can_edit_metadata != null) return page.can_edit_metadata;
  return !isCategoryCmsPage(page);
}

/**
 * Direct `DELETE /pages/{id}` is allowed only when the API says so.
 * Category pages are removed via `DELETE /categories/{id}` (`delete_page_via`).
 */
export function canDeleteCmsPage(page?: CategoryPageFlags | null): boolean {
  if (!page) return true;
  if (page.can_delete_page != null) return page.can_delete_page;
  return !isCategoryCmsPage(page);
}

export function parseCategoryIdFromDeleteVia(deletePageVia?: string | null): number | null {
  if (!deletePageVia) return null;
  const match = String(deletePageVia).match(/categories\/(\d+)/i);
  return match ? positiveId(match[1]) : null;
}

export function resolveLinkedCategoryId(page?: CategoryPageFlags | null): number | null {
  return positiveId(page?.category_id) ?? parseCategoryIdFromDeleteVia(page?.delete_page_via);
}
