import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';
import { RequirePermission } from '@/auth/components/require-permission';
import { FLASH_SALE_PERMISSION } from '@/pages/dashboard/flash-sales/permissions';

import { CONFIG } from 'src/global-config';
import { AuthGuard } from 'src/pages/auth/guard';
import { DashboardLayout } from 'src/layouts/dashboard';
import { LoadingScreen } from 'src/shared/components/loading-screen';

import { usePathname } from '../hooks';

// ----------------------------------------------------------------------

const IndexPage = lazy(() => import('@/pages/dashboard/admin/view/Index'));
const CreatePage = lazy(() => import('@/pages/dashboard/admin/view/Create'));
const AdminDetailsPage = lazy(() => import('@/pages/dashboard/admin/view/Details'));

const VendorIndexPage = lazy(() => import('@/pages/dashboard/vendor/view/vendor/Index'));
const VendorCreatePage = lazy(() => import('@/pages/dashboard/vendor/view/vendor/Create'));

const ShopIndexPage = lazy(() => import('@/pages/dashboard/vendor/view/shop/Index'));
const ShopCreatePage = lazy(() => import('@/pages/dashboard/vendor/view/shop/Create'));
const ShopDetailsPage = lazy(() => import('@/pages/dashboard/vendor/view/shop/Details'));

const ProfilePage = lazy(() => import('@/pages/dashboard/profile/view/Profile'));

const RoleIndexPage = lazy(() => import('@/pages/dashboard/roles/view/Index'));
const RoleCreatePage = lazy(() => import('@/pages/dashboard/roles/view/Create'));
const RoleDetailsPage = lazy(() => import('@/pages/dashboard/roles/view/Details'));

const DriverIndexPage = lazy(() => import('@/pages/dashboard/driver/view/Index'));
const DriverCreatePage = lazy(() => import('@/pages/dashboard/driver/view/Create'));
const DriverDetailsPage = lazy(() => import('@/pages/dashboard/driver/view/Details'));

const BrandIndexPage = lazy(() => import('@/pages/dashboard/products/view/brand/Index'));
const BrandCreatePage = lazy(() => import('@/pages/dashboard/products/view/brand/Create'));
const BrandDetailsPage = lazy(() => import('@/pages/dashboard/products/view/brand/Details'));

const UnitIndexPage = lazy(() => import('@/pages/dashboard/units/view/Index'));
const UnitCreatePage = lazy(() => import('@/pages/dashboard/units/view/Create'));

const ProductIndexPage = lazy(() => import('@/pages/dashboard/products/view/product/Index'));
const ProductCreatePage = lazy(() => import('@/pages/dashboard/products/view/product/Create'));
const ProductDetailsPage = lazy(() => import('@/pages/dashboard/products/view/product/Details'));

const GovernorateIndexPage = lazy(() => import('@/pages/dashboard/locations/view/Index'));
const GovernorateCreatePage = lazy(() => import('@/pages/dashboard/locations/view/Create'));

const CityIndexPage = lazy(() => import('@/pages/dashboard/locations/view/city/Index'));
const CityCreatePage = lazy(() => import('@/pages/dashboard/locations/view/city/Create'));

const AreaIndexPage = lazy(() => import('@/pages/dashboard/locations/view/area/Index'));
const AreaCreatePage = lazy(() => import('@/pages/dashboard/locations/view/area/Create'));
const AreaDetailsPage = lazy(() => import('@/pages/dashboard/locations/view/area/Details'));

const CategoryIndexPage = lazy(() => import('@/pages/dashboard/categories/view/Index'));
const CategorySubcategoriesPage = lazy(() => import('@/pages/dashboard/categories/view/Subcategories'));
const CategoryCreatePage = lazy(() => import('@/pages/dashboard/categories/view/Create'));

const CategoryAttributeIndexPage = lazy(
  () => import('@/pages/dashboard/categories/view/attributes/Index')
);
const CategoryAttributeCreatePage = lazy(
  () => import('@/pages/dashboard/categories/view/attributes/Create')
);

