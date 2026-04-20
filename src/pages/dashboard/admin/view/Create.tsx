import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { useFetchRoles } from '@/pages/dashboard/roles/hooks/role';
import { useFetchCities } from '@/pages/dashboard/locations/hooks/city';
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

  const { data: adminData, isLoading: isLoadingAdmin } = useFetchAdminById(id || '');
  const { data: rolesResponse } = useFetchRoles(1, 200);
  const { data: citiesResponse } = useFetchCities(1, 500);
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

  const cityOptions = useMemo(
    () =>
      (citiesResponse?.data?.items ?? []).map((c) => ({
        value: c.id,
        label: formatTranslated(c.name),
      })),
    [citiesResponse]
  );

  const totalRolesAvailable = roleOptions.length;
  const totalCitiesAvailable = cityOptions.length;

  /** API may return `roles` as names (`["employee"]`) or `{ id, name }[]` */
  const resolvedRoleIdsFromAdmin = useMemo(() => {
    const items = rolesResponse?.data?.items ?? [];
    if (!adminData?.roles?.length) return [];
    return (adminData.roles ?? [])
      .map((r) => {
        if (typeof r === 'object' && r !== null && 'id' in r) {
          return (r as { id: number }).id;
        }
        if (typeof r === 'string') {
          const found = items.find((role) => role.name === r);
          return found?.id ?? 0;
        }
        return 0;
      })
      .filter((id): id is number => id > 0);
  }, [adminData, rolesResponse]);

  const resolvedCityIdsFromAdmin = useMemo(() => {
    if (!adminData) return [];
    if (adminData.city_ids?.length) return adminData.city_ids;
    return (adminData.cities ?? []).map((c) => c.id).filter(Boolean);
  }, [adminData]);

  const defaultValues: AdminFormValues = {
    name: '',
    email: '',
    phone: '',
    role_ids: [],
    city_ids: [],
    ...(isEditMode ? {} : { password: '' }),
  };

  const methods = useForm<AdminFormValues>({
    resolver: zodResolver(AdminSchema),
    defaultValues,
  });

  const { handleSubmit, reset, watch } = methods;
  const roleIds = watch('role_ids') ?? [];
  const cityIds = watch('city_ids') ?? [];
  const rolesProgress =
    totalRolesAvailable > 0 ? Math.round((roleIds.length / totalRolesAvailable) * 100) : 0;
  const citiesProgress =
    totalCitiesAvailable > 0 ? Math.round((cityIds.length / totalCitiesAvailable) * 100) : 0;

  useEffect(() => {
    if (!isEditMode || !adminData || isLoadingAdmin) return;
    reset({
      name: adminData.name,
      email: adminData.email,
      phone: adminData.phone ?? '',
      role_ids: resolvedRoleIdsFromAdmin,
      city_ids: resolvedCityIdsFromAdmin,
    });
  }, [
    adminData,
    isEditMode,
    isLoadingAdmin,
    reset,
    resolvedRoleIdsFromAdmin,
    resolvedCityIdsFromAdmin,
  ]);

  const isSubmitting = createAdminMutation.isPending || updateAdminMutation.isPending;
  const errorMessage =
    createAdminMutation.error?.message || updateAdminMutation.error?.message || null;

  const onSubmit = async (data: AdminFormValues) => {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        ...(!isEditMode && data.password && { password: data.password }),
        roles: data.role_ids.map((rid) => ({ id: rid })),
        city_ids: data.city_ids,
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
        icon={
          <Iconify icon="solar:user-speak-rounded-bold" className="text-primary" width={24} height={24} />
        }
        isEditMode={isEditMode}
        isLoading={isLoadingAdmin}
        loadingText={t('form.loadingAdmin')}
        infoText={infoText}
        submitLabel={isEditMode ? t('form.updateAdminSubmit') : t('form.createAdminSubmit')}
        submittingLabel={
          isEditMode ? t('form.updatingAdminSubmit') : t('form.creatingAdminSubmit')
        }
        formInnerClassName="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8 items-start"
      >
        {/* Identity & contact — sticky sidebar */}
        <Box className="group xl:col-span-4 xl:sticky xl:top-28 space-y-4">
          <Box className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/[0.08] via-background to-background p-5 md:p-6 shadow-sm">
            <Box className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/15 blur-2xl" />
            <Box className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />
            <Box className="relative">
              <Box className="flex items-center gap-2 mb-3">
                <Box className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-lg shadow-sm">
                  <span aria-hidden>👤</span>
                </Box>
                <Box className="min-w-0">
                  <Typography variant="subtitle2" className="font-semibold text-foreground leading-tight">
                    {isEditMode ? t('form.editAdmin') : t('form.createAdmin')}
                  </Typography>
                  <Typography variant="caption" className="text-muted-foreground">
                    {infoText}
                  </Typography>
                </Box>
              </Box>

              <Box className="space-y-5">
                <Box>
                  <Box className="flex items-center gap-2 mb-2">
                    <Iconify
                      icon="solar:user-rounded-bold"
                      className="text-primary"
                      width={20}
                      height={20}
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

                <Box>
                  <Box className="flex items-center gap-2 mb-2">
                    <Iconify icon="solar:letter-bold" className="text-primary" width={20} height={20} />
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

                <Box>
                  <Box className="flex items-center gap-2 mb-2">
                    <Iconify icon="solar:phone-bold" className="text-primary" width={20} height={20} />
                    <Typography variant="subtitle2" className="font-semibold text-foreground">
                      {t('columns.phone')}
                    </Typography>
                  </Box>
                  <RHFTextField
                    name="phone"
                    type="tel"
                    placeholder={t('form.phonePlaceholder')}
                    helperText={t('form.adminPhoneHelper')}
                    className="transition-all duration-200"
                  />
                </Box>

                {!isEditMode && (
                  <Box>
                    <Box className="flex items-center gap-2 mb-2">
                      <Iconify
                        icon="solar:lock-password-outline"
                        className="text-primary"
                        width={20}
                        height={20}
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
              </Box>

              {/* Assignment progress */}
              <Box className="mt-5 space-y-3 rounded-xl border border-border/60 bg-background/70 p-3 backdrop-blur">
                <Box>
                  <Box className="flex items-center justify-between mb-2">
                    <Box className="flex items-center gap-2">
                      <Iconify icon="solar:shield-user-bold" className="text-primary" width={16} />
                      <Typography variant="caption" className="font-semibold text-foreground">
                        {t('columns.roles')}
                      </Typography>
                    </Box>
                    <Typography variant="caption" className="font-mono text-muted-foreground">
                      {roleIds.length}/{totalRolesAvailable || '—'}
                    </Typography>
                  </Box>
                  <Box className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <Box
                      className="h-full rounded-full bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 transition-[width] duration-500"
                      style={{ width: `${rolesProgress}%` }}
                    />
                  </Box>
                </Box>
                <Box>
                  <Box className="flex items-center justify-between mb-2">
                    <Box className="flex items-center gap-2">
                      <Iconify icon="solar:city-bold" className="text-primary" width={16} />
                      <Typography variant="caption" className="font-semibold text-foreground">
                        {t('columns.city')}
                      </Typography>
                    </Box>
                    <Typography variant="caption" className="font-mono text-muted-foreground">
                      {cityIds.length}/{totalCitiesAvailable || '—'}
                    </Typography>
                  </Box>
                  <Box className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <Box
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-[width] duration-500"
                      style={{ width: `${citiesProgress}%` }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Roles & cities */}
        <Box className="group xl:col-span-8 min-w-0 space-y-6">
          <Box className="rounded-xl border border-border/60 bg-card/70 px-4 py-3 backdrop-blur">
            <Box className="flex flex-wrap items-center justify-between gap-3">
              <Box className="flex items-center gap-2 min-w-0">
                <Box className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Iconify icon="solar:shield-user-bold" width={18} height={18} />
                </Box>
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.adminRolesAccessSection')}
                </Typography>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {t('form.rolePermissionsSelected', { count: roleIds.length })}
                </span>
              </Box>
            </Box>
          </Box>
          <RHFMultiSelect
            name="role_ids"
            options={roleOptions}
            placeholder={t('form.searchRolesPlaceholder')}
            helperText={t('form.adminRolesHelper')}
            fullWidth
          />

          <Box className="rounded-xl border border-border/60 bg-card/70 px-4 py-3 backdrop-blur">
            <Box className="flex flex-wrap items-center justify-between gap-3">
              <Box className="flex items-center gap-2 min-w-0">
                <Box className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Iconify icon="solar:city-bold" width={18} height={18} />
                </Box>
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.adminCitiesAccessSection')}
                </Typography>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {t('form.adminCitiesSelected', { count: cityIds.length })}
                </span>
              </Box>
            </Box>
          </Box>
          <RHFMultiSelect
            name="city_ids"
            options={cityOptions}
            placeholder={t('form.searchCitiesPlaceholder')}
            helperText={t('form.adminCitiesHelper')}
            fullWidth
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}
