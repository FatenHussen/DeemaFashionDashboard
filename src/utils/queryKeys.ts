import { ROOTS } from '@/routes/paths';

export const QueryKeys = {
  Column_Order: {
    key: 'column_order',
    url: '',
  },
  // ---------- admin ----------
  AdminList: {
    key: 'admin',
    url: `${ROOTS.ADMIN}/admins`,
  },
  AdminCreate: {
    key: 'admin_create',
    url: `${ROOTS.ADMIN}/admins`,
  },
  AdminUpdate: {
    key: 'admin_update',
    url: `${ROOTS.ADMIN}/admins/:id`,
  },
  AdminDelete: {
    key: 'admin_delete',
    url: `${ROOTS.ADMIN}/admins/:id`,
  },
  // ---------- vendor ----------
  VendorList: {
    key: 'vendor',
    url: `${ROOTS.ADMIN}/vendors`,
  },
  VendorCreate: {
    key: 'vendor_create',
    url: `${ROOTS.ADMIN}/vendors`,
  },
  VendorUpdate: {
    key: 'vendor_update',
    url: `${ROOTS.ADMIN}/vendors/:id`,
  },
  VendorDelete: {
    key: 'vendor_delete',
    url: `${ROOTS.ADMIN}/vendors/:id`,
  },
  // ---------- shop ----------
  ShopList: {
    key: 'shop',
    url: `${ROOTS.ADMIN}/shops`,
  },
  ShopCreate: {
    key: 'shop_create',
    url: `${ROOTS.ADMIN}/shops`,
  },
  ShopUpdate: {
    key: 'shop_update',
    url: `${ROOTS.ADMIN}/shops/:id`,
  },
  ShopDelete: {
    key: 'shop_delete',
    url: `${ROOTS.ADMIN}/shops/:id`,
  },
} as const;
