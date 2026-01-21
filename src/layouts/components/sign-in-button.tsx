import type { HTMLAttributes } from 'react';


// ----------------------------------------------------------------------

export type SignInButtonProps = HTMLAttributes<HTMLAnchorElement>;

export function SignInButton({ className, ...other }: SignInButtonProps) {
  return (
    // <RouterLink
    //   href={CONFIG.auth.redirectPath}
    //   className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium border border-border rounded-lg bg-background text-foreground hover:bg-muted transition-colors ${className || ''}`}
    //   {...other}
    // >
    <button>Sign in</button>
    // </RouterLink>
  );
}
