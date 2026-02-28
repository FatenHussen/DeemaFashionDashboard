import type { NavGroupProps, NavSectionProps } from '../types';

import { mergeClasses } from 'minimal-shared/utils';

import { NavList } from './nav-list';
import { Scrollbar } from '../../scrollbar';
import { Nav, NavUl, NavLi } from '../components';
import { navSectionClasses, navSectionCssVars } from '../styles';

// ----------------------------------------------------------------------

export function NavSectionHorizontal({
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
  const cssVars = { ...navSectionCssVars.horizontal(), ...overridesVars };

  return (
    <Scrollbar
      className="h-full"
      slotProps={{
        contentSx: {
          height: '100%',
          display: 'flex',
          alignItems: 'center',
        } as React.CSSProperties,
      }}
    >
      <Nav
        className={mergeClasses([
          navSectionClasses.horizontal,
          'h-full mx-auto flex items-center min-h-[var(--nav-height)]',
          className,
        ])}
        style={cssVars}
        {...other}
      >
        <NavUl className="flex-row gap-[var(--nav-item-gap)]">
          {data.map((group) => (
            <Group
              key={String(group.subheader ?? group.items[0].title)}
              render={render}
              cssVars={cssVars}
              items={group.items}
              slotProps={slotProps}
              checkPermissions={checkPermissions}
              checkPermission={checkPermission}
              enabledRootRedirect={enabledRootRedirect}
            />
          ))}
        </NavUl>
      </Nav>
    </Scrollbar>
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
  enabledRootRedirect,
}: NavGroupProps) {
  return (
    <NavLi>
      <NavUl className="flex-row gap-[var(--nav-item-gap)]">
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
            enabledRootRedirect={enabledRootRedirect}
          />
        ))}
      </NavUl>
    </NavLi>
  );
}
