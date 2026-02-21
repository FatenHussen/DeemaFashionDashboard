import React, { forwardRef, useId, useMemo } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
  helperText?: string;
  label?: string;
  fullWidth?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;

  // New: UI options
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled';
  floatingLabel?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      error,
      success,
      helperText,
      label,
      fullWidth,
      startAdornment,
      endAdornment,
      id,
      size = 'md',
      variant = 'default',
      floatingLabel = true,
      placeholder,
      disabled,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const autoId = useId();
    const inputId = id || autoId;

    const hasValue =
      value !== undefined
        ? String(value).length > 0
        : defaultValue !== undefined
          ? String(defaultValue).length > 0
          : false;

    const sizeClasses = useMemo(() => {
      switch (size) {
        case 'sm':
          return {
            input: 'h-9 text-sm',
            pad: startAdornment ? 'pl-10 pr-3' : endAdornment ? 'pl-3 pr-10' : 'px-3',
            label: 'text-xs',
            helper: 'text-xs',
          };
        case 'lg':
          return {
            input: 'h-12 text-base',
            pad: startAdornment ? 'pl-11 pr-4' : endAdornment ? 'pl-4 pr-11' : 'px-4',
            label: 'text-sm',
            helper: 'text-sm',
          };
        default:
          return {
            input: 'h-10 text-sm',
            pad: startAdornment ? 'pl-10 pr-3.5' : endAdornment ? 'pl-3.5 pr-10' : 'px-3.5',
            label: 'text-sm',
            helper: 'text-xs',
          };
      }
    }, [size, startAdornment, endAdornment]);

    const stateClasses = useMemo(() => {
      if (disabled) {
        return {
          border: 'border-border/50',
          ring: '',
          text: 'text-muted-foreground',
        };
      }
      if (error) {
        return {
          border: 'border-red-500/70',
          ring: 'focus:ring-red-500/25 focus:border-red-500',
          text: 'text-red-700 dark:text-red-300',
        };
      }
      if (success) {
        return {
          border: 'border-emerald-500/50',
          ring: 'focus:ring-emerald-500/20 focus:border-emerald-500',
          text: 'text-emerald-700 dark:text-emerald-300',
        };
      }
      return {
        border: 'border-border/70',
        ring: 'focus:ring-primary/25 focus:border-primary',
        text: 'text-foreground',
      };
    }, [disabled, error, success]);

    const variantClasses =
      variant === 'filled' ? 'bg-muted/40 hover:bg-muted/50' : 'bg-background/30';

    const inputClasses = mergeClasses([
      'w-full rounded-xl border outline-none transition-all duration-200',
      'placeholder:text-muted-foreground/70',
      'focus:ring-4 focus:ring-offset-0',
      'disabled:cursor-not-allowed disabled:opacity-60',
      'shadow-sm focus:shadow-md',
      sizeClasses.input,
      sizeClasses.pad,
      variantClasses,
      stateClasses.border,
      stateClasses.ring,
      className,
    ]);

    const wrapperClasses = mergeClasses([
      'relative',
      fullWidth ? 'w-full' : '',
      error ? 'animate-[shake_0.22s_ease-in-out_1]' : '',
    ]);

    // If floating label is enabled, we want placeholder to be a single space
    // so the browser still allows :placeholder-shown to work.
    const finalPlaceholder = floatingLabel && label ? ' ' : placeholder;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {/* Classic label (when floating disabled) */}
        {label && !floatingLabel && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-foreground">
            {label}
          </label>
        )}

        <div className={wrapperClasses}>
          {/* Start adornment */}
          {startAdornment && (
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              {startAdornment}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            placeholder={finalPlaceholder}
            disabled={disabled}
            value={value}
            defaultValue={defaultValue}
            {...props}
          />

          {/* Floating label */}
          {label && floatingLabel && (
            <label
              htmlFor={inputId}
              className={mergeClasses([
                'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2',
                'origin-left transition-all duration-200',
                'text-muted-foreground',
                // when focused or has value -> float up
                'peer-focus:-translate-y-[1.9rem] peer-focus:scale-[0.85] peer-focus:text-foreground/80',
              ])}
            />
          )}

          {/* We can’t rely on peer unless we add peer class on input.
              So: use a separate label style based on CSS selectors with placeholder-shown.
              We'll do it with Tailwind by adding `peer` to input and using peer-* on label.
          */}
          {label && floatingLabel && (
            <>
              {/* Re-render input with peer? No.
                 We'll do it clean: add "peer" to input classes above.
              */}
            </>
          )}

          {/* End adornment */}
          {endAdornment && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              {endAdornment}
            </div>
          )}

          {/* Overlay label (actual floating implementation) */}
          {label && floatingLabel && (
            <label
              htmlFor={inputId}
              className={mergeClasses([
                'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2',
                'origin-left transition-all duration-200',
                'text-muted-foreground',
                // match padding when startAdornment exists
                startAdornment ? 'left-10' : 'left-3.5',
                // floating rules
                // if placeholder shown and no value -> centered
                !hasValue ? 'scale-100' : '-translate-y-[1.75rem] scale-[0.85] text-foreground/80',
                // tweak for sizes
                size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-sm',
                disabled ? 'opacity-70' : '',
              ])}
            >
              {label}
            </label>
          )}
        </div>

        {/* Helper text */}
        {helperText && (
          <p
            className={mergeClasses([
              'mt-1.5',
              sizeClasses.helper,
              error ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground',
            ])}
          >
            {helperText}
          </p>
        )}

        {/* Local styles (shake + shimmer utility if you want) */}
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-2px); }
            50% { transform: translateX(2px); }
            75% { transform: translateX(-1px); }
          }
        `}</style>
      </div>
    );
  }
);

Input.displayName = 'Input';
