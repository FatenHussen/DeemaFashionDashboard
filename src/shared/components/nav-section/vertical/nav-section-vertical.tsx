import type { NavGroupProps, NavSectionProps } from '../types';

import React from 'react';
import { useBoolean } from 'minimal-shared/hooks';
import { mergeClasses } from 'minimal-shared/utils';

import { NavList } from './nav-list';
import { canShowNavItem } from '../utils';
import { navSectionClasses, navSectionCssVars } from '../styles';
import { Nav, NavUl, NavLi, NavCollapse, NavSubheader } from '../components';

// ----------------------------------------------------------------------

export function NavSectionVertical({
  data,
  render,
  className,
  slotProps,
  checkPermissions,
  checkPermission,
  checkPermissionAny,
  enabledRootRedirect,
  cssVars: overridesVars,
  ...other
}: NavSectionProps) {
  const cssVars = { ...navSectionCssVars.vertical(), ...overridesVars };

  return (
    <Nav
      className={mergeClasses([navSectionClasses.vertical, className])}
      style={cssVars}
      {...other}
    >
      <NavUl className="flex-auto gap-[var(--nav-item-gap)]">
        {data.map((group, index) => (
          <Group
            key={index}
            subheader={group.subheader}
            items={group.items}
            render={render}
            slotProps={slotProps}
            checkPermissions={checkPermissions}
            checkPermission={checkPermission}
            checkPermissionAny={checkPermissionAny}
            enabledRootRedirect={enabledRootRedirect}
          />
        ))}
      </NavUl>
    </Nav>
  );
}

// ----------------------------------------------------------------------

function Group({
  items,
  render,
  subheader,
  slotProps,
  checkPermissions,
  checkPermission,
  checkPermissionAny,
  enabledRootRedirect,
}: NavGroupProps) {
  const groupOpen = useBoolean(true);

  const hasVisibleItems = items.some((item) =>
    canShowNavItem(item, checkPermissions, checkPermission, checkPermissionAny)
  );
  if (!hasVisibleItems) return null;

  const renderContent = () => (
    <NavUl className="gap-[var(--nav-item-gap)]">
      {items.map((list) => (
        <NavList
          key={list.title}
          data={list}
          render={render}
          depth={1}
          slotProps={slotProps}
          checkPermissions={checkPermissions}
          checkPermission={checkPermission}
          checkPermissionAny={checkPermissionAny}
          enabledRootRedirect={enabledRootRedirect}
        />
      ))}
    </NavUl>
  );

  // Extract text from subheader for data-title attribute
  const getSubheaderText = (): string => {
    if (typeof subheader === 'string') return subheader;
    if (React.isValidElement(subheader)) {
      const children = (subheader as React.ReactElement<{ children?: React.ReactNode }>).props?.children;
      if (Array.isArray(children)) {
        const str = children.find((c): c is string => typeof c === 'string');
        return str ?? 'Group';
      }
      return typeof children === 'string' ? children : 'Group';
    }
    return 'Group';
  };

  return (
    <NavLi>
      {subheader ? (
        <>
          <NavSubheader
            data-title={getSubheaderText()}
            open={groupOpen.value}
            onClick={groupOpen.onToggle}
            {...slotProps?.subheader}
          >
            {subheader}
          </NavSubheader>

          <NavCollapse in={groupOpen.value}>{renderContent()}</NavCollapse>
        </>
      ) : (
        renderContent()
      )}
    </NavLi>
  );
}
