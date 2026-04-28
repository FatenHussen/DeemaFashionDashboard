import type { NavSectionProps } from 'src/shared/components/nav-section';
import type { NavItemDataProps } from 'src/shared/components/nav-section/types';

import { useMemo } from 'react';
import { useLocation } from 'react-router';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { Iconify } from 'src/shared/components/iconify';

// ----------------------------------------------------------------------

function collectNavItems(items: NavItemDataProps[], out: { path: string; title: string }[]) {
  for (const item of items) {
    if (item.path) {
      out.push({ path: item.path, title: typeof item.title === 'string' ? item.title : '' });
    }
    if (item.children?.length) {
      collectNavItems(item.children, out);
    }
  }
}

function findNavContextTitle(
  pathname: string,
  data: NavSectionProps['data']
): string | null {
  const flat: { path: string; title: string }[] = [];
  for (const section of data) {
    collectNavItems(section.items, flat);
  }
  const sorted = flat.filter((x) => x.path).sort((a, b) => b.path.length - a.path.length);
  for (const { path, title } of sorted) {
    if (pathname === path || pathname.startsWith(`${path}/`)) {
      return title || null;
    }
  }
  return null;
}

export type DashboardHeaderCenterProps = {
  navData: NavSectionProps['data'];
};

export function DashboardHeaderCenter({ navData }: DashboardHeaderCenterProps) {
  const { pathname } = useLocation();

  const contextTitle = useMemo(() => findNavContextTitle(pathname, navData), [pathname, navData]);

  return (
    <Box className="pointer-events-none hidden min-w-0 flex-1 select-none flex-col items-center justify-center px-2 lg:flex">
      <Box className="flex w-full max-w-xl items-center justify-center gap-3">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/35 to-primary/10" />
        <Box className="flex max-w-[min(100%,20rem)] flex-col items-center gap-0.5 text-center">
          <Box className="flex items-center gap-1.5">
            <Iconify icon="solar:widget-4-bold-duotone" width={18} className="text-primary/90 shrink-0" />
            <Typography
              variant="overline"
              className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary"
            >
              {CONFIG.appName}
            </Typography>
          </Box>
          {contextTitle ? (
            <Typography
              variant="caption"
              className="line-clamp-1 text-muted-foreground text-xs font-medium"
            >
              {contextTitle}
            </Typography>
          ) : null}
        </Box>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent via-primary/35 to-primary/10" />
      </Box>
    </Box>
  );
}
