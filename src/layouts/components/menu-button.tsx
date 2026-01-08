import type { HTMLAttributes } from 'react';

import { Iconify } from 'src/shared/components/iconify';

// ----------------------------------------------------------------------

export type MenuButtonProps = HTMLAttributes<HTMLButtonElement>;

export function MenuButton({ className, ...other }: MenuButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-lg p-2 hover:bg-muted transition-colors ${className || ''}`}
      {...other}
    >
      <Iconify icon="custom:menu-duotone" width={24} />
    </button>
  );
}
