import { useTranslation } from 'react-i18next';
import { mergeClasses } from 'minimal-shared/utils';

import { Box } from 'src/shared/ui';

// ----------------------------------------------------------------------

type FormResendCodeProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: number;
  disabled?: boolean;
  onResendCode?: () => void;
  className?: string;
};

export function FormResendCode({
  value,
  disabled,
  onResendCode,
  className,
  ...other
}: FormResendCodeProps) {
  const { t } = useTranslation('table');

  return (
    <Box className={mergeClasses(['mt-6 text-sm self-center', className])} {...other}>
      {`${t('auth.dontHaveCode')} `}
      <button
        type="button"
        onClick={onResendCode}
        disabled={disabled}
        className={mergeClasses([
          'text-sm font-medium text-primary hover:text-blue-700',
          disabled ? 'text-gray-400 cursor-not-allowed pointer-events-none' : '',
        ])}
      >
        {t('auth.resend')} {disabled && value && value > 0 && `(${value}s)`}
      </button>
    </Box>
  );
}
