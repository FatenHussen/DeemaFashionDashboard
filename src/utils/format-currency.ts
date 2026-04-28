import i18n from '@/lib/i18n';

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

  if (!Number.isFinite(numeric)) return symbol ? `0 ${getCurrencySymbol()}` : '0';

  const isArabic = i18n.language === 'ar';
  const locale = isArabic ? 'ar-SY' : 'en-US';

  const formatted = numeric.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (!symbol) return formatted;

  return `${formatted} ${getCurrencySymbol()}`;
}

export function getCurrencySymbol(): string {
  return i18n.language === 'ar' ? CURRENCY_SYMBOL_AR : CURRENCY_SYMBOL_EN;
}
