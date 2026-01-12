import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';

// ----------------------------------------------------------------------

const metadata = { title: `Translation Manager | Dashboard - ${CONFIG.appName}` };

export default function TranslationManagerPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <Box className="h-full w-full px-8 flex flex-col">
        <Box className="mb-4">
          <Typography variant="h4" className="font-bold">
            Translation Manager
          </Typography>
          <Typography variant="body2" className="text-muted-foreground mt-1">
            Manage all your application translations in one place
          </Typography>
        </Box>

        <Box className="flex-1 w-full rounded-lg overflow-hidden border border-border bg-background shadow-sm">
          <iframe
            src="https://tikmool.octopus-software.online/translations"
            className="w-full h-full border-0"
            title="Translation Manager"
            style={{ minHeight: 'calc(100vh - 200px)' }}
          />
        </Box>
      </Box>
    </>
  );
}
