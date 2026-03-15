// ----------------------------------------------------------------------

/**
 * Item
 */
export type NavItemRenderProps = {
  navIcon?: Record<string, React.ReactNode>;
  navInfo?: (val: string) => Record<string, React.ReactElement>;
};

export type NavItemStateProps = {
  open?: boolean;
  active?: boolean;
  disabled?: boolean;
};

export type NavItemSlotProps = {
  className?: string;
  style?: React.CSSProperties;
  icon?: React.HTMLAttributes<HTMLSpanElement>;
  texts?: React.HTMLAttributes<HTMLSpanElement>;
  title?: React.HTMLAttributes<HTMLSpanElement>;
  caption?: React.HTMLAttributes<HTMLSpanElement>;
  info?: React.HTMLAttributes<HTMLSpanElement>;
  arrow?: React.HTMLAttributes<HTMLSpanElement>;
};

export type NavSlotProps = {
  rootItem?: NavItemSlotProps;
  subItem?: NavItemSlotProps;
  subheader?: React.HTMLAttributes<HTMLDivElement>;
  dropdown?: {
    paper?: React.HTMLAttributes<HTMLDivElement>;
  };
};

export type NavItemOptionsProps = {
  depth?: number;
  hasChild?: boolean;
  externalLink?: boolean;
  enabledRootRedirect?: boolean;
  render?: NavItemRenderProps;
  slotProps?: NavItemSlotProps;
};

export type NavItemDataProps = Pick<NavItemStateProps, 'disabled'> & {
  path: string;
  title: string;
  icon?: string | React.ReactNode;
  info?: string[] | React.ReactNode;
  caption?: string;
  deepMatch?: boolean;
  allowedRoles?: string | string[]; // Deprecated: use requiredPermission instead
  requiredPermission?: string; // Permission required to show this menu item (e.g., "vendor.view")
  requiredPermissionAny?: string[]; // Show if user has ANY of these permissions
  children?: NavItemDataProps[];
};

export type NavItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  NavItemDataProps &
  NavItemStateProps &
  NavItemOptionsProps;

/**
 * List
 */
export type NavListProps = Pick<NavItemProps, 'render' | 'depth' | 'enabledRootRedirect'> & {
  cssVars?: React.CSSProperties;
  data: NavItemDataProps;
  slotProps?: NavSlotProps;
  checkPermissions?: (allowedRoles?: NavItemProps['allowedRoles']) => boolean; // Deprecated: use checkPermission instead
  checkPermission?: (permission?: string) => boolean; // Check if user has required permission
  checkPermissionAny?: (permissions: string[]) => boolean; // Check if user has any permission
};

export type NavSubListProps = Omit<NavListProps, 'data'> & {
  data: NavItemDataProps[];
};

export type NavGroupProps = Omit<NavListProps, 'data' | 'depth'> & {
  subheader?: string | React.ReactNode;
  items: NavItemDataProps[];
  checkPermission?: (permission?: string) => boolean;
  checkPermissionAny?: (permissions: string[]) => boolean;
};

/**
 * Main
 */
export type NavSectionProps = React.ComponentProps<'nav'> &
  Omit<NavListProps, 'data' | 'depth'> & {
    className?: string;
    data: {
      subheader?: string | React.ReactNode;
      items: NavItemDataProps[];
    }[];
    checkPermission?: (permission?: string) => boolean;
    checkPermissionAny?: (permissions: string[]) => boolean;
  };
