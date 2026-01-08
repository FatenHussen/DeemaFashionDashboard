export type ExportType =
  | 'brands'
  | 'categories'
  | 'taxes'
  | 'warranties'
  | 'units'
  | 'sales'
  | 'purchases'
  | 'jobcards'
  | 'order-request'
  | 'sales-order';

export interface IExportForm {
  type: ExportType;
  columns: number[];
}

