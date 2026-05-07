import i18n from '@/lib/i18n';
import { numberFormatLocaleForUi, normalizeIndicNumeralsToLatin } from '@/utils/numeral-locale';

const CURRENCY_SYMBOL_AR = 'ل.س';
const CURRENCY_SYMBOL_EN = 'SYP';

type FormatCurrencyOptions = {
  decimals?: number;
  symbol?: boolean;
};

export function formatCurrency(
  value: number | string | null | undefined,
  options: FormatCurrencyOptions = {}
): string {
  const { decimals = 0, symbol = true } = options;

  const numeric =
    typeof value === 'number'
      ? value
      : Number.parseFloat(String(value ?? 0).replace(/,/g, ''));

  if (!Number.isFinite(numeric)) {
    const zero = symbol ? normalizeIndicNumeralsToLatin(`0 ${getCurrencySymbol()}`) : '0';
    return zero;
  }

  const locale = numberFormatLocaleForUi(i18n.language);

  const formatted = numeric.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (!symbol) return normalizeIndicNumeralsToLatin(formatted);

  return normalizeIndicNumeralsToLatin(`${formatted} ${getCurrencySymbol()}`);
}

export function getCurrencySymbol(): string {
  return i18n.language === 'ar' ? CURRENCY_SYMBOL_AR : CURRENCY_SYMBOL_EN;
}

/** Row shape from API multi-currency maps (`*_currencies`). */
export type ApiCurrencyAmount = {
  amount: number;
  currency: string;
  symbol?: string;
  formatted?: string;
};

function isArabicLanguage(lng: string): boolean {
  return lng === 'ar' || lng.startsWith('ar');
}

function formatAmountForLocale(amount: number, lng: string): string {
  const locale = numberFormatLocaleForUi(lng);
  const maxFrac = Number.isInteger(amount) ? 0 : 2;
  return normalizeIndicNumeralsToLatin(
    amount.toLocaleString(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxFrac,
    })
  );
}

/**
 * One label per locale: Arabic prefers the API symbol (e.g. ل.س), English the ISO code (e.g. SYP).
 * Avoids showing both the code and a formatted string that already includes the other script.
 */
export function formatApiCurrencyAmountForLanguage(
  block: ApiCurrencyAmount | null | undefined,
  language?: string
): string {
  if (!block) return '—';
  const raw = typeof block.amount === 'number' ? block.amount : Number(block.amount);
  if (!Number.isFinite(raw)) return '—';
  const lng = language ?? i18n.language;

  if (isArabicLanguage(lng)) {
    const sym = (block.symbol ?? '').trim() || (block.currency ?? '').trim();
    if (!sym) return formatAmountForLocale(raw, lng);
    return `${sym} ${formatAmountForLocale(raw, lng)}`;
  }

  const code = (block.currency ?? '').trim();
  if (!code) return formatAmountForLocale(raw, lng);
  return `${code} ${formatAmountForLocale(raw, lng)}`;
}
