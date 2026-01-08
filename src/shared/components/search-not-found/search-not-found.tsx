import { mergeClasses } from 'minimal-shared/utils';

import { Box, Typography } from 'src/shared/ui';

// ----------------------------------------------------------------------

type SearchNotFoundProps = React.HTMLAttributes<HTMLDivElement> & {
  query?: string;
  className?: string;
  slotProps?: {
    title?: React.HTMLAttributes<HTMLElement>;
    description?: React.HTMLAttributes<HTMLElement>;
  };
};

export function SearchNotFound({ query, className, slotProps, ...other }: SearchNotFoundProps) {
  if (!query) {
    const { color: _color, ...descriptionProps } = slotProps?.description || {};
    return (
      <Typography variant="body2" {...descriptionProps}>
        Please enter keywords
      </Typography>
    );
  }

  const { color: _titleColor, ...titleProps } = slotProps?.title || {};
  const { color: _descriptionColor, ...descriptionProps } = slotProps?.description || {};

  return (
    <Box
      className={mergeClasses([
        'gap-1 flex rounded-xl text-center flex-col',
        className,
      ])}
      {...other}
    >
      <Typography variant="h6" color="text" {...titleProps}>
        Not found
      </Typography>

      <Typography variant="body2" {...descriptionProps}>
        No results found for &nbsp;
        <strong>{`"${query}"`}</strong>
        .
        <br /> Try checking for typos or using complete words.
      </Typography>
    </Box>
  );
}
