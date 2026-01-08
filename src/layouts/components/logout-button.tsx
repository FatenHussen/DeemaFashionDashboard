import type { HTMLAttributes } from 'react';

import { useCallback, useState } from 'react';

import { useRouter } from 'src/routes/hooks';

import { Button, IconButton, Tooltip } from 'src/shared/ui';
import { Iconify } from 'src/shared/components/iconify';

import { useAuthContext } from 'src/pages/auth/hooks';
import { signOut } from 'src/pages/auth/context/jwt/action';

// ----------------------------------------------------------------------

type Props = HTMLAttributes<HTMLButtonElement> & {
  variant?: 'icon' | 'button';
  showLabel?: boolean;
};

export function LogoutButton({ variant = 'icon', showLabel = false, className, ...other }: Props) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { checkUserSession } = useAuthContext();

  const handleLogout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      await checkUserSession?.();
      router.refresh();
    } catch (error) {
      console.error(error);
      setIsLoggingOut(false);
    }
  }, [checkUserSession, router]);

  if (variant === 'button') {
    return (
      <Button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        loading={isLoggingOut}
        variant="outlined"
        color="error"
        startIcon={<Iconify icon="solar:logout-2-bold" />}
        className={className}
        {...other}
      >
        {showLabel ? 'Logout' : ''}
      </Button>
    );
  }

  return (
    <Tooltip title="Logout">
      <IconButton
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={className}
        {...other}
      >
        <Iconify icon="solar:logout-2-bold" />
      </IconButton>
    </Tooltip>
  );
}
