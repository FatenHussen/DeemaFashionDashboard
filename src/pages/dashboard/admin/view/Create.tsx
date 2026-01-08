import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { CONFIG } from 'src/global-config';

import { Box, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { Iconify } from '@/shared/components/iconify';
import {
  useFetchAdminById,
  useCreateAdmin,
  useUpdateAdmin,
} from '@/pages/dashboard/admin/hooks/admin';
import {
  AdminSchema,
  type AdminFormValues,
} from '@/pages/dashboard/admin/validation/admin.validation';

// ----------------------------------------------------------------------

const metadata = { title: `Admin ${CONFIG.appName}` };

export default function CreatePage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Hooks for fetching and mutations
  const { data: adminData, isLoading: isLoadingAdmin } = useFetchAdminById(id || '');
  const createAdminMutation = useCreateAdmin();
  const updateAdminMutation = useUpdateAdmin();

  const defaultValues: AdminFormValues = {
    name: '',
    email: '',
    password: '',
  };

  const methods = useForm<AdminFormValues>({
    resolver: zodResolver(AdminSchema),
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  // Fetch admin data if in edit mode
  useEffect(() => {
    if (isEditMode && adminData && !isLoadingAdmin) {
      reset({
        name: adminData.name,
        email: adminData.email,
        password: '', // Don't pre-fill password
      });
    }
  }, [adminData, isEditMode, isLoadingAdmin, reset]);

  const isSubmitting = createAdminMutation.isPending || updateAdminMutation.isPending;
  const errorMessage =
    createAdminMutation.error?.message || updateAdminMutation.error?.message || null;

  const onSubmit = async (data: AdminFormValues) => {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        ...(data.password && data.password.trim() !== '' && { password: data.password }),
      };

      if (isEditMode && id) {
        await updateAdminMutation.mutateAsync({ id, data: payload });
        toast.success('Admin updated successfully');
        navigate('/admin');
      } else {
        await createAdminMutation.mutateAsync(payload);
        toast.success('Admin created successfully');
        navigate('/admin');
      }
    } catch (error: any) {
      console.error('Error saving admin:', error);
    }
  };

  const handleCancel = () => {
    navigate('/admin');
  };

  const infoText = isEditMode
    ? 'You can update any field. Leave password blank to keep the current one.'
    : 'Make sure to use a strong password and a valid email address for the admin account.';

  return (
    <>
      <title>
        {isEditMode ? `Edit Admin | ${metadata.title}` : `Create Admin | ${metadata.title}`}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Admin Account' : 'Create New Admin'}
        description={
          isEditMode
            ? 'Update admin information and permissions'
            : 'Add a new administrator to your system'
        }
        isEditMode={isEditMode}
        isLoading={isLoadingAdmin}
        loadingText="Loading admin data..."
        maxWidth="3xl"
        infoText={infoText}
        submitLabel={isEditMode ? 'Update Admin' : 'Create Admin'}
        submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
      >
        {/* Name Field with Icon */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify
              icon="solar:user-rounded-bold"
              className="text-primary"
              width={24}
              height={24}
            />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Full Name
            </Typography>
          </Box>
          <RHFTextField
            name="name"
            placeholder="e.g., John Doe"
            helperText="Enter the complete name of the administrator"
            className="transition-all duration-200"
          />
        </Box>

        {/* Email Field with Icon */}
        <Box className="group ">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:letter-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Email Address
            </Typography>
          </Box>
          <RHFTextField
            name="email"
            type="email"
            placeholder="e.g., admin@example.com"
            helperText="A valid email address is required for login"
            className="transition-all duration-200"
          />
        </Box>

        {/* Password Field with Icon */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify
              icon="solar:lock-password-outline"
              className="text-primary"
              width={24}
              height={24}
            />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {isEditMode ? 'New Password (Optional)' : 'Password'}
            </Typography>
          </Box>
          <RHFTextField
            name="password"
            type="password"
            placeholder={
              isEditMode ? 'Leave blank to keep current password' : 'Enter secure password'
            }
            helperText={
              isEditMode
                ? 'Only fill this if you want to change the password'
                : 'Must be at least 6 characters long'
            }
            className="transition-all duration-200"
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}
