import { Button } from '@/shared/ui/button';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useFetchRoleById } from '@/pages/dashboard/roles/hooks/role';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { Separator } from 'src/shared/ui/separator';
import { LoadingScreen } from 'src/shared/components/loading-screen';

// ----------------------------------------------------------------------

const metadata = { title: `Role Details | Dashboard - ${CONFIG.appName}` };

export default function DetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: roleResponse, isLoading, error } = useFetchRoleById(id || '');

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !roleResponse?.data) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:danger-bold" className="w-5 h-5 text-destructive" />
            <Typography variant="h6" className="text-destructive">
              Error Loading Role
            </Typography>
          </Box>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Failed to load role information'}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/role')}>
            Back to Roles
          </Button>
        </Box>
      </Box>
    );
  }

  const role = roleResponse.data;

  // Group permissions by resource
  const groupedPermissions: Record<string, typeof role.permissions> = {};
  if (role.permissions && Array.isArray(role.permissions)) {
    role.permissions.forEach((permission) => {
      const [resource] = permission.name.split('.');
      if (!groupedPermissions[resource]) {
        groupedPermissions[resource] = [];
      }
      groupedPermissions[resource].push(permission);
    });
  }

  return (
    <>
      <title>{metadata.title}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        {/* Subtle background gradient */}
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />

        {/* Refined grid overlay */}
        <Box className="pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <Box className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </Box>

        <Box className="relative max-w-4xl mx-auto">
          {/* Header */}
          <Box className="mb-6">
            <Button
              variant="text"
              onClick={() => navigate('/role')}
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
              Back to Roles
            </Button>

            <Box className="flex items-center gap-4 mb-2">
              <Box className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Iconify icon="solar:user-id-bold" className="text-primary" width={32} height={32} />
              </Box>
              <Box className="flex-1">
                <Typography variant="h4" className="font-bold text-foreground mb-1">
                  {role.name}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  Role Details
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => navigate(`/role/update/${id}`)}
                className="gap-2"
              >
                <Iconify icon="solar:pen-bold" width={18} />
                Edit Role
              </Button>
            </Box>
          </Box>

          {/* Details Card */}
          <Box className="rounded-xl border border-border/50 shadow-lg bg-background/95 backdrop-blur-sm overflow-hidden">
            <Box className="p-6 space-y-6">
              {/* Basic Information */}
              <Box>
                <Typography variant="h6" className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Iconify icon="solar:info-circle-bold" width={20} />
                  Basic Information
                </Typography>
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      Role Name
                    </Typography>
                    <Box className="flex items-center gap-2">
                      <Iconify icon="solar:user-id-bold" className="text-primary" width={18} />
                      <Typography variant="body1" className="font-semibold text-foreground capitalize">
                        {role.name}
                      </Typography>
                    </Box>
                  </Box>

                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      Guard
                    </Typography>
                    <Box className="flex items-center gap-2">
                      <Iconify icon="solar:shield-check-bold" className="text-primary" width={18} />
                      <Typography variant="body1" className="text-foreground">
                        {role.guard_name}
                      </Typography>
                    </Box>
                  </Box>

                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      Created At
                    </Typography>
                    <Box className="flex items-center gap-2">
                      <Iconify icon="solar:calendar-date-bold" className="text-primary" width={18} />
                      <Typography variant="body1" className="text-foreground">
                        {role.created_at}
                      </Typography>
                    </Box>
                  </Box>

                  {role.id && (
                    <Box className="space-y-2">
                      <Typography variant="body2" className="text-muted-foreground font-medium">
                        Role ID
                      </Typography>
                      <Box className="flex items-center gap-2">
                        <Box className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">{role.id}</span>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>

              <Separator />

              {/* Permissions */}
              <Box>
                <Typography variant="h6" className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Iconify icon="solar:lock-password-outline" width={20} />
                  Permissions
                  {role.permissions && Array.isArray(role.permissions) && (
                    <Typography variant="body2" className="text-muted-foreground font-normal ml-2">
                      ({role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''})
                    </Typography>
                  )}
                </Typography>

                {role.permissions && Array.isArray(role.permissions) && role.permissions.length > 0 ? (
                  <Box className="space-y-4">
                    {Object.entries(groupedPermissions).map(([resource, perms]) => (
                      <Box key={resource} className="space-y-2">
                        <Typography variant="body2" className="text-muted-foreground font-medium capitalize">
                          {resource}
                        </Typography>
                        <Box className="flex flex-wrap gap-2">
                          {(perms ?? []).map((permission) => (
                            <Box
                              key={permission.id}
                              className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
                            >
                              {permission.name}
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box className="text-center py-8">
                    <Iconify icon="solar:lock-password-outline" className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                    <Typography variant="body2" className="text-muted-foreground">
                      No permissions assigned to this role
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

