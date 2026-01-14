import type { UseFormReturn } from 'react-hook-form';
import type { ReactNode, BaseSyntheticEvent } from 'react';

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
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

  // Content
  children: ReactNode;
  infoText?: string;

  // Button labels
  submitLabel?: string;
  cancelLabel?: string;
  submittingLabel?: string;
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
  loadingText = 'Loading data...',
  maxWidth = '4xl',
  children,
  infoText,
  submitLabel,
  cancelLabel = 'Cancel',
  submittingLabel,
}: CreateFormLayoutProps<T>) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  const defaultSubmitLabel = isEditMode ? 'Update' : 'Create';
  const defaultSubmittingLabel = isEditMode ? 'Updating...' : 'Creating...';

  return (
    <Box className="relative min-h-screen overflow-hidden bg-background p-6">
      {/* Subtle background gradient */}
      <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />

      {/* Refined grid overlay */}
      <Box className="pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <Box className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </Box>

      <Box className={`relative ${maxWidthClasses[maxWidth]} mx-auto`}>
        {/* Loading State */}
        {isLoading && (
          <Box className="mb-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
            <Box className="p-5 flex items-center gap-3">
              <Box className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin flex-shrink-0" />
              <Typography variant="body2" className="text-foreground flex-1">
                {loadingText}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Header */}
        <Box className="mb-8">
          <Box className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
            {/* <Box className="p-6"> */}
            <Box className="flex items-start justify-between gap-6 flex-wrap">
              <Box className="flex items-start gap-4 flex-1 min-w-0">
                {/* Icon badge */}
                <Box className="relative flex-shrink-0">
                  <Box className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
                    {icon ?? (
                      <Iconify
                        icon={isEditMode ? 'solar:pen-bold' : 'solar:add-circle-bold'}
                        className="text-primary"
                        width={28}
                        height={28}
                      />
                    )}
                  </Box>
                </Box>

                <Box className="flex-1 min-w-0">
                  <Box className="flex items-center gap-3 flex-wrap mb-2">
                    <Typography variant="h4" className="font-semibold text-foreground">
                      {title}
                    </Typography>

                    {/* Mode pill */}
                    <Box
                      className={`rounded-lg px-2.5 py-1 border ${
                        isEditMode
                          ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50'
                          : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
                      }`}
                    >
                      <Typography
                        variant="caption"
                        className={`font-medium ${
                          isEditMode
                            ? 'text-amber-700 dark:text-amber-300'
                            : 'text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {isEditMode ? 'Edit' : 'Create'}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" className="text-muted-foreground leading-relaxed">
                    {description}
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={isSubmitting}
                className="border-border hover:bg-muted/50 min-w-[100px] flex-shrink-0"
              >
                {cancelLabel}
              </Button>
            </Box>
            {/* </Box> */}
          </Box>
        </Box>

        {/* Error Message */}
        {errorMessage && (
          <Box
            className="mb-6 rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-950/20 shadow-sm"
            role="alert"
            aria-live="polite"
          >
            <Box className="p-4 flex items-start gap-3">
              <Box className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 flex items-center justify-center flex-shrink-0">
                <Iconify
                  icon="solar:danger-bold"
                  className="text-red-600 dark:text-red-400"
                  width={20}
                  height={20}
                />
              </Box>

              <Box className="flex-1 min-w-0">
                <Typography
                  variant="caption"
                  className="text-red-700 dark:text-red-300 font-semibold block mb-1"
                >
                  Error
                </Typography>
                <Typography
                  variant="body2"
                  className="text-red-600 dark:text-red-400 leading-relaxed"
                >
                  {errorMessage}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Form Card */}
        <Box className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
          <Form methods={methods} onSubmit={onSubmit}>
            {/* Content */}
            <Box className="p-6 md:p-8">
              <Box className="flex flex-col gap-6">{children}</Box>
            </Box>

            {/* Sticky Actions */}
            <Box className="sticky bottom-0 z-10 border-t border-border/60 bg-card/95 backdrop-blur-md shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]">
              <Box className="px-6 md:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
                <Box className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Box className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                  <span>Review your information before submitting</span>
                </Box>

                <Box className="flex items-center gap-3">
                  <Button
                    variant="outlined"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="min-w-[100px] border-border hover:bg-muted/50 transition-colors"
                  >
                    {cancelLabel}
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[140px] bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <Box className="flex items-center gap-2">
                        <Box className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        <span>{submittingLabel || defaultSubmittingLabel}</span>
                      </Box>
                    ) : (
                      <span>{submitLabel || defaultSubmitLabel}</span>
                    )}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Form>
        </Box>

        {/* Info Card */}
        {infoText && (
          <Box className="mt-6 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10">
            <Box className="p-4 flex items-start gap-3">
              <Box className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Iconify
                  icon="solar:info-circle-bold"
                  className="text-primary"
                  width={18}
                  height={18}
                />
              </Box>
              <Box className="flex-1 min-w-0">
                <Typography variant="caption" className="font-semibold text-foreground mb-1 block">
                  Quick Tips
                </Typography>
                <Typography variant="body2" className="text-muted-foreground leading-relaxed">
                  {infoText}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
