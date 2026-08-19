import type {
  CategoryAttributeLinkedItem,
  CategoryAttributeDeleteWarning,
  CategoryAttributeDeleteImpactData,
} from '@/pages/dashboard/categories/types/category-attribute.types';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { isConfirmationRequiredError } from '@/api';
import { Iconify } from '@/shared/components/iconify';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatTranslated } from '@/utils/format-translated';
import { Dialog, DialogContent } from '@/shared/ui/dialogTable';
import {
  useDeleteCategoryAttribute,
  useFetchCategoryAttributeLinkedItems,
  useFetchCategoryAttributeDeleteImpact,
} from '@/pages/dashboard/categories/hooks/category-attribute';

import { Box, Button, Typography } from 'src/shared/ui';

// ----------------------------------------------------------------------

/** Records that survive the delete — informational, not destructive. */
const PRESERVED_KEYS = new Set(['active_orders', 'products']);

function resolveVariantLabel(item: CategoryAttributeLinkedItem): string {
  const label = formatTranslated(item.variant_name, '');
  if (label.trim()) return label;
  return item.product?.name ?? '';
}

function WarningRow({ warning }: { warning: CategoryAttributeDeleteWarning }) {
  const preserved = PRESERVED_KEYS.has(warning.key);
  return (
    <Box
      className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${
        preserved ? 'border-sky-500/30 bg-sky-500/10' : 'border-amber-500/30 bg-amber-500/10'
      }`}
    >
      <Iconify
        icon={preserved ? 'solar:info-circle-bold' : 'solar:danger-triangle-bold'}
        className={`shrink-0 mt-0.5 ${preserved ? 'text-sky-600' : 'text-amber-600'}`}
        width={18}
      />
      <Typography variant="body2" className="text-foreground">
        {warning.message}
      </Typography>
    </Box>
  );
}

export type CategoryAttributeDeleteDialogProps = {
  id: number;
  onCancel: () => void;
  onDeleted: () => void;
};

export function CategoryAttributeDeleteDialog({
  id,
  onCancel,
  onDeleted,
}: CategoryAttributeDeleteDialogProps) {
  const { t } = useTranslation('table');
  const [activeTab, setActiveTab] = useState<'warnings' | 'linked'>('warnings');
  const [linkedPage, setLinkedPage] = useState(1);

  /** Impact from the API's own 409, used when the preview endpoint was unavailable. */
  const [fallbackImpact, setFallbackImpact] = useState<CategoryAttributeDeleteImpactData | null>(
    null
  );

  const { data: impactResp, isLoading: isLoadingImpact } =
    useFetchCategoryAttributeDeleteImpact(id);
  /** The preview when it loaded, otherwise whatever the rejected delete told us. */
  const impact = impactResp?.data ?? fallbackImpact;
  const requiresConfirmation = impact?.requires_confirmation ?? false;

  const { data: linkedResp, isLoading: isLoadingLinked } = useFetchCategoryAttributeLinkedItems(
    requiresConfirmation && activeTab === 'linked' ? id : null,
    linkedPage,
    10
  );
  const linkedItems = linkedResp?.data?.items ?? [];
  const linkedPagination = linkedResp?.data?.pagination;

  const deleteMutation = useDeleteCategoryAttribute();

  const handleConfirm = async () => {
    // Only claim the acknowledgement once real details have been on screen. If the preview
    // failed the delete goes in unconfirmed, so the API's own 409 still gets a chance to stop
    // it — linked data is never removed unseen.
    const acknowledged = impact != null;
    try {
      const res = await deleteMutation.mutateAsync({ id, confirm: acknowledged });
      toast.success((res as { message?: string })?.message || t('deleteSuccess'));
      onDeleted();
    } catch (error) {
      // "Here is what this touches — ask again with confirm=true." Show it and wait for a
      // second, informed click.
      if (isConfirmationRequiredError<CategoryAttributeDeleteImpactData>(error)) {
        setFallbackImpact(error.impact ?? null);
        return;
      }
      /* other errors are surfaced by the axios interceptor */
    }
  };

  const attrName =
    impact?.name && typeof impact.name === 'object'
      ? formatTranslated(impact.name as { en?: string; ar?: string })
      : String(impact?.name ?? '');

  const productImage = (item: CategoryAttributeLinkedItem) =>
    item.product?.image || item.variant_image || null;

  const warnings = impact?.warnings ?? [];

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent
        className={`bg-background text-foreground p-6 rounded-lg shadow-lg z-[9999] w-full ${
          requiresConfirmation ? 'max-w-3xl' : 'max-w-lg'
        }`}
      >
        <h2 className="text-lg font-bold mb-1">{t('confirmDelete')}</h2>
        {attrName ? (
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {attrName}
          </Typography>
        ) : null}

        {isLoadingImpact ? (
          <Typography variant="body2" className="text-muted-foreground py-6 text-center block">
            {t('form.loadingDeleteImpact')}
          </Typography>
        ) : !requiresConfirmation ? (
          <Typography variant="body2">{t('areYouSure')}</Typography>
        ) : (
          <>
            <Box className="flex items-center gap-1 border-b border-border mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('warnings')}
                className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === 'warnings'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('form.deleteImpactWarningsTab')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('linked')}
                className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === 'linked'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('form.deleteImpactLinkedItemsTab')}
                {impact?.counts?.product_variants ? ` (${impact.counts.product_variants})` : ''}
              </button>
            </Box>

            {activeTab === 'warnings' ? (
              <Box className="space-y-2 max-h-72 overflow-y-auto">
                {warnings.length > 0 ? (
                  warnings.map((w) => <WarningRow key={w.key} warning={w} />)
                ) : (
                  <Typography variant="body2">{t('areYouSure')}</Typography>
                )}
              </Box>
            ) : (
              <Box className="max-h-72 overflow-y-auto">
                {isLoadingLinked ? (
                  <Typography
                    variant="body2"
                    className="text-muted-foreground py-4 text-center block"
                  >
                    {t('form.loadingLinkedItems')}
                  </Typography>
                ) : linkedItems.length === 0 ? (
                  <Typography
                    variant="body2"
                    className="text-muted-foreground py-4 text-center block"
                  >
                    {t('form.noLinkedItems')}
                  </Typography>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[36rem]">
                      <thead>
                        <tr className="text-muted-foreground text-xs">
                          <th className="text-start py-1.5 px-2">{t('form.linkedItemProduct')}</th>
                          <th className="text-start py-1.5 px-2">{t('form.linkedItemVariant')}</th>
                          <th className="text-start py-1.5 px-2">{t('form.linkedItemCategory')}</th>
                          <th className="text-start py-1.5 px-2">{t('form.linkedItemValues')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {linkedItems.map((item) => {
                          const image = productImage(item);
                          return (
                            <tr key={item.variant_id} className="border-t border-border/50">
                              <td className="py-2 px-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  {image ? (
                                    <img
                                      src={image}
                                      alt=""
                                      className="h-8 w-8 rounded object-cover shrink-0"
                                    />
                                  ) : null}
                                  <span className="truncate">{item.product?.name}</span>
                                </div>
                              </td>
                              <td className="py-2 px-2">
                                <div className="truncate">{resolveVariantLabel(item)}</div>
                                {item.sku ? (
                                  <div className="text-xs text-muted-foreground">{item.sku}</div>
                                ) : null}
                              </td>
                              <td className="py-2 px-2 text-muted-foreground">
                                {item.product?.category?.name}
                              </td>
                              <td className="py-2 px-2">
                                <div className="flex flex-wrap gap-1">
                                  {(item.used_values ?? []).map((v) => (
                                    <span
                                      key={v.id}
                                      className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs"
                                    >
                                      {v.hex ? (
                                        <span
                                          className="h-2.5 w-2.5 rounded-full border border-border/60 shrink-0"
                                          style={{ backgroundColor: v.hex }}
                                        />
                                      ) : null}
                                      {v.name}
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                {linkedPagination && linkedPagination.last_page > 1 ? (
                  <Box className="flex items-center justify-between mt-3">
                    <Button
                      type="button"
                      variant="outlined"
                      size="small"
                      disabled={linkedPage <= 1}
                      onClick={() => setLinkedPage((p) => Math.max(1, p - 1))}
                      aria-label={t('goToPreviousPage')}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Typography variant="caption" className="text-muted-foreground">
                      {linkedPagination.current_page} / {linkedPagination.last_page}
                    </Typography>
                    <Button
                      type="button"
                      variant="outlined"
                      size="small"
                      disabled={linkedPage >= linkedPagination.last_page}
                      onClick={() => setLinkedPage((p) => p + 1)}
                      aria-label={t('goToNextPage')}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Box>
                ) : null}
              </Box>
            )}
          </>
        )}

        <div className="flex justify-end space-x-2 mt-5">
          <Button variant="outlined" onClick={onCancel} disabled={deleteMutation.isPending}>
            {t('cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirm}
            disabled={deleteMutation.isPending || isLoadingImpact}
          >
            {deleteMutation.isPending ? t('deleting') : t('delete')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
