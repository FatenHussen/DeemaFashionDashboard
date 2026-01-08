import type { MotionValue, MotionProps } from 'framer-motion';

import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { mergeClasses } from 'minimal-shared/utils';
import { m, useSpring, useTransform } from 'framer-motion';

import { Box } from 'src/shared/ui';
import { createClasses } from 'src/theme/create-classes';

// ----------------------------------------------------------------------

export const scrollProgressClasses = {
  circular: createClasses('scroll__progress__circular'),
  linear: createClasses('scroll__progress__linear'),
};

type BaseProps = MotionProps & React.ComponentProps<'svg'> & React.ComponentProps<'div'>;

export interface ScrollProgressProps extends BaseProps {
  size?: number;
  portal?: boolean;
  thickness?: number;
  className?: string;
  whenScroll?: 'x' | 'y';
  progress: MotionValue<number>;
  variant: 'linear' | 'circular';
  color?: 'inherit' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
  slotProps?: {
    wrapper?: React.HTMLAttributes<HTMLDivElement>;
  };
}

const colorClasses = {
  inherit: 'text-gray-900 dark:text-gray-100',
  primary: 'text-primary',
  secondary: 'text-gray-600',
  info: 'text-blue-500',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
};

const colorGradients = {
  primary: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
  secondary: 'linear-gradient(135deg, #9ca3af, #6b7280)',
  info: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
  success: 'linear-gradient(135deg, #4ade80, #22c55e)',
  warning: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
  error: 'linear-gradient(135deg, #f87171, #ef4444)',
};

export function ScrollProgress({
  size,
  portal,
  variant,
  slotProps,
  className,
  thickness = 3.6,
  whenScroll = 'y',
  color = 'primary',
  progress: progressProps,
  ...other
}: ScrollProgressProps) {
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');

  useEffect(() => {
    setDirection(document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr');
  }, []);

  const isRtl = direction === 'rtl';

  const transformProgress = useTransform(progressProps, [0, -1], [0, 1]);

  const progress = isRtl && whenScroll === 'x' ? transformProgress : progressProps;

  const scaleX = useSpring(progress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const progressSize = variant === 'circular' ? (size ?? 64) : (size ?? 3);

  const renderCircular = () => (
    <m.svg
      viewBox={`0 0 ${progressSize} ${progressSize}`}
      xmlns="http://www.w3.org/2000/svg"
      className={mergeClasses([
        scrollProgressClasses.circular,
        '-rotate-90',
        colorClasses[color],
        className,
      ])}
      style={{
        width: progressSize,
        height: progressSize,
      }}
      {...other}
    >
      <circle
        cx={progressSize / 2}
        cy={progressSize / 2}
        r={progressSize / 2 - thickness - 4}
        strokeWidth={thickness}
        strokeOpacity={0.2}
        fill="none"
        strokeDashoffset={0}
        stroke="currentColor"
      />

      <m.circle
        cx={progressSize / 2}
        cy={progressSize / 2}
        r={progressSize / 2 - thickness - 4}
        strokeWidth={thickness}
        fill="none"
        strokeDashoffset={0}
        stroke="currentColor"
        style={{ pathLength: progress }}
      />
    </m.svg>
  );

  const renderLinear = () => (
    <m.div
      className={mergeClasses([
        scrollProgressClasses.linear,
        'top-0 left-0 right-0 origin-left',
        color === 'inherit' ? 'bg-gray-900 dark:bg-gray-100' : '',
        className,
      ])}
      style={{
        height: progressSize,
        scaleX,
        background: color !== 'inherit' ? colorGradients[color] : undefined,
      }}
      {...other}
    />
  );

  const content = (
    <Box {...slotProps?.wrapper}>{variant === 'circular' ? renderCircular() : renderLinear()}</Box>
  );

  if (portal) {
    return createPortal(content, document.body);
  }

  return content;
}
