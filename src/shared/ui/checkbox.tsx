import { forwardRef } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  error?: boolean;
  helperText?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex flex-col">
        <label
          htmlFor={checkboxId}
          className={mergeClasses([
            'flex items-center gap-2 cursor-pointer',
            props.disabled ? 'cursor-not-allowed opacity-50' : '',
          ])}
        >
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={mergeClasses([
              'h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/40',
              error ? 'border-red-500' : '',
              className,
            ])}
            {...props}
          />
          {label && <span className="text-sm text-foreground">{label}</span>}
        </label>
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

Checkbox.displayName = 'Checkbox';
