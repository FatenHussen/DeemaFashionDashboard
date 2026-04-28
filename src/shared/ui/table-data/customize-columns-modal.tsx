import type { Table } from '@tanstack/react-table';
import type { UniqueIdentifier } from '@dnd-kit/core';

import { Settings2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMemo, useState, useCallback } from 'react';
import { useLocalizationStore } from '@/store/useLocalizationStore';
import {
  useSensor,
  DndContext,
  useSensors,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { Input } from '../input';
import { Button } from '../button';
import { SortableItem } from './sortable-item';
import { Dialog, DialogTitle, DialogHeader, DialogContent, DialogTrigger } from '../dialogTable';

interface ColumnItem {
  id: UniqueIdentifier;
  column_name: string;
  checked: boolean;
}

interface CustomizeColumnsModalProps<T> {
  table: Table<T>;
  tableName: string;
  defaultColumns: ColumnItem[];
  columnTranslations?: Record<string, string>;
}

export function CustomizeColumnsModal<T>({
  table,
  tableName,
  defaultColumns,
  columnTranslations = {},
}: CustomizeColumnsModalProps<T>) {
  const { t } = useTranslation('table');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [columns, setColumns] = useState<ColumnItem[]>(defaultColumns);
  const { language } = useLocalizationStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getTranslatedLabel = (name: string) => columnTranslations[name] || name;

  const applyColumnConfig = (cols: ColumnItem[]) => {
    cols.forEach((col) => {
      const c = table.getColumn(col.column_name);
      if (c && c.getIsVisible() !== col.checked) c.toggleVisibility(col.checked);
    });
    const orderIds = cols.map((c) => c.column_name).filter((key) => !!table.getColumn(key));
    table.setColumnOrder(orderIds);
  };

  /** Draft list for the modal: current table visibility + order, same shape as `defaultColumns`. */
  const buildDraftFromTable = useCallback((): ColumnItem[] => {
    const visibilityFor = (columnName: string, fallback: boolean) => {
      const col = table.getColumn(columnName);
      return col ? col.getIsVisible() : fallback;
    };

    const order = table.getState().columnOrder;
    if (order?.length) {
      const byName = new Map(defaultColumns.map((c) => [c.column_name, c]));
      const result: ColumnItem[] = [];
      const seen = new Set<string>();
      for (const id of order) {
        const base = byName.get(id);
        if (base) {
          result.push({
            ...base,
            checked: visibilityFor(base.column_name, base.checked),
          });
          seen.add(base.column_name);
        }
      }
      for (const c of defaultColumns) {
        if (!seen.has(c.column_name)) {
          result.push({
            ...c,
            checked: visibilityFor(c.column_name, c.checked),
          });
        }
      }
      return result;
    }

    return defaultColumns.map((c) => ({
      ...c,
      checked: visibilityFor(c.column_name, c.checked),
    }));
  }, [defaultColumns, table]);

  const filteredColumns = useMemo(
    () => columns.filter((col) => col.column_name.toLowerCase().includes(search.toLowerCase())),
    [columns, search]
  );

  const handleSaveColumns = () => {
    applyColumnConfig(columns);
    setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) setColumns(buildDraftFromTable());
  };

  const resetToDefaults = () => {
    setColumns(defaultColumns.map((c) => ({ ...c })));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setColumns((prev) => {
      const oldIndex = prev.findIndex((c) => c.id === active.id);
      const newIndex = prev.findIndex((c) => c.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleToggleVisibility = (columnId: UniqueIdentifier, checked: boolean) => {
    setColumns((prev) => prev.map((c) => (c.id === columnId ? { ...c, checked } : c)));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="small" variant="text" color="primary" className="h-9 w-9 p-0">
          <Settings2 className="h-4 w-4" />
          <span className="sr-only">{t('customizeColumns')}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-background text-foreground max-h-[80vh] flex flex-col p-0 overflow-hidden">
        {/* Fixed Header Section */}
        <div className="p-6 pb-4 border-b border-border flex-shrink-0">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              <span>{t('customizeColumns')}</span>
            </DialogTitle>
          </DialogHeader>
          <Input
            placeholder={t('searchColumns')}
            className={`text-foreground ${language === 'en' ? 'text-left' : 'text-right'}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Scrollable Content Section */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="border rounded-lg border-border p-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredColumns.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredColumns.map((col) => (
                  <div className="mb-1" key={col.id}>
                    <SortableItem id={col.id}>
                      <div className="flex items-center gap-3 p-2 hover:bg-muted rounded">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary bg-background"
                          onChange={(e) => handleToggleVisibility(col.id, e.target.checked)}
                          checked={col.checked}
                          id={`column-${col.id}`}
                        />
                        <label
                          htmlFor={`column-${col.id}`}
                          className="flex-1 text-foreground cursor-move"
                        >
                          {getTranslatedLabel(col.column_name)}
                        </label>
                      </div>
                    </SortableItem>
                  </div>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>

        {/* Fixed Footer Section */}
        <div className="p-6 pt-4 border-t border-border flex-shrink-0 bg-muted">
          <div className="flex justify-end gap-2">
            <Button variant="outlined" color="secondary" onClick={resetToDefaults}>
              {t('reset') ?? 'Reset'}
            </Button>
            <Button onClick={handleSaveColumns} className="min-w-[120px]">
              {t('saveChanges')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
