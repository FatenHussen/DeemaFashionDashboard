import type { TFunction } from 'i18next';

import { Iconify } from '@/shared/components/iconify';

import { Box, Button, Typography } from 'src/shared/ui';



// ----------------------------------------------------------------------



type Props = {

  totalCount: number;

  withSkuCount: number;

  missingSkuCount: number;

  onGenerateAllMissing: () => void;

  t: TFunction;

};



function StatPill({

  label,

  value,

  accent,

}: {

  label: string;

  value: number;

  accent?: 'primary' | 'muted' | 'warning';

}) {

  const cls =

    accent === 'primary'

      ? 'border-primary/20 bg-primary/5 text-foreground'

      : accent === 'warning'

        ? 'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300'

        : 'border-border/50 bg-muted/30 text-muted-foreground';



  return (

    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs ${cls}`}>

      <span className="font-medium">{label}</span>

      <span className="font-semibold tabular-nums text-foreground">{value}</span>

    </span>

  );

}



export function ProductVariantsSkuToolbar({

  totalCount,

  withSkuCount,

  missingSkuCount,

  onGenerateAllMissing,

  t,

}: Props) {

  if (totalCount === 0) return null;



  return (

    <Box className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/40 bg-muted/20 px-4 py-3">

      <Box className="flex flex-wrap items-center gap-2">

        <Typography variant="body2" className="me-1 font-semibold text-foreground">

          {t('form.variantListTitle')}

        </Typography>

        <StatPill label={t('form.variantSkuStatsTotalLabel')} value={totalCount} accent="primary" />

        <StatPill label={t('form.variantSkuStatsWithSkuLabel')} value={withSkuCount} />

        <StatPill label={t('form.variantSkuStatsMissingLabel')} value={missingSkuCount} accent="warning" />

      </Box>

      <Button

        type="button"

        variant="outlined"

        size="small"

        disabled={missingSkuCount === 0}

        onClick={onGenerateAllMissing}

        className="shrink-0"

      >

        <Iconify icon="solar:magic-stick-3-bold" width={16} className="me-1.5" />

        {t('form.variantGenerateAllMissingSku')}

      </Button>

    </Box>

  );

}

