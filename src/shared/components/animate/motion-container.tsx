import type { MotionProps } from 'framer-motion';

import { m } from 'framer-motion';

import { varContainer } from './variants';

// ----------------------------------------------------------------------

export type MotionContainerProps = React.HTMLAttributes<HTMLDivElement> &
  MotionProps & {
    animate?: boolean;
    action?: boolean;
    className?: string;
  };

export function MotionContainer({
  className,
  animate,
  children,
  action = false,
  ...other
}: MotionContainerProps) {
  const MotionDiv = m.div;

  return (
    <MotionDiv
      variants={varContainer()}
      initial={action ? false : 'initial'}
      animate={action ? (animate ? 'animate' : 'exit') : 'animate'}
      exit={action ? undefined : 'exit'}
      className={className}
      {...other}
    >
      {children}
    </MotionDiv>
  );
}
