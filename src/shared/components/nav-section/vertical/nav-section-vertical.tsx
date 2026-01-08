import type { NavGroupProps, NavSectionProps } from '../types';

import { useBoolean } from 'minimal-shared/hooks';
import { mergeClasses } from 'minimal-shared/utils';

import { NavList } from './nav-list';
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
        {data.map((group) => (
          <Group
            key={group.subheader ?? group.items[0].title}
            subheader={group.subheader}
            items={group.items}
            render={render}
            slotProps={slotProps}
            checkPermissions={checkPermissions}
            checkPermission={checkPermission}
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
  enabledRootRedirect,
}: NavGroupProps) {
  const groupOpen = useBoolean(true);

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
          enabledRootRedirect={enabledRootRedirect}
        />
      ))}
    </NavUl>
  );

  return (
    <NavLi>
      {subheader ? (
        <>
          <NavSubheader
            data-title={subheader}
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
