import { mergeClasses } from 'minimal-shared/utils';

import { flagIconClasses } from './classes';

// ----------------------------------------------------------------------

export type FlagIconProps = React.ComponentProps<'span'> & {
  code?: string;
  className?: string;
};

export function FlagIcon({ code, className, ...other }: FlagIconProps) {
  if (!code) {
    return null;
  }

  return (
    <span
      className={mergeClasses([
        flagIconClasses.root,
        'w-[26px] h-5 shrink-0 overflow-hidden rounded-[5px] items-center inline-flex justify-center bg-muted',
        className,
      ])}
      {...other}
    >
      <img
        loading="lazy"
        alt={code}
        src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${code?.toUpperCase()}.svg`}
        className={mergeClasses([flagIconClasses.img, 'w-full h-full max-w-none object-cover'])}
      />
    </span>
  );
}
