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

export type ParentPickerOption = { id: number; label: string; depth: number };

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
      const prefix = depth > 0 ? `${'— '.repeat(depth)}` : '';
      out.push({ id: c.id, label: `${prefix}${categoryLabel(c)}`, depth });
      walk(c.id, depth + 1);
    }
  };

  walk(null, 0);
  return out;
}
