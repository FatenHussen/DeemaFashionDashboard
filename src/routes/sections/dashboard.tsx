import type { RouteObject } from 'react-router';

import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { RequirePermission } from '@/auth/components/require-permission';
import { FLASH_SALE_PERMISSION } from '@/pages/dashboard/flash-sales/permissions';
import {
  NAV_MENU_ITEM_VIEW_ANY,
  NAV_MENU_ITEM_CREATE_ANY,
  NAV_MENU_ITEM_UPDATE_ANY,
} from '@/pages/dashboard/nav-menu-items/permissions';
import {
  CONTACT_METHOD_VIEW_ANY,
  CONTACT_METHOD_UPDATE_ANY,
  CONTACT_METHOD_CREATE_ANY,
} from '@/pages/dashboard/contact-methods/permissions';

import { lazyWithRetry } from 'src/utils/lazy-with-retry';

import { CONFIG } from 'src/global-config';
import { AuthGuard } from 'src/pages/auth/guard';
import { DashboardLayout } from 'src/layouts/dashboard';
import { LoadingScreen } from 'src/shared/components/loading-screen';

import { usePathname } from '../hooks';

// ----------------------------------------------------------------------

const IndexPage = lazyWithRetry(() => import('@/pages/dashboard/admin/view/Index'));
const CreatePage = lazyWithRetry(() => import('@/pages/dashboard/admin/view/Create'));
const AdminDetailsPage = lazyWithRetry(() => import('@/pages/dashboard/admin/view/Details'));

const VendorIndexPage = lazyWithRetry(() => import('@/pages/dashboard/vendor/view/vendor/Index'));
const VendorCreatePage = lazyWithRetry(() => import('@/pages/dashboard/vendor/view/vendor/Create'));

const ShopIndexPage = lazyWithRetry(() => import('@/pages/dashboard/vendor/view/shop/Index'));
const ShopCreatePage = lazyWithRetry(() => import('@/pages/dashboard/vendor/view/shop/Create'));
const ShopDetailsPage = lazyWithRetry(() => import('@/pages/dashboard/vendor/view/shop/Details'));
const ServiceProviderIndexPage = lazyWithRetry(
  () => import('@/pages/dashboard/vendor/view/service-provider/Index')
);
const ServiceProviderDetailsPage = lazyWithRetry(
  () => import('@/pages/dashboard/vendor/view/service-provider/Details')
);

const ProfilePage = lazyWithRetry(() => import('@/pages/dashboard/profile/view/Profile'));

const RoleIndexPage = lazyWithRetry(() => import('@/pages/dashboard/roles/view/Index'));
const RoleCreatePage = lazyWithRetry(() => import('@/pages/dashboard/roles/view/Create'));
const RoleDetailsPage = lazyWithRetry(() => import('@/pages/dashboard/roles/view/Details'));

const DriverIndexPage = lazyWithRetry(() => import('@/pages/dashboard/driver/view/Index'));
const DriverCreatePage = lazyWithRetry(() => import('@/pages/dashboard/driver/view/Create'));
const DriverDetailsPage = lazyWithRetry(() => import('@/pages/dashboard/driver/view/Details'));

const BrandIndexPage = lazyWithRetry(() => import('@/pages/dashboard/products/view/brand/Index'));
const BrandCreatePage = lazyWithRetry(() => import('@/pages/dashboard/products/view/brand/Create'));
const BrandDetailsPage = lazyWithRetry(() => import('@/pages/dashboard/products/view/brand/Details'));

const UnitIndexPage = lazyWithRetry(() => import('@/pages/dashboard/units/view/Index'));
const UnitCreatePage = lazyWithRetry(() => import('@/pages/dashboard/units/view/Create'));

const ProductIndexPage = lazyWithRetry(() => import('@/pages/dashboard/products/view/product/Index'));
const ProductCreatePage = lazyWithRetry(() => import('@/pages/dashboard/products/view/product/Create'));
const ProductDetailsPage = lazyWithRetry(() => import('@/pages/dashboard/products/view/product/Details'));

const GovernorateIndexPage = lazyWithRetry(() => import('@/pages/dashboard/locations/view/Index'));
const GovernorateCreatePage = lazyWithRetry(() => import('@/pages/dashboard/locations/view/Create'));

const CityIndexPage = lazyWithRetry(() => import('@/pages/dashboard/locations/view/city/Index'));
const CityCreatePage = lazyWithRetry(() => import('@/pages/dashboard/locations/view/city/Create'));

const AreaIndexPage = lazyWithRetry(() => import('@/pages/dashboard/locations/view/area/Index'));
const AreaCreatePage = lazyWithRetry(() => import('@/pages/dashboard/locations/view/area/Create'));
const AreaDetailsPage = lazyWithRetry(() => import('@/pages/dashboard/locations/view/area/Details'));

const CategoryIndexPage = lazyWithRetry(() => import('@/pages/dashboard/categories/view/Index'));
const CategorySubcategoriesPage = lazyWithRetry(() => import('@/pages/dashboard/categories/view/Subcategories'));
const CategoryCreatePage = lazyWithRetry(() => import('@/pages/dashboard/categories/view/Create'));

const CategoryAttributeIndexPage = lazyWithRetry(
  () => import('@/pages/dashboard/categories/view/attributes/Index')
);
const CategoryAttributeCreatePage = lazyWithRetry(
  () => import('@/pages/dashboard/categories/view/attributes/Create')
);

