import type { DragEndEvent } from '@dnd-kit/core';

import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useMemo, useState, useEffect } from 'react';
import { Iconify } from '@/shared/components/iconify';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSensor,
  DndContext,
  useSensors,
  PointerSensor,
  closestCenter,
} from '@dnd-kit/core';

import { SortableItem } from './sortable-item';

// ----------------------------------------------------------------------

export interface SortableEntity {
  id: number;
  /** Display label (already-localized string) */
  label: string;
  /** Optional thumbnail / icon URL */
  image?: string | null;
}

export interface SortItemsDialogProps {
  open: boolean;
  onClose: () => void;
  /** Items in their current persisted order (asc by `order`). */
  items: SortableEntity[];
  /** Dialog title (e.g. "Reorder categories"). */
  title: string;
  /** Optional helper text under the title. */
  description?: string;
  /** Called when user clicks Save. Should resolve when persistence is done. */
  onSave: (orderedIds: number[]) => Promise<void> | void;
  /** External submitting flag (e.g. mutation.isPending). */
  isSubmitting?: boolean;
  /** Disable when there's nothing to sort. */
  isLoading?: boolean;
}

/**
 * Reusable drag-and-drop sort modal.
 *
 * - Local-only reordering until "Save" is clicked.
 * - Resets to the latest `items` whenever the dialog opens or `items` change.
 */
export function SortItemsDialog({
  open,
  onClose,
  items,
  title,
  description,
  onSave,
  isSubmitting,
  isLoading,
}: SortItemsDialogProps) {
  const { t } = useTranslation('table');
  const [ordered, setOrdered] = useState<SortableEntity[]>(items);

  useEffect(() => {
    if (open) setOrdered(items);
  }, [open, items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const orderedIds = useMemo(() => ordered.map((i) => i.id), [ordered]);
  const isDirty = useMemo(() => {
    if (ordered.length !== items.length) return true;
    return ordered.some((row, idx) => row.id !== items[idx]?.id);
  }, [ordered, items]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrdered((prev) => {
      const oldIdx = prev.findIndex((i) => i.id === Number(active.id));
      const newIdx = prev.findIndex((i) => i.id === Number(over.id));
      if (oldIdx < 0 || newIdx < 0) return prev;
      return arrayMove(prev, oldIdx, newIdx);
    });
  };

  const handleSave = async () => {
    if (!isDirty || isSubmitting) return;
    await onSave(orderedIds);
  };

  const disabled = isSubmitting || isLoading || ordered.length === 0;

  return (
    <Modal open={open} onClose={isSubmitting ? undefined : onClose} maxWidth="md" fullWidth>
      <div className="flex max-h-[85vh] flex-col">
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            {description ? (
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label={t('form.closeDialog')}
            onClick={onClose}
            disabled={isSubmitting}
            className="-me-2 -mt-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <Iconify icon="lucide:x" width={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              {t('loading')}
            </div>
          ) : ordered.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              {t('noData')}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={orderedIds}
                strategy={verticalListSortingStrategy}
              >
                <ol className="flex flex-col gap-2">
                  {ordered.map((row, idx) => (
                    <SortableItem key={row.id} id={row.id}>
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-primary/10 px-1.5 text-xs font-semibold text-primary">
                        {idx + 1}
                      </span>
                      {row.image ? (
                        <img
                          src={row.image}
                          alt=""
                          className="h-8 w-8 shrink-0 rounded-md border border-border/60 object-cover"
                        />
                      ) : null}
                      <span className="truncate text-sm font-medium text-foreground">
                        {row.label}
                      </span>
                      <span className="ms-auto text-xs text-muted-foreground">
                        #{row.id}
                      </span>
                    </SortableItem>
                  ))}
                </ol>
              </SortableContext>
            </DndContext>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={disabled || !isDirty}
            loading={isSubmitting}
          >
            {t('save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
