import { useTranslation } from 'react-i18next';
import { mergeClasses } from 'minimal-shared/utils';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/shared/components/iconify';

// ----------------------------------------------------------------------

type FormReturnLinkProps = React.ComponentProps<typeof RouterLink> & {
  href: string;
  icon?: React.ReactNode;
  label?: React.ReactNode;
  className?: string;
};

export function FormReturnLink({
  className,
  href,
  label,
  icon,
  children,
  ...other
}: FormReturnLinkProps) {
  const { t } = useTranslation('table');

  return (
    <RouterLink
      href={href}
      className={mergeClasses([
        'mt-6 gap-1 mx-auto items-center inline-flex text-sm font-medium text-foreground hover:text-foreground/80',
        className,
      ])}
      {...other}
    >
      {icon || <Iconify width={16} icon="eva:arrow-ios-back-fill" />}
      {label || t('auth.returnToSignIn')}
      {children}
    </RouterLink>
  );
}
