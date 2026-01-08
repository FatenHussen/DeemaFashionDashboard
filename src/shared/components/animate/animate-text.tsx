import type { Variants, UseInViewOptions } from 'framer-motion';

import { useRef, useMemo, useEffect } from 'react';
import { mergeClasses } from 'minimal-shared/utils';
import { m, useInView, useAnimation } from 'framer-motion';

import { Typography } from 'src/shared/ui';
import { createClasses } from 'src/theme/create-classes';

import { varFade, varContainer } from './variants';

// ----------------------------------------------------------------------

export const animateTextClasses = {
  root: createClasses('animate__text__root'),
  lines: createClasses('animate__text__lines'),
  line: createClasses('animate__text__line'),
  word: createClasses('animate__text__word'),
  char: createClasses('animate__text__char'),
  space: createClasses('animate__text__space'),
  srOnly: 'sr-only',
};

export type AnimateTextProps = React.HTMLAttributes<HTMLElement> & {
  variants?: Variants;
  repeatDelayMs?: number;
  textContent: string | string[];
  once?: UseInViewOptions['once'];
  amount?: UseInViewOptions['amount'];
  component?: React.ElementType;
  className?: string;
};

export function AnimateText({
  variants,
  className,
  textContent,
  once = true,
  amount = 1 / 3,
  component = 'p',
  repeatDelayMs = 100, // 1000 = 1s
  color: _color,
  ...other
}: AnimateTextProps) {
  const textRef = useRef(null);

  const animationControls = useAnimation();

  const textArray = useMemo(
    () => (Array.isArray(textContent) ? textContent : [textContent]),
    [textContent]
  );

  const isInView = useInView(textRef, { once, amount });

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const triggerAnimation = () => {
      if (repeatDelayMs) {
        timeout = setTimeout(async () => {
          await animationControls.start('initial');
          animationControls.start('animate');
        }, repeatDelayMs);
      } else {
        animationControls.start('animate');
      }
    };

    if (isInView) {
      triggerAnimation();
    } else {
      animationControls.start('initial');
    }

    return () => clearTimeout(timeout);
  }, [animationControls, isInView, repeatDelayMs]);

  return (
    <Typography
      component={component}
      color="text"
      className={mergeClasses([animateTextClasses.root, 'p-0 m-0', className])}
      {...other}
    >
      <span className={animateTextClasses.srOnly}>{textArray.join(' ')}</span>

      <m.span
        aria-hidden
        ref={textRef}
        initial="initial"
        animate={animationControls}
        exit="exit"
        variants={varContainer()}
        className={animateTextClasses.lines}
      >
        {textArray?.map((line, lineIndex) => (
          <span
            key={`${line}-${lineIndex}`}
            data-index={lineIndex}
            className={mergeClasses([animateTextClasses.line, 'block'])}
          >
            {line.split(' ').map((word, wordIndex) => {
              const lastWordInline = line.split(' ')[line.split(' ').length - 1];

              return (
                <span
                  key={`${word}-${wordIndex}`}
                  data-index={wordIndex}
                  className={mergeClasses([animateTextClasses.word, 'inline-block'])}
                >
                  {word.split('').map((char, charIndex) => (
                    <m.span
                      key={`${char}-${charIndex}`}
                      variants={variants ?? varFade('in')}
                      data-index={charIndex}
                      className={mergeClasses([animateTextClasses.char, 'inline-block'])}
                    >
                      {char}
                    </m.span>
                  ))}

                  {lastWordInline !== word && (
                    <span className={mergeClasses([animateTextClasses.space, 'inline-block'])}>
                      &nbsp;
                    </span>
                  )}
                </span>
              );
            })}
          </span>
        ))}
      </m.span>
    </Typography>
  );
}
