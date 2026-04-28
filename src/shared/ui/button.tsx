import { forwardRef } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

type ButtonVariant = 'contained' | 'outlined' | 'text' | 'soft';
type ButtonColor = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'inherit';
type ButtonSize = 'small' | 'medium' | 'large';

const getButtonClasses = (
  variant: ButtonVariant = 'contained',
  color: ButtonColor = 'primary',
  size: ButtonSize = 'medium'
) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  const sizeClasses = {
    small: 'h-8 px-2 text-xs',
    medium: 'h-9 px-3',
    large: 'h-10 px-4',
  };

  const variantClasses: Record<ButtonVariant, Record<ButtonColor, string>> = {
    contained: {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 shadow-sm hover:shadow-md transition-shadow',
      secondary: 'bg-[#8E33FF] text-white hover:bg-[#7A29E0] active:bg-[#6B20D0] shadow-sm hover:shadow-md transition-shadow',
      error: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm hover:shadow-md transition-shadow',
      warning: 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 shadow-sm hover:shadow-md transition-shadow',
      info: 'bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700 shadow-sm hover:shadow-md transition-shadow',
      success: 'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 shadow-sm hover:shadow-md transition-shadow',
      inherit: 'bg-foreground/10 text-foreground hover:bg-foreground/15 active:bg-foreground/20 shadow-sm',
    },
    outlined: {
      primary: 'border border-primary/70 bg-transparent text-primary hover:bg-primary/10 hover:border-primary active:bg-primary/15',
      secondary: 'border border-border bg-transparent text-foreground hover:bg-muted active:bg-muted',
      error: 'border border-red-500/70 bg-transparent text-red-600 hover:bg-red-50 hover:border-red-500 active:bg-red-100',
      warning: 'border border-amber-500/70 bg-transparent text-amber-600 hover:bg-amber-50 hover:border-amber-500 active:bg-amber-100',
      info: 'border border-sky-500/70 bg-transparent text-sky-600 hover:bg-sky-50 hover:border-sky-500 active:bg-sky-100',
      success: 'border border-emerald-500/70 bg-transparent text-emerald-600 hover:bg-emerald-50 hover:border-emerald-500 active:bg-emerald-100',
      inherit: 'border border-border bg-transparent text-foreground hover:bg-muted active:bg-muted',
    },
    text: {
      primary: 'text-primary hover:bg-primary/10 active:bg-primary/15',
      secondary: 'text-foreground hover:bg-muted active:bg-muted',
      error: 'text-red-600 hover:bg-red-50 active:bg-red-100',
      warning: 'text-amber-600 hover:bg-amber-50 active:bg-amber-100',
      info: 'text-sky-600 hover:bg-sky-50 active:bg-sky-100',
      success: 'text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100',
      inherit: 'text-foreground hover:bg-muted active:bg-muted',
    },
    soft: {
      primary: 'bg-primary/10 text-primary hover:bg-primary/18 active:bg-primary/25',
      secondary: 'bg-[#8E33FF]/10 text-[#8E33FF] hover:bg-[#8E33FF]/18 active:bg-[#8E33FF]/25',
      error: 'bg-red-50 text-red-700 hover:bg-red-100 active:bg-red-200',
      warning: 'bg-amber-50 text-amber-700 hover:bg-amber-100 active:bg-amber-200',
      info: 'bg-sky-50 text-sky-700 hover:bg-sky-100 active:bg-sky-200',
      success: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200',
      inherit: 'bg-foreground/5 text-foreground hover:bg-foreground/10 active:bg-foreground/15',
    },
  };

  return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant][color]}`;
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      color,
      size,
      loading,
      disabled,
      fullWidth,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const classes = getButtonClasses(variant, color, size);
    const fullWidthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        type={type}
        className={mergeClasses([classes, fullWidthClass, className])}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
