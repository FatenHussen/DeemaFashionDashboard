import type { CategoryData } from '../types/category.types';

import { formatTranslated } from '@/utils/format-translated';

// ----------------------------------------------------------------------

function categoryLabel(cat: CategoryData): string {
  return typeof cat.name === 'object'
    ? formatTranslated(cat.name as { en?: string; ar?: string })
    : String(cat.name ?? '');
}

function parentKey(cat: CategoryData): number | null {
  const pid = cat.parent_id;
  if (pid == null || Number(pid) <= 0) return null;
  return Number(pid);
}

/** Adjacency list: parent id (null = roots) → child category ids in display order. */
function buildChildrenMap(items: CategoryData[]): Map<number | null, CategoryData[]> {
  const map = new Map<number | null, CategoryData[]>();
  for (const c of items) {
    const pk = parentKey(c);
    const list = map.get(pk) ?? [];
    list.push(c);
    map.set(pk, list);
  }
  for (const [, list] of map) {
    list.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0) || a.id - b.id);
  }
  return map;
}

function collectDescendantIds(rootId: number, childrenByParent: Map<number | null, CategoryData[]>) {
  const blocked = new Set<number>();
  const walk = (id: number) => {
    for (const c of childrenByParent.get(id) ?? []) {
      if (!blocked.has(c.id)) {
        blocked.add(c.id);
        walk(c.id);
      }
    }
  };
  walk(rootId);
  return blocked;
}

/** Category id plus all descendants (edit mode: cannot pick self/descendants as parent). */
export function collectSelfAndDescendantIds(items: CategoryData[], categoryId: number): Set<number> {
  const out = new Set<number>();
  if (!Number.isFinite(categoryId) || categoryId <= 0) return out;
  const childrenByParent = buildChildrenMap(items);
  out.add(categoryId);
  for (const id of collectDescendantIds(categoryId, childrenByParent)) {
    out.add(id);
  }
  return out;
}

/** Root → … → nodeId (inclusive), using parent_id from flat list. Empty if node missing. */
export function ancestorsChainFromFlat(items: CategoryData[], nodeId: number): CategoryData[] {
  const byId = new Map(items.map((c) => [c.id, c]));
  const rev: CategoryData[] = [];
  let cur: number | null = nodeId;
  while (cur != null && cur > 0) {
    const c = byId.get(cur);
    if (!c) break;
    rev.push(c);
    const pk = parentKey(c);
    cur = pk;
  }
  rev.reverse();
  return rev;
}

export type ParentPickerOption = { id: number; label: string; depth: number; hasChildren: boolean };

export type CategorySelectRow = { id: number; label: string; depth: number; hasChildren: boolean };

/** Native `<option>` cannot style indent; use NBSP steps + optional folder emoji for parents. */
export function nativeSelectCategoryLabel(
  label: string,
  depth: number,
  hasChildren?: boolean
): string {
  const step = '\u00A0\u00A0\u00A0\u00A0';
  const indent = depth > 0 ? step.repeat(depth) : '';
  const parentMark = hasChildren ? '\u{1F4C1}\u00A0' : '';
  return `${indent}${parentMark}${label}`;
}

/** Padding in px for custom dropdown rows (InfiniteScrollSelect, MultiSelect). */
export function categoryTreeIndentPx(depth: number): number | undefined {
  if (depth <= 0) return undefined;
  return 12 + (depth - 1) * 14;
}

/**
 * Tree order (pre-order) with depth for indented labels. Optionally excludes a category
 * and its descendants (edit mode) to avoid invalid parent selection.
 */
export function buildParentPickerOptions(
  items: CategoryData[],
  opts?: { excludeCategoryId?: number }
): ParentPickerOption[] {
  const childrenByParent = buildChildrenMap(items);
  const excluded = new Set<number>();
  if (opts?.excludeCategoryId != null && opts.excludeCategoryId > 0) {
    excluded.add(opts.excludeCategoryId);
    for (const id of collectDescendantIds(opts.excludeCategoryId, childrenByParent)) {
      excluded.add(id);
    }
  }

  const out: ParentPickerOption[] = [];

  const walk = (parentId: number | null, depth: number) => {
    for (const c of childrenByParent.get(parentId) ?? []) {
      if (excluded.has(c.id)) continue;
      const hasChildren = (childrenByParent.get(c.id) ?? []).length > 0;
      out.push({ id: c.id, label: categoryLabel(c), depth, hasChildren });
      walk(c.id, depth + 1);
    }
  };

  walk(null, 0);

  const reached = new Set(out.map((r) => r.id));
  const byId = new Map(items.map((c) => [c.id, c]));
  const orphans: ParentPickerOption[] = [];
  for (const c of items) {
    if (excluded.has(c.id) || reached.has(c.id)) continue;
    const chain = ancestorsChainFromFlat(items, c.id);
    const depth = Math.max(0, chain.length - 1);
    const hasChildren = (childrenByParent.get(c.id) ?? []).length > 0;
    orphans.push({ id: c.id, label: categoryLabel(c), depth, hasChildren });
  }
  orphans.sort((a, b) => {
    const ca = byId.get(a.id);
    const cb = byId.get(b.id);
    return (Number(ca?.order) || 0) - (Number(cb?.order) || 0) || a.id - b.id;
  });

  return [...out, ...orphans];
}

/**
 * Ordered rows for flat selects / InfiniteScrollSelect: plain labels + depth for UI indent,
 * optional leading row (e.g. “All categories”, “No category”).
 */
export function buildCategorySelectRows(
  items: CategoryData[],
  opts?: { leading?: Pick<CategorySelectRow, 'id' | 'label'> }
): CategorySelectRow[] {
  const hierarchical = buildParentPickerOptions(items).map((r) => ({
    id: r.id,
    label: r.label,
    depth: r.depth,
    hasChildren: r.hasChildren,
  }));
  if (opts?.leading)
    return [{ ...opts.leading, depth: 0, hasChildren: false }, ...hierarchical];
  return hierarchical;
}

/** Client-side pagination when the full category list is loaded once (InfiniteScrollSelect). */
export function paginateSelectRowsLocal<T>(allRows: T[], page: number, limit: number) {
  const total = allRows.length;
  const lastPage = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const items = allRows.slice(start, start + limit);
  return {
    data: {
      items,
      pagination: {
        current_page: page,
        last_page: lastPage,
        per_page: limit,
        total,
      },
    },
  };
}
