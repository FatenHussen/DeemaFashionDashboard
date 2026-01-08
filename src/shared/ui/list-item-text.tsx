import { mergeClasses } from 'minimal-shared/utils';

export interface ListItemTextProps {
  primary?: React.ReactNode;
  secondary?: React.ReactNode;
  className?: string;
  slotProps?: {
    primary?: {
      className?: string;
      noWrap?: boolean;
    };
    secondary?: {
      className?: string;
    };
  };
}

export function ListItemText({ primary, secondary, className, slotProps }: ListItemTextProps) {
  return (
    <div className={mergeClasses(['flex flex-col min-w-0 flex-1', className])}>
      {primary && (
        <div
          className={mergeClasses([
            'text-sm font-medium text-foreground',
            slotProps?.primary?.noWrap ? 'truncate' : '',
            slotProps?.primary?.className,
          ])}
        >
          {primary}
        </div>
      )}
      {secondary && (
        <div
          className={mergeClasses([
            'text-xs text-muted-foreground mt-0.5',
            slotProps?.secondary?.className,
          ])}
        >
          {secondary}
        </div>
      )}
    </div>
  );
}

