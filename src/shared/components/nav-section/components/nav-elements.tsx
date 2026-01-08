import { mergeClasses } from 'minimal-shared/utils';

import { navSectionClasses } from '../styles';

// ----------------------------------------------------------------------

export const Nav = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav className={className} {...props} />
);

// ----------------------------------------------------------------------

type NavLiProps = React.ComponentProps<'li'> & {
  disabled?: boolean;
};

export const NavLi = ({ disabled, className, ...props }: NavLiProps) => (
  <li
    className={mergeClasses([
      navSectionClasses.li,
      disabled ? 'cursor-not-allowed' : '',
      className,
    ])}
    {...props}
  />
);

// ----------------------------------------------------------------------

type NavUlProps = React.ComponentProps<'ul'>;

export const NavUl = ({ className, ...props }: NavUlProps) => (
  <ul className={mergeClasses([navSectionClasses.ul, 'flex flex-col', className])} {...props} />
);
