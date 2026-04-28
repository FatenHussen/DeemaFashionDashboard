import { useTranslation } from 'react-i18next';
import { mergeClasses } from 'minimal-shared/utils';

import { Box } from 'src/shared/ui';

// ----------------------------------------------------------------------

type SignUpTermsProps = React.HTMLAttributes<HTMLSpanElement> & {
  className?: string;
};

export function SignUpTerms({ className, ...other }: SignUpTermsProps) {
  const { t } = useTranslation('common');

  return (
    <Box
      component="span"
      className={mergeClasses([
        'mt-6 block text-center text-xs text-muted-foreground',
        className,
      ])}
      {...other}
    >
      {t('signUpAgreePrefix')}
      <a href="#" className="underline text-foreground hover:text-foreground/80">
        {t('termsOfService')}
      </a>
      {t('signUpAgreeConnector')}
      <a href="#" className="underline text-foreground hover:text-foreground/80">
        {t('privacyPolicy')}
      </a>
      {t('signUpAgreeEnd')}
    </Box>
  );
}
