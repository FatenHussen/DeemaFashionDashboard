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
  useCreateRole,
  useUpdateRole,
  useFetchRoleById,
  useFetchPermissions,
} from '@/pages/dashboard/roles/hooks/role';

import { CONFIG } from 'src/global-config';
import { Box, Checkbox, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

const metadata = { title: `Role ${CONFIG.appName}` };

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
        toast.success('Role updated successfully');
        navigate('/role');
      } else {
        await createRoleMutation.mutateAsync(payload);
        toast.success('Role created successfully');
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

  const infoText = isEditMode
    ? 'Update role name and permissions. Changes will affect all users with this role.'
    : 'Create a new role and assign permissions. Make sure to select appropriate permissions for the role.';

  return (
    <>
      <title>
        {isEditMode ? `Edit Role | ${metadata.title}` : `Create Role | ${metadata.title}`}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Role' : 'Create New Role'}
        description={
          isEditMode ? 'Update role information and permissions' : 'Add a new role to your system'
        }
        isEditMode={isEditMode}
        isLoading={isLoadingRole || isLoadingPermissions}
        loadingText={t('form.loadingRole')}
        maxWidth="4xl"
        infoText={infoText}
        submitLabel={isEditMode ? 'Update Role' : 'Create Role'}
        submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
      >
        {/* Role Name Field */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify
              icon="solar:shield-user-bold"
              className="text-primary"
              width={24}
              height={24}
            />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Role Name
            </Typography>
          </Box>
          <RHFTextField
            name="name"
            placeholder={t('form.rolePlaceholder')}
            helperText={t('form.roleNameHelper')}
            className="transition-all duration-200"
          />
        </Box>

        {/* Permissions Section */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-4">
            <Iconify icon="solar:key-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Permissions
            </Typography>
            <Typography variant="caption" className="text-muted-foreground">
              ({selectedPermissions?.length || 0} selected)
            </Typography>
          </Box>

          {isLoadingPermissions ? (
            <Box className="p-8 text-center">
              <Typography variant="body2" className="text-muted-foreground">
                Loading permissions...
              </Typography>
            </Box>
          ) : (
            <Controller
              name="permissions"
              control={control}
              render={({ field }) => (
                <Box className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                  {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => {
                    const allSelected = resourcePermissions.every((p) =>
                      field.value?.some((selected) => selected.id === p.id)
                    );
                    const someSelected = resourcePermissions.some((p) =>
                      field.value?.some((selected) => selected.id === p.id)
                    );

                    return (
                      <Box
                        key={resource}
                        className="rounded-lg border border-border/50 bg-background/50 p-4"
                      >
                        {/* Resource Group Header */}
                        <Box className="flex items-center justify-between mb-3">
                          <Box className="flex items-center gap-2">
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
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-blue-500"
                            />
                            <Typography variant="subtitle2" className="font-semibold capitalize">
                              {resource}
                            </Typography>
                            <Typography variant="caption" className="text-muted-foreground">
                              ({resourcePermissions.length} permissions)
                            </Typography>
                          </Box>
                        </Box>

                        {/* Individual Permissions */}
                        <Box className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-6">
                          {resourcePermissions.map((permission) => {
                            const isSelected = field.value?.some((p) => p.id === permission.id);

                            return (
                              <Box
                                key={permission.id}
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
                              >
                                <Checkbox
                                  checked={isSelected || false}
                                  onChange={() => {
                                    field.onChange(togglePermission(permission.id));
                                  }}
                                  className="h-4 w-4"
                                />
                                <Typography variant="body2" className="text-sm text-foreground">
                                  {permission.name}
                                </Typography>
                              </Box>
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
                No permissions available
              </Typography>
            </Box>
          )}
        </Box>
      </CreateFormLayout>
    </>
  );
}
