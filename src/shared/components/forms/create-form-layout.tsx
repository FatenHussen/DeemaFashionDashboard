import type { UseFormReturn } from 'react-hook-form';
import type { ReactNode, BaseSyntheticEvent } from 'react';
import React, { useEffect, useMemo, useRef } from 'react';

import { Iconify } from '@/shared/components/iconify';

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
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';

  // Content
  children: ReactNode;
  infoText?: string; // (kept for API compatibility, not rendered)

  // Button labels
  submitLabel?: string;
  cancelLabel?: string;
  submittingLabel?: string;

  // Optional unsaved changes guard
  showUnsavedGuard?: boolean;
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
  loadingText = 'Loading...',
  maxWidth = '6xl',
  children,
  submitLabel,
  cancelLabel = 'Cancel',
  submittingLabel,
  showUnsavedGuard = true,
}: CreateFormLayoutProps<T>) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
  };

  const defaultSubmitLabel = isEditMode ? 'Update' : 'Create';
  const defaultSubmittingLabel = isEditMode ? 'Updating...' : 'Creating...';

  const resolvedSubmitLabel = submitLabel ?? defaultSubmitLabel;
  const resolvedSubmittingLabel = submittingLabel ?? defaultSubmittingLabel;

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
    if (!showUnsavedGuard) return;

    const handler = (e: BeforeUnloadEvent) => {
      if (methods.formState.isDirty && !isSubmitting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [methods.formState.isDirty, isSubmitting, showUnsavedGuard]);

  const handleCancel = () => {
    if (showUnsavedGuard && methods.formState.isDirty && !isSubmitting) {
      const ok = window.confirm('You have unsaved changes. Leave anyway?');
      if (!ok) return;
    }
    onCancel();
  };

  const modePillClasses = useMemo(() => {
    const base =
      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur';
    return isEditMode
      ? `${base} border-amber-300/70 bg-amber-50/70 text-amber-700 dark:border-amber-700/50 dark:bg-amber-950/25 dark:text-amber-300`
      : `${base} border-emerald-300/70 bg-emerald-50/70 text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-950/25 dark:text-emerald-300`;
  }, [isEditMode]);

  return (
    <Box className="min-h-screen bg-background">
      {/* Subtle background pattern */}
      <Box className="pointer-events-none fixed inset-0">
        <Box className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_70%)]" />
        <Box className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </Box>

      <Box
        className={`relative mx-auto ${maxWidthClasses[maxWidth]} px-4 sm:px-6 lg:px-8 py-8 md:py-12`}
      >
        {/* Hero Header */}
        <Box className="mb-8">
          <Box className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
            {/* Subtle gradient accent */}
            <Box className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-primary/[0.01]" />

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

                      <span className={modePillClasses}>{isEditMode ? 'Edit' : 'Create'}</span>

                      {methods.formState.isDirty && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                          Unsaved
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
                          {loadingText}
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
                    {cancelLabel}
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

        {/* Form Card */}
        <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
          <Form methods={methods} onSubmit={onSubmit}>
            {/* Content */}
            <Box className="p-6 md:p-8 lg:p-10">
              <Box className="flex flex-col gap-6">{children}</Box>
            </Box>

            {/* Sticky Actions */}
            <Box className="sticky bottom-0 z-10 border-t border-border/50 bg-card/95 backdrop-blur-md">
              <Box className="px-6 md:px-8 lg:px-10 py-4 flex items-center justify-between gap-4 flex-wrap">
                <Box className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  <span>Review your information before submitting</span>
                </Box>

                <Box className="flex items-center gap-2">
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="min-w-[100px]"
                  >
                    {cancelLabel}
                  </Button>

                  <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                    {isSubmitting ? resolvedSubmittingLabel : resolvedSubmitLabel}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Form>
        </Box>
      </Box>
    </Box>
  );
}
