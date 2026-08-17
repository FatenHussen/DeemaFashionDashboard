import type {
  VariantDeleteImpact,
  VariantDeleteImpactType,
  VariantDeleteImpactWarning,
} from '../types/variant-delete-impact.types';

import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { Box, Button, Dialog, Typography } from '@/shared/ui';

import { hasVariantDeleteImpact } from '../types/variant-delete-impact.types';

// ----------------------------------------------------------------------

/** Warnings about records that survive the delete are informational, not destructive. */
const PRESERVED_KEYS = new Set(['active_orders', 'past_orders', 'images']);

export interface VariantDeleteImpactDialogProps {
  open: boolean;
  target: VariantDeleteImpactType;
  variantId: number | null;
  impact: VariantDeleteImpact | null;
  /** The preview call failed — fall back to generic wording instead of an empty list. */
  impactUnavailable: boolean;
  isLoadingImpact: boolean;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function WarningRow({ warning }: { warning: VariantDeleteImpactWarning }) {
  const preserved = PRESERVED_KEYS.has(warning.key);
  return (
    <Box
      className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${
        preserved
          ? 'border-sky-500/30 bg-sky-500/5'
          : 'border-amber-500/30 bg-amber-500/5'
      }`}
    >
      <Iconify
        icon={preserved ? 'solar:info-circle-bold' : 'solar:danger-triangle-bold'}
        width={18}
        className={`mt-0.5 shrink-0 ${preserved ? 'text-sky-500' : 'text-amber-500'}`}
      />
      <Typography variant="body2" className="text-foreground">
        {warning.message}
      </Typography>
    </Box>
  );
}

/**
 * Confirmation step for a variant delete: lists everything the API says the delete would
 * remove or leave untouched before the user commits.
 *
 * `warnings[].message` arrives already localized by the backend, so it renders verbatim;
 * the surrounding copy comes from the dashboard's own translations.
 */
export function VariantDeleteImpactDialog({
  open,
  target,
  variantId,
  impact,
  impactUnavailable,
  isLoadingImpact,
  isDeleting,
  onCancel,
  onConfirm,
}: VariantDeleteImpactDialogProps) {
  const { t } = useTranslation();

  const warnings = impact?.warnings ?? [];
  const activeOrders = impact?.active_orders ?? [];
  const hasImpact = hasVariantDeleteImpact(impact);

  const title =
    target === 'product_variant'
      ? t('form.variantDeleteImpactTitle')
      : t('form.shopVariantDeleteImpactTitle');

  const idLabel =
    target === 'product_variant'
      ? t('form.variantDeleteImpactSubject', { id: variantId ?? '' })
      : t('form.shopVariantDeleteImpactSubject', { id: variantId ?? '' });

  let body: React.ReactNode;
  if (isLoadingImpact) {
    body = (
      <Box className="flex items-center gap-2 py-2 text-muted-foreground">
        <Iconify icon="svg-spinners:ring-resize" width={18} />
        <Typography variant="body2">{t('form.variantDeleteImpactLoading')}</Typography>
      </Box>
    );
  } else if (hasImpact) {
    body = (
      <Box className="space-y-3">
        <Typography variant="body2" className="text-muted-foreground">
          {t('form.variantDeleteImpactIntro')}
        </Typography>

        <Box className="space-y-2">
          {warnings.length > 0 ? (
            warnings.map((warning, i) => (
              <WarningRow key={`${warning.key}-${i}`} warning={warning} />
            ))
          ) : (
            <WarningRow
              warning={{
                key: 'generic',
                count: 0,
                message: t('form.variantDeleteImpactUnlistedLinks'),
              }}
            />
          )}
        </Box>

        {activeOrders.length > 0 && (
          <Box className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <Typography variant="caption" className="mb-2 block font-semibold text-foreground">
              {t('form.variantDeleteImpactActiveOrders')}
            </Typography>
            <Box className="flex flex-wrap gap-1.5">
              {activeOrders.map((order) => (
                <Box
                  key={order.id}
                  className="rounded-md border border-border/60 bg-background px-2 py-1 text-xs"
                  title={order.status ?? undefined}
                >
                  <span className="font-mono">{order.order_code ?? `#${order.id}`}</span>
                  {order.status ? (
                    <span className="text-muted-foreground"> · {order.status}</span>
                  ) : null}
                </Box>
              ))}
            </Box>
            <Typography variant="caption" className="mt-2 block text-muted-foreground">
              {t('form.variantDeleteImpactOrdersPreserved')}
            </Typography>
          </Box>
        )}

        <Typography variant="body2" className="font-medium text-foreground">
          {t('form.variantDeleteImpactQuestion')}
        </Typography>
      </Box>
    );
  } else {
    body = (
      <Box className="space-y-2">
        <Typography variant="body2">
          {impactUnavailable
            ? t('form.variantDeleteImpactUnavailable')
            : t('form.variantDeleteImpactNoLinks')}
        </Typography>
        <Typography variant="body2" className="font-medium text-foreground">
          {t('form.variantDeleteImpactQuestion')}
        </Typography>
      </Box>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={isDeleting ? undefined : onCancel}
      maxWidth="sm"
      disableEscapeKeyDown={isDeleting}
      disableBackdropClick={isDeleting}
      title={
        <Box className="flex flex-col gap-0.5">
          <span>{title}</span>
          {variantId ? (
            <Typography variant="caption" className="font-normal text-muted-foreground">
              {idLabel}
            </Typography>
          ) : null}
        </Box>
      }
      content={<Box className="max-h-[55vh] overflow-y-auto">{body}</Box>}
      actions={
        <>
          <Button variant="outlined" onClick={onCancel} disabled={isDeleting}>
            {t('cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={onConfirm}
            disabled={isDeleting || isLoadingImpact}
          >
            {isDeleting ? t('form.variantDeleteImpactDeleting') : t('form.variantDeleteImpactConfirm')}
          </Button>
        </>
      }
    />
  );
}
