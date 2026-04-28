import { useTranslation } from 'react-i18next';
import { useBoolean } from 'minimal-shared/hooks';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { _mock } from 'src/_mock';
import { Label } from 'src/shared/components/label';
import { useMockedUser } from 'src/pages/auth/hooks';
import { Iconify } from 'src/shared/components/iconify';
import { Scrollbar } from 'src/shared/components/scrollbar';
import { AnimateBorder } from 'src/shared/components/animate';
import {
  Box,
  Link,
  Avatar,
  Drawer,
  Tooltip,
  MenuList,
  MenuItem,
  Typography,
  IconButton,
} from 'src/shared/ui';

import { UpgradeBlock } from './nav-upgrade';
import { AccountButton } from './account-button';
import { SignOutButton } from './sign-out-button';

// ----------------------------------------------------------------------

export type AccountDrawerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  data?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    info?: React.ReactNode;
  }[];
};

export function AccountDrawer({ data = [], className, ...other }: AccountDrawerProps) {
  const pathname = usePathname();
  const { t } = useTranslation('common');

  const { user } = useMockedUser();

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const renderAvatar = () => (
    <AnimateBorder
      className="mb-2 p-[6px] w-24 h-24 rounded-full"
      slotProps={{
        primaryBorder: { size: 120, className: 'text-primary' },
      }}
    >
      <Avatar src={user?.photoURL} alt={user?.displayName} className="w-full h-full">
        {user?.displayName?.charAt(0).toUpperCase()}
      </Avatar>
    </AnimateBorder>
  );

  const renderList = () => (
    <MenuList className="py-3 px-2.5 border-t border-dashed border-border border-b border-dashed [&_li]:p-0">
      {data.map((option) => {
        const isHome = option.label === 'accountNavHome';
        const rootLabel = pathname.includes('/dashboard') ? t('menuHome') : t('menuDashboard');
        const rootHref = pathname.includes('/dashboard') ? '/' : paths.dashboard.root;

        return (
          <MenuItem key={option.label}>
            <Link
              component={RouterLink}
              href={isHome ? rootHref : option.href}
              color="inherit"
              underline="none"
              onClick={onClose}
              className="p-1 w-full flex text-sm items-center text-muted-foreground hover:text-foreground [&_svg]:w-6 [&_svg]:h-6"
            >
              {option.icon}

              <Box component="span" className="ms-2">
                {isHome ? rootLabel : t(option.label)}
              </Box>

              {option.info && (
                <Label color="error" className="ms-1">
                  {option.info}
                </Label>
              )}
            </Link>
          </MenuItem>
        );
      })}
    </MenuList>
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

      <Drawer
        open={open}
        onClose={onClose}
        anchor="right"
        slotProps={{
          backdrop: { invisible: true },
        }}
        className="w-80"
      >
        <IconButton onClick={onClose} className="absolute top-3 left-3 z-[9]">
          <Iconify icon="mingcute:close-line" />
        </IconButton>

        <Scrollbar>
          <Box className="pt-8 flex items-center flex-col">
            {renderAvatar()}

            <Typography variant="subtitle1" className="mt-2 truncate">
              {user?.displayName}
            </Typography>

            <Typography variant="body2" className="text-muted-foreground mt-0.5 truncate">
              {user?.email}
            </Typography>
          </Box>

          <Box className="p-3 gap-1 flex-wrap flex justify-center">
            {Array.from({ length: 3 }, (_, index) => (
              <Tooltip
                key={_mock.fullName(index + 1)}
                title={t('switchToAccount', { name: _mock.fullName(index + 1) })}
              >
                <Avatar
                  alt={_mock.fullName(index + 1)}
                  src={_mock.image.avatar(index + 1)}
                  onClick={() => {}}
                />
              </Tooltip>
            ))}

            <Tooltip title={t('addAccount')}>
              <IconButton className="bg-muted border border-dashed border-border">
                <Iconify icon="mingcute:add-line" />
              </IconButton>
            </Tooltip>
          </Box>

          {renderList()}

          <Box className="px-2.5 py-3">
            <UpgradeBlock />
          </Box>
        </Scrollbar>

        <Box className="p-2.5">
          <SignOutButton onClose={onClose} />
        </Box>
      </Drawer>
    </>
  );
}
