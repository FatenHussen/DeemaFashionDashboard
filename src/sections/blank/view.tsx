import { Box, Typography } from 'src/shared/ui';
import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  className?: string;
};

export function BlankView({ title = 'Blank', description, className }: Props) {
  const renderContent = () => (
    <Box
      className={`mt-10 w-full h-80 rounded-lg border border-dashed border-border bg-muted/40 ${className || ''}`}
    />
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4"> {title} </Typography>
      {description && <Typography className="mt-1"> {description} </Typography>}

      {renderContent()}
    </DashboardContent>
  );
}
