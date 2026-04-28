import { forwardRef } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  error?: boolean;
  helperText?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex flex-col">
        <label
          htmlFor={switchId}
          className={mergeClasses([
            'flex items-center gap-2 cursor-pointer',
            props.disabled ? 'cursor-not-allowed opacity-50' : '',
          ])}
        >
          <input
            ref={ref}
            type="checkbox"
            id={switchId}
            className="peer sr-only"
            {...props}
          />
          <div
            className={mergeClasses([
              'relative h-6 w-11 rounded-full bg-muted-foreground/30 transition-colors',
              'peer-checked:bg-primary',
              'peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-2 peer-focus:ring-offset-background',
              'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
              error ? 'bg-red-400/40 peer-checked:bg-red-500' : '',
              className,
            ])}
          >
            <div
              className={mergeClasses([
                'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform',
                'peer-checked:translate-x-5',
              ])}
            />
          </div>
          {label && (
            <span className="text-sm text-foreground">{label}</span>
          )}
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

Switch.displayName = 'Switch';

