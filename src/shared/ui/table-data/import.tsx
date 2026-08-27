import type { ProductImportResultData } from '@/pages/dashboard/products/types/product.types';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { X, Upload } from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { _ProductApi } from '@/pages/dashboard/products/api/product.services';
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
} from '@/shared/ui/dialogTable';

interface ImportModalProps {
  tableName: string;
  onImportSuccess?: () => void;
}

function normalizeImportResult(raw: unknown): ProductImportResultData {
  const data =
    raw && typeof raw === 'object' && 'data' in raw
      ? (raw as { data?: ProductImportResultData }).data
      : (raw as ProductImportResultData | undefined);
  return {
    created: Number(data?.created ?? 0) || 0,
    updated: Number(data?.updated ?? 0) || 0,
    failed: Array.isArray(data?.failed)
      ? data.failed.map((row) => ({
          row: Number(row?.row ?? 0) || 0,
          errors: Array.isArray(row?.errors)
            ? row.errors.map(String)
            : row?.errors
              ? [String(row.errors)]
              : [],
        }))
      : [],
  };
}

export function Import({ tableName, onImportSuccess }: ImportModalProps) {
  const { t } = useTranslation('table');

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ProductImportResultData | null>(null);

  const validateAndSetFile = (selectedFile: File) => {
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));

    if (!validExtensions.includes(fileExtension)) {
      toast.error(t('import.invalidFileType'));
      return;
    }
    setFile(selectedFile);
    setResult(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error(t('import.selectFile'));
      return;
    }
    if (tableName !== 'products') {
      toast.error(t('import.error'));
      return;
    }

    setIsImporting(true);
    try {
      const response = await _ProductApi.importProducts(file);
      const summary = normalizeImportResult(response);
      setResult(summary);

      const failedCount = summary.failed.length;
      if (failedCount === 0) {
        toast.success(
          t('import.successSummary', {
            created: summary.created,
            updated: summary.updated,
            defaultValue: response.message || t('import.success'),
          })
        );
      } else {
        toast.warning(
          t('import.partialSummary', {
            created: summary.created,
            updated: summary.updated,
            failed: failedCount,
          })
        );
      }

      onImportSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || t('import.error');
      const detailedErrors = error?.response?.data?.errors;
      if (detailedErrors && typeof detailedErrors === 'object') {
        Object.values(detailedErrors).forEach((errorArray: any) => {
          if (Array.isArray(errorArray)) {
            errorArray.forEach((err: string) => toast.error(err));
          }
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsImporting(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    const fileInput = document.getElementById('import-file') as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outlined"
          className="h-8 px-2 md:mr-2 lg:px-3 md:mt-0 text-foreground border-border"
        >
          <Upload className="w-4 h-4 mr-2" />
          {t('import.import')}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {t('import.title', { table: t('tableNames.product', { defaultValue: tableName }) })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('import.productsHint')}</p>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t('import.file')}</label>
            <div
              className={`
                border-2 border-dashed rounded-lg p-4 text-center
                transition-colors duration-200
                ${isDragging ? 'border-primary bg-primary/10' : 'border-border bg-muted/50'}
              `}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  validateAndSetFile(e.dataTransfer.files[0]);
                  e.dataTransfer.clearData();
                }
              }}
            >
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="import-file"
              />
              <label htmlFor="import-file" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {file ? file.name : isDragging ? t('import.dropHere') : t('import.chooseFile')}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {t('import.supportedFormatsXlsx')}
                </span>
              </label>
            </div>
          </div>

          {result ? (
            <div className="space-y-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
              <p className="font-medium text-foreground">{t('import.resultTitle')}</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>
                  {t('import.resultCreated')}:{' '}
                  <span className="font-semibold text-foreground">{result.created}</span>
                </li>
                <li>
                  {t('import.resultUpdated')}:{' '}
                  <span className="font-semibold text-foreground">{result.updated}</span>
                </li>
                <li>
                  {t('import.resultFailed')}:{' '}
                  <span className="font-semibold text-foreground">{result.failed.length}</span>
                </li>
              </ul>
              {result.failed.length > 0 ? (
                <div className="mt-2 max-h-40 space-y-2 overflow-y-auto rounded-md border border-destructive/30 bg-destructive/5 p-2">
                  {result.failed.map((row) => (
                    <div key={`fail-${row.row}`} className="text-xs text-destructive">
                      <span className="font-semibold">
                        {t('import.failedRow', { row: row.row })}
                      </span>
                      {row.errors.length > 0 ? `: ${row.errors.join(' — ')}` : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex justify-end space-x-2">
            <Button variant="outlined" onClick={() => setOpen(false)} disabled={isImporting}>
              <X className="w-4 h-4 mr-2" />
              {result ? t('import.done') : t('cancel')}
            </Button>
            {!result ? (
              <Button
                onClick={() => void handleImport()}
                disabled={!file || isImporting}
                className="bg-primary text-primary-foreground"
              >
                {isImporting ? t('import.importing') : t('import.confirm')}
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
