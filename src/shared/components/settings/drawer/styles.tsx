import { mergeClasses } from 'minimal-shared/utils';

import { Tooltip } from 'src/shared/ui';

import { Iconify } from '../../iconify';

// ----------------------------------------------------------------------

type LargeBlockProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  children?: React.ReactNode;
  title: string;
  tooltip?: string;
  canReset?: boolean;
  onReset?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

export function LargeBlock({
  title,
  tooltip,
  children,
  canReset,
  onReset,
  className,
  style,
  ...other
}: LargeBlockProps) {
  return (
    <div
      className={mergeClasses([
        'flex relative flex-col p-4 pt-2 rounded-2xl border border-border',
        className,
      ])}
      style={style}
      {...other}
    >
      <span
        className={mergeClasses([
          '-top-3 leading-[22px] rounded-[22px] absolute items-center inline-flex px-2.5',
          'text-[13px] text-foreground font-semibold bg-card',
        ])}
      >
        {canReset && (
          <button type="button" onClick={onReset} className="ml-[-4px] mr-1">
            <Iconify width={14} icon="solar:restart-bold" className="opacity-64" />
          </button>
        )}
        {title}
        {tooltip && (
          <Tooltip title={tooltip} placement="right" arrow>
            <Iconify
              width={14}
              icon="eva:info-outline"
              className="ml-1 mr-[-4px] opacity-48 cursor-pointer"
            />
          </Tooltip>
        )}
      </span>

      {children}
    </div>
  );
}

// ----------------------------------------------------------------------

type SmallBlockProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  children?: React.ReactNode;
  label: string;
  canReset?: boolean;
  onReset?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

export function SmallBlock({
  label,
  canReset,
  onReset,
  className,
  style,
  children,
  ...other
}: SmallBlockProps) {
  return (
    <div className={mergeClasses(['flex flex-col gap-3', className])} style={style} {...other}>
      <button
        type="button"
        onClick={canReset ? onReset : undefined}
        className={mergeClasses([
          'cursor-default pointer-events-none gap-1 self-start',
          'leading-4 text-[11px] text-muted-foreground font-semibold transition-colors',
          canReset
            ? 'cursor-pointer pointer-events-auto text-foreground font-bold hover:text-primary'
            : '',
        ])}
      >
        {canReset && <Iconify width={14} icon="solar:restart-bold" />}
        {label}
      </button>
      {children}
    </div>
  );
}

// ----------------------------------------------------------------------

export type OptionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
};

export function OptionButton({
  selected,
  className,
  style,
  children,
  ...other
}: OptionButtonProps) {
  return (
    <button
      type="button"
      className={mergeClasses([
        'w-full rounded-xl leading-[18px] text-[13px] font-semibold',
        'border border-transparent',
        selected ? 'text-foreground bg-card border-border shadow-lg' : 'text-muted-foreground',
        className,
      ])}
      style={{
        ...(selected && {
          borderColor: 'rgba(145, 158, 171, 0.08)',
          boxShadow: '-8px 8px 20px -4px rgba(145, 158, 171, 0.12)',
        }),
        ...style,
      }}
      {...other}
    >
      {children}
    </button>
  );
}
