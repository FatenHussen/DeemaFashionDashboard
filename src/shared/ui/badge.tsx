import type { CSSProperties } from 'react';

import { mergeClasses } from 'minimal-shared/utils';

export interface BadgeProps {
  children: React.ReactNode;
  badgeContent?: React.ReactNode;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  variant?: 'standard' | 'dot';
  max?: number;
  invisible?: boolean;
  className?: string;
  badgeClassName?: string;
  /** Applied to the outer wrapper (e.g. custom label colors). */
  style?: CSSProperties;
}

const colorClasses = {
  default: 'bg-foreground/70 text-white',
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-[#8E33FF] text-white',
  error: 'bg-red-500 text-white',
  warning: 'bg-amber-500 text-white',
  info: 'bg-sky-500 text-white',
  success: 'bg-emerald-500 text-white',
};

export function Badge({
  children,
  badgeContent,
  color = 'default',
  variant = 'standard',
  max = 99,
  invisible = false,
  className,
  badgeClassName,
  style,
}: BadgeProps) {
  const displayContent =
    variant === 'dot'
      ? null
      : typeof badgeContent === 'number' && badgeContent > max
        ? `${max}+`
        : badgeContent;

  if (invisible && !badgeContent) return <>{children}</>;

  return (
    <span className={mergeClasses(['relative inline-flex', className])} style={style}>
      {children}
      <span
        className={mergeClasses([
          'absolute -right-2 -top-2 flex items-center justify-center rounded-full',
          variant === 'dot' ? 'h-2 w-2' : 'min-w-[18px] px-1 text-[10px] font-medium leading-none',
          colorClasses[color],
          invisible ? 'hidden' : '',
          badgeClassName,
        ])}
      >
        {displayContent}
      </span>
    </span>
  );
}

