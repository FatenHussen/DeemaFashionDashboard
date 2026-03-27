import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { apiRoutes, axiosInstance } from 'src/api';

import { can } from './permissions';

/**
 * Normalize a permission value to string (handles objects like { name: "user.view" })
 */
function toPermissionString(p: unknown): string | null {
  if (typeof p === 'string' && p) return p;
  if (p && typeof p === 'object' && typeof (p as any).name === 'string') return (p as any).name;
  return null;
}

/**
 * Extract permissions from various API response structures.
 * Supports: user.permissions, user.data.permissions, data.permissions, user.roles[].permissions
 */
export function extractPermissionsFromLoginResponse(
  user: any,
  responseData?: { data?: any }
): string[] {
  const result = new Set<string>();

  const tryAdd = (source: unknown) => {
    if (!source) return;
    const arr = Array.isArray(source) ? source : [];
    arr.forEach((p) => {
      const s = toPermissionString(p);
      if (s) result.add(s);
    });
  };

  tryAdd(user?.permissions);
  tryAdd(user?.data?.permissions);
  tryAdd(responseData?.data?.permissions);
  tryAdd(responseData?.data?.user?.permissions);

  const roles = user?.roles ?? responseData?.data?.user?.roles;
  if (Array.isArray(roles)) {
    roles.forEach((r: any) => tryAdd(r?.permissions));
  }

  return Array.from(result);
}

/**
 * Fetch permissions from /me API (used when login response lacks permissions).
 * The /me endpoint typically returns full user data including roles/permissions.
 */
export async function fetchPermissionsFromMe(): Promise<string[]> {
  try {
    const res = await axiosInstance.get(apiRoutes.auth.me);
    const responseData = res.data;
    const user = responseData?.data?.user || responseData?.user || responseData;
    return extractPermissionsFromLoginResponse(user, { data: responseData?.data ?? responseData });
  } catch {
    return [];
  }
}

/**
 * Ordered list of nav items (path + required permission) in sidebar order.
 * Used to determine post-login redirect when user doesn't have statistics permission.
 * Statistics is handled first in getPostLoginRedirectPath; this list matches the rest of the sidebar.
 */
const NAV_REDIRECT_ORDER: { path: string; permission: string }[] = [
  { path: paths.dashboard.reports, permission: 'reports.view' },
  { path: paths.dashboard.categories, permission: 'category.view' },
  { path: paths.dashboard.categoryAttributes, permission: 'categoryattribute.view' },
  { path: paths.dashboard.categoryDetails, permission: 'categorydetail.view' },
  { path: paths.dashboard.brands, permission: 'brand.view' },
  { path: paths.dashboard.products, permission: 'product.view' },
  { path: paths.dashboard.sections, permission: 'section.view' },
  { path: paths.dashboard.pageSections, permission: 'pagesection.view' },
  { path: paths.dashboard.banners, permission: 'banner.view' },
  { path: paths.dashboard.recipes, permission: 'recipe.view' },
  { path: paths.dashboard.baskets, permission: 'basket.view' },
  { path: paths.dashboard.scheduledBaskets, permission: 'scheduledbasket.view' },
  { path: paths.dashboard.locations, permission: 'governorate.view' },
  { path: paths.dashboard.city, permission: 'city.view' },
  { path: paths.dashboard.area, permission: 'area.view' },
  { path: paths.dashboard.users, permission: 'user.view' },
  { path: paths.dashboard.vendor, permission: 'vendor.view' },
  { path: paths.dashboard.vendorUsers, permission: 'vendoruser.view' },
  { path: paths.dashboard.sellerRegistrations, permission: 'sellerregistration.view' },
  { path: paths.dashboard.shop, permission: 'shop.view' },
  { path: paths.dashboard.driver, permission: 'driver.view' },
  { path: paths.dashboard.orders, permission: 'order.view' },
  { path: paths.dashboard.packages, permission: 'package.view' },
  { path: paths.dashboard.subscriptions, permission: 'subscription.view' },
  { path: paths.dashboard.vendorPackages, permission: 'vendorpackage.view' },
  { path: paths.dashboard.vendorSubscriptions, permission: 'vendorsubscription.view' },
  { path: paths.dashboard.gifts, permission: 'gift.view' },
  { path: paths.dashboard.userGifts, permission: 'gift.view' },
  { path: paths.dashboard.userPoints, permission: 'pointwallet.view' },
  { path: paths.dashboard.pointExchanges, permission: 'pointexchange.view' },
  { path: paths.dashboard.coupons, permission: 'coupon.view' },
  { path: paths.dashboard.services, permission: 'service.view' },
  // { path: `${paths.dashboard.languages}/translations`, permission: 'language.view' },
  { path: paths.dashboard.currencies, permission: 'currency.view' },
  { path: paths.dashboard.legalDocuments, permission: 'legaldocument.view' },
  { path: paths.dashboard.faqs, permission: 'faq.view' },
  { path: paths.dashboard.complaints, permission: 'complaint.view' },
  { path: paths.dashboard.adminNotifications, permission: 'notification.view' },
  { path: paths.dashboard.root, permission: 'admin.view' },
  { path: paths.dashboard.role, permission: 'role.view' },
];

/**
 * Get the post-login redirect path based on user permissions.
 * - If user has stats.view (or stats.index or statistics.view) → redirect to statistics page
 * - Else → redirect to first sidebar tab they have permission for
 * - Fallback → CONFIG.auth.redirectPath
 */
export function getPostLoginRedirectPath(permissions: string[] | undefined | null): string {
  const perms = permissions ?? [];

  // 1. Statistics if user has permission (stats.index, stats.view, or statistics.view)
  if (can(perms, 'stats.index') || can(perms, 'stats.view') || can(perms, 'statistics.view')) {
    return paths.dashboard.statistics;
  }

  // 2. First sidebar item user has permission for
  for (const { path, permission } of NAV_REDIRECT_ORDER) {
    if (can(perms, permission)) {
      return path;
    }
  }

  // 3. Fallback
  return CONFIG.auth.redirectPath;
}
