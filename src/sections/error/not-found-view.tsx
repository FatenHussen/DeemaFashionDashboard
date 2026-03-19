import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { RouterLink } from 'src/routes/components';

import { SimpleLayout } from 'src/layouts/simple';
import { PageNotFoundIllustration } from 'src/assets/illustrations';
import { varBounce, MotionContainer } from 'src/shared/components/animate';

// ----------------------------------------------------------------------

export function NotFoundView() {
  const { t } = useTranslation('table');

  return (
    <SimpleLayout
      slotProps={{
        content: { compact: true },
      }}
    >
      <MotionContainer className="max-w-screen-xl mx-auto px-4">
        <m.div variants={varBounce('in')}>
          <h3 className="text-2xl font-semibold mb-4">{t('common.pageNotFound')}</h3>
        </m.div>

        <m.div variants={varBounce('in')}>
          <p className="text-muted-foreground">
            {t('common.pageNotFoundDesc')}
          </p>
        </m.div>

        <m.div variants={varBounce('in')} className="my-12 sm:my-20">
          <PageNotFoundIllustration />
        </m.div>

        <RouterLink
          href="/"
          className="inline-flex items-center justify-center h-10 px-4 text-base font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          {t('common.goToHome')}
        </RouterLink>
      </MotionContainer>
    </SimpleLayout>
  );
}