const CategoryDetailIndexPage = lazyWithRetry(
  () => import('@/pages/dashboard/categories/view/details/Index')
);
const CategoryDetailCreatePage = lazyWithRetry(
  () => import('@/pages/dashboard/categories/view/details/Create')
);

const ProductExtraDetailIndexPage = lazyWithRetry(
  () => import('@/pages/dashboard/categories/view/extra-details/Index')
);
const ProductExtraDetailCreatePage = lazyWithRetry(
  () => import('@/pages/dashboard/categories/view/extra-details/Create')
);

const ServiceIndexPage = lazyWithRetry(() => import('@/pages/dashboard/vendor/view/service/Index'));
const ServiceCreatePage = lazyWithRetry(() => import('@/pages/dashboard/vendor/view/service/Create'));

// const LanguageIndexPage = lazyWithRetry(() => import('@/pages/dashboard/languages/view/Index'));
// const LanguageCreatePage = lazyWithRetry(() => import('@/pages/dashboard/languages/view/Create'));
// const TranslationManagerPage = lazyWithRetry(
//   () => import('@/pages/dashboard/languages/view/TranslationManager')
// );

const SectionIndexPage = lazyWithRetry(() => import('@/pages/dashboard/sections/view/Index'));
const SectionCreatePage = lazyWithRetry(() => import('@/pages/dashboard/sections/view/Create'));
const SectionDetailsPage = lazyWithRetry(() => import('@/pages/dashboard/sections/view/Details'));

const PageSectionEditPage = lazyWithRetry(
  () => import('@/pages/dashboard/sections/view/PageSectionEdit')
);

const PagesIndexPage = lazyWithRetry(() => import('@/pages/dashboard/sections/view/Pages'));
const PageDetailsPage = lazyWithRetry(() => import('@/pages/dashboard/sections/view/PageDetails'));
const PageCreatePage = lazyWithRetry(() => import('@/pages/dashboard/sections/view/PageCreate'));
const PageAddSectionPage = lazyWithRetry(
  () => import('@/pages/dashboard/sections/view/PageAddSection')
);

const BannerIndexPage = lazyWithRetry(() => import('@/pages/dashboard/banners/view/Index'));
const BannerCreatePage = lazyWithRetry(() => import('@/pages/dashboard/banners/view/Create'));

const CouponIndexPage = lazyWithRetry(() => import('@/pages/dashboard/coupons/view/Index'));
const CouponCreatePage = lazyWithRetry(() => import('@/pages/dashboard/coupons/view/Create'));
const CouponDetailsPage = lazyWithRetry(() => import('@/pages/dashboard/coupons/view/Details'));

const ComplaintIndexPage = lazyWithRetry(() => import('@/pages/dashboard/complaints/view/Index'));
const ComplaintDetailsPage = lazyWithRetry(() => import('@/pages/dashboard/complaints/view/Details'));

const UserIndexPage = lazyWithRetry(() => import('@/pages/dashboard/users/view/Index'));
const UserCreatePage = lazyWithRetry(() => import('@/pages/dashboard/users/view/Create'));
const UserUpdatePage = lazyWithRetry(() => import('@/pages/dashboard/users/view/Update'));
const UserDetailsPage = lazyWithRetry(() => import('@/pages/dashboard/users/view/Details'));

const AffiliateIndexPage = lazyWithRetry(() => import('@/pages/dashboard/affiliates/view/Index'));

// Orders
const OrderIndexPage = lazyWithRetry(() => import('@/pages/dashboard/orders/view/Index'));
const OrderDetailsPage = lazyWithRetry(() => import('@/pages/dashboard/orders/view/Details'));

// Custom order requests
const CustomOrderRequestIndexPage = lazyWithRetry(
  () => import('@/pages/dashboard/custom-order-requests/view/Index')
);
const CustomOrderRequestDetailsPage = lazyWithRetry(
  () => import('@/pages/dashboard/custom-order-requests/view/Details')
);

// Baskets
const BasketIndexPage = lazyWithRetry(() => import('@/pages/dashboard/baskets/view/basket/Index'));
const BasketCreatePage = lazyWithRetry(() => import('@/pages/dashboard/baskets/view/basket/Create'));
const BasketDetailsPage = lazyWithRetry(() => import('@/pages/dashboard/baskets/view/basket/Details'));

// Scheduled Baskets
const ScheduledBasketIndexPage = lazyWithRetry(
  () => import('@/pages/dashboard/baskets/view/scheduled/Index')
);
const ScheduledBasketCreatePage = lazyWithRetry(
  () => import('@/pages/dashboard/baskets/view/scheduled/Create')
);
const ScheduledBasketDetailsPage = lazyWithRetry(
  () => import('@/pages/dashboard/baskets/view/scheduled/Details')
);

// Packages
const PackageIndexPage = lazyWithRetry(() => import('@/pages/dashboard/packages/view/Index'));
const PackageCreatePage = lazyWithRetry(() => import('@/pages/dashboard/packages/view/Create'));
const PackageDetailsPage = lazyWithRetry(() => import('@/pages/dashboard/packages/view/Details'));

