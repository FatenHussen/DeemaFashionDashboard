import type { Table } from '@tanstack/react-table';

import { useState } from 'react';
import { Input } from '@/shared/ui/input';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from '@/shared/ui/dialogTable';

interface ExportColumnsModalProps<TData> {
  table: Table<TData>;
  availableColumns: string[];
  onExport: (selectedColumns: string[]) => void;
  exportT: 'excel' | 'pdf';
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export function ExportColumnsModal<TData>({
  availableColumns,
  onExport,
  exportT,
  children,
  onOpenChange,
}: ExportColumnsModalProps<TData>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(availableColumns);
  const { t } = useTranslation('table');

  const filteredColumns = availableColumns.filter((column) =>
    column.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };
  const handleExport = () => {
    onExport(selectedColumns);
    setOpen(false);
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-sm rounded-xl text-foreground p-6 shadow-2xl bg-background">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            ⚙️ {t('customExport')} ({exportT.toUpperCase()})
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t('selectColumnsToExportAs')} {exportT}
          </DialogDescription>
        </DialogHeader>

        <Input
          placeholder={t('searchColumns')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 border-primary focus-visible:ring-primary"
        />

        <div className="max-h-64 overflow-y-auto space-y-2">
          {filteredColumns.map((column) => {
            const isSelected = selectedColumns.includes(column);
            return (
              <div
                key={column}
                className="flex items-center justify-between p-3  rounded-lg border border-border bg-muted"
              >
                <div className="flex items-center gap-3 flex-1 ">
                  <Checkbox
                    checked={isSelected}
                    onChange={(e) =>
                      setSelectedColumns((prev) =>
                        e.target.checked ? [...prev, column] : prev.filter((id) => id !== column)
                      )
                    }
                    className="data-[state=checked]:bg-primary text-primary-foreground"
                  />
                  <label htmlFor={column} className="text-sm font-medium text-foreground  flex-1">
                    {column}
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outlined" onClick={() => setOpen(false)}>
            {t('cancel')}
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleExport}
          >
            {t('export')} {exportT.toUpperCase()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
