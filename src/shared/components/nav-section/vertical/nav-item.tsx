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
    'relative group flex items-center justify-center',
    'transition-all duration-200 ease-out',
    'hover:bg-[var(--nav-item-hover-bg)] hover:translate-x-0.5',
    'hover:shadow-sm',
    open
      ? 'text-[var(--nav-item-root-open-color)] bg-[var(--nav-item-root-open-bg)] shadow-sm'
      : '',
    active
      ? 'text-[var(--nav-item-root-active-color)] bg-[var(--nav-item-root-active-bg)] hover:bg-[var(--nav-item-root-active-hover-bg)] shadow-md before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-10 before:bg-[var(--nav-item-root-active-color)] before:rounded-r-full'
      : '',
    disabled ? 'opacity-48 pointer-events-none' : '',
  ]);

  const subItemClasses = mergeClasses([
    'w-full min-h-[var(--nav-item-sub-height)]',
    'pt-[var(--nav-item-pt)] pr-[var(--nav-item-pr)] pb-[var(--nav-item-pb)] pl-[var(--nav-item-pl)]',
    'rounded-[var(--nav-item-radius)]',
    'text-[var(--nav-item-color)]',
    'relative group transition-all duration-200 ease-out flex items-center justify-center',
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
            'inline-flex shrink-0',
            'w-[var(--nav-icon-size)] h-[var(--nav-icon-size)]',
            'm-[var(--nav-icon-margin)]',
            'transition-all duration-200',
            'group-hover:scale-110',
            active ? 'scale-105' : '',
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
              'flex-auto text-sm font-medium',
              'overflow-hidden text-ellipsis whitespace-nowrap',
              active ? 'font-semibold' : '',
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
                  'text-xs text-[var(--nav-item-caption-color)]',
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
          icon={open ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
          className={mergeClasses([
            navSectionClasses.item.arrow,
            'w-4 h-4 shrink-0 ml-1.5 inline-flex',
            'transition-transform duration-200 ease-out',
            isRtl ? 'scale-x-[-1]' : '',
            slotProps?.arrow?.className,
          ])}
          style={slotProps?.arrow?.style}
        />
      )}
    </Component>
  );
});
