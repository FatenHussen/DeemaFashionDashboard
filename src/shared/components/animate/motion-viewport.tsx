import type { MotionProps } from 'framer-motion';

import { m } from 'framer-motion';
import { useState, useEffect } from 'react';

import { Box } from 'src/shared/ui';

import { varContainer } from './variants';

// ----------------------------------------------------------------------

export type MotionViewportProps = React.HTMLAttributes<HTMLDivElement> &
  MotionProps & {
    disableAnimate?: boolean;
    className?: string;
  };

export function MotionViewport({
  children,
  viewport,
  disableAnimate = true,
  className,
  ...other
}: MotionViewportProps) {
  const [smDown, setSmDown] = useState(false);

  useEffect(() => {
    const checkBreakpoint = () => {
      setSmDown(window.matchMedia('(max-width: 640px)').matches);
    };
    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  const disabled = smDown && disableAnimate;

  if (disabled) {
    return (
      <Box className={className} {...other}>
        {children}
      </Box>
    );
  }

  const MotionDiv = m.div;

  return (
    <MotionDiv
      initial="initial"
      whileInView="animate"
      variants={varContainer()}
      viewport={{ once: true, amount: 0.3, ...viewport }}
      className={className}
      {...other}
    >
      {children}
    </MotionDiv>
  );
}
