import type { AccountDrawerProps } from './components/account-drawer';

import { paths } from 'src/routes/paths';

import { Iconify } from 'src/shared/components/iconify';

// ----------------------------------------------------------------------

// Labels are i18n keys under the `common` namespace; the consumer resolves them via `t()`.
export const _account: AccountDrawerProps['data'] = [
  { label: 'accountNavHome', href: '/', icon: <Iconify icon="solar:home-angle-bold-duotone" /> },
  {
    label: 'accountNavProfile',
    href: paths.dashboard.profile,
    icon: <Iconify icon="custom:profile-duotone" />,
  },
  {
    label: 'accountNavProjects',
    href: '#',
    icon: <Iconify icon="solar:notes-bold-duotone" />,
    info: '3',
  },
  {
    label: 'accountNavSubscription',
    href: '#',
    icon: <Iconify icon="custom:invoice-duotone" />,
  },
  { label: 'accountNavSecurity', href: '#', icon: <Iconify icon="solar:shield-keyhole-bold-duotone" /> },
  { label: 'accountNavSettings', href: '#', icon: <Iconify icon="solar:settings-bold-duotone" /> },
];
