import type { ExportFormat } from '../api/report.services';

import { useState } from 'react';
import { Button } from '@/shared/ui';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';

// ----------------------------------------------------------------------

type ReportExportButtonsProps = {
  disabled?: boolean;
  onExport: (format: ExportFormat) => Promise<void>;
};

export function ReportExportButtons({ disabled, onExport }: ReportExportButtonsProps) {
  const { t } = useTranslation(['table', 'common']);
  const [loading, setLoading] = useState<'excel' | 'pdf' | null>(null);

  const run = async (format: 'excel' | 'pdf') => {
    try {
      setLoading(format);
      await onExport(format);
    } catch {
      toast.error(t('genericError', { ns: 'common' }));
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        disabled={disabled || loading !== null}
        onClick={() => run('excel')}
        className="gap-1.5"
      >
        <Iconify icon="solar:document-text-bold" width={18} />
        {loading === 'excel' ? '…' : t('exportByExcel')}
      </Button>
      <Button
        variant="outlined"
        size="small"
        disabled={disabled || loading !== null}
        onClick={() => run('pdf')}
        className="gap-1.5"
      >
        <Iconify icon="solar:documents-bold" width={18} />
        {loading === 'pdf' ? '…' : t('exportByPDF')}
      </Button>
    </>
  );
}
