import * as XLSX from 'xlsx';

/** Official SPBS columns — backend reads these headers only. */
export const PRODUCT_IMPORT_COLUMNS = [
  'كود المنتج',
  'الفئة الرئيسية',
  'اسم المنتج عربي',
  'اسم المنتج انكليزي',
  'الوصف المختصر',
  'العلامة التجارية',
  'الباركود',
  'السعر دولار',
  'السعر سوري',
  'نوع الخصم',
  'الخصم',
  'الكمية',
  'تاريخ انتهاء الصلاحية',
] as const;

/** Optional columns: empty / placeholders become blank (backend treats as null). */
const OPTIONAL_IMPORT_HEADERS = new Set([
  'كود المنتج',
  'الوصف المختصر',
  'العلامة التجارية',
  'الباركود',
  'السعر دولار',
  'السعر سوري',
  'نوع الخصم',
  'الخصم',
  'تاريخ انتهاء الصلاحية',
]);

const EXAMPLE_ROW = [
  'SKU-001',
  'الأزياء',
  'قميص',
  'Shirt',
  '',
  '',
  '',
  '10',
  '',
  '',
  '',
  '5',
  '',
];

const INSTRUCTIONS_AR = [
  ['تعليمات'],
  ['1. الصف الأول عناوين ثابتة — لا تغيّري أسماء الأعمدة.'],
  ['2. اتركي أي حقل اختياري فارغاً (بدون ??? أو -) ليُحفظ كـ null.'],
  ['3. الفئة الرئيسية مطلوبة ويجب أن تطابق فئة موجودة حرفياً.'],
  ['4. العلامة التجارية اختيارية — إن كانت فارغة أو غير موجودة تُتجاهل (null).'],
  ['5. صف المثال للشرح فقط. احذفيه قبل الاستيراد أو استبدليه ببياناتك.'],
];

export const PRODUCT_IMPORT_TEMPLATE_FILENAME = 'products-import-template.xlsx';

function isPlaceholderCell(value: unknown): boolean {
  if (value == null) return true;
  const s = String(value).trim();
  if (s === '') return true;
  return /^(n\/?a|\?+|-+|_+|null|undefined|none|nil|فارغ)$/i.test(s);
}

function isNoneLike(value: unknown): boolean {
  const s = String(value ?? '')
    .trim()
    .toLowerCase();
  return s === 'بدون' || s === 'none' || s === 'no';
}

function normalizeName(value: unknown): string {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function collectBrandNames(brands: Array<{ name?: unknown }>): Set<string> {
  const names = new Set<string>();
  for (const brand of brands) {
    const name = brand?.name;
    if (typeof name === 'string') {
      const n = normalizeName(name);
      if (n) names.add(n);
    } else if (name && typeof name === 'object') {
      for (const part of Object.values(name as Record<string, unknown>)) {
        const n = normalizeName(part);
        if (n) names.add(n);
      }
    }
  }
  return names;
}

/** Empty optional cells (and unknown brands) become blank so the API stores null. */
export async function sanitizeProductsImportFile(
  file: File,
  knownBrands: Array<{ name?: unknown }> = []
): Promise<File> {
  try {
    return await sanitizeProductsImportFileInner(file, knownBrands);
  } catch {
    return file;
  }
}

async function sanitizeProductsImportFileInner(
  file: File,
  knownBrands: Array<{ name?: unknown }>
): Promise<File> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName =
    workbook.SheetNames.find((name) => name.toLowerCase() === 'products') ??
    workbook.SheetNames[0];
  if (!sheetName) return file;

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
    defval: '',
    raw: false,
  }) as unknown[][];
  if (!rows.length) return file;

  const headers = (rows[0] ?? []).map((h) => String(h ?? '').trim());
  const brandCol = headers.findIndex((h) => h === 'العلامة التجارية');
  const brandNames = collectBrandNames(knownBrands);

  const cleaned = rows.map((row, rowIndex) => {
    if (rowIndex === 0) return headers;
    return headers.map((header, colIndex) => {
      const cell = row[colIndex];
      if (OPTIONAL_IMPORT_HEADERS.has(header) && isPlaceholderCell(cell)) {
        return '';
      }
      if (header === 'العلامة التجارية' && isNoneLike(cell)) {
        return '';
      }
      if (header === 'نوع الخصم' && isNoneLike(cell)) {
        return '';
      }
      if (colIndex === brandCol && brandNames.size > 0) {
        const n = normalizeName(cell);
        if (n && !brandNames.has(n)) return '';
      }
      return cell == null ? '' : cell;
    });
  });

  const dataRows = cleaned.filter((row, idx) => {
    if (idx === 0) return true;
    return row.some((cell) => String(cell ?? '').trim() !== '');
  });

  const nextSheet = XLSX.utils.aoa_to_sheet(dataRows);
  const nextWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(nextWorkbook, nextSheet, 'Products');
  const out = XLSX.write(nextWorkbook, { bookType: 'xlsx', type: 'array' });
  return new File([out], file.name.replace(/\.(xls|xlsx)$/i, '.xlsx'), {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

export function buildProductsImportTemplateBlob(): Blob {
  const sheet = XLSX.utils.aoa_to_sheet([[...PRODUCT_IMPORT_COLUMNS], EXAMPLE_ROW]);
  sheet['!cols'] = PRODUCT_IMPORT_COLUMNS.map((header) => ({
    wch: Math.max(14, header.length + 2),
  }));
  const notes = XLSX.utils.aoa_to_sheet(INSTRUCTIONS_AR);
  notes['!cols'] = [{ wch: 80 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Products');
  XLSX.utils.book_append_sheet(workbook, notes, 'تعليمات');
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
