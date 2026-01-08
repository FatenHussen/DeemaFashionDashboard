import { mergeClasses } from 'minimal-shared/utils';

import { layoutClasses } from './classes';

// ----------------------------------------------------------------------

export type MainSectionProps = React.HTMLAttributes<HTMLElement> & {
  className?: string;
};

export function MainSection({ children, className, ...other }: MainSectionProps) {
  return (
    <main
      className={mergeClasses([
        layoutClasses.main,
        'flex flex-1 flex-col',
        'relative overflow-hidden',
        'bg-gradient-to-br from-background via-background to-background',
        'before:absolute before:inset-0 before:opacity-40',
        'before:bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent_50%)]',
        'after:absolute after:inset-0 after:opacity-30',
        'after:bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.05),transparent_50%)]',
        className,
      ])}
      {...other}
    >
      <div className="relative z-[1] flex flex-1 flex-row justify-center w-full">{children}</div>
    </main>
  );
}
