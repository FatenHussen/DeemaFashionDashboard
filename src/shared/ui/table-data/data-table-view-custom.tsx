//import { useExportFile, useFetchExportColumns } from "@/hooks/useExcelPdf";
import type { ExportType, IExportForm } from '@/types/ExportExcelPdf/exportExcelPdf';

//import { useLocalizationStore } from "@/store/useLocalizationStore";
import { useState } from 'react';
import { toast } from 'react-toastify';
import { FileText } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { type Table } from '@tanstack/react-table';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { useExportHandler } from '@/hooks/settings/useExportHandler';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from '@/shared/ui/dropdown-menu';

import { ExportColumnsModal } from './ExportColumnsModal';

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  tableName: ExportType;
}

const VALID_EXPORT_TYPES: ExportType[] = [
  'brands',
  'categories',
  'taxes',
  'warranties',
  'units',
  'sales',
  'purchases',
  'jobcards',
  'order-request',
  'sales-order',
];

export function DataTableViewOptionsCustom<TData>({
  table,
  tableName,
}: DataTableViewOptionsProps<TData>) {
  const { exportColumns, exportToExcel, exportToPDF } = useExportHandler(tableName);

  //const { data: exportColumnsData } = useFetchExportColumns(tableName);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  //const { direction } = useLocalizationStore();
  // const exportColumns = direction === 'rtl'
  // ? exportColumnsData?.data?.columns?.ar || []
  // : exportColumnsData?.data?.columns?.en || [];
  // const { mutateAsync: exportToExcel } = useExportFile(false);
  // const { mutateAsync: exportToPDF } = useExportFile(true);

  const { t } = useTranslation('table');

  const handleExport = async (selectedColumns: string[], isPdf: boolean) => {
    if (!VALID_EXPORT_TYPES.includes(tableName)) {
      return;
    }

    //   if (!validTypes.includes(tableName)) {
    //     toast.error(`Invalid export type: ${tableName}`);
    //     return;
    //   }

    if (!selectedColumns || selectedColumns.length === 0) {
      toast.error(t('form.exportSelectColumnsError'));
      return;
    }

    try {
      const exportData: IExportForm = {
        type: tableName,
        columns: exportColumns.map((col) => (selectedColumns.includes(col) ? 1 : 0)),
      };

      const response = await (isPdf ? exportToPDF(exportData) : exportToExcel(exportData));

      // if (response?.data?.url) {
      //   const fileName = `export_${tableName}_${new Date().toISOString().slice(0, 10)}.${isPdf ? 'pdf' : 'xlsx'}`;

      //   const link = document.createElement('a');
      //   link.href = response.data.url;
      //   link.setAttribute('download', fileName);
      //   link.style.display = 'none';
      //   document.body.appendChild(link);
      //   link.click();
      //   document.body.removeChild(link);

      // }
      if (response?.data?.url) {
        if (isPdf) {
          window.open(response.data.url, '_blank');
        } else {
          const fileName = `export_${tableName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
          const link = document.createElement('a');
          link.href = response.data.url;
          link.setAttribute('download', fileName);
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    } catch { return; }
  };

  const handleCustomExportExcel = (selectedColumns: string[]) => {
    handleExport(selectedColumns, false);
  };

  const handleCustomExportPDF = (selectedColumns: string[]) => {
    handleExport(selectedColumns, true);
  };
  const isValidExportType = VALID_EXPORT_TYPES.includes(tableName);

  if (!isValidExportType) {
    return null;
  }
  return (
    <div className="flex space-x-4">
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outlined"
            size="small"
            className="mr-2  space-y-2 h-8 md:mr-0  lg:flex text-foreground border-border"
          >
            <FileText className="mr-2 h-4 w-4" />
            {t('customExport')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[200px] bg-popover shadow-md border border-border"
        >
          <DropdownMenuLabel className="flex items-center text-[13px] gap-2 text-popover-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="text-primary"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {t('customExportOptions')}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <ExportColumnsModal
            table={table}
            availableColumns={exportColumns}
            onExport={handleCustomExportExcel}
            exportT="excel"
            onOpenChange={() => setDropdownOpen(false)}
          >
            <DropdownMenuItem
              className="flex items-center gap-2 text-[13px] hover:bg-muted text-popover-foreground"
              onSelect={(e) => e.preventDefault()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="text-purple-600"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <rect x="8" y="12" width="8" height="2" />
                <rect x="8" y="16" width="8" height="2" />
                <path d="M10 9h4" />
              </svg>
              {t('customExportByExcel')}
            </DropdownMenuItem>
          </ExportColumnsModal>

          <ExportColumnsModal
            table={table}
            availableColumns={exportColumns}
            onExport={handleCustomExportPDF}
            exportT="pdf"
            onOpenChange={() => setDropdownOpen(false)}
          >
            <DropdownMenuItem
              className="flex items-center gap-2 text-[13px] hover:bg-muted text-popover-foreground"
              onSelect={(e) => e.preventDefault()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="text-red-600"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M8 11h1" />
                <path d="M8 15h1" />
                <path d="M12 11h3" />
                <path d="M16 15h-3" />
                <path d="M13 15v-3" />
              </svg>
              {t('customExportByPDF')}
            </DropdownMenuItem>
          </ExportColumnsModal>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
