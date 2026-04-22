import type { UseFormReturn } from 'react-hook-form';
import type { ReactNode, BaseSyntheticEvent } from 'react';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';

import { Box, Button, Typography } from 'src/shared/ui';
import { Form } from 'src/shared/components/hook-form/form-provider';

// ----------------------------------------------------------------------

export interface StepperStep {
  label: string;
  description?: string;
  icon?: string;
  content: ReactNode;
}

export interface StepperFormLayoutProps<T extends Record<string, any>> {
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
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';

  // Stepper configuration
  steps: StepperStep[];
  defaultStep?: number;
  /** When moving to the next step, validate these react-hook-form paths first (same order as `steps`). */
  stepValidationFields?: string[][];
  /** Short hint under the step indicator (e.g. review before submit). */
  reviewHint?: string;

  // Button labels
  submitLabel?: string;
  cancelLabel?: string;
  submittingLabel?: string;
  nextLabel?: string;
  backLabel?: string;
}

// ----------------------------------------------------------------------

export function StepperFormLayout<T extends Record<string, any>>({
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
  maxWidth = '4xl',
  steps,
  defaultStep = 0,
  stepValidationFields,
  reviewHint,
  submitLabel,
  cancelLabel,
  submittingLabel,
  nextLabel,
  backLabel,
}: StepperFormLayoutProps<T>) {
  const { t } = useTranslation('table');
  const [activeStep, setActiveStep] = useState(defaultStep);

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    full: 'w-full max-w-none',
  };

  const isFullWidth = maxWidth === 'full';

  const resolvedLoadingText = loadingText ?? t('loading');
  const resolvedCancelLabel = cancelLabel ?? t('cancel');
  const resolvedNextLabel = nextLabel ?? t('next');
  const resolvedBackLabel = backLabel ?? t('form.backLabel');
  const defaultSubmitLabel = isEditMode ? t('edit') : t('create');
  const defaultSubmittingLabel = isEditMode ? t('updating') : t('form.creating');

  const isLastStep = activeStep === steps.length - 1;
  const isFirstStep = activeStep === 0;

  const handleNext = async () => {
    if (activeStep >= steps.length - 1) return;

    const fields = stepValidationFields?.[activeStep];
    if (fields?.length) {
      const ok = await methods.trigger(fields as any);
      if (!ok) return;
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= activeStep) {
      setActiveStep(stepIndex);
    }
  };

  return (
    <Box
      className={`relative min-h-screen overflow-hidden bg-background ${
        isFullWidth
          ? 'px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 xl:px-14'
          : 'p-4 sm:p-6'
      }`}
    >
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
                {resolvedLoadingText}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Header */}
        <Box className="mb-6 sm:mb-8">
          <Box
            className={`rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-sm ${
              isFullWidth ? 'overflow-hidden ring-1 ring-primary/[0.06]' : ''
            }`}
          >
            <Box
              className={`flex items-start justify-between gap-4 sm:gap-6 flex-wrap p-4 sm:p-6 ${
                isFullWidth ? 'md:p-8 bg-gradient-to-br from-card via-card to-primary/[0.03]' : ''
              }`}
            >
              <Box className="flex items-start gap-4 flex-1 min-w-0">
                {/* Icon badge */}
                <Box className="relative flex-shrink-0">
                  {icon ?? (
                    <Box className="flex h-14 w-14 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 shadow-sm">
                      <Iconify
                        icon={isEditMode ? 'solar:pen-bold' : 'solar:add-circle-bold'}
                        className="text-primary"
                        width={28}
                        height={28}
                      />
                    </Box>
                  )}
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
                        {isEditMode ? t('edit') : t('create')}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" className="text-muted-foreground leading-relaxed">
                    {description}
                  </Typography>
                </Box>
              </Box>

              <Button
                type="button"
                variant="outlined"
                onClick={onCancel}
                disabled={isSubmitting || isLoading}
                className="border-border hover:bg-muted/50 w-full min-[420px]:w-auto min-w-0 min-[420px]:min-w-[100px] flex-shrink-0"
              >
                {resolvedCancelLabel}
              </Button>
            </Box>
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
                  {t('error')}
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

        {/* Stepper */}
        <Box className="mb-6 sm:mb-8">
          <Box
            className={`rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-sm p-4 sm:p-6 ${
              isFullWidth ? 'ring-1 ring-border/40' : ''
            }`}
          >
            {/* Desktop stepper — from `lg` so tablets avoid a cramped 5-step rail */}
            <Box className="hidden lg:flex items-center justify-between gap-2 min-w-0">
              {steps.map((step, index) => {
                const isActive = index === activeStep;
                const isCompleted = index < activeStep;
                const isClickable = index <= activeStep;

                return (
                  <Box key={index} className="flex items-center flex-1">
                    <Box
                      className={`flex items-center gap-3 flex-1 cursor-pointer transition-all duration-200 ${
                        isClickable ? 'hover:opacity-80' : 'opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() => isClickable && handleStepClick(index)}
                    >
                      {/* Step Circle */}
                      <Box
                        className={`relative flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          isActive
                            ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110'
                            : isCompleted
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'bg-muted border-border text-muted-foreground'
                        }`}
                      >
                        {isCompleted ? (
                          <Iconify icon="solar:check-circle-bold" width={24} height={24} />
                        ) : step.icon ? (
                          <Iconify icon={step.icon} width={20} height={20} />
                        ) : (
                          <Typography variant="body2" className="font-semibold">
                            {index + 1}
                          </Typography>
                        )}
                      </Box>

                      {/* Step Label */}
                      <Box className="flex-1 min-w-0">
                        <Typography
                          variant="subtitle2"
                          className={`font-semibold transition-colors ${
                            isActive
                              ? 'text-primary'
                              : isCompleted
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                          }`}
                        >
                          {step.label}
                        </Typography>
                        {step.description && (
                          <Typography
                            variant="caption"
                            className={`text-xs mt-0.5 transition-colors ${
                              isActive
                                ? 'text-primary/80'
                                : isCompleted
                                  ? 'text-muted-foreground'
                                  : 'text-muted-foreground/60'
                            }`}
                          >
                            {step.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                      <Box
                        className={`flex-1 min-w-2 max-w-14 h-0.5 mx-1.5 lg:mx-3 transition-all duration-300 shrink ${
                          isCompleted ? 'bg-primary' : 'bg-border'
                        }`}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>

            {/* Compact stepper for small / medium viewports */}
            <Box className="lg:hidden">
              <Box className="flex items-center justify-between mb-4">
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('stepOf', { current: activeStep + 1, total: steps.length })}
                </Typography>
                <Typography variant="caption" className="text-muted-foreground">
                  {steps[activeStep].label}
                </Typography>
              </Box>
              <Box className="flex gap-2">
                {steps.map((_, index) => {
                  const isActive = index === activeStep;
                  const isCompleted = index < activeStep;

                  return (
                    <Box
                      key={index}
                      className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                        isActive ? 'bg-primary' : isCompleted ? 'bg-primary/50' : 'bg-border'
                      }`}
                    />
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Form Card */}
        <Box
          className={`rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-sm ${
            isFullWidth ? 'shadow-xl shadow-primary/[0.04] ring-1 ring-primary/[0.05]' : ''
          }`}
        >
          <Form methods={methods} onSubmit={onSubmit}>
            {/* Content */}
            <Box
              className={`min-h-[400px] p-4 sm:p-6 md:p-8 ${isFullWidth ? 'lg:p-10 xl:p-12' : ''}`}
            >
              {reviewHint && (
                <Box className="mb-6 flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3">
                  <Box className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary/70" />
                  <Typography variant="body2" className="text-muted-foreground leading-relaxed">
                    {reviewHint}
                  </Typography>
                </Box>
              )}
              <Box className="flex flex-col gap-6">
                {/* Step Content */}
                <Box
                  key={activeStep}
                  className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300"
                >
                  {steps[activeStep].content}
                </Box>
              </Box>
            </Box>

            {/* Sticky Actions */}
            <Box className="sticky bottom-0 z-10 border-t border-border/60 bg-card/95 backdrop-blur-md rounded-b-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]">
              <Box className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <Box className="flex items-center gap-2 text-xs text-muted-foreground sm:min-w-0">
                  <Box className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                  <span>
                    {t('stepOf', { current: activeStep + 1, total: steps.length })}
                  </span>
                </Box>

                <Box className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={onCancel}
                    disabled={isSubmitting || isLoading}
                    className="min-w-[100px] border-border hover:bg-muted/50 transition-colors"
                  >
                    {resolvedCancelLabel}
                  </Button>

                  {!isFirstStep && (
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={handleBack}
                      disabled={isSubmitting || isLoading}
                      className="min-w-[100px] border-border hover:bg-muted/50 transition-colors"
                    >
                      {resolvedBackLabel}
                    </Button>
                  )}

                  {!isLastStep ? (
                    <Button
                      type="button"
                      onClick={() => void handleNext()}
                      disabled={isSubmitting || isLoading}
                      className="min-w-[100px] bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {resolvedNextLabel}
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting || isLoading}
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
