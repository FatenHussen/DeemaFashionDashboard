import { mergeClasses } from 'minimal-shared/utils';
import React, { useRef, useState, useEffect } from 'react';
import {
  m,
  useTransform,
  useMotionValue,
  useAnimationFrame,
  useMotionTemplate,
} from 'framer-motion';

import { createClasses } from 'src/theme/create-classes';

// ----------------------------------------------------------------------

const animateBorderClasses = {
  root: createClasses('border__animation__root'),
  primaryBorder: createClasses('border__animation__primary'),
  secondaryBorder: createClasses('border__animation__secondary'),
  svgWrapper: createClasses('border__animation__svg__wrapper'),
  movingShape: createClasses('border__animation__moving__shape'),
};

type BorderStyleProps = {
  width?: string;
  size?: number;
  className?: string;
};

type AnimateBorderProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  children?: React.ReactNode;
  duration?: number;
  className?: string;
  slotProps?: {
    primaryBorder?: BorderStyleProps;
    secondaryBorder?: BorderStyleProps;
    outlineColor?: string;
    svgSettings?: {
      rx?: string;
      ry?: string;
    };
  };
};

export function AnimateBorder({
  children,
  duration,
  slotProps,
  className,
  ...other
}: AnimateBorderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const primaryBorderRef = useRef<HTMLSpanElement>(null);

  const [isHidden, setIsHidden] = useState(false);
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');

  useEffect(() => {
    setDirection(document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr');
  }, []);

  const secondaryBorderStyles = useComputedElementStyles(primaryBorderRef, direction);

  useEffect(() => {
    const handleVisibility = () => {
      if (rootRef.current) {
        const displayStyle = getComputedStyle(rootRef.current).display;
        setIsHidden(displayStyle === 'none');
      }
    };

    handleVisibility();

    window.addEventListener('resize', handleVisibility);

    return () => {
      window.removeEventListener('resize', handleVisibility);
    };
  }, []);

  const outlineColor = slotProps?.outlineColor || 'currentColor';
  const borderWidth = slotProps?.primaryBorder?.width || '2px';

  const borderProps = {
    duration,
    isHidden,
    rx: slotProps?.svgSettings?.rx,
    ry: slotProps?.svgSettings?.ry,
  };

  const renderPrimaryBorder = () => (
    <MovingBorder
      {...borderProps}
      ref={primaryBorderRef}
      size={slotProps?.primaryBorder?.size}
      className={slotProps?.primaryBorder?.className}
      style={{
        padding: slotProps?.primaryBorder?.width,
        background: `linear-gradient(90deg, transparent, ${outlineColor}, transparent)`,
        backgroundClip: 'padding-box',
      }}
    />
  );

  const renderSecondaryBorder = () =>
    slotProps?.secondaryBorder && (
      <MovingBorder
        {...borderProps}
        size={slotProps?.secondaryBorder?.size ?? slotProps?.primaryBorder?.size}
        className={slotProps?.secondaryBorder?.className}
        style={{
          padding: slotProps?.secondaryBorder?.width ?? secondaryBorderStyles.padding,
          borderRadius: secondaryBorderStyles.borderRadius,
          transform: 'scale(-1, -1)',
          background: `linear-gradient(90deg, transparent, ${outlineColor}, transparent)`,
          backgroundClip: 'padding-box',
        }}
      />
    );

  return (
    <div
      dir="ltr"
      ref={rootRef}
      className={mergeClasses([
        animateBorderClasses.root,
        'min-w-10 min-h-10 overflow-hidden relative w-fit',
        children ? 'min-w-0 min-h-0' : '',
        className,
      ])}
      style={
        {
          '--outline-color': outlineColor,
          '--border-width': borderWidth,
        } as React.CSSProperties
      }
      {...other}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          padding: borderWidth,
          background: `linear-gradient(90deg, transparent, ${outlineColor}, transparent)`,
          backgroundClip: 'padding-box',
          WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      {renderPrimaryBorder()}
      {renderSecondaryBorder()}
      {children}
    </div>
  );
}

// ----------------------------------------------------------------------

type MovingBorderProps = React.HTMLAttributes<HTMLSpanElement> & {
  rx?: string;
  ry?: string;
  duration?: number;
  isHidden?: boolean;
  size?: number;
};

const MovingBorder = React.forwardRef<HTMLSpanElement, MovingBorderProps>(
  ({ size, isHidden, rx = '30%', ry = '30%', duration = 8, className, style, ...other }, ref) => {
    const svgRectRef = useRef<SVGRectElement>(null);
    const progress = useMotionValue<number>(0);

    const updateAnimationFrame = (time: number) => {
      if (!svgRectRef.current) return;
      try {
        const pathLength = svgRectRef.current.getTotalLength();
        const pixelsPerMs = pathLength / (duration * 1000);
        progress.set((time * pixelsPerMs) % pathLength);
      } catch {
        return;
      }
    };

    const calculateTransform = (val: number) => {
      if (!svgRectRef.current) return { x: 0, y: 0 };
      try {
        const point = svgRectRef.current.getPointAtLength(val);
        return point ? { x: point.x, y: point.y } : { x: 0, y: 0 };
      } catch {
        return { x: 0, y: 0 };
      }
    };

    useAnimationFrame((time) => (!isHidden ? updateAnimationFrame(time) : undefined));

    const x = useTransform(progress, (val) => calculateTransform(val).x);
    const y = useTransform(progress, (val) => calculateTransform(val).y);
    const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

    return (
      <span ref={ref} className={mergeClasses(['text-left', className])} style={style} {...other}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          width="100%"
          height="100%"
          className={animateBorderClasses.svgWrapper}
          style={{ position: 'absolute', inset: 0 }}
        >
          <rect ref={svgRectRef} fill="none" width="100%" height="100%" rx={rx} ry={ry} />
        </svg>

        <m.span
          style={{
            transform,
            width: size,
            height: size,
            filter: 'blur(8px)',
            position: 'absolute',
            background: 'radial-gradient(currentColor 40%, transparent 80%)',
          }}
          className={animateBorderClasses.movingShape}
        />
      </span>
    );
  }
);

MovingBorder.displayName = 'MovingBorder';

// ----------------------------------------------------------------------

function useComputedElementStyles(
  ref: React.RefObject<HTMLSpanElement | null>,
  isRtl: 'ltr' | 'rtl'
) {
  const [computedStyles, setComputedStyles] = useState<{
    padding?: string;
    borderRadius?: string;
  } | null>(null);

  useEffect(() => {
    if (ref.current) {
      const style = getComputedStyle(ref.current);
      const rtl = isRtl === 'rtl';
      setComputedStyles({
        padding: `${style.paddingBottom} ${rtl ? style.paddingLeft : style.paddingRight} ${style.paddingTop} ${rtl ? style.paddingRight : style.paddingLeft}`,
        borderRadius: `${rtl ? style.borderBottomLeftRadius : style.borderBottomRightRadius} ${rtl ? style.borderBottomRightRadius : style.borderBottomLeftRadius} ${rtl ? style.borderTopLeftRadius : style.borderTopRightRadius} ${rtl ? style.borderTopRightRadius : style.borderTopLeftRadius}`,
      });
    }
  }, [ref, isRtl]);

  return {
    padding: computedStyles?.padding || '',
    borderRadius: computedStyles?.borderRadius || '',
  };
}
