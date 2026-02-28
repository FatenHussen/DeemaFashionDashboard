import { mergeClasses } from 'minimal-shared/utils';

import { layoutClasses } from './classes';
import { layoutSectionVars } from './css-vars';

// ----------------------------------------------------------------------

export type LayoutSectionProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  cssVars?: React.CSSProperties;
  children?: React.ReactNode;
  footerSection?: React.ReactNode;
  headerSection?: React.ReactNode;
  sidebarSection?: React.ReactNode;
};

export function LayoutSection({
  className,
  cssVars,
  children,
  footerSection,
  headerSection,
  sidebarSection,
  ...other
}: LayoutSectionProps) {
  const defaultVars = layoutSectionVars();

  return (
    <>
      <style>
        {`
          body {
            ${Object.entries({ ...defaultVars, ...cssVars })
              .map(([key, value]) => `${key}: ${value};`)
              .join('\n            ')}
          }
        `}
      </style>

      <div
        id="root__layout"
        className={mergeClasses([
          layoutClasses.root,
          ' relative min-h-screen',
          'bg-gradient-to-br from-background via-background to-background',
          // Subtle grid pattern overlay - only on main content area, not sidebar
          'after:absolute after:inset-0 after:pointer-events-none after:z-0',
          'after:bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)]',
          'after:bg-[size:20px_20px]',
          className,
        ])}
        {...other}
      >
        {sidebarSection ? (
          <>
            {sidebarSection}
            <div
              className={mergeClasses([
                layoutClasses.sidebarContainer,
                'flex flex-1 flex-col relative z-[1]',
                // Dynamic margin-inline-start based on sidebar width CSS variables
                // Uses --layout-nav-current-width if set, otherwise falls back to vertical width
                'lg:ms-(--layout-nav-current-width,var(--layout-nav-vertical-width))',
                // Transition for smooth width changes
                'transition-[margin-inline-start] duration-(--layout-transition-duration) ease-(--layout-transition-easing)',
              ])}
            >
              {headerSection}
              {children}
              {footerSection}
            </div>
          </>
        ) : (
          <>
            {headerSection}
            {children}
            {footerSection}
          </>
        )}
      </div>
    </>
  );
}
