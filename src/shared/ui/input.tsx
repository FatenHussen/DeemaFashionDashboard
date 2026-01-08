import { forwardRef } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  helperText?: string;
  label?: string;
  fullWidth?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      error,
      helperText,
      label,
      fullWidth,
      startAdornment,
      endAdornment,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const inputClasses = mergeClasses([
      'h-9 w-full rounded-lg border bg-transparent py-2 text-sm',
      'placeholder:text-gray-400',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:cursor-not-allowed disabled:opacity-50',
      error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
        : 'border-input focus:border-blue-500 focus:ring-blue-500',
      fullWidth ? 'w-full' : '',
      startAdornment ? 'pl-10 pr-3' : endAdornment ? 'pl-3 pr-10' : 'px-3',
      className,
    ]);

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {startAdornment && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {startAdornment}
            </div>
          )}
          <input ref={ref} id={inputId} className={inputClasses} {...props} />
          {endAdornment && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {endAdornment}
            </div>
          )}
        </div>
        {helperText && (
          <p
            className={mergeClasses([
              'mt-1 text-xs',
              error ? 'text-red-600' : 'text-muted-foreground',
            ])}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