// Subscriptions (read-only: list + details)
const SubscriptionIndexPage = lazyWithRetry(() => import('@/pages/dashboard/subscriptions/view/Index'));
const SubscriptionDetailsPage = lazyWithRetry(() => import('@/pages/dashboard/subscriptions/view/Details'));

// Gifts
const GiftIndexPage = lazyWithRetry(() => import('@/pages/dashboard/gifts/view/Index'));
const GiftCreatePage = lazyWithRetry(() => import('@/pages/dashboard/gifts/view/Create'));
const GiftDetailsPage = lazyWithRetry(() => import('@/pages/dashboard/gifts/view/Details'));

// User Gifts
const UserGiftIndexPage = lazyWithRetry(() => import('@/pages/dashboard/user-gifts/view/Index'));
const UserGiftCreatePage = lazyWithRetry(() => import('@/pages/dashboard/user-gifts/view/Create'));
const UserGiftDetailsPage = lazyWithRetry(() => import('@/pages/dashboard/user-gifts/view/Details'));

// Point Exchanges
const PointExchangeIndexPage = lazyWithRetry(() => import('@/pages/dashboard/point-exchanges/view/Index'));
const PointExchangeDetailsPage = lazyWithRetry(
  () => import('@/pages/dashboard/point-exchanges/view/Details')
);

// User Points
const UserPointsIndexPage = lazyWithRetry(() => import('@/pages/dashboard/user-points/view/Index'));
const UserPointsDetailsPage = lazyWithRetry(() => import('@/pages/dashboard/user-points/view/Details'));

// Currencies
const CurrencyIndexPage = lazyWithRetry(() => import('@/pages/dashboard/currencies/view/Index'));
const CurrencyCreatePage = lazyWithRetry(() => import('@/pages/dashboard/currencies/view/Create'));
const CurrencyDetailsPage = lazyWithRetry(() => import('@/pages/dashboard/currencies/view/Details'));

const DeliveryDistanceRangeIndexPage = lazyWithRetry(
  () => import('@/pages/dashboard/delivery-distance-ranges/view/Index')
);
const DeliveryDistanceRangeCreatePage = lazyWithRetry(
  () => import('@/pages/dashboard/delivery-distance-ranges/view/Create')
);
const DeliveryDistanceRangeDetailsPage = lazyWithRetry(
  () => import('@/pages/dashboard/delivery-distance-ranges/view/Details')
);

// Recipes
const RecipeIndexPage = lazyWithRetry(() => import('@/pages/dashboard/recipes/view/Index'));
const RecipeCreatePage = lazyWithRetry(() => import('@/pages/dashboard/recipes/view/Create'));
const RecipeDetailsPage = lazyWithRetry(() => import('@/pages/dashboard/recipes/view/Details'));

// Legal Documents
const LegalDocumentIndexPage = lazyWithRetry(() => import('@/pages/dashboard/content/view/legal-document/Index'));
const LegalDocumentCreatePage = lazyWithRetry(() => import('@/pages/dashboard/content/view/legal-document/Create'));
const LegalDocumentEditPage = lazyWithRetry(() => import('@/pages/dashboard/content/view/legal-document/Edit'));

// FAQs
const FaqIndexPage = lazyWithRetry(() => import('@/pages/dashboard/content/view/faq/Index'));
const FaqCreatePage = lazyWithRetry(() => import('@/pages/dashboard/content/view/faq/Create'));

const ContactMethodIndexPage = lazyWithRetry(() => import('@/pages/dashboard/contact-methods/view/Index'));
const ContactMethodCreatePage = lazyWithRetry(() => import('@/pages/dashboard/contact-methods/view/Create'));

// Vendor Subscriptions
const VendorSubscriptionIndexPage = lazyWithRetry(
  () => import('@/pages/dashboard/vendor/view/subscription/Index')
);
const VendorSubscriptionDetailsPage = lazyWithRetry(
  () => import('@/pages/dashboard/vendor/view/subscription/Details')
);
const VendorSubscriptionCreatePage = lazyWithRetry(
  () => import('@/pages/dashboard/vendor/view/subscription/Create')
);

// Admin Notifications
const AdminNotificationIndexPage = lazyWithRetry(
  () => import('@/pages/dashboard/admin-notifications/view/Index')
);
const AdminNotificationCreatePage = lazyWithRetry(
  () => import('@/pages/dashboard/admin-notifications/view/Create')
);

// Vendor Packages
const VendorPackageIndexPage = lazyWithRetry(
  () => import('@/pages/dashboard/vendor/view/package/Index')
);
const VendorPackageCreatePage = lazyWithRetry(
  () => import('@/pages/dashboard/vendor/view/package/Create')
);
const VendorPackageDetailsPage = lazyWithRetry(
  () => import('@/pages/dashboard/vendor/view/package/Details')
);

// Vendor Users
const VendorUserIndexPage = lazyWithRetry(
  () => import('@/pages/dashboard/vendor/view/vendor-user/Index')
);
const VendorUserCreatePage = lazyWithRetry(
  () => import('@/pages/dashboard/vendor/view/vendor-user/Create')
);
const VendorUserDetailsPage = lazyWithRetry(
  () => import('@/pages/dashboard/vendor/view/vendor-user/Details')
);

// Seller Registrations
const SellerRegistrationIndexPage = lazyWithRetry(
  () => import('@/pages/dashboard/vendor/view/seller-registration/Index')
);
const SellerRegistrationDetailsPage = lazyWithRetry(
  () => import('@/pages/dashboard/vendor/view/seller-registration/Details')
);

