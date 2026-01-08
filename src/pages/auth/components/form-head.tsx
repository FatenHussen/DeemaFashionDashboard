import { mergeClasses } from 'minimal-shared/utils';

import { Box, Typography } from 'src/shared/ui';

// ----------------------------------------------------------------------

type FormHeadProps = React.HTMLAttributes<HTMLDivElement> & {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
};

export function FormHead({ className, icon, title, description, ...other }: FormHeadProps) {
  return (
    <>
      {icon && (
        <Box component="span" className="mb-6 mx-auto inline-flex">
          {icon}
        </Box>
      )}

      <Box
        className={mergeClasses([
          'mb-10 gap-1.5 flex text-center whitespace-pre-line flex-col',
          className,
        ])}
        {...other}
      >
        <Typography variant="h5">{title}</Typography>

        {description && (
          <Typography variant="body2" color="secondary">
            {description}
          </Typography>
        )}
      </Box>
    </>
  );
}
