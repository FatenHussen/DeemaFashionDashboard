import type { UseFormReturn } from 'react-hook-form';
import type { ReactNode, BaseSyntheticEvent } from 'react';

import { useTranslation } from 'react-i18next';
import { mergeClasses } from 'minimal-shared/utils';
import { Iconify } from '@/shared/components/iconify';
import React, { useRef, useMemo, useEffect } from 'react';

import { Box, Button, Typography } from 'src/shared/ui';
import { Form } from 'src/shared/components/hook-form/form-provider';

// ----------------------------------------------------------------------

export interface CreateFormLayoutProps<T extends Record<string, any>> {
  // Form configuration
  methods: UseFormReturn<T>;
  onSubmit: (e?: BaseSyntheticEvent) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;

  // Layout configuration
  title: string;
  description: string;
  icon?: ReactNode;
  isEditMode?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  /** Max width for the page content. Omit for full width (previous behavior). */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  /** Soft gradient orbs behind content (full-width immersive pages). */
  ambientBackground?: boolean;
  /** Overrides default `flex flex-col gap-6` for the form fields area (padding is always applied). */
  formInnerClassName?: string;

  // Content
  children: ReactNode;
  infoText?: string; // (kept for API compatibility, not rendered)

  // Button labels
  submitLabel?: string;
  cancelLabel?: string;
  submittingLabel?: string;
  secondarySubmitLabel?: string;
  secondarySubmittingLabel?: string;
  onSubmitButtonClick?: () => void;
  onSecondarySubmitButtonClick?: () => void;

  // Optional unsaved changes guard
  showUnsavedGuard?: boolean;
  /** When true, primary/secondary submit buttons are disabled (e.g. view-only detail). */
  submitDisabled?: boolean;
}

// ----------------------------------------------------------------------

