import { Box, Button, Typography } from 'src/shared/ui';
import { Iconify } from 'src/shared/components/iconify';

// ----------------------------------------------------------------------

export function UpgradeBlock() {
  return (
    <Box className="rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-4">
      <Box className="flex items-center justify-between mb-2">
        <Typography variant="subtitle2" className="font-semibold">
          Upgrade Plan
        </Typography>
        <Iconify icon="solar:notes-bold-duotone" className="text-primary" width={20} />
      </Box>
      <Typography variant="body2" className="text-muted-foreground mb-3">
        Get more features and unlimited access
      </Typography>
      <Button variant="contained" size="small" className="w-full">
        Upgrade Now
      </Button>
    </Box>
  );
}
