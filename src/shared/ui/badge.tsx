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
}

const colorClasses = {
  default: 'bg-gray-500 text-white',
  primary: 'bg-blue-600 text-white',
  secondary: 'bg-gray-600 text-white',
  error: 'bg-red-600 text-white',
  warning: 'bg-yellow-600 text-white',
  info: 'bg-blue-500 text-white',
  success: 'bg-green-600 text-white',
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
}: BadgeProps) {
  const displayContent =
    variant === 'dot'
      ? null
      : typeof badgeContent === 'number' && badgeContent > max
        ? `${max}+`
        : badgeContent;

  if (invisible && !badgeContent) return <>{children}</>;

  return (
    <span className={mergeClasses(['relative inline-flex', className])}>
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

