import type { HTMLAttributes } from 'react';

import { useTranslation } from 'react-i18next';

import { Iconify } from 'src/shared/components/iconify';

// ----------------------------------------------------------------------

export type MenuButtonProps = HTMLAttributes<HTMLButtonElement>;

export function MenuButton({ className, ...other }: MenuButtonProps) {
  const { t } = useTranslation('common');

  return (
    <button
      type="button"
      aria-label={t('openMainMenu')}
      className={`inline-flex items-center justify-center rounded-lg p-2 hover:bg-muted transition-colors ${className || ''}`}
      {...other}
    >
      <Iconify icon="custom:menu-duotone" width={24} />
    </button>
  );
}
