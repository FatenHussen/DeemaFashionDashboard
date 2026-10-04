import { useTranslation } from 'react-i18next';
import { mergeClasses } from 'minimal-shared/utils';

import { RouterLink } from 'src/routes/components';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

export type LogoProps = React.ComponentProps<typeof RouterLink> & {
  isSingle?: boolean;
  disabled?: boolean;
  className?: string;
};

export function Logo({ disabled, className, href = '/', isSingle = true, ...other }: LogoProps) {
  const { t } = useTranslation('common');

  const deemaLogo = (
    <img src="/logo/logo-deema.svg" alt="Deema" className="h-full w-full object-contain object-left" />
  );

  return (
    <RouterLink
      href={href}
      aria-label={t('logoAria')}
      className={mergeClasses([
        logoClasses.root,
        'shrink-0 inline-flex align-middle items-center',
        isSingle ? 'w-48 h-10' : 'w-auto h-12',
        disabled ? 'pointer-events-none' : '',
        className,
      ])}
      {...other}
    >
      {deemaLogo}
    </RouterLink>
  );
}
