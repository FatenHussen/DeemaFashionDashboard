import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';
import { RequirePermission } from '@/auth/components/require-permission';

import { CONFIG } from 'src/global-config';
import { AuthGuard } from 'src/pages/auth/guard';
import { DashboardLayout } from 'src/layouts/dashboard';
import { LoadingScreen } from 'src/shared/components/loading-screen';

import { usePathname } from '../hooks';

// ----------------------------------------------------------------------

const IndexPage = lazy(() => import('@/pages/dashboard/admin/view/Index'));
const CreatePage = lazy(() => import('@/pages/dashboard/admin/view/Create'));

const VendorIndexPage = lazy(() => import('@/pages/dashboard/vendor/view/Index'));
const VendorCreatePage = lazy(() => import('@/pages/dashboard/vendor/view/Create'));

const ShopIndexPage = lazy(() => import('@/pages/dashboard/vendor/view/shop/Index'));
const ShopCreatePage = lazy(() => import('@/pages/dashboard/vendor/view/shop/Create'));

const ProfilePage = lazy(() => import('@/pages/dashboard/profile/view/Profile'));

const RoleIndexPage = lazy(() => import('@/pages/dashboard/roles/view/Index'));
const RoleCreatePage = lazy(() => import('@/pages/dashboard/roles/view/Create'));
const RoleDetailsPage = lazy(() => import('@/pages/dashboard/roles/view/Details'));

const DriverIndexPage = lazy(() => import('@/pages/dashboard/driver/view/Index'));
const DriverCreatePage = lazy(() => import('@/pages/dashboard/driver/view/Create'));
const DriverDetailsPage = lazy(() => import('@/pages/dashboard/driver/view/Details'));

const BrandIndexPage = lazy(() => import('@/pages/dashboard/products/view/Index'));
const BrandCreatePage = lazy(() => import('@/pages/dashboard/products/view/Create'));
const BrandDetailsPage = lazy(() => import('@/pages/dashboard/products/view/Details'));

const GovernorateIndexPage = lazy(() => import('@/pages/dashboard/locations/view/Index'));
const GovernorateCreatePage = lazy(() => import('@/pages/dashboard/locations/view/Create'));

const CityIndexPage = lazy(() => import('@/pages/dashboard/locations/view/city/Index'));
const CityCreatePage = lazy(() => import('@/pages/dashboard/locations/view/city/Create'));

const AreaIndexPage = lazy(() => import('@/pages/dashboard/locations/view/area/Index'));
const AreaCreatePage = lazy(() => import('@/pages/dashboard/locations/view/area/Create'));

const CategoryIndexPage = lazy(() => import('@/pages/dashboard/categories/view/Index'));
const CategoryCreatePage = lazy(() => import('@/pages/dashboard/categories/view/Create'));

const CategoryAttributeIndexPage = lazy(
  () => import('@/pages/dashboard/categories/view/attributes/Index')
);
const CategoryAttributeCreatePage = lazy(
  () => import('@/pages/dashboard/categories/view/attributes/Create')
);

const Page403 = lazy(() => import('src/pages/error/403'));
// const PageTwo = lazy(() => import('src/pages/dashboard/two'));
// const PageThree = lazy(() => import('src/pages/dashboard/three'));
// const PageFour = lazy(() => import('src/pages/dashboard/four'));
// const PageFive = lazy(() => import('src/pages/dashboard/five'));
// const PageSix = lazy(() => import('src/pages/dashboard/six'));

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
    path: '403',
    element: <Page403 />,
  },
];
