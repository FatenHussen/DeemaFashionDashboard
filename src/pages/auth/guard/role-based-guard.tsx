import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { mergeClasses } from 'minimal-shared/utils';

import { Typography } from 'src/shared/ui';
import { ForbiddenIllustration } from 'src/assets/illustrations';
import { varBounce, MotionContainer } from 'src/shared/components/animate';

// ----------------------------------------------------------------------

/**
 * NOTE:
 * This component is for reference only.
 * You can customize the logic and conditions to better suit your application's requirements.
 */

export type RoleBasedGuardProp = {
  className?: string;
  currentRole: string;
  hasContent?: boolean;
  allowedRoles: string | string[];
  children: React.ReactNode;
};

export function RoleBasedGuard({
  className,
  children,
  hasContent,
  currentRole,
  allowedRoles,
}: RoleBasedGuardProp) {
  const { t } = useTranslation('common');

  if (currentRole && allowedRoles && !allowedRoles.includes(currentRole)) {
    return hasContent ? (
      <MotionContainer
        className={mergeClasses(['text-center', className])}
      >
        <m.div variants={varBounce('in')}>
          <Typography variant="h3" className="mb-4">
            {t('permissionDenied')}
          </Typography>
        </m.div>

        <m.div variants={varBounce('in')}>
          <Typography color="secondary">
            {t('noPageAccess')}
          </Typography>
        </m.div>

        <m.div variants={varBounce('in')}>
          <ForbiddenIllustration className="my-10 sm:my-20" />
        </m.div>
      </MotionContainer>
    ) : null;
  }

  return <> {children} </>;
}