const CategoryDetailIndexPage = lazy(
  () => import('@/pages/dashboard/categories/view/details/Index')
);
const CategoryDetailCreatePage = lazy(
  () => import('@/pages/dashboard/categories/view/details/Create')
);

const ServiceIndexPage = lazy(() => import('@/pages/dashboard/vendor/view/service/Index'));
const ServiceCreatePage = lazy(() => import('@/pages/dashboard/vendor/view/service/Create'));

// const LanguageIndexPage = lazy(() => import('@/pages/dashboard/languages/view/Index'));
// const LanguageCreatePage = lazy(() => import('@/pages/dashboard/languages/view/Create'));
// const TranslationManagerPage = lazy(
//   () => import('@/pages/dashboard/languages/view/TranslationManager')
// );

const SectionIndexPage = lazy(() => import('@/pages/dashboard/sections/view/Index'));
const SectionCreatePage = lazy(() => import('@/pages/dashboard/sections/view/Create'));
const SectionDetailsPage = lazy(() => import('@/pages/dashboard/sections/view/Details'));

const PageSectionIndexPage = lazy(() => import('@/pages/dashboard/sections/view/PageSections'));
const PageSectionCreatePage = lazy(
  () => import('@/pages/dashboard/sections/view/PageSectionCreate')
);
const PageSectionDetailsPage = lazy(
  () => import('@/pages/dashboard/sections/view/PageSectionDetails')
);

const BannerIndexPage = lazy(() => import('@/pages/dashboard/banners/view/Index'));
const BannerCreatePage = lazy(() => import('@/pages/dashboard/banners/view/Create'));

const CouponIndexPage = lazy(() => import('@/pages/dashboard/coupons/view/Index'));
const CouponCreatePage = lazy(() => import('@/pages/dashboard/coupons/view/Create'));
const CouponDetailsPage = lazy(() => import('@/pages/dashboard/coupons/view/Details'));

const ComplaintIndexPage = lazy(() => import('@/pages/dashboard/complaints/view/Index'));
const ComplaintDetailsPage = lazy(() => import('@/pages/dashboard/complaints/view/Details'));

const UserIndexPage = lazy(() => import('@/pages/dashboard/users/view/Index'));
const UserCreatePage = lazy(() => import('@/pages/dashboard/users/view/Create'));
const UserUpdatePage = lazy(() => import('@/pages/dashboard/users/view/Update'));
const UserDetailsPage = lazy(() => import('@/pages/dashboard/users/view/Details'));

const AffiliateIndexPage = lazy(() => import('@/pages/dashboard/affiliates/view/Index'));

// Orders
const OrderIndexPage = lazy(() => import('@/pages/dashboard/orders/view/Index'));
const OrderDetailsPage = lazy(() => import('@/pages/dashboard/orders/view/Details'));

// Baskets
const BasketIndexPage = lazy(() => import('@/pages/dashboard/baskets/view/basket/Index'));
const BasketCreatePage = lazy(() => import('@/pages/dashboard/baskets/view/basket/Create'));
const BasketDetailsPage = lazy(() => import('@/pages/dashboard/baskets/view/basket/Details'));

// Scheduled Baskets
const ScheduledBasketIndexPage = lazy(
  () => import('@/pages/dashboard/baskets/view/scheduled/Index')
);
const ScheduledBasketCreatePage = lazy(
  () => import('@/pages/dashboard/baskets/view/scheduled/Create')
);
const ScheduledBasketDetailsPage = lazy(
  () => import('@/pages/dashboard/baskets/view/scheduled/Details')
);

// Packages
const PackageIndexPage = lazy(() => import('@/pages/dashboard/packages/view/Index'));
const PackageCreatePage = lazy(() => import('@/pages/dashboard/packages/view/Create'));
const PackageDetailsPage = lazy(() => import('@/pages/dashboard/packages/view/Details'));

// Subscriptions (read-only: list + details)
const SubscriptionIndexPage = lazy(() => import('@/pages/dashboard/subscriptions/view/Index'));
const SubscriptionDetailsPage = lazy(() => import('@/pages/dashboard/subscriptions/view/Details'));

