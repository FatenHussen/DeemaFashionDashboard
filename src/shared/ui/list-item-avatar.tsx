import { mergeClasses } from 'minimal-shared/utils';

export interface ListItemAvatarProps {
  children: React.ReactNode;
  className?: string;
}

export function ListItemAvatar({ children, className }: ListItemAvatarProps) {
  return (
    <div className={mergeClasses(['flex-shrink-0 mr-3', className])}>
      {children}
    </div>
  );
}

