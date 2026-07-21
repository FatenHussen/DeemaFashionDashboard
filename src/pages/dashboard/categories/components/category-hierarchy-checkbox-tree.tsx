import type { ReactNode } from 'react';
import type { CategoryData } from '../types/category.types';

import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import { Box, Checkbox, Typography } from 'src/shared/ui';

import { ancestorsChainFromFlat } from '../utils/build-parent-picker-options';

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

function computeExpandedForSelection(categories: CategoryData[], selectedIds: number[]): Set<number> {
  const expanded = new Set<number>();
  const childrenByParent = buildChildrenMap(categories);
  for (const id of selectedIds) {
    const chain = ancestorsChainFromFlat(categories, id);
    for (const node of chain) {
      if ((childrenByParent.get(node.id) ?? []).length > 0) {
        expanded.add(node.id);
      }
    }
  }
  return expanded;
}

// ----------------------------------------------------------------------

type CategoryHierarchyCheckboxTreeProps = {
  categories: CategoryData[];
  value: number[];
  onChange: (ids: number[]) => void;
  isLoading?: boolean;
  disabled?: boolean;
  error?: string;
};

function AnimatedCollapse({ open, children }: { open: boolean; children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>(open ? 'auto' : 0);

  useEffect(() => {
    if (!contentRef.current) return undefined;
    if (open) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
    return undefined;
  }, [open, children]);

  return (
    <Box
      className="overflow-hidden transition-all duration-300 ease-in-out"
      style={{ height: height === 'auto' ? 'auto' : `${height}px`, opacity: open ? 1 : 0.85 }}
    >
      <Box ref={contentRef}>{children}</Box>
    </Box>
  );
}

type CategoryTreeNodeProps = {
  category: CategoryData;
  depth: number;
  childrenByParent: Map<number | null, CategoryData[]>;
  value: number[];
  onToggle: (id: number, checked: boolean) => void;
  expandedIds: Set<number>;
  onExpandToggle: (id: number) => void;
  disabled?: boolean;
};

function CategoryTreeNode({
  category,
  depth,
  childrenByParent,
  value,
  onToggle,
  expandedIds,
  onExpandToggle,
  disabled,
}: CategoryTreeNodeProps) {
  const children = childrenByParent.get(category.id) ?? [];
  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(category.id);
  const isChecked = value.includes(category.id);
  const label = categoryLabel(category);

  return (
    <Box className="flex flex-col">
      <Box
        className={`flex items-center gap-2 rounded-lg border border-transparent py-2 pe-2 transition-colors hover:border-border/40 hover:bg-muted/30 ${
          depth > 0 ? 'ms-6 border-s border-border/30 ps-3' : ''
        }`}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onExpandToggle(category.id)}
            disabled={disabled}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/50 bg-background/80 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <Iconify
              icon="eva:arrow-ios-forward-fill"
              width={14}
              className={`text-muted-foreground transition-transform duration-300 ${
                isExpanded ? 'rotate-90' : 'rotate-0'
              }`}
            />
          </button>
        ) : (
          <Box className="h-7 w-7 shrink-0" />
        )}

        <Checkbox
          checked={isChecked}
          onChange={(e) => onToggle(category.id, e.target.checked)}
          disabled={disabled}
          label={
            <span className="text-sm font-medium text-foreground">
              {hasChildren ? (
                <Iconify
                  icon="solar:folder-bold"
                  width={14}
                  className="me-1.5 inline-block text-primary/70 align-[-2px]"
                />
              ) : null}
              {label}
            </span>
          }
        />
      </Box>

      {hasChildren ? (
        <AnimatedCollapse open={isExpanded}>
          <Box className="flex flex-col gap-0.5">
            {children.map((child) => (
              <CategoryTreeNode
                key={child.id}
                category={child}
                depth={depth + 1}
                childrenByParent={childrenByParent}
                value={value}
                onToggle={onToggle}
                expandedIds={expandedIds}
                onExpandToggle={onExpandToggle}
                disabled={disabled}
              />
            ))}
          </Box>
        </AnimatedCollapse>
      ) : null}
    </Box>
  );
}

export function CategoryHierarchyCheckboxTree({
  categories,
  value,
  onChange,
  isLoading = false,
  disabled = false,
  error,
}: CategoryHierarchyCheckboxTreeProps) {
  const { t } = useTranslation('table');

  const childrenByParent = useMemo(() => buildChildrenMap(categories), [categories]);
  const rootCategories = useMemo(
    () => childrenByParent.get(null) ?? [],
    [childrenByParent]
  );

  const [expandedIds, setExpandedIds] = useState<Set<number>>(() =>
    computeExpandedForSelection(categories, value)
  );

  useEffect(() => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      for (const id of computeExpandedForSelection(categories, value)) {
        next.add(id);
      }
      return next;
    });
  }, [categories, value]);

  const handleToggle = useCallback(
    (id: number, checked: boolean) => {
      const next = checked
        ? [...new Set([...value, id])]
        : value.filter((existingId) => existingId !== id);
      onChange(next.filter((n) => Number.isFinite(n) && n > 0));
    },
    [onChange, value]
  );

  const handleExpandToggle = useCallback((id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  if (isLoading) {
    return (
      <Box className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 px-4 py-6">
        <Box className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <Typography variant="body2" className="text-muted-foreground">
          {t('form.restaurantCategoriesLoading')}
        </Typography>
      </Box>
    );
  }

  if (rootCategories.length === 0) {
    return (
      <Box className="rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-6 text-center">
        <Typography variant="body2" className="text-muted-foreground">
          {t('form.restaurantCategoriesEmpty')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="space-y-1">
      {rootCategories.map((root) => (
        <CategoryTreeNode
          key={root.id}
          category={root}
          depth={0}
          childrenByParent={childrenByParent}
          value={value}
          onToggle={handleToggle}
          expandedIds={expandedIds}
          onExpandToggle={handleExpandToggle}
          disabled={disabled}
        />
      ))}

      <Typography variant="caption" className="mt-2 block text-muted-foreground">
        {t('form.restaurantCategoriesHelper')}
      </Typography>

      {error ? (
        <Typography variant="caption" className="mt-1 block text-destructive">
          {error}
        </Typography>
      ) : null}
    </Box>
  );
}
