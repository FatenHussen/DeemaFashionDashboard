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
      primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800',
      error: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
      warning: 'bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800',
      info: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
      success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
      inherit: 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800',
    },
    outlined: {
      primary:
        'border border-blue-600 bg-transparent text-primary hover:bg-blue-50 active:bg-blue-100',
      secondary:
        'border border-border bg-transparent text-foreground hover:bg-muted active:bg-muted',
      error: 'border border-red-600 bg-transparent text-red-600 hover:bg-red-50 active:bg-red-100',
      warning:
        'border border-yellow-600 bg-transparent text-yellow-600 hover:bg-yellow-50 active:bg-yellow-100',
      info: 'border border-blue-500 bg-transparent text-blue-500 hover:bg-blue-50 active:bg-blue-100',
      success:
        'border border-green-600 bg-transparent text-green-600 hover:bg-green-50 active:bg-green-100',
      inherit: 'border border-border bg-transparent text-foreground hover:bg-muted active:bg-muted',
    },
    text: {
      primary: 'text-primary hover:bg-blue-50 active:bg-blue-100',
      secondary: 'text-foreground hover:bg-muted active:bg-muted',
      error: 'text-red-600 hover:bg-red-50 active:bg-red-100',
      warning: 'text-yellow-600 hover:bg-yellow-50 active:bg-yellow-100',
      info: 'text-blue-500 hover:bg-blue-50 active:bg-blue-100',
      success: 'text-green-600 hover:bg-green-50 active:bg-green-100',
      inherit: 'text-foreground hover:bg-muted active:bg-muted',
    },
    soft: {
      primary: 'bg-blue-50 text-blue-700 hover:bg-blue-100 active:bg-blue-200',
      secondary: 'bg-gray-50 text-gray-700 hover:bg-gray-100 active:bg-gray-200',
      error: 'bg-red-50 text-red-700 hover:bg-red-100 active:bg-red-200',
      warning: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 active:bg-yellow-200',
      info: 'bg-blue-50 text-blue-700 hover:bg-blue-100 active:bg-blue-200',
      success: 'bg-green-50 text-green-700 hover:bg-green-100 active:bg-green-200',
      inherit: 'bg-gray-50 text-gray-700 hover:bg-gray-100 active:bg-gray-200',
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
