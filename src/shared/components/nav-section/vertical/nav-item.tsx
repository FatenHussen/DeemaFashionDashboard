import type { NavItemProps } from '../types';

import { Tooltip } from '@/shared/ui';
import { mergeClasses } from 'minimal-shared/utils';
import { useState, useEffect, forwardRef } from 'react';

import { Iconify } from '../../iconify';
import { createNavItem } from '../utils';
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
  const [isRtl, setIsRtl] = useState(false);

  useEffect(() => {
    setIsRtl(document.documentElement.dir === 'rtl');
  }, []);

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

  const bulletSvg = `"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='none' viewBox='0 0 14 14'%3E%3Cpath d='M1 1v4a8 8 0 0 0 8 8h4' stroke='%23efefef' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E"`;

  const rootItemClasses = mergeClasses([
    'w-full min-h-[var(--nav-item-root-height)]',
    'pt-[var(--nav-item-pt)] pr-[var(--nav-item-pr)] pb-[var(--nav-item-pb)] pl-[var(--nav-item-pl)]',
    'rounded-[var(--nav-item-radius)]',
    'text-[var(--nav-item-color)]',
    'relative group flex items-center gap-[var(--nav-icon-text-gap)]',
    'transition-all duration-200 ease-out',
    'hover:bg-[var(--nav-item-hover-bg)] hover:text-foreground',
    open
      ? 'text-[var(--nav-item-root-open-color)] bg-[var(--nav-item-root-open-bg)]'
      : '',
    active
      ? [
          'text-[var(--nav-item-root-active-color)] bg-[var(--nav-item-root-active-bg)]',
          'shadow-[inset_0_0_0_1px_rgb(var(--primary)_/_0.12)]',
          'before:absolute before:start-0 before:inset-y-[4px]',
          'before:w-[3px] before:rounded-e-full',
          'before:bg-gradient-to-b before:from-primary before:to-primary/55',
        ].join(' ')
      : '',
    disabled ? 'opacity-48 pointer-events-none' : '',
  ]);

  const subItemClasses = mergeClasses([
    'w-full min-h-[var(--nav-item-sub-height)]',
    'pt-[var(--nav-item-pt)] pr-[var(--nav-item-pr)] pb-[var(--nav-item-pb)] pl-[var(--nav-item-pl)]',
    'rounded-[var(--nav-item-radius)]',
    'text-[var(--nav-item-color)]',
    'relative group transition-all duration-200 ease-out flex items-center justify-center gap-[var(--nav-icon-text-gap)]',
    'hover:bg-[var(--nav-item-hover-bg)] hover:translate-x-1 hover:shadow-sm',
    'before:content-[""] before:absolute before:left-0',
    'before:w-[var(--nav-bullet-size)] before:h-[var(--nav-bullet-size)]',
    'before:bg-[var(--nav-bullet-light-color)]',
    'before:transition-all before:duration-200',
    `before:mask-[url(${bulletSvg})_no-repeat_50%_50%/100%_auto]`,
    `before:[-webkit-mask:url(${bulletSvg})_no-repeat_50%_50%/100%_auto]`,
    isRtl
      ? 'before:translate-x-[var(--nav-bullet-size)] before:translate-y-[calc(var(--nav-bullet-size)*-0.4)] before:scale-x-[-1]'
      : 'before:translate-x-[calc(var(--nav-bullet-size)*-1)] before:translate-y-[calc(var(--nav-bullet-size)*-0.4)]',
    'group-hover:before:scale-110 group-hover:before:opacity-80',
    open ? 'text-[var(--nav-item-sub-open-color)] bg-[var(--nav-item-sub-open-bg)] shadow-sm' : '',
    active
      ? 'text-[var(--nav-item-sub-active-color)] bg-[var(--nav-item-sub-active-bg)] shadow-sm font-medium'
      : '',
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
            'inline-flex shrink-0 items-center justify-center',
            'w-[var(--nav-icon-size)] h-[var(--nav-icon-size)]',
            'm-[var(--nav-icon-margin)]',
            'transition-transform duration-200',
            isRootItem && active ? 'scale-110' : '',
            '[&>:first-of-type:not(style):not(:first-of-type~*),&>style+*]:w-full [&>:first-of-type:not(style):not(:first-of-type~*),&>style+*]:h-full',
            slotProps?.icon?.className,
          ])}
          style={slotProps?.icon?.style}
        >
          {navItem.renderIcon}
        </span>
      )}

      {title && (
        <span
          className={mergeClasses([
            navSectionClasses.item.texts,
            'flex-auto inline-flex flex-col',
            slotProps?.texts?.className,
          ])}
          style={slotProps?.texts?.style}
        >
          <span
            className={mergeClasses([
              navSectionClasses.item.title,
              'flex-auto',
              isRootItem ? 'text-[12px] font-semibold' : 'text-[11px] font-medium',
              'overflow-hidden text-ellipsis whitespace-nowrap',
              active ? (isRootItem ? 'font-bold' : 'font-medium') : '',
              slotProps?.title?.className,
            ])}
            style={slotProps?.title?.style}
          >
            {title}
          </span>

          {caption && (
            <Tooltip title={caption} placement="top">
              <span
                className={mergeClasses([
                  navSectionClasses.item.caption,
                  'text-[13px] text-[var(--nav-item-caption-color)]',
                  'overflow-hidden text-ellipsis whitespace-nowrap',
                  slotProps?.caption?.className,
                ])}
                style={slotProps?.caption?.style}
              >
                {caption}
              </span>
            </Tooltip>
          )}
        </span>
      )}

      {/* {info && (
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
      )} */}

      {hasChild && (
        <Iconify
          icon="solar:alt-arrow-down-outline"
          className={mergeClasses([
            navSectionClasses.item.arrow,
            'w-4 h-4 shrink-0 ml-auto inline-flex',
            'transition-transform duration-200 ease-out',
            open ? 'rotate-0' : '-rotate-90',
            slotProps?.arrow?.className,
          ])}
          style={slotProps?.arrow?.style}
        />
      )}
    </Component>
  );
});
