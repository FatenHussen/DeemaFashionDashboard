import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { _UserApi } from '@/pages/dashboard/users/api/user.services';
import { _GiftApi } from '@/pages/dashboard/gifts/api/gift.services';
import { useCreateUserGift } from '@/pages/dashboard/user-gifts/hooks/user-gift';
import {
  UserGiftCreateSchema,
  type UserGiftCreateFormValues,
} from '@/pages/dashboard/user-gifts/validation/user-gift.validation';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { Iconify } from 'src/shared/components/iconify';
import { RHFSelect } from 'src/shared/components/hook-form/rhf-select';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { RHFInfiniteSelect } from 'src/shared/components/hook-form/rhf-infinite-select';

// ----------------------------------------------------------------------

const toStr = (val: string | { ar?: string; en?: string } | undefined): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val.en || val.ar || '';
};

const userFetcher = (page: number, limit: number) =>
  _UserApi.getListUsers({ page, per_page: limit }).then((r) => ({
    data: {
      items: r.data.items.map((u) => ({
        id: u.id,
        label: `${u.name}${u.phone ? ` (${u.phone})` : u.email ? ` (${u.email})` : ''}`,
      })),
      pagination: r.data.pagination,
    },
  }));

export default function CreatePage() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const createMutation = useCreateUserGift();

  const defaultValues: UserGiftCreateFormValues = {
    user_id: 0,
    gift_id: 0,
    address_id: undefined,
    status: 'pending',
    admin_notes: '',
  };

  const methods = useForm<UserGiftCreateFormValues>({
    resolver: zodResolver(UserGiftCreateSchema) as any,
    defaultValues,
  });

  const { handleSubmit } = methods;
  const isSubmitting = createMutation.isPending;
  const errorMessage = createMutation.error?.message || null;

  const giftFetcher = (page: number, limit: number) =>
    _GiftApi.getListGifts({ page, per_page: limit }).then((r) => {
      const items = Array.isArray(r.data)
        ? r.data
        : (r.data as { items?: any[] })?.items ?? [];
      const pagination = Array.isArray(r.data)
        ? (r as any).meta
          ? { current_page: (r as any).meta.current_page, last_page: Math.ceil((r as any).meta.total / limit) || 1, per_page: limit, total: (r as any).meta.total }
          : { current_page: 1, last_page: 1, per_page: limit, total: items.length }
        : (r.data as { pagination?: any })?.pagination ?? { current_page: 1, last_page: 1, per_page: limit, total: items.length };
      return {
        data: {
          items: items.map((g: any) => ({
            id: g.id,
            label: toStr(g.name) || t('form.userGiftFallbackLabel', { id: g.id }),
          })),
          pagination,
        },
      };
    });

  const onSubmit = async (data: UserGiftCreateFormValues) => {
    try {
      if (!data.user_id || !data.gift_id) {
        toast.error(t('form.selectBothUserAndGift'));
        return;
      }
      await createMutation.mutateAsync({
        user_id: data.user_id,
        gift_id: data.gift_id,
        address_id: data.address_id && data.address_id > 0 ? data.address_id : undefined,
        status: data.status || 'pending',
        admin_notes: data.admin_notes || undefined,
      });
      toast.success(t('form.userGiftAssignedSuccess'));
      navigate('/user-gifts');
    } catch {
      return;
    }
  };

  return (
    <>
      <title>{t('form.userGiftAssignDocumentTitle', { appName: CONFIG.appName })}</title>
      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={() => navigate('/user-gifts')}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={t('form.assignGift')}
        description={t('form.assignGiftDesc')}
        submitLabel={t('form.assignGiftSubmit')}
        submittingLabel={t('form.assigning')}
      >
        {/* ── Section: User & Gift ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:gift-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.userGiftFieldUserRequired')} & {t('form.userGiftFieldGiftRequired')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.userGiftFieldUserRequired')}</Typography>
              <RHFInfiniteSelect name="user_id" queryKey={['users', 'infinite', 'user-gift-form']} fetcher={userFetcher} placeholder={t('form.selectUser')} />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.userGiftFieldGiftRequired')}</Typography>
              <RHFInfiniteSelect name="gift_id" queryKey={['gifts', 'infinite', 'user-gift-form']} fetcher={giftFetcher} placeholder={t('form.selectGift')} />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Delivery & Status ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:delivery-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('columns.status')} & {t('form.userGiftFieldAddressOptional')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('columns.status')}</Typography>
              <RHFSelect
                name="status"
                options={[
                  { value: 'pending', label: t('form.userGiftStatus_pending') },
                  { value: 'processing', label: t('form.userGiftStatus_processing') },
                  { value: 'shipped', label: t('form.userGiftStatus_shipped') },
                  { value: 'delivered', label: t('form.userGiftStatus_delivered') },
                  { value: 'cancelled', label: t('form.userGiftStatus_cancelled') },
                ]}
                placeholder={t('form.selectStatus')}
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.userGiftFieldAddressOptional')}</Typography>
              <RHFTextField name="address_id" type="number" placeholder={t('form.deliveryAddressPlaceholder')} fullWidth />
            </Box>
            <Box className="md:col-span-2">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.adminNotesLabel')}</Typography>
              <RHFTextField name="admin_notes" placeholder={t('form.adminNotesPlaceholder')} fullWidth />
            </Box>
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
