import type { VariantDeleteImpact, VariantDeleteImpactType } from '../types/variant-delete-impact.types';

import { isConfirmationRequiredError } from '@/api';
import { useRef, useState, useCallback } from 'react';
import { _ShopProductVariantApi } from '@/shared/api/shop-product-variant.services';

import { _ProductVariantApi } from '../api/product-variant.services';
import { useDeleteProductVariant, useDeleteShopProductVariant } from './product-variant';

// ----------------------------------------------------------------------

const API_BY_TARGET = {
  product_variant: _ProductVariantApi,
  shop_product_variant: _ShopProductVariantApi,
} as const;

export interface UseVariantDeleteFlowOptions<TContext> {
  /** Which endpoint family to hit — decides both the impact preview and the delete call. */
  target: VariantDeleteImpactType;
  /** Runs once the variant is actually gone: refetch, drop the form row, toast, etc. */
  onDeleted: (id: number, context: TContext) => void | Promise<void>;
  /** Called when the delete itself fails. Axios already toasted the API message. */
  onError?: (error: unknown, id: number, context: TContext) => void;
}

/**
 * Drives the two-step variant delete: preview the impact, let the user acknowledge it,
 * then repeat the call with `confirm=true`.
 *
 * The preview (`GET .../delete-impact`) is best-effort — if it is unavailable the dialog
 * still opens with generic wording and the delete falls back to the API's own `409`
 * handshake, so nothing is ever removed without the user seeing what it touches.
 *
 * Spread the returned `dialogProps` into `<VariantDeleteImpactDialog />`.
 */
export function useVariantDeleteFlow<TContext = void>({
  target,
  onDeleted,
  onError,
}: UseVariantDeleteFlowOptions<TContext>) {
  const deleteProductVariant = useDeleteProductVariant();
  const deleteShopProductVariant = useDeleteShopProductVariant();
  const deleteMutation =
    target === 'product_variant' ? deleteProductVariant : deleteShopProductVariant;

  const [pending, setPending] = useState<{ id: number; context: TContext } | null>(null);
  const [impact, setImpact] = useState<VariantDeleteImpact | null>(null);
  /** True when the preview call failed — the dialog then shows generic wording. */
  const [impactUnavailable, setImpactUnavailable] = useState(false);
  const [isLoadingImpact, setIsLoadingImpact] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /** Guards against a stale preview landing after the user opened a different row. */
  const requestSeq = useRef(0);

  const close = useCallback(() => {
    requestSeq.current += 1;
    setPending(null);
    setImpact(null);
    setImpactUnavailable(false);
    setIsLoadingImpact(false);
    setIsDeleting(false);
  }, []);

  const requestDelete = useCallback(
    async (id: number | string, context: TContext) => {
      const numericId = Number(id);
      if (!Number.isFinite(numericId) || numericId <= 0) return;

      requestSeq.current += 1;
      const seq = requestSeq.current;

      setPending({ id: numericId, context });
      setImpact(null);
      setImpactUnavailable(false);
      setIsDeleting(false);
      setIsLoadingImpact(true);

      try {
        const preview = await API_BY_TARGET[target].getDeleteImpact(numericId);
        if (seq !== requestSeq.current) return;
        setImpact(preview);
      } catch {
        if (seq !== requestSeq.current) return;
        setImpactUnavailable(true);
      } finally {
        if (seq === requestSeq.current) setIsLoadingImpact(false);
      }
    },
    [target]
  );

  const confirm = useCallback(async () => {
    if (!pending || isDeleting) return;
    const { id, context } = pending;
    const seq = requestSeq.current;

    // Only claim the ack once real details have been on screen. Without them (preview
    // unreachable or empty) the delete goes in unconfirmed so the API's own 409 still gets
    // a chance to stop it — nothing linked is ever removed unseen.
    const alreadyAcknowledged = impact !== null;

    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync({ id, confirm: alreadyAcknowledged });
      if (seq !== requestSeq.current) return;
      close();
      await onDeleted(id, context);
    } catch (error) {
      if (seq !== requestSeq.current) return;
      setIsDeleting(false);

      // The API answered "here is what this touches, ask again with confirm=true".
      // Show it and wait for a second, informed click instead of deleting behind the user.
      if (isConfirmationRequiredError<VariantDeleteImpact>(error)) {
        setImpact(error.impact ?? null);
        setImpactUnavailable(false);
        return;
      }

      close();
      onError?.(error, id, context);
    }
  }, [pending, isDeleting, impact, deleteMutation, close, onDeleted, onError]);

  return {
    requestDelete,
    /** True while a delete is in flight — disable the row's trash button. */
    isDeleting,
    dialogProps: {
      open: pending !== null,
      target,
      variantId: pending?.id ?? null,
      impact,
      impactUnavailable,
      isLoadingImpact,
      isDeleting,
      onCancel: close,
      onConfirm: confirm,
    },
  };
}
