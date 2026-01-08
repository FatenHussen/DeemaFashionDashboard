import { mergeClasses } from 'minimal-shared/utils';

// ----------------------------------------------------------------------

type FormDividerProps = {
  className?: string;
  label?: React.ReactNode;
};

export function FormDivider({ className, label = 'OR' }: FormDividerProps) {
  return (
    <div
      className={mergeClasses([
        'my-6 flex items-center gap-4 text-xs uppercase tracking-wider text-muted-foreground',
        className,
      ])}
    >
      <div className="flex-1 border-t border-dashed border-border" />
      <span>{label}</span>
      <div className="flex-1 border-t border-dashed border-border" />
    </div>
  );
}
