import { useEffect } from 'react';

// ----------------------------------------------------------------------

type RtlProps = {
  direction: 'ltr' | 'rtl';
  children: React.ReactNode;
};

export function Rtl({ children, direction }: RtlProps) {
  useEffect(() => {
    document.documentElement.setAttribute('dir', direction);
    return () => {
      document.documentElement.removeAttribute('dir');
    };
  }, [direction]);

  return <>{children}</>;
}
