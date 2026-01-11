import { useNavigate } from 'react-router';
import { Button } from '@/shared/ui/button';
import { Iconify } from '@/shared/components/iconify';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';

// ----------------------------------------------------------------------

const metadata = { title: `403 Forbidden | ${CONFIG.appName}` };

export default function Page403() {
  const navigate = useNavigate();

  return (
    <>
      <title>{metadata.title}</title>
      <Box className="flex items-center justify-center min-h-screen p-6 bg-background">
        <Box className="w-full max-w-md text-center">
          <Box className="mb-6">
            <Iconify
              icon="solar:shield-warning-bold"
              className="w-24 h-24 text-destructive mx-auto mb-4"
            />
            <Typography variant="h3" className="font-bold text-foreground mb-2">
              403 Forbidden
            </Typography>
            <Typography variant="body1" className="text-muted-foreground mb-6">
              You don&apos;t have permission to access this resource.
            </Typography>
          </Box>
          <Button variant="contained" onClick={() => navigate('/admin')}>
            Go to Dashboard
          </Button>
        </Box>
      </Box>
    </>
  );
}

