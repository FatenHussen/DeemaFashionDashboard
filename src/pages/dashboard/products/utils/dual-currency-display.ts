import { formatDecimal, normalizeFormattedMoneyText, formatApiCurrencyAmountForLanguage } from '@/utils/format-currency';

export type DualCurrencyInput = {
  currencies?: Record<
    string,
    { amount?: number; currency?: string; symbol?: string; formatted?: string } | null
  > | null;
  singleFormatted?: string | null;
  amount?: number | null;
  legacySypPrefix?: string;
};

function formatCurrencyCell(
  code: string,
  row: { amount?: number; currency?: string; symbol?: string; formatted?: string }
): string {
  if (
    typeof row.amount === 'number' &&
    Number.isFinite(row.amount) &&
    (row.currency != null || code)
  ) {
    return formatApiCurrencyAmountForLanguage({
      amount: row.amount,
      currency: (row.currency ?? code) as string,
      symbol: row.symbol,
    });
  }
  return normalizeFormattedMoneyText(row?.formatted ?? '—');
}

/** Resolve SYP + USD strings for side-by-side pricing rows. */
export function resolveDualCurrencyDisplay(input: DualCurrencyInput): {
  syp: string;
  usd: string;
} {
  const { currencies, singleFormatted, amount, legacySypPrefix } = input;

  if (currencies && typeof currencies === 'object') {
    const sypRow = currencies.SYP ?? currencies.syp;
    const usdRow = currencies.USD ?? currencies.usd;
    const syp = sypRow ? formatCurrencyCell('SYP', sypRow) : '—';
    const usd = usdRow ? formatCurrencyCell('USD', usdRow) : '—';
    if (syp !== '—' || usd !== '—') {
      return { syp, usd };
    }
  }

  if (singleFormatted) {
    const text = normalizeFormattedMoneyText(singleFormatted);
    return { syp: text, usd: '—' };
  }

  if (amount != null && !Number.isNaN(Number(amount)) && legacySypPrefix) {
    return { syp: `${legacySypPrefix} ${formatDecimal(amount)}`, usd: '—' };
  }

  return { syp: '—', usd: '—' };
}
