import type { Permission } from '@/pages/dashboard/roles/types/role.types';

import { toast } from 'react-toastify';
import { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import {
  RoleSchema,
  type RoleFormValues,
} from '@/pages/dashboard/roles/validation/role.validation';
import {
  translatePermissionName,
  translatePermissionResource,
} from '@/pages/dashboard/roles/utils/permission-label';
import {
  useCreateRole,
  useUpdateRole,
  useFetchRoleById,
  useFetchPermissions,
} from '@/pages/dashboard/roles/hooks/role';

import { CONFIG } from 'src/global-config';
import { Box, Button, Checkbox, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

// Friendly, distinct accent palette per resource group (stable hash → color).
const RESOURCE_PALETTE = [
  { ring: 'ring-sky-200/60 dark:ring-sky-800/40', bar: 'from-sky-500 to-blue-500', soft: 'bg-sky-500/10', text: 'text-sky-700 dark:text-sky-300', emoji: '🛡️' },
  { ring: 'ring-emerald-200/60 dark:ring-emerald-800/40', bar: 'from-emerald-500 to-teal-500', soft: 'bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-300', emoji: '🌿' },
  { ring: 'ring-violet-200/60 dark:ring-violet-800/40', bar: 'from-violet-500 to-fuchsia-500', soft: 'bg-violet-500/10', text: 'text-violet-700 dark:text-violet-300', emoji: '✨' },
  { ring: 'ring-amber-200/60 dark:ring-amber-800/40', bar: 'from-amber-500 to-orange-500', soft: 'bg-amber-500/10', text: 'text-amber-700 dark:text-amber-300', emoji: '🔆' },
  { ring: 'ring-rose-200/60 dark:ring-rose-800/40', bar: 'from-rose-500 to-pink-500', soft: 'bg-rose-500/10', text: 'text-rose-700 dark:text-rose-300', emoji: '💗' },
  { ring: 'ring-cyan-200/60 dark:ring-cyan-800/40', bar: 'from-cyan-500 to-sky-500', soft: 'bg-cyan-500/10', text: 'text-cyan-700 dark:text-cyan-300', emoji: '💧' },
  { ring: 'ring-indigo-200/60 dark:ring-indigo-800/40', bar: 'from-indigo-500 to-violet-500', soft: 'bg-indigo-500/10', text: 'text-indigo-700 dark:text-indigo-300', emoji: '🪄' },
  { ring: 'ring-lime-200/60 dark:ring-lime-800/40', bar: 'from-lime-500 to-green-500', soft: 'bg-lime-500/10', text: 'text-lime-700 dark:text-lime-300', emoji: '🌱' },
];

function paletteFor(resource: string) {
  let h = 0;
  for (let i = 0; i < resource.length; i += 1) h = (h * 31 + resource.charCodeAt(i)) >>> 0;
  return RESOURCE_PALETTE[h % RESOURCE_PALETTE.length];
}

// Action-aware chip colors so view/create/update/delete are instantly readable.
function actionStyle(name: string): { chip: string; dot: string; icon: string } {
  const action = (name.split('.')[1] || '').toLowerCase();
  if (action.includes('view') || action.includes('read') || action.includes('list') || action.includes('show'))
    return { chip: 'border-sky-300/60 bg-sky-50/80 text-sky-800 dark:border-sky-700/50 dark:bg-sky-950/30 dark:text-sky-200', dot: 'bg-sky-500', icon: 'solar:eye-bold' };
  if (action.includes('create') || action.includes('add') || action.includes('store'))
    return { chip: 'border-emerald-300/60 bg-emerald-50/80 text-emerald-800 dark:border-emerald-700/50 dark:bg-emerald-950/30 dark:text-emerald-200', dot: 'bg-emerald-500', icon: 'solar:add-circle-bold' };
  if (action.includes('update') || action.includes('edit'))
    return { chip: 'border-amber-300/60 bg-amber-50/80 text-amber-800 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-200', dot: 'bg-amber-500', icon: 'solar:pen-bold' };
  if (action.includes('delete') || action.includes('destroy') || action.includes('remove'))
    return { chip: 'border-rose-300/60 bg-rose-50/80 text-rose-800 dark:border-rose-700/50 dark:bg-rose-950/30 dark:text-rose-200', dot: 'bg-rose-500', icon: 'solar:trash-bin-trash-bold' };
  return { chip: 'border-violet-300/60 bg-violet-50/80 text-violet-800 dark:border-violet-700/50 dark:bg-violet-950/30 dark:text-violet-200', dot: 'bg-violet-500', icon: 'solar:bolt-bold' };
}

// ----------------------------------------------------------------------

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Hooks for fetching and mutations
  const { data: roleResponse, isLoading: isLoadingRole } = useFetchRoleById(id || '');
  const { data: permissionsResponse, isLoading: isLoadingPermissions } = useFetchPermissions();
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();

  const roleData = roleResponse?.data;
  const permissions = permissionsResponse?.data?.items || [];

  const defaultValues: RoleFormValues = {
    name: '',
    permissions: [],
  };

  const methods = useForm<RoleFormValues>({
    resolver: zodResolver(RoleSchema),
    defaultValues,
  });

  const { handleSubmit, reset, control, watch } = methods;
  const selectedPermissions = watch('permissions');

  // Group permissions by resource (e.g., "role", "admin", "user")
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    permissions.forEach((permission) => {
      const [resource] = permission.name.split('.');
      if (!groups[resource]) {
        groups[resource] = [];
      }
      groups[resource].push(permission);
    });
    return groups;
  }, [permissions]);

  // Fetch role data if in edit mode
  useEffect(() => {
    if (isEditMode && roleData && !isLoadingRole) {
      reset({
        name: roleData.name,
        permissions: roleData.permissions?.map((p) => ({ id: p.id })) || [],
      });
    }
  }, [roleData, isEditMode, isLoadingRole, reset]);

  const isSubmitting = createRoleMutation.isPending || updateRoleMutation.isPending;
  const errorMessage =
    createRoleMutation.error?.message || updateRoleMutation.error?.message || null;

  const onSubmit = async (data: RoleFormValues) => {
    try {
      const payload = {
        name: data.name,
        permissions: data.permissions,
      };

      if (isEditMode && id) {
        await updateRoleMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.roleUpdatedSuccess'));
        navigate('/role');
      } else {
        await createRoleMutation.mutateAsync(payload);
        toast.success(t('form.roleCreatedSuccess'));
        navigate('/role');
      }
    } catch (error: any) {
      console.error('Error saving role:', error);
    }
  };

  const handleCancel = () => {
    navigate('/role');
  };

  const togglePermission = (permissionId: number) => {
    const current = selectedPermissions || [];
    const isSelected = current.some((p) => p.id === permissionId);

    if (isSelected) {
      return current.filter((p) => p.id !== permissionId);
    } else {
      return [...current, { id: permissionId }];
    }
  };

  const toggleResourceGroup = (resourcePermissions: Permission[]) => {
    const current = selectedPermissions || [];
    const resourcePermissionIds = resourcePermissions.map((p) => p.id);
    const allSelected = resourcePermissionIds.every((permId) => current.some((p) => p.id === permId));

    if (allSelected) {
      // Deselect all permissions in this group
      return current.filter((p) => !resourcePermissionIds.includes(p.id));
    } else {
      // Select all permissions in this group
      const newPermissions = [...current];
      resourcePermissionIds.forEach((permId) => {
        if (!newPermissions.some((p) => p.id === permId)) {
          newPermissions.push({ id: permId });
        }
      });
      return newPermissions;
    }
  };

  const infoText = isEditMode ? t('form.roleFormInfoEdit') : t('form.roleFormInfoCreate');

  const totalPermissions = permissions.length;
  const selectedCount = selectedPermissions?.length || 0;
  const progress = totalPermissions ? Math.round((selectedCount / totalPermissions) * 100) : 0;

  const selectAllPermissions = () => {
    methods.setValue(
      'permissions',
      permissions.map((p) => ({ id: p.id })),
      { shouldDirty: true, shouldValidate: true }
    );
  };

  const clearAllPermissions = () => {
    methods.setValue('permissions', [], { shouldDirty: true, shouldValidate: true });
  };

  return (
    <>
      <title>
        {isEditMode
          ? t('form.roleEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.roleCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editRole') : t('form.createRole')}
        description={
          isEditMode
            ? t('form.roleFormLayoutDescriptionEdit')
            : t('form.roleFormLayoutDescriptionCreate')
        }
        icon={
          <Iconify icon="solar:shield-user-bold" className="text-primary" width={24} height={24} />
        }
        isEditMode={isEditMode}
        isLoading={isLoadingRole || isLoadingPermissions}
        loadingText={t('form.loadingRole')}
        infoText={infoText}
        submitLabel={isEditMode ? t('form.updateRoleSubmit') : t('form.createRoleSubmit')}
        submittingLabel={
          isEditMode ? t('form.updatingRoleSubmit') : t('form.creatingRoleSubmit')
        }
        formInnerClassName="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8 items-start"
      >
        {/* Role Name — full width on mobile, sidebar on xl */}
        <Box className="group xl:col-span-4 xl:sticky xl:top-28 space-y-4">
          <Box className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/[0.08] via-background to-background p-5 md:p-6 shadow-sm">
            <Box className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/15 blur-2xl" />
            <Box className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-fuchsia-500/10 blur-2xl" />
            <Box className="relative">
              <Box className="flex items-center gap-2 mb-3">
                <Box className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-lg shadow-sm">
                  <span aria-hidden>👋</span>
                </Box>
                <Box className="min-w-0">
                  <Typography variant="subtitle2" className="font-semibold text-foreground leading-tight">
                    {isEditMode ? t('form.editRole') : t('form.createRole')}
                  </Typography>
                  <Typography variant="caption" className="text-muted-foreground">
                    {infoText}
                  </Typography>
                </Box>
              </Box>

              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:shield-user-bold" className="text-primary" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('columns.roleName')}
                </Typography>
              </Box>
              <RHFTextField
                name="name"
                placeholder={t('form.rolePlaceholder')}
                helperText={t('form.roleNameHelper')}
                className="transition-all duration-200"
              />

              {/* Live progress */}
              <Box className="mt-5 rounded-xl border border-border/60 bg-background/70 p-3 backdrop-blur">
                <Box className="flex items-center justify-between mb-2">
                  <Box className="flex items-center gap-2">
                    <Iconify icon="solar:key-bold" className="text-primary" width={16} />
                    <Typography variant="caption" className="font-semibold text-foreground">
                      {t('form.rolePermissionsSection')}
                    </Typography>
                  </Box>
                  <Typography variant="caption" className="font-mono text-muted-foreground">
                    {selectedCount}/{totalPermissions}
                  </Typography>
                </Box>
                <Box className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <Box
                    className="h-full rounded-full bg-gradient-to-r from-primary via-fuchsia-500 to-amber-500 transition-[width] duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Permissions — wide column */}
        <Box className="group xl:col-span-8 min-w-0">
          <Box className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/70 px-4 py-3 backdrop-blur">
            <Box className="flex items-center gap-2 min-w-0">
              <Box className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Iconify icon="solar:key-bold" width={18} height={18} />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.rolePermissionsSection')}
              </Typography>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t('form.rolePermissionsSelected', { count: selectedCount })}
              </span>
            </Box>
            <Box className="flex items-center gap-2">
              <Button
                type="button"
                variant="outlined"
                size="small"
                onClick={selectAllPermissions}
                disabled={isLoadingPermissions || totalPermissions === 0 || selectedCount === totalPermissions}
                className="gap-1.5"
              >
                <Iconify icon="solar:check-square-bold" width={16} />
                {t('selectAll', { defaultValue: 'Select all' })}
              </Button>
              <Button
                type="button"
                variant="text"
                size="small"
                onClick={clearAllPermissions}
                disabled={selectedCount === 0}
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Iconify icon="solar:eraser-bold" width={16} />
                {t('clear', { defaultValue: 'Clear' })}
              </Button>
            </Box>
          </Box>

          {isLoadingPermissions ? (
            <Box className="p-8 text-center">
              <Typography variant="body2" className="text-muted-foreground">
                {t('form.rolePermissionsLoading')}
              </Typography>
            </Box>
          ) : (
            <Controller
              name="permissions"
              control={control}
              render={({ field }) => (
                <Box className="space-y-5 max-h-[min(70vh,780px)] overflow-y-auto pr-1 sm:pr-2 [scrollbar-gutter:stable]">
                  {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => {
                    const allSelected = resourcePermissions.every((p) =>
                      field.value?.some((selected) => selected.id === p.id)
                    );
                    const someSelected = resourcePermissions.some((p) =>
                      field.value?.some((selected) => selected.id === p.id)
                    );
                    const palette = paletteFor(resource);
                    const groupSelectedCount = resourcePermissions.filter((p) =>
                      field.value?.some((s) => s.id === p.id)
                    ).length;

                    return (
                      <Box
                        key={resource}
                        className={`group/card relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-4 md:p-5 shadow-sm ring-1 ${palette.ring} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`}
                      >
                        {/* Color strip */}
                        <Box
                          className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${palette.bar}`}
                        />

                        {/* Resource Group Header */}
                        <Box className="mb-3 flex items-center justify-between gap-3">
                          <label className="flex min-w-0 cursor-pointer items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={allSelected}
                              ref={(el) => {
                                if (el) {
                                  el.indeterminate = someSelected && !allSelected;
                                }
                              }}
                              onChange={() => {
                                field.onChange(toggleResourceGroup(resourcePermissions));
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary/40"
                            />
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${palette.soft} text-base`}
                              aria-hidden
                            >
                              {palette.emoji}
                            </span>
                            <Typography
                              variant="subtitle2"
                              className={`font-semibold capitalize ${palette.text}`}
                            >
                              {translatePermissionResource(resource, t)}
                            </Typography>
                          </label>
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/60 bg-background/70 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                            {groupSelectedCount}/{resourcePermissions.length}
                          </span>
                        </Box>

                        {/* Individual Permissions */}
                        <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {resourcePermissions.map((permission) => {
                            const isSelected =
                              field.value?.some((p) => p.id === permission.id) ?? false;
                            const a = actionStyle(permission.name);

                            return (
                              <label
                                key={permission.id}
                                className={`group/item flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-sm transition-all duration-150 ${
                                  isSelected
                                    ? `${a.chip} shadow-sm`
                                    : 'border-border/40 bg-background/40 text-foreground hover:border-border hover:bg-background'
                                }`}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onChange={() => {
                                    field.onChange(togglePermission(permission.id));
                                  }}
                                  className="h-4 w-4 shrink-0"
                                />
                                <Iconify
                                  icon={a.icon}
                                  width={14}
                                  className={isSelected ? '' : 'text-muted-foreground'}
                                />
                                <Typography
                                  variant="body2"
                                  className="truncate text-sm font-medium"
                                  title={translatePermissionName(permission.name, t)}
                                >
                                  {translatePermissionName(permission.name, t)}
                                </Typography>
                              </label>
                            );
                          })}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            />
          )}

          {!isLoadingPermissions && permissions.length === 0 && (
            <Box className="p-8 text-center border border-dashed border-border rounded-lg">
              <Typography variant="body2" className="text-muted-foreground">
                {t('form.rolePermissionsNoneAvailable')}
              </Typography>
            </Box>
          )}
        </Box>
      </CreateFormLayout>
    </>
  );
}
