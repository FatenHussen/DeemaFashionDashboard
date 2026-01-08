import { mergeClasses } from 'minimal-shared/utils';

export interface MenuItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  disableRipple?: boolean;
}

export function MenuItem({ disableRipple, className, children, ...props }: MenuItemProps) {
  return (
    <li
      className={mergeClasses([
        'list-none',
        className,
      ])}
      {...props}
    >
      {children}
    </li>
  );
}

