import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

// ----------------------------------------------------------------------

export const CitySchema = zod
  .object({
    name: zod.object({
      en: zod.string().min(1, { message: t('city.nameEnRequired') }),
      ar: zod.string().min(1, { message: t('city.nameArRequired') }),
    }),
    governorate_id: zod.number().min(1, { message: t('city.governorateRequired') }),
    tax_type: zod.enum(['percent', 'fixed']),
    tax_value: zod.coerce.number().min(0, { message: t('city.taxValueMin') }),
  })
  .superRefine((data, ctx) => {
    if (data.tax_type === 'percent' && data.tax_value > 100) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        path: ['tax_value'],
        message: t('city.taxValuePercentMax'),
      });
    }
  });

export type CityFormValues = zod.infer<typeof CitySchema>;

/** Build write payload: percent keeps tax_rate = tax_value; fixed sends tax_rate = 0. */
export function toCityTaxWritePayload(data: Pick<CityFormValues, 'tax_type' | 'tax_value'>): {
  tax_type: 'percent' | 'fixed';
  tax_value: number;
  tax_rate: number;
} {
  const taxValue = Number(data.tax_value) || 0;
  const taxType = data.tax_type === 'fixed' ? 'fixed' : 'percent';
  return {
    tax_type: taxType,
    tax_value: taxValue,
    tax_rate: taxType === 'percent' ? taxValue : 0,
  };
}

/** Prefer tax_value; fall back to tax_rate when type is percent. */
export function resolveCityTaxFormValues(source: {
  tax_type?: string | null;
  tax_value?: number | string | null;
  tax_rate?: number | string | null;
}): Pick<CityFormValues, 'tax_type' | 'tax_value'> {
  const taxType = source.tax_type === 'fixed' ? 'fixed' : 'percent';
  const rawValue = source.tax_value;
  const hasValue =
    rawValue !== undefined && rawValue !== null && String(rawValue).trim() !== '';
  if (hasValue) {
    return { tax_type: taxType, tax_value: Number(rawValue) || 0 };
  }
  if (taxType === 'percent' && source.tax_rate != null && String(source.tax_rate).trim() !== '') {
    return { tax_type: taxType, tax_value: Number(source.tax_rate) || 0 };
  }
  return { tax_type: 'percent', tax_value: 0 };
}
