import { formatTranslated } from '@/utils/format-translated';

import { _CategoryApi } from '../api/category.services';

// ----------------------------------------------------------------------

export type CategoryTrailSegment = { id: number; name: string };

/** Parse `trail=6,7,12` into ordered category IDs (deduped, positive integers only). */
export function parseCategoryTrailParam(
  raw: string | null | undefined,
  maxDepth = 5
): number[] {
  if (!raw?.trim()) return [];

  const ids: number[] = [];
  for (const part of raw.split(',')) {
    const n = Number(part.trim());
    if (!Number.isFinite(n) || n <= 0 || ids.includes(n)) continue;
    ids.push(n);
  }
  return ids.slice(0, maxDepth);
}

export function serializeCategoryTrailParam(ids: number[]): string | null {
  if (ids.length === 0) return null;
  return ids.join(',');
}

export function trailIdsEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((id, i) => id === b[i]);
}

export async function hydrateCategoryTrail(ids: number[]): Promise<CategoryTrailSegment[]> {
  const segments: CategoryTrailSegment[] = [];

  for (const id of ids) {
    const resp = await _CategoryApi.getCategoryById(id);
    segments.push({
      id: resp.data.id,
      name: formatTranslated(resp.data.name),
    });
  }

  return segments;
}