export function CreateFormLayout<T extends Record<string, any>>({
  methods,
  onSubmit,
  onCancel,
  isSubmitting = false,
  errorMessage = null,
  title,
  description,
  icon,
  isEditMode = false,
  isLoading = false,
  loadingText,
  maxWidth,
  ambientBackground = false,
  formInnerClassName,
  children,
  submitLabel,
  cancelLabel,
  submittingLabel,
  secondarySubmitLabel,
  secondarySubmittingLabel,
  onSubmitButtonClick,
  onSecondarySubmitButtonClick,
  showUnsavedGuard = true,
  submitDisabled = false,
}: CreateFormLayoutProps<T>) {
  const { t } = useTranslation('table');

  const defaultSubmittingLabel = isEditMode ? t('updating') : t('form.creating');

  const resolvedSubmitLabel = submitLabel ?? (isEditMode ? t('edit') : t('create'));
  const resolvedSubmittingLabel = submittingLabel ?? defaultSubmittingLabel;
  const resolvedSecondarySubmittingLabel = secondarySubmittingLabel ?? resolvedSubmittingLabel;
  const resolvedCancelLabel = cancelLabel ?? t('cancel');
  const resolvedLoadingText = loadingText ?? t('loading');

  const maxWidthClass = useMemo(() => {
    if (!maxWidth) return '';
    const map: Record<string, string> = {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
      '3xl': 'max-w-screen-3xl',
      '4xl': 'max-w-screen-4xl',
      '5xl': 'max-w-screen-5xl',
      '6xl': 'max-w-screen-6xl',
      '7xl': 'max-w-screen-7xl',
    };
    return map[maxWidth] ?? '';
  }, [maxWidth]);

  const errorRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to error
  useEffect(() => {
    if (!errorMessage) return;
    requestAnimationFrame(() => {
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [errorMessage]);

  // Unsaved changes guard
  useEffect(() => {
    if (!showUnsavedGuard) return () => {};

    const handler = (e: BeforeUnloadEvent) => {
      if (methods.formState.isDirty && !isSubmitting && !submitDisabled) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [methods.formState.isDirty, isSubmitting, showUnsavedGuard, submitDisabled]);

  const handleCancel = () => {
    if (showUnsavedGuard && methods.formState.isDirty && !isSubmitting && !submitDisabled) {
      const ok = window.confirm(t('unsavedChanges'));
      if (!ok) return;
    }
    onCancel();
  };

  const modePillClasses = useMemo(() => {
    const base =
      'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold tracking-wide shadow-sm';
    return isEditMode
      ? `${base} border-amber-400/75 bg-amber-50/95 text-amber-900 dark:border-amber-600/55 dark:bg-amber-950/35 dark:text-amber-200`
      : `${base} border-primary bg-primary text-primary-foreground shadow-[0_1px_2px_rgb(0_0_0_/_0.08)] dark:border-primary dark:bg-primary dark:text-primary-foreground`;
  }, [isEditMode]);

  return (
    <Box
      className={mergeClasses([
        'min-h-screen w-full',
        ambientBackground ? 'relative overflow-hidden' : 'bg-background',
      ])}
    >
      {ambientBackground && (
        <>
          <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/25" />
          <Box className="pointer-events-none fixed top-0 right-0 h-[min(60vh,520px)] w-[min(90vw,640px)] -translate-y-1/4 translate-x-1/4 rounded-full bg-primary/[0.07] blur-[100px]" />
          <Box className="pointer-events-none fixed bottom-0 left-0 h-[min(50vh,420px)] w-[min(80vw,520px)] translate-y-1/4 -translate-x-1/4 rounded-full bg-violet-500/[0.06] blur-[90px]" />
        </>
      )}
      <Box
        className={mergeClasses([
          'relative z-[1] w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8',
          maxWidthClass,
          maxWidthClass ? 'mx-auto' : '',
        ])}
      >
        {/* Hero Header */}
        <Box className="mb-5">
          <Box className="relative rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/[0.08] via-card to-card shadow-md overflow-hidden">
            {/* Primary accent strip */}
            <Box className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/70 via-primary to-primary/70" />

            <Box className="relative p-6 md:p-8">
              <Box className="flex items-start justify-between gap-6 flex-wrap">
                <Box className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Icon Badge */}
                  <Box className="relative shrink-0">
                    <Box className="absolute inset-0 rounded-xl bg-primary/10 blur-md" />
                    <Box className="relative h-12 w-12 rounded-xl border border-border/50 bg-background/60 flex items-center justify-center">
                      {icon ?? (
                        <Iconify
                          icon={isEditMode ? 'solar:pen-bold' : 'solar:add-circle-bold'}
                          className="text-primary"
                          width={24}
                          height={24}
                        />
                      )}
                    </Box>
                  </Box>

                  <Box className="flex-1 min-w-0">
                    <Box className="flex items-center gap-3 flex-wrap mb-2">
                      <Typography variant="h4" className="font-semibold text-foreground">
                        {title}
                      </Typography>

                      <span className={modePillClasses}>{isEditMode ? t('edit') : t('create')}</span>

                      {methods.formState.isDirty && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                          {t('unsaved')}
                        </span>
                      )}
                    </Box>

                    <Typography variant="body2" className="text-muted-foreground leading-relaxed">
                      {description}
                    </Typography>

                    {/* Loading State */}
                    {isLoading && (
                      <Box className="mt-4">
                        <Box className="h-1 w-full rounded-full bg-muted overflow-hidden">
                          <Box className="h-full w-1/3 bg-primary/40 animate-[shimmer_1.5s_ease-in-out_infinite] [background-image:linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)]" />
                        </Box>
                        <Typography variant="caption" className="text-muted-foreground mt-2 block">
                          {resolvedLoadingText}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Header Actions */}
                <Box className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="min-w-[100px]"
                  >
                    {resolvedCancelLabel}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Error Alert */}
        {errorMessage && (
          <Box
            ref={errorRef}
            className="mb-6 rounded-xl border border-red-200/60 dark:border-red-800/40 bg-red-50/50 dark:bg-red-950/20 px-4 py-3"
            role="alert"
            aria-live="polite"
          >
            <Box className="flex items-start gap-3">
              <Box className="mt-0.5 shrink-0">
                <Iconify
                  icon="solar:danger-bold"
                  className="text-red-600 dark:text-red-400"
                  width={18}
                  height={18}
                />
              </Box>
              <Box className="min-w-0 flex-1">
                <Typography variant="body2" className="text-red-700 dark:text-red-300 font-medium">
                  {errorMessage}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        <style>
          {`
            /* Project-wide section card polish for create/update forms */
            .create-form-sections > .rounded-2xl {
              border-width: 1px !important;
              border-color: color-mix(in oklab, hsl(var(--border)) 62%, transparent) !important;
              box-shadow:
                0 1px 2px rgba(0, 0, 0, 0.05),
                0 0 0 1px color-mix(in oklab, hsl(var(--border)) 20%, transparent) inset;
            }

            /* Remove duplicated section title bars (keep field labels only) */
            .create-form-sections > .rounded-2xl > [class*="px-6"][class*="py-4"][class*="border-b"] {
              display: none !important;
            }
          `}
        </style>

        {/* Form Card */}
        <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm">
          <Form methods={methods} onSubmit={onSubmit}>
            {/* Content */}
            <Box
              className={mergeClasses([
                'create-form-sections p-5 sm:p-6 md:p-8 pb-28 sm:pb-32',
                formInnerClassName ?? 'flex flex-col gap-6',
              ])}
            >
              {children}
            </Box>

            {/* Sticky Actions */}
            <Box className="sticky bottom-0 z-50 border-t border-border/50 bg-card/95 backdrop-blur-md rounded-b-2xl pointer-events-auto">
              <Box className="px-5 sm:px-6 md:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
                <Box className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  <span>{t('reviewBeforeSubmit')}</span>
                </Box>

                <Box className="flex items-center gap-2">
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="min-w-[100px]"
                  >
                    {resolvedCancelLabel}
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting || submitDisabled}
                    onClick={onSubmitButtonClick}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? resolvedSubmittingLabel : resolvedSubmitLabel}
                  </Button>

                  {secondarySubmitLabel && (
                    <Button
                      type="submit"
                      variant="outlined"
                      disabled={isSubmitting || submitDisabled}
                      onClick={onSecondarySubmitButtonClick}
                      className="min-w-[120px]"
                    >
                      {isSubmitting ? resolvedSecondarySubmittingLabel : secondarySubmitLabel}
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          </Form>
        </Box>
      </Box>
    </Box>
  );
}
