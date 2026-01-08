import { mergeClasses } from 'minimal-shared/utils';

export interface MenuListProps extends React.HTMLAttributes<HTMLUListElement> {
  disablePadding?: boolean;
}

export function MenuList({ disablePadding, className, children, ...props }: MenuListProps) {
  return (
    <ul
      className={mergeClasses([
        'list-none m-0 p-0',
        !disablePadding ? 'py-3 px-2.5' : '',
        className,
      ])}
      {...props}
    >
      {children}
    </ul>
  );
}

