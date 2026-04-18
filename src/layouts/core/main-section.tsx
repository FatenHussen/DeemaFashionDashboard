import { mergeClasses } from 'minimal-shared/utils';

import { layoutClasses } from './classes';

// ----------------------------------------------------------------------

export type MainSectionProps = React.HTMLAttributes<HTMLElement> & {
  className?: string;
  /** Applied to the inner wrapper around children. Split layouts (e.g. auth) need row direction here so the two panels sit beside each other; `flex-row` on main alone is not enough because main only has this single inner child. */
  innerClassName?: string;
};

export function MainSection({ children, className, innerClassName, ...other }: MainSectionProps) {
  return (
    <main
      className={mergeClasses([
        layoutClasses.main,
        'flex flex-1 flex-col',
        'relative overflow-hidden',
        'bg-gradient-to-br from-background via-background to-background',
        'before:absolute before:inset-0 before:opacity-40',
        'before:bg-[radial-gradient(circle_at_50%_50%,rgb(var(--primary)_/_0.045),transparent_50%)]',
        'after:absolute after:inset-0 after:opacity-30',
        'after:bg-[radial-gradient(circle_at_82%_18%,rgb(var(--accent-amber)_/_0.35),transparent_52%)]',
        className,
      ])}
      {...other}
    >
      <div
        className={mergeClasses([
          'relative z-[1] flex min-h-0 w-full flex-1 flex-col',
          innerClassName,
        ])}
      >
        {children}
      </div>
    </main>
  );
}
