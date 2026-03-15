import type { TFunction } from 'i18next';
import type { NavSectionProps } from 'src/shared/components/nav-section';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { Label } from 'src/shared/components/label';
import { Iconify } from 'src/shared/components/iconify';
import { SvgColor } from 'src/shared/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  params: icon('ic-params'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
};

// ----------------------------------------------------------------------

export function getNavData(t: TFunction<'nav'>): NavSectionProps['data'] {
  return [
    /**
     * 1. Statistics & Reports
     */
    {
      subheader: (
        <span className="flex items-center gap-2">
          <Iconify icon="solar:chart-2-bold" width={16} height={16} />
          <span>{t('statisticsReportsGroup')}</span>
        </span>
      ) as any,
      items: [
        { title: t('statistics'), path: paths.dashboard.statistics, icon: ICONS.analytics, requiredPermissionAny: ['stats.index', 'stats.view', 'statistics.view'] },
        { title: t('reports'), path: paths.dashboard.reports, icon: ICONS.invoice, requiredPermission: 'reports.view' },
      ],
    },
    /**
     * 2. Content Management - Categories & Products
     */
    {
      subheader: (
        <span className="flex items-center gap-2">
          <Iconify icon="solar:box-minimalistic-bold" width={16} height={16} />
          <span>{t('contentManagementGroup')}</span>
        </span>
      ) as any,
      items: [
        { title: t('categories'), path: paths.dashboard.categories, icon: ICONS.product, requiredPermission: 'category.view' },
        { title: t('categoryAttributes'), path: paths.dashboard.categoryAttributes, icon: ICONS.params, requiredPermission: 'categoryattribute.view' },
        { title: t('categoryDetails'), path: paths.dashboard.categoryDetails, icon: ICONS.menuItem, requiredPermission: 'categorydetail.view' },
        { title: t('brands'), path: paths.dashboard.brands, icon: ICONS.ecommerce, requiredPermission: 'brand.view' },
        { title: t('products'), path: paths.dashboard.products, icon: ICONS.product, requiredPermission: 'product.view' },
      ],
    },
    /**
     * 3. Content Management - Sections & Pages
     */
    {
      subheader: (
        <span className="flex items-center gap-2">
          <Iconify icon="solar:widget-add-bold" width={16} height={16} />
          <span>{t('sectionsPagesGroup')}</span>
        </span>
      ) as any,
      items: [
        { title: t('sections'), path: paths.dashboard.sections, icon: ICONS.menuItem, requiredPermission: 'section.view' },
        { title: t('pageSections'), path: paths.dashboard.pageSections, icon: ICONS.menuItem, requiredPermission: 'pagesection.view' },
        { title: t('banners'), path: paths.dashboard.banners, icon: ICONS.ecommerce, requiredPermission: 'banner.view' },
        { title: t('recipes'), path: paths.dashboard.recipes, icon: ICONS.file, requiredPermission: 'recipe.view' },
      ],
    },
    /**
     * 4. Content Management - Baskets & Schedules
     */
    {
      subheader: (
        <span className="flex items-center gap-2">
          <Iconify icon="solar:cart-large-2-bold" width={16} height={16} />
          <span>{t('basketsSchedulesGroup')}</span>
        </span>
      ) as any,
      items: [
        { title: t('baskets'), path: paths.dashboard.baskets, icon: ICONS.ecommerce, requiredPermission: 'basket.view' },
        { title: t('scheduledBaskets'), path: paths.dashboard.scheduledBaskets, icon: ICONS.calendar, requiredPermission: 'scheduledbasket.view' },
      ],
    },
    /**
     * 5. Locations
     */
    {
      subheader: (
        <span className="flex items-center gap-2">
          <Iconify icon="solar:map-point-bold" width={16} height={16} />
          <span>{t('locationsGroup')}</span>
        </span>
      ) as any,
      items: [
        { title: t('government'), path: paths.dashboard.locations, icon: ICONS.tour, requiredPermission: 'governorate.view' },
        { title: t('city'), path: paths.dashboard.city, icon: ICONS.tour, requiredPermission: 'city.view' },
        { title: t('area'), path: paths.dashboard.area, icon: ICONS.label, requiredPermission: 'area.view' },
      ],
    },
    /**
     * 6. Users & Vendors
     */
    {
      subheader: (
        <span className="flex items-center gap-2">
          <Iconify icon="solar:users-group-rounded-bold" width={16} height={16} />
          <span>{t('usersVendorsGroup')}</span>
        </span>
      ) as any,
      items: [
        { title: t('users'), path: paths.dashboard.users, icon: ICONS.label, requiredPermission: 'user.view' },
        { title: t('vendor'), path: paths.dashboard.vendor, icon: ICONS.ecommerce, requiredPermission: 'vendor.view' },
        { title: t('vendorUsers'), path: paths.dashboard.vendorUsers, icon: ICONS.job, requiredPermission: 'vendoruser.view' },
        { title: t('sellerRegistrations'), path: paths.dashboard.sellerRegistrations, icon: ICONS.file, requiredPermission: 'sellerregistration.view' },
        { title: t('shop'), path: paths.dashboard.shop, icon: ICONS.analytics, requiredPermission: 'shop.view' },
        { title: t('driver'), path: paths.dashboard.driver, icon: ICONS.order, requiredPermission: 'driver.view' },
      ],
    },
    /**
     * 7. Orders
     */
    {
      subheader: (
        <span className="flex items-center gap-2">
          <Iconify icon="solar:cart-2-bold" width={16} height={16} />
          <span>{t('ordersGroup')}</span>
        </span>
      ) as any,
      items: [
        { title: t('orders'), path: paths.dashboard.orders, icon: ICONS.order, requiredPermission: 'order.view' },
      ],
    },
    /**
     * 8. Packages & Subscriptions
     */
    {
      subheader: (
        <span className="flex items-center gap-2">
          <Iconify icon="solar:box-bold" width={16} height={16} />
          <span>{t('packagesSubscriptionsGroup')}</span>
        </span>
      ) as any,
      items: [
        { title: t('packages'), path: paths.dashboard.packages, icon: ICONS.product, requiredPermission: 'package.view' },
        { title: t('subscriptions'), path: paths.dashboard.subscriptions, icon: ICONS.invoice, requiredPermission: 'subscription.view' },
        { title: t('vendorPackages'), path: paths.dashboard.vendorPackages, icon: ICONS.product, requiredPermission: 'vendorpackage.view' },
        { title: t('vendorSubscriptions'), path: paths.dashboard.vendorSubscriptions, icon: ICONS.booking, requiredPermission: 'vendorsubscription.view' },
      ],
    },
    /**
     * 9. Rewards & Points
     */
    {
      subheader: (
        <span className="flex items-center gap-2">
          <Iconify icon="solar:gift-bold" width={16} height={16} />
          <span>{t('rewardsGroup')}</span>
        </span>
      ) as any,
      items: [
        { title: t('gifts'), path: paths.dashboard.gifts, icon: ICONS.ecommerce, requiredPermission: 'gift.view' },
        { title: t('userGifts'), path: paths.dashboard.userGifts, icon: ICONS.ecommerce, requiredPermission: 'gift.view' },
        { title: t('userPoints'), path: paths.dashboard.userPoints, icon: ICONS.analytics, requiredPermission: 'pointwallet.view' },
        { title: t('pointExchanges'), path: paths.dashboard.pointExchanges, icon: ICONS.banking, requiredPermission: 'pointexchange.view' },
      ],
    },
    /**
     * 10. Marketing & Promotions
     */
    {
      subheader: (
        <span className="flex items-center gap-2">
          <Iconify icon="solar:tag-bold" width={16} height={16} />
          <span>{t('marketingPromotionsGroup')}</span>
        </span>
      ) as any,
      items: [
        { title: t('coupons'), path: paths.dashboard.coupons, icon: ICONS.invoice, requiredPermission: 'coupon.view' },
        { title: t('services'), path: paths.dashboard.services, icon: ICONS.course, requiredPermission: 'service.view' },
      ],
    },
    /**
     * 11. Settings
     */
    {
      subheader: (
        <span className="flex items-center gap-2">
          <Iconify icon="solar:settings-minimalistic-bold" width={16} height={16} />
          <span>{t('settingsGroup')}</span>
        </span>
      ) as any,
      items: [
        { title: t('translationManager'), path: `${paths.dashboard.languages}/translations`, icon: ICONS.file, requiredPermission: 'language.view' },
        { title: t('currencies'), path: paths.dashboard.currencies, icon: ICONS.banking, requiredPermission: 'currency.view' },
        { title: t('legalDocuments'), path: paths.dashboard.legalDocuments, icon: ICONS.lock, requiredPermission: 'legaldocument.view' },
        { title: t('faqs'), path: paths.dashboard.faqs, icon: ICONS.blog, requiredPermission: 'faq.view' },
        { title: t('complaints'), path: paths.dashboard.complaints, icon: ICONS.chat, requiredPermission: 'complaint.view' },
        { title: t('adminNotifications'), path: paths.dashboard.adminNotifications, icon: <Iconify icon="solar:bell-bold" width={22} height={22} />, requiredPermission: 'notification.view' },
      ],
    },
    /**
     * 12. Administration
     */
    {
      subheader: (
        <span className="flex items-center gap-2">
          <Iconify icon="solar:shield-user-bold" width={16} height={16} />
          <span>{t('administrationGroup')}</span>
        </span>
      ) as any,
      items: [
        { title: t('admin'), path: paths.dashboard.root, icon: ICONS.dashboard, info: <Label>v{CONFIG.appVersion}</Label>, requiredPermission: 'admin.view' },
        { title: t('role'), path: paths.dashboard.role, icon: ICONS.lock, requiredPermission: 'role.view' },
      ],
    },
  ];
}
