/// <reference types="vite/client" />

export {};

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<_TData, _TValue> {
    /** Appended to `<th>` for this column (e.g. responsive `hidden md:table-cell`). */
    headerClassName?: string;
    /** Appended to `<td>` for this column. */
    cellClassName?: string;
  }
}
