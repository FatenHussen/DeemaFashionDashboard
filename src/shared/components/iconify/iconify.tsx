import type { IconProps } from '@iconify/react';
import type { IconifyName } from './register-icons';

import { useId } from 'react';
import { Icon } from '@iconify/react';
import { mergeClasses } from 'minimal-shared/utils';

import { iconifyClasses } from './classes';
import { allIconNames, registerIcons } from './register-icons';

/** Avoid spamming console: each unregistered icon name warns at most once (dev only). */
const warnedUnregisteredIcons = new Set<string>();

// ----------------------------------------------------------------------

export type IconifyProps = Omit<IconProps, 'icon'> & {
  icon: string;
  className?: string;
  width?: number | string;
  height?: number | string;
};

export function Iconify({ className, icon, width = 20, height, ...other }: IconifyProps) {
  const uniqueId = useId();

  if (
    import.meta.env.DEV &&
    !allIconNames.includes(icon as IconifyName) &&
    !warnedUnregisteredIcons.has(icon)
  ) {
    warnedUnregisteredIcons.add(icon);
    console.warn(
      [
        `Icon "${icon}" is currently loaded online, which may cause flickering effects.`,
        `To ensure a smoother experience, please register your icon collection for offline use.`,
        `More information is available at: https://docs.minimals.cc/icons/`,
      ].join('\n')
    );
  }

  registerIcons();

  const iconWidth = typeof width === 'number' ? `${width}px` : width;
  const iconHeight = height ? (typeof height === 'number' ? `${height}px` : height) : iconWidth;

  return (
    <Icon
      ssr
      id={uniqueId}
      icon={icon}
      className={mergeClasses([iconifyClasses.root, 'inline-flex flex-shrink-0', className])}
      style={{ width: iconWidth, height: iconHeight }}
      {...other}
    />
  );
}
