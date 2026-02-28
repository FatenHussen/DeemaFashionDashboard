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
        { title: t('statistics'), path: paths.dashboard.statistics, icon: ICONS.analytics, requiredPermission: 'stats.index' },
        { title: t('reports'), path: paths.dashboard.reports, icon: ICONS.invoice, requiredPermission: 'reports.view' },
      ],
    },
    /**
     * 2. Management
     */
    {
      subheader: (
        <span className="flex items-center gap-2">
          <Iconify icon="solar:widget-2-bold" width={16} height={16} />
          <span>{t('managementGroup')}</span>
        </span>
      ) as any,
      items: [
        { title: t('admin'), path: paths.dashboard.root, icon: ICONS.dashboard, info: <Label>v{CONFIG.appVersion}</Label>, requiredPermission: 'admin.view' },
        { title: t('vendor'), path: paths.dashboard.vendor, icon: ICONS.ecommerce, requiredPermission: 'vendor.view' },
        { title: t('shop'), path: paths.dashboard.shop, icon: ICONS.analytics, requiredPermission: 'shop.view' },
        { title: t('role'), path: paths.dashboard.role, icon: ICONS.lock, requiredPermission: 'role.view' },
        { title: t('driver'), path: paths.dashboard.driver, icon: ICONS.order, requiredPermission: 'driver.view' },
        { title: t('users'), path: paths.dashboard.users, icon: ICONS.label, requiredPermission: 'user.view' },
        { title: t('vendorUsers'), path: paths.dashboard.vendorUsers, icon: ICONS.job, requiredPermission: 'vendoruser.view' },
        { title: t('sellerRegistrations'), path: paths.dashboard.sellerRegistrations, icon: ICONS.file, requiredPermission: 'sellerregistration.view' },
      ],
    },
    /**
     * 3. Products (all product-related in one group)
     */
    {
      subheader: null,
      items: [
        {
          title: t('productsGroup'),
          path: paths.dashboard.products,
          icon: ICONS.product,
          requiredPermission: 'product.view',
          children: [
            { title: t('brands'), path: paths.dashboard.brands, icon: ICONS.ecommerce, requiredPermission: 'brand.view' },
            { title: t('categories'), path: paths.dashboard.categories, icon: ICONS.product, requiredPermission: 'category.view' },
            { title: t('categoryAttributes'), path: paths.dashboard.categoryAttributes, icon: ICONS.params, requiredPermission: 'categoryattribute.view' },
            { title: t('categoryDetails'), path: paths.dashboard.categoryDetails, icon: ICONS.menuItem, requiredPermission: 'categorydetail.view' },
          ],
        },
      ],
    },
    /**
     * 4. Locations
     */
    {
      subheader: null,
      items: [
        {
          title: t('locationsGroup'),
          path: paths.dashboard.locations,
          icon: ICONS.folder,
          requiredPermission: 'governorate.view',
          children: [
            { title: t('city'), path: paths.dashboard.city, icon: ICONS.tour, requiredPermission: 'city.view' },
            { title: t('area'), path: paths.dashboard.area, icon: ICONS.label, requiredPermission: 'area.view' },
          ],
        },
      ],
    },
    /**
     * 5. Services
     */
    {
      subheader: null,
      items: [
        { title: t('servicesGroup'), path: paths.dashboard.services, icon: ICONS.course, requiredPermission: 'service.view' },
      ],
    },
    /**
     * 6. Languages
     */
    {
      subheader: null,
      items: [
        {
          title: t('languagesGroup'),
          path: paths.dashboard.languages,
          icon: ICONS.label,
          requiredPermission: 'language.view',
          children: [
            { title: t('translationManager'), path: `${paths.dashboard.languages}/translations`, icon: ICONS.file, requiredPermission: 'language.view' },
          ],
        },
      ],
    },
    /**
     * 7. Content & Sections
     */
    {
      subheader: null,
      items: [
        {
          title: t('sectionsGroup'),
          path: paths.dashboard.sections,
          icon: ICONS.folder,
          requiredPermission: 'section.view',
          children: [
            { title: t('pageSections'), path: paths.dashboard.pageSections, icon: ICONS.menuItem, requiredPermission: 'pagesection.view' },
            { title: t('banners'), path: paths.dashboard.banners, icon: ICONS.ecommerce, requiredPermission: 'banner.view' },
            { title: t('coupons'), path: paths.dashboard.coupons, icon: ICONS.invoice, requiredPermission: 'coupon.view' },
            { title: t('complaints'), path: paths.dashboard.complaints, icon: ICONS.chat, requiredPermission: 'complaint.view' },
            { title: t('adminNotifications'), path: paths.dashboard.adminNotifications, icon: <Iconify icon="solar:bell-bold" width={22} height={22} />, requiredPermission: 'notification.view' },
          ],
        },
      ],
    },
    /**
     * 8. Commerce
     */
    {
      subheader: (
        <span className="flex items-center gap-2">
          <Iconify icon="solar:cart-large-2-bold" width={16} height={16} />
          <span>{t('commerceGroup')}</span>
        </span>
      ) as any,
      items: [
        { title: t('orders'), path: paths.dashboard.orders, icon: ICONS.order, requiredPermission: 'order.view' },
        { title: t('baskets'), path: paths.dashboard.baskets, icon: ICONS.ecommerce, requiredPermission: 'basket.view' },
        { title: t('scheduledBaskets'), path: paths.dashboard.scheduledBaskets, icon: ICONS.calendar, requiredPermission: 'scheduledbasket.view' },
        { title: t('packages'), path: paths.dashboard.packages, icon: ICONS.product, requiredPermission: 'package.view' },
        { title: t('subscriptions'), path: paths.dashboard.subscriptions, icon: ICONS.invoice, requiredPermission: 'subscription.view' },
        { title: t('vendorSubscriptions'), path: paths.dashboard.vendorSubscriptions, icon: ICONS.booking, requiredPermission: 'vendorsubscription.view' },
        { title: t('vendorPackages'), path: paths.dashboard.vendorPackages, icon: ICONS.product, requiredPermission: 'vendorpackage.view' },
        { title: t('recipes'), path: paths.dashboard.recipes, icon: ICONS.file, requiredPermission: 'recipe.view' },
      ],
    },
    /**
     * 9. Rewards
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
        { title: t('pointExchanges'), path: paths.dashboard.pointExchanges, icon: ICONS.banking, requiredPermission: 'pointexchange.view' },
        { title: t('userPoints'), path: paths.dashboard.userPoints, icon: ICONS.analytics, requiredPermission: 'pointwallet.view' },
      ],
    },
    /**
     * 10. Settings
     */
    {
      subheader: (
        <span className="flex items-center gap-2">
          <Iconify icon="solar:settings-minimalistic-bold" width={16} height={16} />
          <span>{t('settingsGroup')}</span>
        </span>
      ) as any,
      items: [
        { title: t('currencies'), path: paths.dashboard.currencies, icon: ICONS.banking, requiredPermission: 'currency.view' },
        { title: t('legalDocuments'), path: paths.dashboard.legalDocuments, icon: ICONS.lock, requiredPermission: 'legaldocument.view' },
        { title: t('faqs'), path: paths.dashboard.faqs, icon: ICONS.blog, requiredPermission: 'faq.view' },
      ],
    },
  ];
}
