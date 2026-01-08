import { cloneElement } from 'react';
import { useBackToTop } from 'minimal-shared/hooks';
import { mergeClasses } from 'minimal-shared/utils';

import { IconButton } from 'src/shared/ui';

import { Iconify } from '../iconify';

// ----------------------------------------------------------------------

type BackToTopProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isDebounce?: boolean;
  scrollThreshold?: string | number;
  renderButton?: (isVisible?: boolean) => React.ReactElement;
  className?: string;
};

export function BackToTopButton({
  className,
  isDebounce,
  renderButton,
  scrollThreshold = '90%',
  color: _color,
  ...other
}: BackToTopProps) {
  const { onBackToTop, isVisible } = useBackToTop(scrollThreshold, isDebounce);

  if (renderButton) {
    return cloneElement(renderButton(isVisible) as React.ReactElement<{ onClick?: () => void }>, {
      onClick: onBackToTop,
    });
  }

  return (
    <IconButton
      aria-label="Back to top"
      onClick={onBackToTop}
      className={mergeClasses([
        'w-12 h-12 fixed scale-0 right-6 md:right-8 bottom-6 md:bottom-8 z-1050 transition-transform',
        isVisible ? 'scale-100' : '',
        className,
      ])}
      {...other}
    >
      <Iconify width={24} icon="solar:double-alt-arrow-up-bold-duotone" />
    </IconButton>
  );
}
