import type { NavSectionProps } from 'src/shared/components/nav-section';
import type { NavItemDataProps } from 'src/shared/components/nav-section/types';

import { canShowNavItem } from 'src/shared/components/nav-section/utils';

// ----------------------------------------------------------------------

export type OutputItem = {
  title: string;
  path: string;
  group: string;
};

type PermissionCheckers = {
  checkPermission?: (permission?: string) => boolean;
  checkPermissionAny?: (permissions: string[]) => boolean;
};

const flattenNavItems = (
  navItems: NavItemDataProps[],
  parentGroup?: string,
  checkers?: PermissionCheckers
): OutputItem[] => {
  let flattenedItems: OutputItem[] = [];

  navItems.forEach((navItem) => {
    if (
      !canShowNavItem(
        navItem,
        undefined,
        checkers?.checkPermission,
        checkers?.checkPermissionAny
      )
    ) {
      return;
    }

    const currentGroup = parentGroup ? `${parentGroup}-${navItem.title}` : navItem.title;
    const groupArray = currentGroup.split('-');

    flattenedItems.push({
      title: navItem.title,
      path: navItem.path,
      group: groupArray.length > 2 ? `${groupArray[0]}.${groupArray[1]}` : groupArray[0],
    });

    if (navItem.children) {
      flattenedItems = flattenedItems.concat(
        flattenNavItems(navItem.children, currentGroup, checkers)
      );
    }
  });
  return flattenedItems;
};

export function flattenNavSections(
  navSections: NavSectionProps['data'],
  checkers?: PermissionCheckers
): OutputItem[] {
  return navSections.flatMap((navSection) =>
    flattenNavItems(
      navSection.items,
      typeof navSection.subheader === 'string' ? navSection.subheader : undefined,
      checkers
    )
  );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  query: string;
  inputData: OutputItem[];
};

export function applyFilter({ inputData, query }: ApplyFilterProps): OutputItem[] {
  if (!query) return inputData;

  return inputData.filter(({ title, path, group }) =>
    [title, path, group].some((field) => field?.toLowerCase().includes(query.toLowerCase()))
  );
}
