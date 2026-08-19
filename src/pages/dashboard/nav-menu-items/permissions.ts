/**
 * Permission keys for the storefront navigation menu (`nav_menu_items`).
 *
 * These are the canonical keys registered by `RolePermissionSeeder` on the backend. Keep one key
 * per list: `canAny` is an OR check, so any extra key here would silently hand the whole screen
 * (create / update / delete / toggle) to a role that was never granted the navigation menu.
 */
export const NAV_MENU_ITEM_VIEW_ANY = ['navmenuitem.view'] as const;

export const NAV_MENU_ITEM_CREATE_ANY = ['navmenuitem.create'] as const;

export const NAV_MENU_ITEM_UPDATE_ANY = ['navmenuitem.update'] as const;

export const NAV_MENU_ITEM_DELETE_ANY = ['navmenuitem.delete'] as const;
