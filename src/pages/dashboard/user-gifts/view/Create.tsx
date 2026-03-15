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
import { RHFSelect } from 'src/shared/components/hook-form/rhf-select';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { RHFInfiniteSelect } from 'src/shared/components/hook-form/rhf-infinite-select';

// ----------------------------------------------------------------------

const metadata = { title: `Assign Gift | Dashboard - ${CONFIG.appName}` };

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
        items: items.map((g: any) => ({ id: g.id, label: toStr(g.name) || `Gift #${g.id}` })),
        pagination,
      },
    };
  });

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

  const onSubmit = async (data: UserGiftCreateFormValues) => {
    try {
      if (!data.user_id || !data.gift_id) {
        toast.error('Please select both user and gift');
        return;
      }
      await createMutation.mutateAsync({
        user_id: data.user_id,
        gift_id: data.gift_id,
        address_id: data.address_id && data.address_id > 0 ? data.address_id : undefined,
        status: data.status || 'pending',
        admin_notes: data.admin_notes || undefined,
      });
      toast.success('Gift assigned to user successfully');
      navigate('/user-gifts');
    } catch {
      return;
    }
  };

  return (
    <>
      <title>Assign Gift | {metadata.title}</title>
      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={() => navigate('/user-gifts')}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={t('form.assignGift')}
        description={t('form.assignGiftDesc')}
        maxWidth="2xl"
        submitLabel={t('form.assignGiftSubmit')}
        submittingLabel="Assigning..."
      >
        <Box className="space-y-4">
          <Box>
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
              User (required)
            </Typography>
            <RHFInfiniteSelect
              name="user_id"
              queryKey={['users', 'infinite', 'user-gift-form']}
              fetcher={userFetcher}
              placeholder={t('form.selectUser')}
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
              Gift (required)
            </Typography>
            <RHFInfiniteSelect
              name="gift_id"
              queryKey={['gifts', 'infinite', 'user-gift-form']}
              fetcher={giftFetcher}
              placeholder={t('form.selectGift')}
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
              Address ID (optional)
            </Typography>
            <RHFTextField
              name="address_id"
              type="number"
              placeholder={t('form.deliveryAddressPlaceholder')}
              fullWidth
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
              Status
            </Typography>
            <RHFSelect
              name="status"
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'processing', label: 'Processing' },
                { value: 'shipped', label: 'Shipped' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
              placeholder={t('form.selectStatus')}
            />
          </Box>

          <RHFTextField
            name="admin_notes"
            label={t('form.adminNotesLabel')}
            placeholder={t('form.adminNotesPlaceholder')}
            fullWidth
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}