// Statistics
const StatisticsPage = lazyWithRetry(() => import('@/pages/dashboard/statistics/view/Index'));

// Reports
const ReportsIndexPage = lazyWithRetry(() => import('@/pages/dashboard/reports/view/Index'));
const SalesReportPage = lazyWithRetry(() => import('@/pages/dashboard/reports/view/SalesReport'));
const ProductMovementReportPage = lazyWithRetry(
  () => import('@/pages/dashboard/reports/view/ProductMovementReport')
);
const VendorPerformanceReportPage = lazyWithRetry(
  () => import('@/pages/dashboard/reports/view/VendorPerformanceReport')
);
const DriverPerformanceReportPage = lazyWithRetry(
  () => import('@/pages/dashboard/reports/view/DriverPerformanceReport')
);
const SalesByLocationReportPage = lazyWithRetry(
  () => import('@/pages/dashboard/reports/view/SalesByLocationReport')
);
const SalesByCategoryReportPage = lazyWithRetry(
  () => import('@/pages/dashboard/reports/view/SalesByCategoryReport')
);

// Settings
const SettingsIndexPage = lazyWithRetry(() => import('@/pages/dashboard/settings/view/Index'));

// Badges
const BadgeIndexPage = lazyWithRetry(() => import('@/pages/dashboard/badges/view/Index'));
const BadgeCreatePage = lazyWithRetry(() => import('@/pages/dashboard/badges/view/Create'));

// Activity Logs
const ActivityLogIndexPage = lazyWithRetry(() => import('@/pages/dashboard/activity-logs/view/Index'));

// Affiliate Withdraw Requests
const AffiliateWithdrawIndexPage = lazyWithRetry(
  () => import('@/pages/dashboard/affiliate-withdraw-requests/view/Index')
);
const AffiliateWithdrawDetailsPage = lazyWithRetry(
  () => import('@/pages/dashboard/affiliate-withdraw-requests/view/Details')
);

// Affiliate wallet transactions (read-only ledger)
const AffiliateWalletTransactionIndexPage = lazyWithRetry(
  () => import('@/pages/dashboard/affiliate-wallet-transactions/view/Index')
);
const AffiliateWalletTransactionDetailsPage = lazyWithRetry(
  () => import('@/pages/dashboard/affiliate-wallet-transactions/view/Details')
);

// Driver wallet transactions (read-only ledger)
const DriverWalletTransactionIndexPage = lazyWithRetry(
  () => import('@/pages/dashboard/driver-wallet-transactions/view/Index')
);
const DriverWalletTransactionDetailsPage = lazyWithRetry(
  () => import('@/pages/dashboard/driver-wallet-transactions/view/Details')
);
const DriverOrdersPage = lazyWithRetry(
  () => import('@/pages/dashboard/driver-wallet-transactions/view/DriverOrders')
);

// Icons
const IconIndexPage = lazyWithRetry(() => import('@/pages/dashboard/icons/view/Index'));
const IconCreatePage = lazyWithRetry(() => import('@/pages/dashboard/icons/view/Create'));

// Colors
const ColorIndexPage = lazyWithRetry(() => import('@/pages/dashboard/colors/view/Index'));
const ColorCreatePage = lazyWithRetry(() => import('@/pages/dashboard/colors/view/Create'));

// Promotions
const PromotionIndexPage = lazyWithRetry(() => import('@/pages/dashboard/promotions/view/Index'));
const PromotionCreatePage = lazyWithRetry(() => import('@/pages/dashboard/promotions/view/Create'));
const PromotionDetailsPage = lazyWithRetry(() => import('@/pages/dashboard/promotions/view/Details'));

// Countries
const CountryIndexPage = lazyWithRetry(() => import('@/pages/dashboard/countries/view/Index'));
const CountryCreatePage = lazyWithRetry(() => import('@/pages/dashboard/countries/view/Create'));

// Sale countries (markets)
const SaleCountryIndexPage = lazyWithRetry(() => import('@/pages/dashboard/sale-countries/view/Index'));
const SaleCountryCreatePage = lazyWithRetry(() => import('@/pages/dashboard/sale-countries/view/Create'));

// Promotion Requests
const PromotionRequestIndexPage = lazyWithRetry(() => import('@/pages/dashboard/promotion-requests/view/Index'));
const PromotionRequestDetailsPage = lazyWithRetry(() => import('@/pages/dashboard/promotion-requests/view/Details'));

// Point Rules
const PointRuleIndexPage = lazyWithRetry(() => import('@/pages/dashboard/point-rules/view/Index'));
const PointRuleDetailsPage = lazyWithRetry(() => import('@/pages/dashboard/point-rules/view/Details'));
const PointRuleCreatePage = lazyWithRetry(() => import('@/pages/dashboard/point-rules/view/Create'));

// Schedules
const ScheduleIndexPage = lazyWithRetry(() => import('@/pages/dashboard/schedules/view/Index'));
const ScheduleCreatePage = lazyWithRetry(() => import('@/pages/dashboard/schedules/view/Create'));

// User Basket Schedules
const UserBasketScheduleIndexPage = lazyWithRetry(() => import('@/pages/dashboard/user-basket-schedules/view/Index'));
const UserBasketScheduleDetailsPage = lazyWithRetry(
  () => import('@/pages/dashboard/user-basket-schedules/view/Details')
);

