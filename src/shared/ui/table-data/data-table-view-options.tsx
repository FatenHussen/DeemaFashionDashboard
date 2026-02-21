import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import * as Papa from 'papaparse';
import autoTable from 'jspdf-autotable';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { Printer, FileText } from 'lucide-react';
import { type Table } from '@tanstack/react-table';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from '@/shared/ui/dropdown-menu';

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  tableName?: string;
}

export function DataTableViewOptions<TData>({
  table,
  tableName,
}: DataTableViewOptionsProps<TData>) {
  const { t } = useTranslation('table');
  const excludedExportColumns = ['Actions'];
  const capitalizeFirstLetter = (str?: string): string => {
    if (!str) return 'Table';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  const handleExportCSV = () => {
    const rows = table.getRowModel().rows.map((row) => {
      const rowData: any = {};
      row
        .getVisibleCells()
        .filter((cell) => !excludedExportColumns.includes(cell.column.id))
        .forEach((cell) => {
          const columnDef = cell.column.columnDef as any;
          const headerName =
            columnDef.headerName ||
            (columnDef.header && typeof columnDef.header === 'string'
              ? columnDef.header
              : cell.column.id.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()));
          rowData[headerName] = cell.getValue();
        });
      return rowData;
    });

    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${capitalizeFirstLetter(tableName)}.csv`;
    link.click();
  };

  const handleExportExcel = () => {
    const rows = table.getRowModel().rows.map((row) => {
      const rowData: any = {};
      row
        .getVisibleCells()
        .filter((cell) => !excludedExportColumns.includes(cell.column.id))
        .forEach((cell) => {
          const columnDef = cell.column.columnDef as any;
          const headerName =
            columnDef.headerName ||
            (columnDef.header && typeof columnDef.header === 'string'
              ? columnDef.header
              : cell.column.id.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()));
          rowData[headerName] = cell.getValue();
        });
      return rowData;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${capitalizeFirstLetter(tableName)}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const headers = table
      .getVisibleLeafColumns()
      .filter((column) => !excludedExportColumns.includes(column.id))
      .map((column) => {
        const columnDef = column.columnDef as any;
        if (columnDef.header && typeof columnDef.header === 'string') {
          return columnDef.header;
        }
        if (columnDef.headerName) {
          return columnDef.headerName;
        }
        return column.id.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
      });

    const data = table.getRowModel().rows.map((row) =>
      row
        .getVisibleCells()
        .filter((cell) => !excludedExportColumns.includes(cell.column.id))
        .map((cell) => {
          const value = cell.getValue();
          return typeof value === 'string' || typeof value === 'number'
            ? value
            : JSON.stringify(value);
        })
    );

    doc.text(tableName ? capitalizeFirstLetter(tableName) : 'Table Export', 14, 16);

    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 20,
      styles: {
        fontSize: 10,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    doc.save(`${capitalizeFirstLetter(tableName)}.pdf`);
  };

  const handlePrint = () => {
    const headers = table
      .getVisibleLeafColumns()
      .filter((column) => !excludedExportColumns.includes(column.id))
      .map((column) => {
        const columnDef = column.columnDef as any;
        if (columnDef.header && typeof columnDef.header === 'string') {
          return columnDef.header;
        }
        if (columnDef.headerName) {
          return columnDef.headerName;
        }
        return column.id.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
      });

    const data = table.getRowModel().rows.map((row) =>
      row
        .getVisibleCells()
        .filter((cell) => !excludedExportColumns.includes(cell.column.id))
        .map((cell) => {
          const value = cell.getValue();
          return typeof value === 'string' || typeof value === 'number'
            ? value
            : JSON.stringify(value);
        })
    );

    const capitalizedTableName = tableName ? capitalizeFirstLetter(tableName) : 'Table Print';

    const printContent = `
    <html>
      <head>
        <title>Print</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #394ea0; color: white;  text-align: left; padding: 10px; border: 1px solid #ddd; }
          td { padding: 8px; border: 1px solid #ddd; }
          @media print {
            body { margin: 0; padding: 0; }
            .no-print { display: none !important; }
              th { 
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              background-color: #394ea0;
              color: #ffffff;
            }
          }
        </style>
      </head>
      <body>
        <h1>${capitalizedTableName}</h1>
        <table>
          <thead>
            <tr>
              ${headers.map((header) => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data
              .map(
                (row) => `
              <tr>
                ${row.map((cell) => `<td>${cell}</td>`).join('')}
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };
  return (
    <div className="flex items-center space-x-2 md:space-x-3 mr-2 py-3 gap-2 transition-opacity duration-300">
      {/* Print Button with Creative Design */}
      {/* <Button
        variant="outlined"
        size="small"
        className="
          h-9 px-4 lg:flex 
          bg-gradient-to-r from-background to-muted
          border-2 border-border
          hover:border-primary
          hover:shadow-lg hover:shadow-primary/20
          hover:scale-105 active:scale-95
          transition-all duration-300 ease-in-out
          group relative overflow-hidden
        "
        onClick={handlePrint}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Printer className="relative z-10 mr-2 h-4 w-4 text-foreground group-hover:text-primary transition-colors duration-300" />
        <span className="relative z-10 font-medium text-sm text-foreground group-hover:text-primary transition-colors duration-300">
          {t('print')}
        </span>
      </Button> */}

      {/* Export Dropdown with Enhanced Design */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outlined"
            size="small"
            className="
              h-9 px-4 lg:flex
              bg-gradient-to-r from-background to-muted
              border-2 border-border
              hover:border-primary
              hover:shadow-lg hover:shadow-primary/20
              hover:scale-105 active:scale-95
              transition-all duration-300 ease-in-out
              group relative overflow-hidden
            "
          >
            <span className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <FileText className="relative z-10 mr-2 h-4 w-4 text-foreground group-hover:text-primary transition-colors duration-300" />
            <span className="relative z-10 font-medium text-sm text-foreground group-hover:text-primary transition-colors duration-300">
              {t('export')}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="
            w-[240px] p-2
            bg-popover/95 backdrop-blur-lg
            shadow-2xl border-2 border-border
            rounded-xl
            transition-all duration-300
          "
        >
          <DropdownMenuLabel
            className="
            flex items-center gap-3 px-3 py-2.5
            text-sm font-semibold
            text-popover-foreground
            bg-gradient-to-r from-primary/10 to-primary/5
            rounded-lg mb-1
          "
          >
            <div
              className="
              p-1.5 rounded-lg
              bg-primary
              shadow-lg shadow-primary/30
            "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgb(var(--primary-foreground))"
                strokeWidth="2.5"
                className="drop-shadow-sm"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <span>{t('exportOptions')}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-2 bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* CSV Export */}
          <DropdownMenuItem
            onClick={handleExportCSV}
            className="
              flex items-center gap-3 px-3 py-2.5
              text-sm font-medium
              rounded-lg mb-1
              cursor-pointer
              transition-all duration-200
              hover:bg-primary/10
              text-popover-foreground
              group/item
            "
          >
            <div
              className="
              p-1.5 rounded-md
              bg-primary
              shadow-md shadow-primary/30
              group-hover/item:scale-110
              transition-transform duration-200
            "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgb(var(--primary-foreground))"
                strokeWidth="2"
                className="drop-shadow-sm"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M8 13v-1h8v1" />
                <path d="M8 17v-1h6v1" />
              </svg>
            </div>
            <span className="flex-1 group-hover/item:text-primary transition-colors">
              {t('exportByCSV')}
            </span>
            <span className="text-xs text-muted-foreground group-hover/item:text-primary transition-colors">
              .csv
            </span>
          </DropdownMenuItem>

          {/* Excel Export */}
          <DropdownMenuItem
            onClick={handleExportExcel}
            className="
              flex items-center gap-3 px-3 py-2.5
              text-sm font-medium
              rounded-lg mb-1
              cursor-pointer
              transition-all duration-200
              hover:bg-primary/10
              text-popover-foreground
              group/item
            "
          >
            <div
              className="
              p-1.5 rounded-md
              bg-primary
              shadow-md shadow-primary/30
              group-hover/item:scale-110
              transition-transform duration-200
            "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgb(var(--primary-foreground))"
                strokeWidth="2"
                className="drop-shadow-sm"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <rect x="8" y="12" width="8" height="2" />
                <rect x="8" y="16" width="8" height="2" />
                <path d="M10 9h4" />
              </svg>
            </div>
            <span className="flex-1 group-hover/item:text-primary transition-colors">
              {t('exportByExcel')}
            </span>
            <span className="text-xs text-muted-foreground group-hover/item:text-primary transition-colors">
              .xlsx
            </span>
          </DropdownMenuItem>

          {/* PDF Export */}
          <DropdownMenuItem
            onClick={handleExportPDF}
            className="
              flex items-center gap-3 px-3 py-2.5
              text-sm font-medium
              rounded-lg
              cursor-pointer
              transition-all duration-200
              hover:bg-primary/10
              text-popover-foreground
              group/item
            "
          >
            <div
              className="
              p-1.5 rounded-md
              bg-primary
              shadow-md shadow-primary/30
              group-hover/item:scale-110
              transition-transform duration-200
            "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgb(var(--primary-foreground))"
                strokeWidth="2"
                className="drop-shadow-sm"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M8 11h1" />
                <path d="M8 15h1" />
                <path d="M12 11h3" />
                <path d="M16 15h-3" />
                <path d="M13 15v-3" />
              </svg>
            </div>
            <span className="flex-1 group-hover/item:text-primary transition-colors">
              {t('exportByPDF')}
            </span>
            <span className="text-xs text-muted-foreground group-hover/item:text-primary transition-colors">
              .pdf
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
