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
          <span className="relative inline-flex h-6 w-11 shrink-0 align-middle">
            <input
              ref={ref}
              type="checkbox"
              id={switchId}
              className="peer sr-only"
              {...props}
            />
            {/* Must be siblings of `.peer` for `peer-checked:` (Tailwind); nested thumb never received peer state */}
            <span
              aria-hidden
              className={mergeClasses([
                'pointer-events-none absolute inset-0 rounded-full bg-muted-foreground/30 transition-colors duration-200',
                'peer-checked:bg-primary',
                'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
                'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
                error ? 'bg-red-400/40 peer-checked:bg-red-500' : '',
                className,
              ])}
            />
            <span
              aria-hidden
              className={mergeClasses([
                'pointer-events-none absolute top-1/2 z-10 h-5 w-5 -translate-y-1/2 rounded-full bg-background shadow ring-1 ring-black/10',
                'start-0.5 transition-[inset-inline-start] duration-200 ease-out',
                'peer-checked:start-[calc(100%-1.375rem)]',
              ])}
            />
          </span>
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

Switch.displayName = 'Switch';
