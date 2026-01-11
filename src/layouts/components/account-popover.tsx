import type { HTMLAttributes } from 'react';

import { usePopover } from 'minimal-shared/hooks';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Label } from 'src/shared/components/label';
import { useMockedUser } from 'src/pages/auth/hooks';
import { CustomPopover } from 'src/shared/components/custom-popover';

import { AccountButton } from './account-button';
import { SignOutButton } from './sign-out-button';

// ----------------------------------------------------------------------

export type AccountPopoverProps = HTMLAttributes<HTMLButtonElement> & {
  data?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    info?: React.ReactNode;
  }[];
};

export function AccountPopover({ data = [], className, ...other }: AccountPopoverProps) {
  const pathname = usePathname();

  const { open, anchorEl, onClose, onOpen } = usePopover();

  const { user } = useMockedUser();

  const renderMenuActions = () => (
    <CustomPopover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      slotProps={{ paper: { style: { padding: 0, width: 200 } }, arrow: { offset: 20 } }}
    >
      <div className="p-4 pb-3">
        <div className="text-sm font-semibold truncate">{user?.displayName}</div>

        <div className="text-sm text-muted-foreground truncate">{user?.email}</div>
      </div>

      <hr className="border-dashed border-border" />

      <ul className="p-2 my-2 list-none">
        {data.map((option) => {
          const rootLabel = pathname.includes('/dashboard') ? 'Home' : 'Dashboard';
          const rootHref = pathname.includes('/dashboard') ? '/' : paths.dashboard.root;

          return (
            <li key={option.label} className="p-0">
              <RouterLink
                href={option.label === 'Home' ? rootHref : option.href}
                onClick={onClose}
                className="px-2 py-1.5 w-full flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors [&_svg]:w-6 [&_svg]:h-6"
              >
                {option.icon}

                <span className="ml-2">{option.label === 'Home' ? rootLabel : option.label}</span>

                {option.info && (
                  <Label color="error" className="ml-1">
                    {option.info}
                  </Label>
                )}
              </RouterLink>
            </li>
          );
        })}
      </ul>

      <hr className="border-dashed border-border" />

      <div className="p-2">
        <SignOutButton onClose={onClose} className="block text-left" />
      </div>
    </CustomPopover>
  );

  return (
    <>
      <AccountButton
        onClick={onOpen}
        photoURL={user?.photoURL || ''}
        displayName={user?.displayName || ''}
        className={className}
        {...other}
      />

      {renderMenuActions()}
    </>
  );
}
