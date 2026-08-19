import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { usePermissions } from '@/auth/hooks/use-permissions';
import {
  isCategoryCmsPage,
  resolveLinkedCategoryId,
  type CategoryPageFlags,
} from '@/pages/dashboard/sections/utils/category-page';

import { Box, Button, Typography } from 'src/shared/ui';

type CategoryPageBannerProps = {
  page?: CategoryPageFlags | null;
  /** Locked metadata form (title/slug rejected with 422). */
  locked?: boolean;
  className?: string;
};

export function CategoryPageBanner({ page, locked = false, className }: CategoryPageBannerProps) {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const { can } = usePermissions();

  if (!isCategoryCmsPage(page)) return null;

  const linkedCategoryId = resolveLinkedCategoryId(page);

  return (
    <Box
      className={`flex flex-col gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3 sm:flex-row sm:items-start ${className ?? ''}`}
    >
      <Iconify
        icon="solar:info-circle-bold"
        className="mt-0.5 shrink-0 text-emerald-600"
        width={18}
      />
      <Typography variant="body2" className="min-w-0 flex-1 text-muted-foreground">
        {locked
          ? t('form.pageBuilderCategoryPageLockedNotice')
          : t('form.pageBuilderCategoryPageNotice')}
      </Typography>
      {linkedCategoryId != null && can('category.update') && (
        <Button
          type="button"
          variant="outlined"
          onClick={() => navigate(`/categories/update/${linkedCategoryId}`)}
          className="shrink-0 gap-2 self-start whitespace-nowrap"
        >
          <Iconify icon="solar:folder-with-files-bold" width={16} />
          {t('form.pageBuilderOpenLinkedCategory')}
        </Button>
      )}
    </Box>
  );
}
