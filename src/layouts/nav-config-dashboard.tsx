import type { NavSectionProps } from 'src/shared/components/nav-section';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { Label } from 'src/shared/components/label';
import { SvgColor } from 'src/shared/components/svg-color';
import { Iconify } from 'src/shared/components/iconify';

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

// Creative group icons
const GROUP_ICONS = {
  products: <Iconify icon="solar:shop-2-bold" width={16} height={16} />,
  locations: <Iconify icon="solar:map-point-bold" width={16} height={16} />,
  categories: <Iconify icon="solar:widget-5-bold" width={16} height={16} />,
  services: <Iconify icon="solar:settings-bold" width={16} height={16} />,
  languages: <Iconify icon="solar:global-bold" width={16} height={16} />,
  sections: <Iconify icon="solar:document-bold" width={16} height={16} />,
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
        title: 'Users',
        path: paths.dashboard.users,
        icon: ICONS.user,
        requiredPermission: 'user.view',
      },
    ],
  },
  /**
   * Products & Brands
   */
  {
    subheader: (
      <span className="flex items-center gap-2">
        {GROUP_ICONS.products}
        <span>Products</span>
      </span>
    ) as any,
    items: [
      {
        title: 'Products',
        path: paths.dashboard.products,
        icon: ICONS.product,
        requiredPermission: 'product.view',
      },
      {
        title: 'Brands',
        path: paths.dashboard.brands,
        icon: ICONS.ecommerce,
        requiredPermission: 'brand.view',
      },
    ],
  },
  /**
   * Locations
   */
  {
    subheader: (
      <span className="flex items-center gap-2">
        {GROUP_ICONS.locations}
        <span>Locations</span>
      </span>
    ) as any,
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
    subheader: (
      <span className="flex items-center gap-2">
        {GROUP_ICONS.categories}
        <span>Categories</span>
      </span>
    ) as any,
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
    subheader: (
      <span className="flex items-center gap-2">
        {GROUP_ICONS.services}
        <span>Services</span>
      </span>
    ) as any,
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
    subheader: (
      <span className="flex items-center gap-2">
        {GROUP_ICONS.languages}
        <span>Languages</span>
      </span>
    ) as any,
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
    subheader: (
      <span className="flex items-center gap-2">
        {GROUP_ICONS.sections}
        <span>Sections</span>
      </span>
    ) as any,
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
      {
        title: 'Banners',
        path: paths.dashboard.banners,
        icon: ICONS.ecommerce,
        requiredPermission: 'banner.view',
      },
      {
        title: 'Coupons',
        path: paths.dashboard.coupons,
        icon: ICONS.invoice,
        requiredPermission: 'coupon.view',
      },
      {
        title: 'Complaints',
        path: paths.dashboard.complaints,
        icon: ICONS.chat,
        requiredPermission: 'complaint.view',
      },
    ],
  },
];
