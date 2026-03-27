import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useFetchRoles } from '@/pages/dashboard/roles/hooks/role';
import {
  AdminSchema,
  type AdminFormValues,
} from '@/pages/dashboard/admin/validation/admin.validation';
import {
  useCreateAdmin,
  useUpdateAdmin,
  useFetchAdminById,
} from '@/pages/dashboard/admin/hooks/admin';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { RHFMultiSelect } from 'src/shared/components/hook-form/rhf-multi-select';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Hooks for fetching and mutations
  const { data: adminData, isLoading: isLoadingAdmin } = useFetchAdminById(id || '');
  const { data: rolesResponse } = useFetchRoles(1, 200);
  const createAdminMutation = useCreateAdmin();
  const updateAdminMutation = useUpdateAdmin();

  const roleOptions = useMemo(
    () =>
      (rolesResponse?.data?.items ?? []).map((r) => ({
        value: r.id,
        label: r.name,
      })),
    [rolesResponse]
  );

  const defaultValues: AdminFormValues = {
    name: '',
    email: '',
    role_ids: [],
    ...(isEditMode ? {} : { password: '' }),
  };

  const methods = useForm<AdminFormValues>({
    resolver: zodResolver(AdminSchema),
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  // Fetch admin data if in edit mode
  useEffect(() => {
    if (isEditMode && adminData && !isLoadingAdmin) {
      const roleIds = (adminData.roles ?? []).map((r) =>
        typeof r === 'object' ? r.id : 0
      ).filter(Boolean);
      reset({
        name: adminData.name,
        email: adminData.email,
        role_ids: roleIds,
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
        ...(!isEditMode && data.password && { password: data.password }),
        roles: data.role_ids.map((rid) => ({ id: rid })),
      };

      if (isEditMode && id) {
        await updateAdminMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.adminUpdatedSuccess'));
        navigate('/admin');
      } else {
        await createAdminMutation.mutateAsync(payload);
        toast.success(t('form.adminCreatedSuccess'));
        navigate('/admin');
      }
    } catch (error: any) {
      console.error('Error saving admin:', error);
    }
  };

  const handleCancel = () => {
    navigate('/admin');
  };

  const infoText = isEditMode ? t('form.adminFormInfoEdit') : t('form.adminFormInfoCreate');

  return (
    <>
      <title>
        {isEditMode
          ? t('form.adminEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.adminCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editAdmin') : t('form.createAdmin')}
        description={
          isEditMode
            ? t('form.adminFormLayoutDescriptionEdit')
            : t('form.adminFormLayoutDescriptionCreate')
        }
        isEditMode={isEditMode}
        isLoading={isLoadingAdmin}
        loadingText={t('form.loadingAdmin')}
        maxWidth="3xl"
        infoText={infoText}
        submitLabel={isEditMode ? t('form.updateAdminSubmit') : t('form.createAdminSubmit')}
        submittingLabel={
          isEditMode ? t('form.updatingAdminSubmit') : t('form.creatingAdminSubmit')
        }
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
              {t('form.fullName')}
            </Typography>
          </Box>
          <RHFTextField
            name="name"
            placeholder={t('form.namePlaceholder')}
            helperText={t('form.adminNameHelper')}
            className="transition-all duration-200"
          />
        </Box>

        {/* Email Field with Icon */}
        <Box className="group ">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:letter-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.emailAddress')}
            </Typography>
          </Box>
          <RHFTextField
            name="email"
            type="email"
            placeholder={t('form.emailPlaceholder')}
            helperText={t('form.adminEmailHelper')}
            className="transition-all duration-200"
          />
        </Box>

        {!isEditMode && (
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify
                icon="solar:lock-password-outline"
                className="text-primary"
                width={24}
                height={24}
              />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.passwordLabel')}
              </Typography>
            </Box>
            <RHFTextField
              name="password"
              type="password"
              placeholder={t('form.passwordPlaceholder')}
              helperText={t('form.adminPasswordHelper')}
              className="transition-all duration-200"
            />
          </Box>
        )}

        {/* Roles */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:shield-user-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('columns.roles')}
            </Typography>
          </Box>
          <RHFMultiSelect
            name="role_ids"
            options={roleOptions}
            placeholder={t('form.searchRolesPlaceholder')}
            helperText={t('form.adminRolesHelper')}
            fullWidth
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}
