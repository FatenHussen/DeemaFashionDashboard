import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('table');

  if (!query) {
    const { color: _color, ...descriptionProps } = slotProps?.description || {};
    return (
      <Typography variant="body2" {...descriptionProps}>
        {t('common.pleaseEnterKeywords')}
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
        {t('common.notFound')}
      </Typography>

      <Typography variant="body2" {...descriptionProps}>
        {t('common.noResultsFound')} &nbsp;
        <strong>{`"${query}"`}</strong>
        .
        <br /> {t('common.tryCheckingTypos')}
      </Typography>
    </Box>
  );
}
