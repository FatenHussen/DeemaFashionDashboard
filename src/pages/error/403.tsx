import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';

// ----------------------------------------------------------------------

export default function Page403() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('common');

  useEffect(() => {
    document.title = `${t('error403Title')} | ${CONFIG.appName}`;
  }, [t, i18n.language]);

  return (
    <Box className="flex items-center justify-center min-h-screen p-6 bg-background">
      <Box className="w-full max-w-md text-center">
        <Box className="mb-6">
          <Iconify
            icon="solar:shield-warning-bold"
            className="w-24 h-24 text-destructive mx-auto mb-4"
          />
          <Typography variant="h3" className="font-bold text-foreground mb-2">
            {t('error403Title')}
          </Typography>
          <Typography variant="body1" className="text-muted-foreground mb-6">
            {t('error403Message')}
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => navigate('/admin')}>
          {t('goToDashboard')}
        </Button>
      </Box>
    </Box>
  );
}

