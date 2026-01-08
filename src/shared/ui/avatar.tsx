import { forwardRef } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  children?: React.ReactNode;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={mergeClasses([
        'inline-flex items-center justify-center rounded-full bg-gray-300 text-gray-600 overflow-hidden',
        'flex-shrink-0',
        className,
      ])}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span className="text-sm font-medium">{children}</span>
      )}
    </div>
  )
);

Avatar.displayName = 'Avatar';

