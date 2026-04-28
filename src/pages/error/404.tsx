import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { CONFIG } from 'src/global-config';

import { NotFoundView } from 'src/sections/error';

// ----------------------------------------------------------------------

export default function Page() {
  const { t, i18n } = useTranslation('common');

  useEffect(() => {
    document.title = `${t('page404DocumentTitle')} | ${CONFIG.appName}`;
  }, [t, i18n.language]);

  return <NotFoundView />;
}