// Vendor Service Types
const VendorServiceTypeIndexPage = lazyWithRetry(
  () => import('@/pages/dashboard/vendor-service-types/view/Index')
);
const VendorServiceTypeCreatePage = lazyWithRetry(
  () => import('@/pages/dashboard/vendor-service-types/view/Create')
);

// Vendor Services
const VendorServiceIndexPage = lazyWithRetry(
  () => import('@/pages/dashboard/vendor-services/view/Index')
);
const VendorServiceCreatePage = lazyWithRetry(
  () => import('@/pages/dashboard/vendor-services/view/Create')
);

// Shop Vendor Services
const ShopVendorServiceIndexPage = lazyWithRetry(
  () => import('@/pages/dashboard/shop-vendor-services/view/Index')
);
const ShopVendorServiceCreatePage = lazyWithRetry(
  () => import('@/pages/dashboard/shop-vendor-services/view/Create')
);

// Service Orders
const ServiceOrderIndexPage = lazyWithRetry(
  () => import('@/pages/dashboard/service-orders/view/Index')
);

// Quick Actions
const QuickActionIndexPage = lazyWithRetry(() => import('@/pages/dashboard/quick-actions/view/Index'));
const QuickActionCreatePage = lazyWithRetry(() => import('@/pages/dashboard/quick-actions/view/Create'));

// Navigation menu items (storefront top bar)
const NavMenuItemIndexPage = lazyWithRetry(() => import('@/pages/dashboard/nav-menu-items/view/Index'));
const NavMenuItemCreatePage = lazyWithRetry(() => import('@/pages/dashboard/nav-menu-items/view/Create'));

// Popup Campaigns
const PopupCampaignIndexPage = lazyWithRetry(() => import('@/pages/dashboard/popup-campaigns/view/Index'));
const PopupCampaignCreatePage = lazyWithRetry(() => import('@/pages/dashboard/popup-campaigns/view/Create'));

const FlashSaleIndexPage = lazyWithRetry(() => import('@/pages/dashboard/flash-sales/view/Index'));
const FlashSaleCreatePage = lazyWithRetry(() => import('@/pages/dashboard/flash-sales/view/Create'));

// Inventory
const InventoryIndexPage = lazyWithRetry(() => import('@/pages/dashboard/inventory/view/Index'));

// Vendor Accounting
const VendorAccountingIndexPage = lazyWithRetry(
  () => import('@/pages/dashboard/vendor-accounting/view/Index')
);
const VendorStatementPage = lazyWithRetry(
  () => import('@/pages/dashboard/vendor-accounting/view/VendorStatement')
);
const VendorWithdrawRequestsPage = lazyWithRetry(
  () => import('@/pages/dashboard/vendor-withdraw-requests/view/Index')
);

const Page403 = lazyWithRetry(() => import('src/pages/error/403'));

// ----------------------------------------------------------------------

