import { createPortal } from 'react-dom';
import { mergeClasses } from 'minimal-shared/utils';

// ----------------------------------------------------------------------

export type LoadingScreenProps = React.ComponentProps<'div'> & {
  portal?: boolean;
  className?: string;
};

export function LoadingScreen({ portal, className, ...other }: LoadingScreenProps) {
  const content = (
    <div
      className={mergeClasses([
        'flex-1 w-full flex min-h-full items-center justify-center px-10',
        className,
      ])}
      {...other}
    >
      <div className="w-full max-w-[360px] h-1 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 animate-pulse" style={{ width: '30%' }} />
      </div>
    </div>
  );

  if (portal) {
    return createPortal(content, document.body);
  }

  return content;
}
