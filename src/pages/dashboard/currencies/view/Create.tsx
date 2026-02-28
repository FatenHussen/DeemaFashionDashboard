import type { CurrencyData } from '@/pages/dashboard/currencies/types/currency.types';

import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate, useLocation } from 'react-router';
import { CurrencySchema, type CurrencyFormValues } from '@/pages/dashboard/currencies/validation/currency.validation';
import { useCreateCurrency, useUpdateCurrency, useFetchCurrencyById } from '@/pages/dashboard/currencies/hooks/currency';

import { CONFIG } from 'src/global-config';
import { Box, Switch, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

const metadata = { title: `Currency ${CONFIG.appName}` };

export default function CreatePage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromState = location.state?.currency as CurrencyData | undefined;
  const isEditMode = !!id;

  const { data: detailsResponse, isLoading: isLoadingDetails } = useFetchCurrencyById(id || '');
  const createMutation = useCreateCurrency();
  const updateMutation = useUpdateCurrency();

  const defaultValues: CurrencyFormValues = {
    code: '',
    name: { en: '', ar: '' },
    symbol: '',
    exchange_rate: 1,
    is_default: false,
    is_active: true,
  };

  const methods = useForm<CurrencyFormValues>({
    resolver: zodResolver(CurrencySchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control } = methods;

  useEffect(() => {
    const source = isEditMode ? (detailsResponse?.data ?? fromState) : null;
    if (source) {
      const name = typeof source.name === 'object' ? source.name : { en: String(source.name || ''), ar: '' };
      reset({
        code: source.code || '',
        name: { en: (name as any)?.en || '', ar: (name as any)?.ar || '' },
        symbol: source.symbol || '',
        exchange_rate: source.exchange_rate || 1,
        is_default: source.is_default ?? false,
        is_active: source.is_active ?? true,
      });
    }
  }, [detailsResponse?.data, fromState, isEditMode, reset]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const errorMessage = createMutation.error?.message || updateMutation.error?.message || null;

  const onSubmit = async (data: CurrencyFormValues) => {
    try {
      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data });
        toast.success('Currency updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Currency created successfully');
      }
      navigate('/currencies');
    } catch (error: any) { console.error('Error saving currency:', error); }
  };

  if (isEditMode && isLoadingDetails && !fromState) return <LoadingScreen />;

  return (
    <>
      <title>{isEditMode ? `Edit Currency | ${metadata.title}` : `Create Currency | ${metadata.title}`}</title>
      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={() => navigate('/currencies')}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Currency' : 'Create New Currency'}
        description={isEditMode ? 'Update currency details' : 'Add a new currency'}
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingDetails}
        loadingText="Loading currency..."
        maxWidth="2xl"
        submitLabel={isEditMode ? 'Update Currency' : 'Create Currency'}
        submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
      >
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Code (3 characters)</Typography>
          <RHFTextField name="code" placeholder="USD" fullWidth />
        </Box>
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Name (English)</Typography>
          <RHFTextField name="name.en" placeholder="US Dollar" fullWidth />
        </Box>
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Name (Arabic)</Typography>
          <RHFTextField name="name.ar" placeholder="دولار أمريكي" dir="rtl" fullWidth />
        </Box>
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Symbol</Typography>
          <RHFTextField name="symbol" placeholder="$" fullWidth />
        </Box>
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Exchange Rate</Typography>
          <RHFTextField name="exchange_rate" type="number" placeholder="1.00" fullWidth />
        </Box>
        <Box className="flex gap-6">
          <Controller name="is_default" control={control} render={({ field }) => (
            <div className="flex items-center gap-2">
              <Switch checked={field.value} onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)} />
              <Typography variant="body2">Default Currency</Typography>
            </div>
          )} />
          <Controller name="is_active" control={control} render={({ field }) => (
            <div className="flex items-center gap-2">
              <Switch checked={field.value} onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)} />
              <Typography variant="body2">Active</Typography>
            </div>
          )} />
        </Box>
      </CreateFormLayout>
    </>
  );
}