// Gifts
const GiftIndexPage = lazy(() => import('@/pages/dashboard/gifts/view/Index'));
const GiftCreatePage = lazy(() => import('@/pages/dashboard/gifts/view/Create'));
const GiftDetailsPage = lazy(() => import('@/pages/dashboard/gifts/view/Details'));

// User Gifts
const UserGiftIndexPage = lazy(() => import('@/pages/dashboard/user-gifts/view/Index'));
const UserGiftCreatePage = lazy(() => import('@/pages/dashboard/user-gifts/view/Create'));
const UserGiftDetailsPage = lazy(() => import('@/pages/dashboard/user-gifts/view/Details'));

// Point Exchanges
const PointExchangeIndexPage = lazy(() => import('@/pages/dashboard/point-exchanges/view/Index'));
const PointExchangeDetailsPage = lazy(
  () => import('@/pages/dashboard/point-exchanges/view/Details')
);

// User Points
const UserPointsIndexPage = lazy(() => import('@/pages/dashboard/user-points/view/Index'));
const UserPointsDetailsPage = lazy(() => import('@/pages/dashboard/user-points/view/Details'));

// Currencies
const CurrencyIndexPage = lazy(() => import('@/pages/dashboard/currencies/view/Index'));
const CurrencyCreatePage = lazy(() => import('@/pages/dashboard/currencies/view/Create'));
const CurrencyDetailsPage = lazy(() => import('@/pages/dashboard/currencies/view/Details'));

const DeliveryDistanceRangeIndexPage = lazy(
  () => import('@/pages/dashboard/delivery-distance-ranges/view/Index')
);
const DeliveryDistanceRangeCreatePage = lazy(
  () => import('@/pages/dashboard/delivery-distance-ranges/view/Create')
);
const DeliveryDistanceRangeDetailsPage = lazy(
  () => import('@/pages/dashboard/delivery-distance-ranges/view/Details')
);

// Recipes
const RecipeIndexPage = lazy(() => import('@/pages/dashboard/recipes/view/Index'));
const RecipeCreatePage = lazy(() => import('@/pages/dashboard/recipes/view/Create'));
const RecipeDetailsPage = lazy(() => import('@/pages/dashboard/recipes/view/Details'));

// Legal Documents
const LegalDocumentIndexPage = lazy(() => import('@/pages/dashboard/content/view/legal-document/Index'));
const LegalDocumentEditPage = lazy(() => import('@/pages/dashboard/content/view/legal-document/Edit'));

// FAQs
const FaqIndexPage = lazy(() => import('@/pages/dashboard/content/view/faq/Index'));
const FaqCreatePage = lazy(() => import('@/pages/dashboard/content/view/faq/Create'));

// Vendor Subscriptions
const VendorSubscriptionIndexPage = lazy(
  () => import('@/pages/dashboard/vendor/view/subscription/Index')
);
const VendorSubscriptionDetailsPage = lazy(
  () => import('@/pages/dashboard/vendor/view/subscription/Details')
);
const VendorSubscriptionCreatePage = lazy(
  () => import('@/pages/dashboard/vendor/view/subscription/Create')
);

// Admin Notifications
const AdminNotificationIndexPage = lazy(
  () => import('@/pages/dashboard/admin-notifications/view/Index')
);
const AdminNotificationCreatePage = lazy(
  () => import('@/pages/dashboard/admin-notifications/view/Create')
);

// Vendor Packages
const VendorPackageIndexPage = lazy(
  () => import('@/pages/dashboard/vendor/view/package/Index')
);
const VendorPackageCreatePage = lazy(
  () => import('@/pages/dashboard/vendor/view/package/Create')
);
const VendorPackageDetailsPage = lazy(
  () => import('@/pages/dashboard/vendor/view/package/Details')
);

// Vendor Users
const VendorUserIndexPage = lazy(
  () => import('@/pages/dashboard/vendor/view/vendor-user/Index')
);
const VendorUserCreatePage = lazy(
  () => import('@/pages/dashboard/vendor/view/vendor-user/Create')
);
const VendorUserDetailsPage = lazy(
  () => import('@/pages/dashboard/vendor/view/vendor-user/Details')
);

