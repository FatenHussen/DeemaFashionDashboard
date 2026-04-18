import type { NavGroupProps, NavSectionProps } from '../types';

import { mergeClasses } from 'minimal-shared/utils';

import { NavList } from './nav-list';
import { canShowNavItem } from '../utils';
import { Nav, NavUl, NavLi } from '../components';
import { navSectionClasses, navSectionCssVars } from '../styles';

// ----------------------------------------------------------------------

export function NavSectionMini({
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
  const cssVars = { ...navSectionCssVars.mini(), ...overridesVars };

  return (
    <Nav className={mergeClasses([navSectionClasses.mini, className])} style={cssVars} {...other}>
      <NavUl className="flex-auto items-center gap-[var(--nav-item-gap)]">
        {data.map((group) => (
          <Group
            key={String(group.subheader ?? group.items[0].title)}
            render={render}
            cssVars={cssVars}
            items={group.items}
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
  cssVars,
  slotProps,
  checkPermissions,
  checkPermission,
  checkPermissionAny,
  enabledRootRedirect,
}: NavGroupProps) {
  const hasVisibleItems = items.some((item) =>
    canShowNavItem(item, checkPermissions, checkPermission, checkPermissionAny)
  );
  if (!hasVisibleItems) return null;

  return (
    <NavLi className="w-full">
      <NavUl className="w-full items-center gap-[var(--nav-item-gap)]">
        {items.map((list) => (
          <NavList
            key={list.title}
            depth={1}
            data={list}
            render={render}
            cssVars={cssVars}
            slotProps={slotProps}
            checkPermissions={checkPermissions}
            checkPermission={checkPermission}
            checkPermissionAny={checkPermissionAny}
            enabledRootRedirect={enabledRootRedirect}
          />
        ))}
      </NavUl>
    </NavLi>
  );
}
