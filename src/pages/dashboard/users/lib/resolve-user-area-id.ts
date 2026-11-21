import type { UserAddress, UserDetailsData, UserItem } from '../types/user.types';

type UserLike = Partial<UserDetailsData> &
  Partial<UserItem> & {
    area_id?: number;
    area?: string | null | { id?: number };
    addresses?: UserAddress[];
  };

/** Prefer top-level `area_id`, then nested `area.id`, then default/first address area. */
export function resolveUserAreaId(user: UserLike | null | undefined): number | undefined {
  if (!user) return undefined;

  const direct = Number(user.area_id);
  if (Number.isFinite(direct) && direct > 0) return direct;

  if (user.area && typeof user.area === 'object') {
    const nested = Number(user.area.id);
    if (Number.isFinite(nested) && nested > 0) return nested;
  }

  const addresses = user.addresses;
  if (Array.isArray(addresses) && addresses.length > 0) {
    const preferred = addresses.find((a) => a.is_default) ?? addresses[0];
    const fromAddress = Number(preferred?.area?.id);
    if (Number.isFinite(fromAddress) && fromAddress > 0) return fromAddress;
  }

  return undefined;
}
