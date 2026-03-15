import type { NavItemProps, NavSectionProps } from 'src/shared/components/nav-section';
import type { MainSectionProps, HeaderSectionProps, LayoutSectionProps } from '../core';

import { merge } from 'es-toolkit';
import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBoolean } from 'minimal-shared/hooks';
import { mergeClasses } from 'minimal-shared/utils';

import { Box, Alert } from 'src/shared/ui';
import { getFcmToken } from 'src/lib/firebase';
import { Logo } from 'src/shared/components/logo';
import { apiRoutes, axiosInstance } from 'src/api';
import { useMockedUser } from 'src/pages/auth/hooks';
import { useSettingsContext } from 'src/shared/components/settings';
import { useAuthContext } from 'src/pages/auth/hooks/use-auth-context';

import { NavMobile } from './nav-mobile';
import { VerticalDivider } from './content';
import { NavVertical } from './nav-vertical';
import { NavHorizontal } from './nav-horizontal';
import { Searchbar } from '../components/searchbar';
import { getNavData } from '../nav-config-dashboard';
import { _workspaces } from '../nav-config-workspace';
import { MenuButton } from '../components/menu-button';
import { LogoutButton } from '../components/logout-button';
import { SettingsButton } from '../components/settings-button';
import { LanguagePopover } from '../components/language-popover';
import { WorkspacesPopover } from '../components/workspaces-popover';
import { dashboardLayoutVars, dashboardNavColorVars } from './css-vars';
import { NotificationsDrawer } from '../components/notifications-drawer';
import { MainSection, layoutClasses, HeaderSection, LayoutSection } from '../core';

// ----------------------------------------------------------------------

type LayoutBaseProps = Pick<LayoutSectionProps, 'className' | 'children' | 'cssVars'>;

export type DashboardLayoutProps = LayoutBaseProps & {
  layoutQuery?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  slotProps?: {
    header?: HeaderSectionProps;
    nav?: {
      data?: NavSectionProps['data'];
    };
    main?: MainSectionProps;
  };
};