// Seller Registrations
const SellerRegistrationIndexPage = lazy(
  () => import('@/pages/dashboard/vendor/view/seller-registration/Index')
);
const SellerRegistrationDetailsPage = lazy(
  () => import('@/pages/dashboard/vendor/view/seller-registration/Details')
);

// Statistics
const StatisticsPage = lazy(() => import('@/pages/dashboard/statistics/view/Index'));

// Reports
const ReportsIndexPage = lazy(() => import('@/pages/dashboard/reports/view/Index'));
const SalesReportPage = lazy(() => import('@/pages/dashboard/reports/view/SalesReport'));
const ProductMovementReportPage = lazy(
  () => import('@/pages/dashboard/reports/view/ProductMovementReport')
);
const VendorPerformanceReportPage = lazy(
  () => import('@/pages/dashboard/reports/view/VendorPerformanceReport')
);
const DriverPerformanceReportPage = lazy(
  () => import('@/pages/dashboard/reports/view/DriverPerformanceReport')
);
const SalesByLocationReportPage = lazy(
  () => import('@/pages/dashboard/reports/view/SalesByLocationReport')
);
const SalesByCategoryReportPage = lazy(
  () => import('@/pages/dashboard/reports/view/SalesByCategoryReport')
);

// Settings
const SettingsIndexPage = lazy(() => import('@/pages/dashboard/settings/view/Index'));

// Badges
const BadgeIndexPage = lazy(() => import('@/pages/dashboard/badges/view/Index'));
const BadgeCreatePage = lazy(() => import('@/pages/dashboard/badges/view/Create'));

// Activity Logs
const ActivityLogIndexPage = lazy(() => import('@/pages/dashboard/activity-logs/view/Index'));

// Affiliate Withdraw Requests
const AffiliateWithdrawIndexPage = lazy(
  () => import('@/pages/dashboard/affiliate-withdraw-requests/view/Index')
);
const AffiliateWithdrawDetailsPage = lazy(
  () => import('@/pages/dashboard/affiliate-withdraw-requests/view/Details')
);

// Affiliate wallet transactions (read-only ledger)
const AffiliateWalletTransactionIndexPage = lazy(
  () => import('@/pages/dashboard/affiliate-wallet-transactions/view/Index')
);
const AffiliateWalletTransactionDetailsPage = lazy(
  () => import('@/pages/dashboard/affiliate-wallet-transactions/view/Details')
);

// Driver wallet transactions (read-only ledger)
const DriverWalletTransactionIndexPage = lazy(
  () => import('@/pages/dashboard/driver-wallet-transactions/view/Index')
);
const DriverWalletTransactionDetailsPage = lazy(
  () => import('@/pages/dashboard/driver-wallet-transactions/view/Details')
);

// Icons
const IconIndexPage = lazy(() => import('@/pages/dashboard/icons/view/Index'));
const IconCreatePage = lazy(() => import('@/pages/dashboard/icons/view/Create'));

// Colors
const ColorIndexPage = lazy(() => import('@/pages/dashboard/colors/view/Index'));
const ColorCreatePage = lazy(() => import('@/pages/dashboard/colors/view/Create'));

// Promotions
const PromotionIndexPage = lazy(() => import('@/pages/dashboard/promotions/view/Index'));
const PromotionCreatePage = lazy(() => import('@/pages/dashboard/promotions/view/Create'));
const PromotionDetailsPage = lazy(() => import('@/pages/dashboard/promotions/view/Details'));

// Countries
const CountryIndexPage = lazy(() => import('@/pages/dashboard/countries/view/Index'));
const CountryCreatePage = lazy(() => import('@/pages/dashboard/countries/view/Create'));

// Sale countries (markets)
const SaleCountryIndexPage = lazy(() => import('@/pages/dashboard/sale-countries/view/Index'));
const SaleCountryCreatePage = lazy(() => import('@/pages/dashboard/sale-countries/view/Create'));

