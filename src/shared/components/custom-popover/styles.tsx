import type { PopoverArrow } from './types';

import React, { useState, useEffect } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

// ----------------------------------------------------------------------

const getArrowStyles = (
  placement: PopoverArrow['placement'],
  offset: number,
  size: number,
  isRtl: boolean
): React.CSSProperties => {
  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    position: 'absolute',
    clipPath: 'polygon(0% 0%, 100% 100%, 0% 100%)',
  };

  const direction = placement?.split('-')[0] || 'top';
  const position = placement || 'top-right';

  // Direction-based transforms
  const directionStyles: Record<string, React.CSSProperties> = {
    top: {
      top: 0,
      transform: 'rotate(135deg) translate(0, -50%)',
    },
    bottom: {
      bottom: 0,
      transform: 'rotate(-45deg) translate(0, 50%)',
    },
    left: {
      left: 0,
      transform: 'rotate(45deg) translate(-50%, 0)',
    },
    right: {
      right: 0,
      transform: 'rotate(-135deg) translate(50%, 0)',
    },
  };

  // Position-based offsets
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-left': {
      left: isRtl ? 'auto' : offset,
      right: isRtl ? offset : 'auto',
    },
    'top-center': {
      left: 0,
      right: 0,
      margin: '0 auto',
    },
    'top-right': {
      left: isRtl ? offset : 'auto',
      right: isRtl ? 'auto' : offset,
      backgroundImage: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.1))',
      backgroundSize: `${size * 3}px ${size * 3}px`,
      backgroundPosition: 'top right',
      backgroundRepeat: 'no-repeat',
    },
    'bottom-left': {
      left: isRtl ? 'auto' : offset,
      right: isRtl ? offset : 'auto',
      backgroundImage: 'linear-gradient(45deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.1))',
      backgroundSize: `${size * 3}px ${size * 3}px`,
      backgroundPosition: 'bottom left',
      backgroundRepeat: 'no-repeat',
    },
    'bottom-center': {
      left: 0,
      right: 0,
      margin: '0 auto',
    },
    'bottom-right': {
      left: isRtl ? offset : 'auto',
      right: isRtl ? 'auto' : offset,
    },
    'left-top': {
      top: offset,
      bottom: 'auto',
    },
    'left-center': {
      top: 0,
      bottom: 0,
      margin: 'auto 0',
      backgroundImage: 'linear-gradient(45deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.1))',
      backgroundSize: `${size * 3}px ${size * 3}px`,
      backgroundPosition: 'bottom left',
      backgroundRepeat: 'no-repeat',
    },
    'left-bottom': {
      bottom: offset,
      top: 'auto',
      backgroundImage: 'linear-gradient(45deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.1))',
      backgroundSize: `${size * 3}px ${size * 3}px`,
      backgroundPosition: 'bottom left',
      backgroundRepeat: 'no-repeat',
    },
    'right-top': {
      top: offset,
      bottom: 'auto',
      backgroundImage: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.1))',
      backgroundSize: `${size * 3}px ${size * 3}px`,
      backgroundPosition: 'top right',
      backgroundRepeat: 'no-repeat',
    },
    'right-center': {
      top: 0,
      bottom: 0,
      margin: 'auto 0',
      backgroundImage: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.1))',
      backgroundSize: `${size * 3}px ${size * 3}px`,
      backgroundPosition: 'top right',
      backgroundRepeat: 'no-repeat',
    },
    'right-bottom': {
      bottom: offset,
      top: 'auto',
    },
  };

  return {
    ...baseStyle,
    ...directionStyles[direction],
    ...positionStyles[position],
  };
};

export function Arrow({
  size = 14,
  offset = 17,
  placement = 'top-right',
  className,
}: PopoverArrow) {
  const [isRtl, setIsRtl] = useState(false);

  useEffect(() => {
    setIsRtl(document.documentElement.dir === 'rtl');
  }, []);

  return (
    <span
      className={mergeClasses([
        'backdrop-blur-sm rounded-bl bg-background border border-border',
        className,
      ])}
      style={getArrowStyles(placement, offset, size, isRtl)}
    />
  );
}