export function DashboardLayout({
  className,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'lg',
}: DashboardLayoutProps) {
  const { user } = useMockedUser();
  const { t } = useTranslation('nav');

  const settings = useSettingsContext();

  const navVars = dashboardNavColorVars(settings.state.navColor, settings.state.navLayout);

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const navData = slotProps?.nav?.data ?? getNavData(t);

  const isNavMini = settings.state.navLayout === 'mini';
  const isNavHorizontal = settings.state.navLayout === 'horizontal';
  const isNavVertical = isNavMini || settings.state.navLayout === 'vertical';

  const { permissions } = useAuthContext();

  const fcmInitialized = useRef(false);
  useEffect(() => {
    if (fcmInitialized.current) return;
    fcmInitialized.current = true;

    getFcmToken().then((fcmToken) => {
      if (fcmToken) {
        axiosInstance
          .post(apiRoutes.auth.storeToken, {
            deviceId: navigator.userAgent.slice(0, 50),
            fcmToken,
          })
          .catch(() => {});
      }
    });
  }, []);

  // Legacy role-based check (for backward compatibility)
  const canDisplayItemByRole = (allowedRoles: NavItemProps['allowedRoles']): boolean =>
    !allowedRoles?.includes(user?.role);

  // Permission-based check
  const canDisplayItemByPermission = (requiredPermission?: string): boolean => {
    if (!requiredPermission) {
      return true; // No permission required, show item
    }
    if (!permissions || !Array.isArray(permissions)) {
      return false; // No permissions available, hide item
    }
    return permissions.includes(requiredPermission);
  };

  // Permission-based check (any of the list)
  const canDisplayItemByPermissionAny = (requiredPermissions: string[]): boolean => {
    if (!requiredPermissions?.length) return true;
    if (!permissions || !Array.isArray(permissions)) return false;
    return requiredPermissions.some((p) => permissions.includes(p));
  };

  const renderHeader = () => {
    const headerSlotProps: HeaderSectionProps['slotProps'] = {
      container: {
        className: mergeClasses([
          // Creative flex container styling
          'flex justify-between w-full items-center',
          'relative z-10',
          'px-4 md:px-6 lg:px-8',
          // Creative visual enhancements
          'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px',
          'before:bg-gradient-to-b before:from-transparent before:via-indigo-200/30 before:to-transparent',
          'after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px',
          'after:bg-gradient-to-b after:from-transparent after:via-indigo-200/30 after:to-transparent',
          // Responsive padding based on nav layout
          isNavVertical ? 'lg:pl-10 lg:pr-10' : '',
          isNavHorizontal
            ? 'bg-[var(--layout-nav-bg)] lg:h-[var(--layout-nav-horizontal-height)]'
            : '',
        ]),
      },
    };

    const headerSlots: HeaderSectionProps['slots'] = {
      topArea: (
        <Alert severity="info" className="hidden rounded-none">
          This is an info Alert.
        </Alert>
      ),
      bottomArea: isNavHorizontal ? (
        <NavHorizontal
          data={navData}
          layoutQuery={layoutQuery}
          cssVars={navVars.section}
          checkPermissions={canDisplayItemByRole}
          checkPermission={canDisplayItemByPermission}
          checkPermissionAny={canDisplayItemByPermissionAny}
        />
      ) : null,
      leftArea: (
        <Box className="flex items-center gap-2 md:gap-4 relative z-10">
          {/** @slot Nav mobile */}
          <MenuButton onClick={onOpen} className="mr-2 -ml-2 lg:hidden" />
          <NavMobile
            data={navData}
            open={open}
            onClose={onClose}
            cssVars={navVars.section}
            checkPermissions={canDisplayItemByRole}
            checkPermission={canDisplayItemByPermission}
            checkPermissionAny={canDisplayItemByPermissionAny}
          />

          {/** @slot Logo */}
          {isNavHorizontal && (
            <Box className="hidden lg:inline-flex items-center gap-3">
              <Logo href="/" />
              <Box className="h-6 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
            </Box>
          )}

          {/** @slot Divider */}
          {isNavHorizontal && <VerticalDivider className="hidden lg:flex" />}

          {/** @slot Workspace popover */}
          {/* <Box className="flex items-center gap-2">
            <WorkspacesPopover
              data={_workspaces}
              className={mergeClasses([
                isNavHorizontal ? 'text-[var(--layout-nav-text-primary-color)]' : '',
                'transition-all duration-200 hover:scale-105',
              ])}
            />
          </Box> */}
        </Box>
      ),
      rightArea: (
        <Box className="flex items-center gap-1 sm:gap-2 md:gap-3 relative z-10">
          {/** @slot Searchbar */}
          <Box className="hidden sm:block">
            <Searchbar data={navData} />
          </Box>

          {/** @slot Divider for visual separation */}
          <Box className="hidden sm:block h-6 w-px bg-gradient-to-b from-transparent via-border to-transparent mx-1" />

          {/** @slot Notifications popover */}
          <Box className="flex items-center">
            <NotificationsDrawer />
          </Box>

          {/** @slot Contacts popover */}
          {/* <Box className="hidden md:flex items-center">
            <ContactsPopover data={_contacts} />
          </Box> */}

          {/** @slot Settings button */}
          <Box className="flex items-center">
            <SettingsButton />
          </Box>

          {/** @slot Divider before account */}
          <Box className="hidden md:block h-6 w-px bg-gradient-to-b from-transparent via-border to-transparent mx-1" />

          {/** @slot Logout button */}
          <Box className="flex items-center">
            <LogoutButton />
          </Box>

          {/** @slot Language popover - at bottom of header actions */}
          <Box className="flex items-center gap-1">
            <LanguagePopover
              data={[
                { value: 'en', label: 'English', countryCode: 'GB' },
                { value: 'ar', label: 'العربية', countryCode: 'SA' },
              ]}
            />
          </Box>

          {/** @slot Account drawer */}
          {/* <Box className="flex items-center">
            <AccountDrawer data={_account} />
          </Box> */}
        </Box>
      ),
    };

    return (
      <HeaderSection
        layoutQuery={layoutQuery}
        disableElevation={isNavVertical}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps || {})}
        className={slotProps?.header?.className}
      />
    );
  };

  const renderSidebar = () => (
    <NavVertical
      data={navData}
      isNavMini={isNavMini}
      layoutQuery={layoutQuery}
      cssVars={navVars.section}
      checkPermissions={canDisplayItemByRole}
      checkPermission={canDisplayItemByPermission}
      checkPermissionAny={canDisplayItemByPermissionAny}
      onToggleNav={() =>
        settings.setField(
          'navLayout',
          settings.state.navLayout === 'vertical' ? 'mini' : 'vertical'
        )
      }
    />
  );

  const renderFooter = () => null;

  const renderMain = () => <MainSection {...slotProps?.main}>{children}</MainSection>;

  return (
    <LayoutSection
      headerSection={renderHeader()}
      sidebarSection={isNavHorizontal ? null : renderSidebar()}
      footerSection={renderFooter()}
      cssVars={
        {
          ...dashboardLayoutVars(),
          ...navVars.layout,
          // Set current sidebar width variable for dynamic margin calculation
          '--layout-nav-current-width': isNavMini
            ? 'var(--layout-nav-mini-width)'
            : 'var(--layout-nav-vertical-width)',
          ...cssVars,
        } as any
      }
      className={mergeClasses([
        className,
        `[&_.${layoutClasses.sidebarContainer}]:lg:ps-[var(--layout-nav-${isNavMini ? 'mini' : 'vertical'}-width)]`,
        `[&_.${layoutClasses.sidebarContainer}]:transition-[padding-inline-start]`,
        `[&_.${layoutClasses.sidebarContainer}]:duration-[var(--layout-transition-duration)]`,
        `[&_.${layoutClasses.sidebarContainer}]:ease-[var(--layout-transition-easing)]`,
      ])}
    >
      {renderMain()}
    </LayoutSection>
  );
}
