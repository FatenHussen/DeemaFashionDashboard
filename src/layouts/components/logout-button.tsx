import type { HTMLAttributes } from 'react';

import { useState, useCallback } from 'react';

import { useRouter } from 'src/routes/hooks';

import { useAuthContext } from 'src/pages/auth/hooks';
import { Iconify } from 'src/shared/components/iconify';
import { Button, Tooltip, IconButton } from 'src/shared/ui';
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
    const { color: _, ...restProps } = other as HTMLAttributes<HTMLButtonElement> & {
      color?: string;
    };
    return (
      <Button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        loading={isLoggingOut}
        variant="outlined"
        color={'error' as const}
        className={className}
        {...restProps}
      >
        <span className="flex items-center gap-2">
          <Iconify icon="solar:logout-2-bold" />
          {showLabel ? 'Logout' : ''}
        </span>
      </Button>
    );
  }

  const { color: __, ...restIconProps } = other as HTMLAttributes<HTMLButtonElement> & {
    color?: string;
  };
  return (
    <Tooltip title="Logout">
      <IconButton
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={className}
        {...restIconProps}
      >
        <Iconify icon="solar:logout-2-bold" />
      </IconButton>
    </Tooltip>
  );
}
