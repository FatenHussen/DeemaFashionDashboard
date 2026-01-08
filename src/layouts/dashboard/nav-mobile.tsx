import type { NavSectionProps } from 'src/shared/components/nav-section';

import { useEffect } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

import { usePathname } from 'src/routes/hooks';

import { Box, Drawer } from 'src/shared/ui';

import { Logo } from 'src/shared/components/logo';
import { Scrollbar } from 'src/shared/components/scrollbar';
import { NavSectionVertical } from 'src/shared/components/nav-section';

import { layoutClasses } from '../core';

// ----------------------------------------------------------------------

type NavMobileProps = NavSectionProps & {
  open: boolean;
  onClose: () => void;
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
  className?: string;
  style?: React.CSSProperties;
  checkPermission?: (permission?: string) => boolean;
};

export function NavMobile({
  data,
  open,
  slots,
  onClose,
  className,
  checkPermissions,
  checkPermission,
  style,
  ...other
}: NavMobileProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor="left"
      width="var(--layout-nav-mobile-width)"
      className={mergeClasses([
        layoutClasses.nav.root,
        layoutClasses.nav.vertical,
        'overflow-visible bg-[var(--layout-nav-bg)]',
        className,
      ])}
    >
      {slots?.topArea ?? (
        <Box className="pl-7 pt-5 pb-2">
          <Logo href="/" />
        </Box>
      )}

      <Scrollbar fillContent>
        <NavSectionVertical
          data={data}
          checkPermissions={checkPermissions}
          checkPermission={checkPermission}
          className="px-4 flex-auto"
          {...other}
        />
      </Scrollbar>

      {slots?.bottomArea}
    </Drawer>
  );
}
