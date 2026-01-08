import type { NavItemProps } from '../types';

import { forwardRef } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

import { Iconify } from '../../iconify';
import { createNavItem } from '../utils';
import { Tooltip } from '@/shared/ui';
import { navSectionClasses } from '../styles';

// ----------------------------------------------------------------------

export const NavItem = forwardRef<HTMLButtonElement, NavItemProps>(function NavItem({
  path,
  icon,
  info,
  title,
  caption,
  open,
  active,
  disabled,
  depth,
  render,
  hasChild,
  slotProps,
  className,
  externalLink,
  enabledRootRedirect,
  ...other
}: NavItemProps) {
  const navItem = createNavItem({
    path,
    icon,
    info,
    depth,
    render,
    hasChild,
    externalLink,
    enabledRootRedirect,
  });

  const isRootItem = navItem.rootItem;
  const isSubItem = navItem.subItem;

  const rootItemClasses = mergeClasses([
    'w-full text-center flex-col min-h-[var(--nav-item-root-height)]',
    'p-[var(--nav-item-root-padding)]',
    'rounded-[var(--nav-item-radius)]',
    'text-[var(--nav-item-color)]',
    'hover:bg-[var(--nav-item-hover-bg)]',
    open ? 'text-[var(--nav-item-root-open-color)] bg-[var(--nav-item-root-open-bg)]' : '',
    active
      ? 'text-[var(--nav-item-root-active-color)] bg-[var(--nav-item-root-active-bg)] hover:bg-[var(--nav-item-root-active-hover-bg)]'
      : '',
    disabled ? 'opacity-48 pointer-events-none' : '',
  ]);

  const subItemClasses = mergeClasses([
    'w-full min-h-[var(--nav-item-sub-height)]',
    'p-[var(--nav-item-sub-padding)]',
    'rounded-[var(--nav-item-radius)]',
    'text-gray-600',
    'hover:bg-[var(--nav-item-hover-bg)]',
    open ? 'text-[var(--nav-item-sub-open-color)] bg-[var(--nav-item-sub-open-bg)]' : '',
    active ? 'text-[var(--nav-item-sub-active-color)] bg-[var(--nav-item-sub-active-bg)]' : '',
    disabled ? 'opacity-48 pointer-events-none' : '',
  ]);

  const Component = navItem.baseProps.component || 'button';
  const baseProps = navItem.baseProps.component ? navItem.baseProps : {};

  return (
    <Component
      aria-label={title}
      {...baseProps}
      className={mergeClasses([
        navSectionClasses.item.root,
        isRootItem ? rootItemClasses : subItemClasses,
        open ? navSectionClasses.state.open : '',
        active ? navSectionClasses.state.active : '',
        disabled ? navSectionClasses.state.disabled : '',
        className,
        slotProps?.className,
      ])}
      disabled={disabled}
      style={slotProps?.style}
      {...other}
    >
      {icon && (
        <span
          className={mergeClasses([
            navSectionClasses.item.icon,
            'inline-flex shrink-0',
            'w-[var(--nav-icon-size)] h-[var(--nav-icon-size)]',
            isRootItem ? 'm-[var(--nav-icon-root-margin)]' : 'm-[var(--nav-icon-sub-margin)]',
            '[&>:first-of-type:not(style):not(:first-of-type~*),&>style+*]:w-full [&>:first-of-type:not(style):not(:first-of-type~*),&>style+*]:h-full',
            slotProps?.icon?.className,
          ])}
          style={slotProps?.icon?.style}
        >
          {navItem.renderIcon}
        </span>
      )}

      {false && title && (
        <span
          className={mergeClasses([
            navSectionClasses.item.title,
            isRootItem ? 'leading-4 text-[10px] font-semibold' : 'text-sm font-medium',
            'overflow-hidden text-ellipsis whitespace-nowrap',
            isRootItem && active ? 'font-bold' : '',
            !isRootItem && active ? 'font-semibold' : '',
            slotProps?.title?.className,
          ])}
          style={slotProps?.title?.style}
        >
          {title}
        </span>
      )}

      {caption && (
        <Tooltip title={caption} arrow placement="right">
          <Iconify
            icon="eva:info-outline"
            className={mergeClasses([
              navSectionClasses.item.caption,
              'w-4 h-4 text-[var(--nav-item-caption-color)]',
              isRootItem ? 'absolute top-[11px] left-1.5' : '',
              slotProps?.caption?.className,
            ])}
            style={slotProps?.caption?.style}
          />
        </Tooltip>
      )}

      {info && isSubItem && (
        <span
          className={mergeClasses([
            navSectionClasses.item.info,
            'text-xs font-semibold shrink-0 ml-1.5 inline-flex',
            slotProps?.info?.className,
          ])}
          style={slotProps?.info?.style}
        >
          {navItem.renderInfo}
        </span>
      )}

      {hasChild && (
        <Iconify
          icon="eva:arrow-ios-forward-fill"
          className={mergeClasses([
            navSectionClasses.item.arrow,
            'w-4 h-4 shrink-0 inline-flex',
            isRootItem ? 'absolute top-[11px] right-1.5 m-0' : '',
            isSubItem ? '-mr-0.5' : '',
            slotProps?.arrow?.className,
          ])}
          style={slotProps?.arrow?.style}
        />
      )}
    </Component>
  );
});
