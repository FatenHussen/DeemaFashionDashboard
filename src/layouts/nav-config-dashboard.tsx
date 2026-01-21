import type { NavSectionProps } from 'src/shared/components/nav-section';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { Label } from 'src/shared/components/label';
import { SvgColor } from 'src/shared/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  params: icon('ic-params'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  subpaths: icon('ic-subpaths'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
};

// ----------------------------------------------------------------------

export const navData: NavSectionProps['data'] = [
  /**
   * Overview
   */
  {
    subheader: '',
    items: [
      {
        title: 'Admin',
        path: paths.dashboard.root,
        icon: ICONS.dashboard,
        info: <Label>v{CONFIG.appVersion}</Label>,
        requiredPermission: 'admin.view',
      },
      {
        title: 'Vendor',
        path: paths.dashboard.vendor,
        icon: ICONS.ecommerce,
        requiredPermission: 'vendor.view',
      },
      {
        title: 'Shop',
        path: paths.dashboard.shop,
        icon: ICONS.analytics,
        requiredPermission: 'shop.view',
      },
      {
        title: 'Role',
        path: paths.dashboard.role,
        icon: ICONS.lock,
        requiredPermission: 'role.view',
      },
      {
        title: 'Driver',
        path: paths.dashboard.driver,
        icon: ICONS.order,
        requiredPermission: 'driver.view',
      },
      {
        title: 'Brand',
        path: paths.dashboard.products,
        icon: ICONS.product,
        requiredPermission: 'brand.view',
      },
    ],
  },
  /**
   * Locations
   */
  {
    subheader: '🗺️ Locations',
    items: [
      {
        title: 'Government',
        path: paths.dashboard.locations,
        icon: ICONS.folder,
        requiredPermission: 'governorate.view',
      },
      {
        title: 'City',
        path: paths.dashboard.city,
        icon: ICONS.tour,
        requiredPermission: 'city.view',
      },
      {
        title: 'Area',
        path: paths.dashboard.area,
        icon: ICONS.label,
        requiredPermission: 'area.view',
      },
    ],
  },
  /**
   * Categories
   */
  {
    subheader: '📦 Categories',
    items: [
      {
        title: 'Categories',
        path: paths.dashboard.categories,
        icon: ICONS.product,
        requiredPermission: 'category.view',
      },
      {
        title: 'Category Attributes',
        path: paths.dashboard.categoryAttributes,
        icon: ICONS.params,
        requiredPermission: 'categoryattribute.view',
      },
      {
        title: 'Category Details',
        path: paths.dashboard.categoryDetails,
        icon: ICONS.menuItem,
        requiredPermission: 'categorydetail.view',
      },
    ],
  },
  /**
   * Services
   */
  {
    subheader: '🛠️ Services',
    items: [
      {
        title: 'Services',
        path: paths.dashboard.services,
        icon: ICONS.course,
        requiredPermission: 'service.view',
      },
    ],
  },
  /**
   * Languages
   */
  {
    subheader: '🌐 Languages',
    items: [
      {
        title: 'Languages',
        path: paths.dashboard.languages,
        icon: ICONS.label,
        requiredPermission: 'language.view',
      },
      {
        title: 'Translation Manager',
        path: `${paths.dashboard.languages}/translations`,
        icon: ICONS.file,
        requiredPermission: 'language.view',
      },
    ],
  },
  /**
   * Sections
   */
  {
    subheader: '📋 Sections',
    items: [
      {
        title: 'Sections',
        path: paths.dashboard.sections,
        icon: ICONS.folder,
        requiredPermission: 'section.view',
      },
      {
        title: 'Page Sections',
        path: paths.dashboard.pageSections,
        icon: ICONS.menuItem,
        requiredPermission: 'pagesection.view',
      },
    ],
  },
];