function SuspenseOutlet() {
  const pathname = usePathname();
  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

const dashboardLayout = () => (
  <DashboardLayout>
    <SuspenseOutlet />
  </DashboardLayout>
);

export const dashboardRoutes: RouteObject[] = [
  {
    path: 'admin',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="admin.view">
            <IndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="admin.create">
            <CreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="admin.view">
            <AdminDetailsPage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="admin.update">
            <CreatePage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'vendor',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="vendor.view">
            <VendorIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="vendor.create">
            <VendorCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="vendor.update">
            <VendorCreatePage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'shop',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="shop.view">
            <ShopIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="shop.create">
            <ShopCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="shop.update">
            <ShopCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="shop.view">
            <ShopDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'restaurants',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="shop.view">
            <ShopIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="shop.create">
            <ShopCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="shop.update">
            <ShopCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="shop.view">
            <ShopDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'service-providers',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="shop.view">
            <ServiceProviderIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="shop.create">
            <ShopCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="shop.update">
            <ShopCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="shop.view">
            <ServiceProviderDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'profile',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <ProfilePage />, index: true }],
  },
  {
    path: 'role',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="role.view">
            <RoleIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="role.create">
            <RoleCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="role.update">
            <RoleCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="role.view">
            <RoleDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'driver',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="driver.view">
            <DriverIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="driver.create">
            <DriverCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="driver.update">
            <DriverCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="driver.view">
            <DriverDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'products',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="product.view">
            <ProductIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="product.create">
            <ProductCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="product.update">
            <ProductCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="product.view">
            <ProductDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'products/brands',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="brand.view">
            <BrandIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="brand.create">
            <BrandCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="brand.update">
            <BrandCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="brand.view">
            <BrandDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'products/units',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="unit.view">
            <UnitIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="unit.create">
            <UnitCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="unit.update">
            <UnitCreatePage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'locations',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="governorate.view">
            <GovernorateIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="governorate.create">
            <GovernorateCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="governorate.update">
            <GovernorateCreatePage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'locations/city',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="city.view">
            <CityIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="city.create">
            <CityCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="city.update">
            <CityCreatePage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'locations/area',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="area.view">
            <AreaIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="area.create">
            <AreaCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="area.update">
            <AreaCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="area.view">
            <AreaDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'categories',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="category.view">
            <CategoryIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="category.create">
            <CategoryCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="category.update">
            <CategoryCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'subcategories',
        element: (
          <RequirePermission permission="category.view">
            <CategorySubcategoriesPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'categories/attributes',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="categoryattribute.view">
            <CategoryAttributeIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="categoryattribute.create">
            <CategoryAttributeCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="categoryattribute.update">
            <CategoryAttributeCreatePage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'categories/details',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="categorydetail.view">
            <CategoryDetailIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="categorydetail.create">
            <CategoryDetailCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="categorydetail.update">
            <CategoryDetailCreatePage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'categories/extra-details',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission
            permissionAny={['productextradetail.view', 'categorydetail.view']}
          >
            <ProductExtraDetailIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission
            permissionAny={['productextradetail.create', 'categorydetail.create']}
          >
            <ProductExtraDetailCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission
            permissionAny={['productextradetail.update', 'categorydetail.update']}
          >
            <ProductExtraDetailCreatePage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'services',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="service.view">
            <ServiceIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="service.create">
            <ServiceCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="service.update">
            <ServiceCreatePage />
          </RequirePermission>
        ),
      },
    ],
  },
  // {
  //   path: 'languages',
  //   element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
  //   children: [
  //     {
  //       element: (
  //         <RequirePermission permission="language.view">
  //           <LanguageIndexPage />
  //         </RequirePermission>
  //       ),
  //       index: true,
  //     },
  //     {
  //       path: 'create',
  //       element: (
  //         <RequirePermission permission="language.create">
  //           <LanguageCreatePage />
  //         </RequirePermission>
  //       ),
  //     },
  //     {
  //       path: 'update/:id',
  //       element: (
  //         <RequirePermission permission="language.update">
  //           <LanguageCreatePage />
  //         </RequirePermission>
  //       ),
  //     },
  //     {
  //       path: 'translations',
  //       element: (
  //         <RequirePermission permission="language.view">
  //           <TranslationManagerPage />
  //         </RequirePermission>
  //       ),
  //     },
  //   ],
  // },
  {
    path: 'sections',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="section.view">
            <SectionIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="section.create">
            <SectionCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="section.update">
            <SectionCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="section.view">
            <SectionDetailsPage />
          </RequirePermission>
        ),
      },
      {
        path: 'pages',
        element: (
          <RequirePermission permissionAny={['page.view', 'pagesection.view']}>
            <PagesIndexPage />
          </RequirePermission>
        ),
      },
      {
        path: 'pages/create',
        element: (
          <RequirePermission permission="page.create">
            <PageCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'pages/update/:id',
        element: (
          <RequirePermission permission="page.update">
            <PageCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'pages/details/:id',
        element: (
          <RequirePermission permissionAny={['page.view', 'pagesection.view']}>
            <PageDetailsPage />
          </RequirePermission>
        ),
      },
      {
        path: 'pages/:pageId/sections/create',
        element: (
          <RequirePermission permission="pagesection.create">
            <PageAddSectionPage />
          </RequirePermission>
        ),
      },
      {
        path: 'pages/:pageId/sections/update/:id',
        element: (
          <RequirePermission permission="pagesection.update">
            <PageSectionEditPage />
          </RequirePermission>
        ),
      },
      {
        path: 'nav-menu-items',
        element: (
          <RequirePermission permissionAny={[...NAV_MENU_ITEM_VIEW_ANY]}>
            <NavMenuItemIndexPage />
          </RequirePermission>
        ),
      },
      {
        path: 'nav-menu-items/create',
        element: (
          <RequirePermission permissionAny={[...NAV_MENU_ITEM_CREATE_ANY]}>
            <NavMenuItemCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'nav-menu-items/update/:id',
        element: (
          <RequirePermission permissionAny={[...NAV_MENU_ITEM_UPDATE_ANY]}>
            <NavMenuItemCreatePage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'sections/banners',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="banner.view">
            <BannerIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="banner.create">
            <BannerCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="banner.update">
            <BannerCreatePage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'users',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="user.view">
            <UserIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="user.create">
            <UserCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="user.update">
            <UserUpdatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="user.view">
            <UserDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'affiliates',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="user.view">
            <AffiliateIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
    ],
  },
  {
    path: 'complaints',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="complaint.view">
            <ComplaintIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="complaint.view">
            <ComplaintDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'coupons',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="coupon.view">
            <CouponIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="coupon.create">
            <CouponCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="coupon.update">
            <CouponCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="coupon.view">
            <CouponDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'orders',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="order.view">
            <OrderIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="order.view">
            <OrderDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'custom-order-requests',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission
            permissionAny={[
              'customorderrequest.view',
              'custom_order_request.view',
              'order.view',
            ]}
          >
            <CustomOrderRequestIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission
            permissionAny={[
              'customorderrequest.view',
              'custom_order_request.view',
              'order.view',
            ]}
          >
            <CustomOrderRequestDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'baskets',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="basket.view">
            <BasketIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="basket.create">
            <BasketCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="basket.update">
            <BasketCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="basket.view">
            <BasketDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'scheduled-baskets',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="schedulebasket.view">
            <ScheduledBasketIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="schedulebasket.create">
            <ScheduledBasketCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="schedulebasket.update">
            <ScheduledBasketCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="schedulebasket.view">
            <ScheduledBasketDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'packages',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="package.view">
            <PackageIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="package.create">
            <PackageCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="package.update">
            <PackageCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="package.view">
            <PackageDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'subscriptions',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="subscription.view">
            <SubscriptionIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="subscription.view">
            <SubscriptionDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'gifts',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="gift.view">
            <GiftIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="gift.create">
            <GiftCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="gift.update">
            <GiftCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="gift.view">
            <GiftDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'user-gifts',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="gift.view">
            <UserGiftIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="gift.create">
            <UserGiftCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="gift.view">
            <UserGiftDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'point-exchanges',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="pointexchange.view">
            <PointExchangeIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="pointexchange.view">
            <PointExchangeDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'user-points',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="pointwallet.view">
            <UserPointsIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="pointwallet.view">
            <UserPointsDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'currencies',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="currency.view">
            <CurrencyIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="currency.create">
            <CurrencyCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="currency.update">
            <CurrencyCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="currency.view">
            <CurrencyDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'delivery-distance-ranges',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="deliverydistancerange.view">
            <DeliveryDistanceRangeIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="deliverydistancerange.create">
            <DeliveryDistanceRangeCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="deliverydistancerange.update">
            <DeliveryDistanceRangeCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="deliverydistancerange.view">
            <DeliveryDistanceRangeDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'recipes',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="recipe.view">
            <RecipeIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="recipe.create">
            <RecipeCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="recipe.update">
            <RecipeCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="recipe.view">
            <RecipeDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'legal-documents',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="legaldocument.view">
            <LegalDocumentIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="legaldocument.create">
            <LegalDocumentCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="legaldocument.update">
            <LegalDocumentEditPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'faqs',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="faq.view">
            <FaqIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="faq.create">
            <FaqCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="faq.update">
            <FaqCreatePage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'contact-methods',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permissionAny={[...CONTACT_METHOD_VIEW_ANY]}>
            <ContactMethodIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permissionAny={[...CONTACT_METHOD_CREATE_ANY]}>
            <ContactMethodCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permissionAny={[...CONTACT_METHOD_UPDATE_ANY]}>
            <ContactMethodCreatePage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'admin-notifications',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="notification.view">
            <AdminNotificationIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="notification.create">
            <AdminNotificationCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="notification.create">
            <AdminNotificationCreatePage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'vendor-subscriptions',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="vendorsubscription.view">
            <VendorSubscriptionIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="vendorsubscription.create">
            <VendorSubscriptionCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: ':id',
        element: (
          <RequirePermission permission="vendorsubscription.view">
            <VendorSubscriptionDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'vendor-packages',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="vendorpackage.view">
            <VendorPackageIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="vendorpackage.create">
            <VendorPackageCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="vendorpackage.update">
            <VendorPackageCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="vendorpackage.view">
            <VendorPackageDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'vendor-users',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="vendoruser.view">
            <VendorUserIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="vendoruser.create">
            <VendorUserCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="vendoruser.update">
            <VendorUserCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="vendoruser.view">
            <VendorUserDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'seller-registrations',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="sellerregistration.view">
            <SellerRegistrationIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: ':id',
        element: (
          <RequirePermission permission="sellerregistration.view">
            <SellerRegistrationDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'statistics',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permissionAny={['stats.index', 'stats.view', 'statistics.view']}>
            <StatisticsPage />
          </RequirePermission>
        ),
        index: true,
      },
    ],
  },
  {
    path: 'reports',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      { element: <ReportsIndexPage />, index: true },
      { path: 'sales', element: <SalesReportPage /> },
      { path: 'product-movement', element: <ProductMovementReportPage /> },
      { path: 'vendor-performance', element: <VendorPerformanceReportPage /> },
      { path: 'driver-performance', element: <DriverPerformanceReportPage /> },
      { path: 'sales-by-location', element: <SalesByLocationReportPage /> },
      { path: 'sales-by-category', element: <SalesByCategoryReportPage /> },
    ],
  },
  // Settings
  {
    path: 'settings',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="setting.view">
            <SettingsIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
    ],
  },
  // Badges
  {
    path: 'badges',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="badge.view">
            <BadgeIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="badge.create">
            <BadgeCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="badge.update">
            <BadgeCreatePage />
          </RequirePermission>
        ),
      },
    ],
  },
  // Activity Logs
  {
    path: 'activity-logs',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="activitylog.view">
            <ActivityLogIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
    ],
  },
  // Affiliate Withdraw Requests
  {
    path: 'affiliate-withdraw-requests',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="affiliatewithdrawrequest.view">
            <AffiliateWithdrawIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: ':id',
        element: (
          <RequirePermission permission="affiliatewithdrawrequest.view">
            <AffiliateWithdrawDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  // Affiliate wallet transactions
  {
    path: 'affiliate-wallet-transactions',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="affiliatewallettransaction.view">
            <AffiliateWalletTransactionIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: ':id',
        element: (
          <RequirePermission permission="affiliatewallettransaction.view">
            <AffiliateWalletTransactionDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  // Driver wallet transactions
  {
    path: 'driver-wallet-transactions',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="driverwallettransaction.view">
            <DriverWalletTransactionIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: ':id',
        element: (
          <RequirePermission permission="driverwallettransaction.view">
            <DriverWalletTransactionDetailsPage />
          </RequirePermission>
        ),
      },
      {
        path: 'driver/:driverId/orders',
        element: (
          <RequirePermission permission="driverwallettransaction.view">
            <DriverOrdersPage />
          </RequirePermission>
        ),
      },
    ],
  },
  // Icons
  {
    path: 'icons',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="icon.view">
            <IconIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="icon.create">
            <IconCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="icon.update">
            <IconCreatePage />
          </RequirePermission>
        ),
      },
    ],
  },
  // Colors
  {
    path: 'colors',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permissionAny={['color.view', 'Color.view']}>
            <ColorIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permissionAny={['color.create', 'Color.create']}>
            <ColorCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permissionAny={['color.update', 'Color.update']}>
            <ColorCreatePage />
          </RequirePermission>
        ),
      },
    ],
  },
  // Promotions
  {
    path: 'promotions',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="promotion.view">
            <PromotionIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="promotion.create">
            <PromotionCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="promotion.update">
            <PromotionCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: ':id',
        element: (
          <RequirePermission permission="promotion.view">
            <PromotionDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'countries',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="country.view">
            <CountryIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="country.create">
            <CountryCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="country.update">
            <CountryCreatePage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'sale-countries',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permissionAny={['salecountry.view', 'SaleCountry.view']}>
            <SaleCountryIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permissionAny={['salecountry.create', 'SaleCountry.create']}>
            <SaleCountryCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permissionAny={['salecountry.update', 'SaleCountry.update']}>
            <SaleCountryCreatePage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'promotion-requests',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="promotionrequest.view">
            <PromotionRequestIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: ':id',
        element: (
          <RequirePermission permission="promotionrequest.view">
            <PromotionRequestDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'point-rules',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="pointrule.view">
            <PointRuleIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      // Create disabled — keep list + update only (restore route when needed)
      // {
      //   path: 'create',
      //   element: (
      //     <RequirePermission permission="pointrule.create">
      //       <PointRuleCreatePage />
      //     </RequirePermission>
      //   ),
      // },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="pointrule.view">
            <PointRuleDetailsPage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="pointrule.update">
            <PointRuleCreatePage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'schedules',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="schedule.view">
            <ScheduleIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="schedule.create">
            <ScheduleCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="schedule.update">
            <ScheduleCreatePage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'user-basket-schedules',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="userbasketschedule.view">
            <UserBasketScheduleIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'details/:id',
        element: (
          <RequirePermission permission="userbasketschedule.view">
            <UserBasketScheduleDetailsPage />
          </RequirePermission>
        ),
      },
    ],
  },
  // Vendor Service Types
  {
    path: 'vendor-service-types',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: <VendorServiceTypeIndexPage />,
        index: true,
      },
      {
        path: 'create',
        element: <VendorServiceTypeCreatePage />,
      },
      {
        path: 'update/:id',
        element: <VendorServiceTypeCreatePage />,
      },
    ],
  },
  // Vendor Services
  {
    path: 'vendor-services',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: <VendorServiceIndexPage />,
        index: true,
      },
      {
        path: 'create',
        element: <VendorServiceCreatePage />,
      },
      {
        path: 'update/:id',
        element: <VendorServiceCreatePage />,
      },
    ],
  },
  // Shop Vendor Services
  {
    path: 'shop-vendor-services',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: <ShopVendorServiceIndexPage />,
        index: true,
      },
      {
        path: 'create',
        element: <ShopVendorServiceCreatePage />,
      },
      {
        path: 'update/:id',
        element: <ShopVendorServiceCreatePage />,
      },
    ],
  },
  // Service Orders
  {
    path: 'service-orders',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: <ServiceOrderIndexPage />,
        index: true,
      },
    ],
  },
  // Quick Actions
  {
    path: 'quick-actions',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="quickaction.view">
            <QuickActionIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="quickaction.create">
            <QuickActionCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="quickaction.update">
            <QuickActionCreatePage />
          </RequirePermission>
        ),
      },
    ],
  },
  // Popup Campaigns
  {
    path: 'popup-campaigns',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission="popupcampaign.view">
            <PopupCampaignIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission="popupcampaign.create">
            <PopupCampaignCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission="popupcampaign.update">
            <PopupCampaignCreatePage />
          </RequirePermission>
        ),
      },
    ],
  },
  {
    path: 'flash-sales',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: (
          <RequirePermission permission={FLASH_SALE_PERMISSION.view}>
            <FlashSaleIndexPage />
          </RequirePermission>
        ),
        index: true,
      },
      {
        path: 'create',
        element: (
          <RequirePermission permission={FLASH_SALE_PERMISSION.create}>
            <FlashSaleCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'update/:id',
        element: (
          <RequirePermission permission={FLASH_SALE_PERMISSION.update}>
            <FlashSaleCreatePage />
          </RequirePermission>
        ),
      },
    ],
  },
  // Inventory
  {
    path: 'inventory',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: <InventoryIndexPage />,
        index: true,
      },
    ],
  },
  // Vendor Accounting
  {
    path: 'vendor-accounting',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: <VendorAccountingIndexPage />,
        index: true,
      },
      {
        path: 'vendors/:id',
        element: <VendorStatementPage />,
      },
    ],
  },
  // Vendor Withdraw Requests
  {
    path: 'vendor-withdraw-requests',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        element: <VendorWithdrawRequestsPage />,
        index: true,
      },
    ],
  },
  {
    path: '403',
    element: <Page403 />,
  },
];