// Promotion Requests
const PromotionRequestIndexPage = lazy(() => import('@/pages/dashboard/promotion-requests/view/Index'));
const PromotionRequestDetailsPage = lazy(() => import('@/pages/dashboard/promotion-requests/view/Details'));

// Point Rules
const PointRuleIndexPage = lazy(() => import('@/pages/dashboard/point-rules/view/Index'));
const PointRuleDetailsPage = lazy(() => import('@/pages/dashboard/point-rules/view/Details'));
const PointRuleCreatePage = lazy(() => import('@/pages/dashboard/point-rules/view/Create'));

// Schedules
const ScheduleIndexPage = lazy(() => import('@/pages/dashboard/schedules/view/Index'));
const ScheduleCreatePage = lazy(() => import('@/pages/dashboard/schedules/view/Create'));

// User Basket Schedules
const UserBasketScheduleIndexPage = lazy(() => import('@/pages/dashboard/user-basket-schedules/view/Index'));
const UserBasketScheduleDetailsPage = lazy(
  () => import('@/pages/dashboard/user-basket-schedules/view/Details')
);

// Vendor Service Types
const VendorServiceTypeIndexPage = lazy(
  () => import('@/pages/dashboard/vendor-service-types/view/Index')
);
const VendorServiceTypeCreatePage = lazy(
  () => import('@/pages/dashboard/vendor-service-types/view/Create')
);

// Vendor Services
const VendorServiceIndexPage = lazy(
  () => import('@/pages/dashboard/vendor-services/view/Index')
);
const VendorServiceCreatePage = lazy(
  () => import('@/pages/dashboard/vendor-services/view/Create')
);

// Shop Vendor Services
const ShopVendorServiceIndexPage = lazy(
  () => import('@/pages/dashboard/shop-vendor-services/view/Index')
);
const ShopVendorServiceCreatePage = lazy(
  () => import('@/pages/dashboard/shop-vendor-services/view/Create')
);

// Service Orders
const ServiceOrderIndexPage = lazy(
  () => import('@/pages/dashboard/service-orders/view/Index')
);

// Quick Actions
const QuickActionIndexPage = lazy(() => import('@/pages/dashboard/quick-actions/view/Index'));
const QuickActionCreatePage = lazy(() => import('@/pages/dashboard/quick-actions/view/Create'));

// Popup Campaigns
const PopupCampaignIndexPage = lazy(() => import('@/pages/dashboard/popup-campaigns/view/Index'));
const PopupCampaignCreatePage = lazy(() => import('@/pages/dashboard/popup-campaigns/view/Create'));

const FlashSaleIndexPage = lazy(() => import('@/pages/dashboard/flash-sales/view/Index'));
const FlashSaleCreatePage = lazy(() => import('@/pages/dashboard/flash-sales/view/Create'));

// Inventory
const InventoryIndexPage = lazy(() => import('@/pages/dashboard/inventory/view/Index'));

// Vendor Accounting
const VendorAccountingIndexPage = lazy(
  () => import('@/pages/dashboard/vendor-accounting/view/Index')
);
const VendorStatementPage = lazy(
  () => import('@/pages/dashboard/vendor-accounting/view/VendorStatement')
);
const VendorWithdrawRequestsPage = lazy(
  () => import('@/pages/dashboard/vendor-withdraw-requests/view/Index')
);

const Page403 = lazy(() => import('src/pages/error/403'));

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
        path: 'page-sections',
        element: (
          <RequirePermission permission="pagesection.view">
            <PageSectionIndexPage />
          </RequirePermission>
        ),
      },
      {
        path: 'page-sections/create',
        element: (
          <RequirePermission permission="pagesection.create">
            <PageSectionCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'page-sections/update/:id',
        element: (
          <RequirePermission permission="pagesection.update">
            <PageSectionCreatePage />
          </RequirePermission>
        ),
      },
      {
        path: 'page-sections/details/:id',
        element: (
          <RequirePermission permission="pagesection.view">
            <PageSectionDetailsPage />
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
