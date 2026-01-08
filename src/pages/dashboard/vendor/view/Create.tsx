import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { CONFIG } from 'src/global-config';

import { Box, Typography, Checkbox } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { Iconify } from '@/shared/components/iconify';
import {
  useFetchVendorById,
  useCreateVendor,
  useUpdateVendor,
} from '@/pages/dashboard/vendor/hooks/vendor';
import {
  VendorSchema,
  type VendorFormValues,
} from '@/pages/dashboard/vendor/validation/vendor.validation';

// ----------------------------------------------------------------------

const metadata = { title: `Vendor ${CONFIG.appName}` };

export default function CreatePage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Hooks for fetching and mutations
  const { data: vendorData, isLoading: isLoadingVendor } = useFetchVendorById(id || '');
  const createVendorMutation = useCreateVendor();
  const updateVendorMutation = useUpdateVendor();

  const defaultValues: VendorFormValues = {
    name: {
      ar: '',
      en: '',
    },
    owner_name: '',
    owner_phone: '',
    commercial_register: '',
    contract_date: '',
    contract_number: '',
    contract_duration_months: 12,
    commission_rate: 5,
    is_active: true,
  };

  const methods = useForm<VendorFormValues>({
    resolver: zodResolver(VendorSchema),
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  // Fetch vendor data if in edit mode
  useEffect(() => {
    if (isEditMode && vendorData && !isLoadingVendor) {
      // Note: API returns name as string, but form expects {ar, en}
      const nameValue =
        typeof vendorData.name === 'string'
          ? { ar: vendorData.name, en: vendorData.name }
          : vendorData.name;

      reset({
        name: nameValue,
        owner_name: vendorData.owner_name,
        owner_phone: '', // Not in GET response, might need separate endpoint
        commercial_register: '', // Not in GET response
        contract_date: '', // Not in GET response
        contract_number: '', // Not in GET response
        contract_duration_months: 12,
        commission_rate: 5,
        is_active: vendorData.is_active,
      });
    }
  }, [vendorData, isEditMode, isLoadingVendor, reset]);

  const isSubmitting = createVendorMutation.isPending || updateVendorMutation.isPending;
  const errorMessage =
    createVendorMutation.error?.message || updateVendorMutation.error?.message || null;

  const onSubmit = async (data: VendorFormValues) => {
    try {
      const payload = {
        name: {
          ar: data.name.ar,
          en: data.name.en,
        },
        owner_name: data.owner_name,
        owner_phone: data.owner_phone,
        commercial_register: data.commercial_register,
        contract_date: data.contract_date,
        contract_number: data.contract_number,
        contract_duration_months: data.contract_duration_months,
        commission_rate: data.commission_rate,
        is_active: data.is_active,
      };

      if (isEditMode && id) {
        await updateVendorMutation.mutateAsync({ id, data: payload });
        toast.success('Vendor updated successfully');
        navigate('/vendor');
      } else {
        await createVendorMutation.mutateAsync(payload);
        toast.success('Vendor created successfully');
        navigate('/vendor');
      }
    } catch (error: any) {
      console.error('Error saving vendor:', error);
    }
  };

  const handleCancel = () => {
    navigate('/vendor');
  };

  const infoText = isEditMode
    ? 'You can update any field. Make sure all required fields are filled.'
    : 'Fill in all required fields to create a new vendor. The contract details are important for tracking vendor agreements.';

  return (
    <>
      <title>
        {isEditMode ? `Edit Vendor | ${metadata.title}` : `Create Vendor | ${metadata.title}`}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Vendor' : 'Create New Vendor'}
        description={
          isEditMode
            ? 'Update vendor information and contract details'
            : 'Add a new vendor to your system'
        }
        isEditMode={isEditMode}
        isLoading={isLoadingVendor}
        loadingText="Loading vendor data..."
        maxWidth="4xl"
        infoText={infoText}
        submitLabel={isEditMode ? 'Update Vendor' : 'Create Vendor'}
        submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
      >
        {/* Store Name - Arabic */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify
              icon="solar:case-minimalistic-bold"
              className="text-primary"
              width={24}
              height={24}
            />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Store Name (Arabic)
            </Typography>
          </Box>
          <RHFTextField
            name="name.ar"
            placeholder="e.g., متجر تجريبي"
            helperText="Enter the store name in Arabic"
            className="transition-all duration-200"
          />
        </Box>

        {/* Store Name - English */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify
              icon="solar:case-minimalistic-bold"
              className="text-primary"
              width={24}
              height={24}
            />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Store Name (English)
            </Typography>
          </Box>
          <RHFTextField
            name="name.en"
            placeholder="e.g., Test Store"
            helperText="Enter the store name in English"
            className="transition-all duration-200"
          />
        </Box>

        {/* Owner Name */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify
              icon="solar:user-rounded-bold"
              className="text-primary"
              width={24}
              height={24}
            />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Owner Name
            </Typography>
          </Box>
          <RHFTextField
            name="owner_name"
            placeholder="e.g., أحمد محمد"
            helperText="Enter the owner's full name"
            className="transition-all duration-200"
          />
        </Box>

        {/* Owner Phone */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:phone-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Owner Phone
            </Typography>
          </Box>
          <RHFTextField
            name="owner_phone"
            placeholder="e.g., +963944000111"
            helperText="Enter the owner's phone number with country code"
            className="transition-all duration-200"
          />
        </Box>

        {/* Commercial Register */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:file-text-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Commercial Register
            </Typography>
          </Box>
          <RHFTextField
            name="commercial_register"
            placeholder="e.g., CR-123456"
            helperText="Enter the commercial register number"
            className="transition-all duration-200"
          />
        </Box>

        {/* Contract Date */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify
              icon="solar:calendar-date-bold"
              className="text-primary"
              width={24}
              height={24}
            />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Contract Date
            </Typography>
          </Box>
          <RHFTextField
            name="contract_date"
            type="date"
            helperText="Select the contract start date"
            className="transition-all duration-200"
          />
        </Box>

        {/* Contract Number */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:bill-list-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Contract Number
            </Typography>
          </Box>
          <RHFTextField
            name="contract_number"
            placeholder="e.g., zxcvv-zzccc"
            helperText="Enter the contract number"
            className="transition-all duration-200"
          />
        </Box>

        {/* Contract Duration */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify
              icon="solar:clock-circle-bold"
              className="text-primary"
              width={24}
              height={24}
            />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Contract Duration (Months)
            </Typography>
          </Box>
          <RHFTextField
            name="contract_duration_months"
            type="number"
            placeholder="e.g., 12"
            helperText="Enter the contract duration in months"
            className="transition-all duration-200"
          />
        </Box>

        {/* Commission Rate */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify
              icon="solar:wad-of-money-bold"
              className="text-primary"
              width={24}
              height={24}
            />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Commission Rate (%)
            </Typography>
          </Box>
          <RHFTextField
            name="commission_rate"
            type="number"
            placeholder="e.g., 5"
            helperText="Enter the commission rate percentage (0-100)"
            className="transition-all duration-200"
          />
        </Box>

        {/* Active Status */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify
              icon="solar:check-circle-bold"
              className="text-primary"
              width={24}
              height={24}
            />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Active Status
            </Typography>
          </Box>
          <Controller
            name="is_active"
            control={methods.control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                label="Mark vendor as active"
              />
            )}
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}
