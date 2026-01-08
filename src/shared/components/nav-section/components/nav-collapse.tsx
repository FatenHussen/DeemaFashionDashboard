import { useRef, useState, useEffect } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

import { navSectionClasses } from '../styles';

// ----------------------------------------------------------------------

type NavCollapseProps = {
  in?: boolean;
  mountOnEnter?: boolean;
  unmountOnExit?: boolean;
  depth?: number;
  children: React.ReactNode;
  'data-group'?: string;
  className?: string;
};

export function NavCollapse({
  in: inProp = false,
  mountOnEnter,
  unmountOnExit,
  depth,
  children,
  className,
  ...other
}: NavCollapseProps) {
  const [mounted, setMounted] = useState(!mountOnEnter || inProp);
  const [height, setHeight] = useState<string | number>(inProp ? 'auto' : 0);
  const contentRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (mountOnEnter && !mounted && inProp) {
      setMounted(true);
    }
    if (unmountOnExit && mounted && !inProp) {
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [inProp, mountOnEnter, unmountOnExit, mounted]);

  useEffect(() => {
    if (!contentRef.current) {
      return undefined;
    }

    if (inProp) {
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(contentHeight);
    } else {
      setHeight(0);
    }
    return undefined;
  }, [inProp, children]);

  if (!mounted) return null;

  const hasDepth = depth && depth + 1 !== 1;

  return (
    <div
      className={mergeClasses([
        'overflow-hidden transition-all duration-300 ease-in-out',
        hasDepth ? 'pl-[calc(var(--nav-item-pl)+var(--nav-icon-size)/2)]' : '',
        className,
      ])}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
      {...other}
    >
      <ul
        ref={contentRef}
        className={mergeClasses([
          navSectionClasses.ul,
          hasDepth ? 'relative pl-[var(--nav-bullet-size)]' : '',
        ])}
        style={
          hasDepth
            ? ({
                '--before-content': '""',
                '--before-position': 'absolute',
                '--before-top': '0',
                '--before-left': '0',
                '--before-width': '2px',
                '--before-bg': 'var(--nav-bullet-light-color)',
                '--before-bottom':
                  'calc(var(--nav-item-sub-height) - 2px - var(--nav-bullet-size) / 2)',
              } as React.CSSProperties)
            : undefined
        }
      >
        {children}
      </ul>
    </div>
  );
}
