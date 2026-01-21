import type { HTMLAttributes } from 'react';

import { useCallback } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useAuthContext } from 'src/pages/auth/hooks';
import { signOut } from 'src/pages/auth/context/jwt/action';

// ----------------------------------------------------------------------

type Props = HTMLAttributes<HTMLButtonElement> & {
  onClose?: () => void;
};

export function SignOutButton({ onClose, className, ...other }: Props) {
  const router = useRouter();

  const { checkUserSession } = useAuthContext();

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      await checkUserSession?.();

      onClose?.();

      // Redirect to login page after logout
      router.push(paths.auth.jwt.signIn);
    } catch (error) {
      console.error(error);
    }
  }, [checkUserSession, onClose, router]);

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={`w-full px-6 py-3 text-base font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors ${className || ''}`}
      {...other}
    >
      Logout
    </button>
  );
}
