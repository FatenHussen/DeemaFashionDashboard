import { CONFIG } from 'src/global-config';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { queryKeys } from '@/api';
import { _ProfileApi } from '../api/profile.services';
import { Iconify } from 'src/shared/components/iconify';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { Box, Typography, Badge } from 'src/shared/ui';
import { Separator } from 'src/shared/ui/separator';

// ----------------------------------------------------------------------

const metadata = { title: `Profile | Dashboard - ${CONFIG.appName}` };

export default function ProfilePage() {
  const { t } = useTranslation();
  const { data: profileResponse, isLoading, error } = useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: () => _ProfileApi.getProfile(),
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <Box className="flex items-center justify-center min-h-[400px]">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:danger-bold" className="w-5 h-5 text-destructive" />
            <Typography variant="h6" className="text-destructive">
              Error Loading Profile
            </Typography>
          </Box>
          <Typography variant="body2" className="text-muted-foreground">
            {error instanceof Error ? error.message : 'Failed to load profile information'}
          </Typography>
        </Box>
      </Box>
    );
  }

  const profile = profileResponse?.data;

  if (!profile) {
    return (
      <Box className="flex items-center justify-center min-h-[400px]">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Typography variant="h6" className="mb-2">
            No Profile Data
          </Typography>
          <Typography variant="body2" className="text-muted-foreground">
            Unable to retrieve profile information
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="container mx-auto py-8 px-4 max-w-4xl">
      <Box className="mb-6">
        <Typography variant="h4" className="font-bold tracking-tight">
          Profile
        </Typography>
        <Typography variant="body2" className="text-muted-foreground mt-2">
          View and manage your account information
        </Typography>
      </Box>

      <Box className="grid gap-6">
        {/* Profile Header Card */}
        <Box className="rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Box className="flex items-center gap-4">
            <Box className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/20">
              <Typography variant="h4" className="font-bold text-primary">
                {profile.name?.charAt(0).toUpperCase() || 'U'}
              </Typography>
            </Box>
            <Box className="flex-1">
              <Typography variant="h5" className="font-semibold">
                {profile.name}
              </Typography>
              <Typography variant="body2" className="text-muted-foreground mt-1">
                {profile.email}
              </Typography>
            </Box>
            <Badge
              variant={profile.is_active === 1 ? 'default' : 'secondary'}
              className="text-sm px-3 py-1"
            >
              {profile.is_active === 1 ? 'Active' : 'Inactive'}
            </Badge>
          </Box>
        </Box>

        {/* Profile Details Card */}
        <Box className="rounded-xl border border-border/50 shadow-lg bg-background">
          <Box className="p-6 border-b border-border/50">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:user-id-bold" className="w-5 h-5" />
              <Typography variant="h6" className="font-semibold">
                Account Information
              </Typography>
            </Box>
            <Typography variant="body2" className="text-muted-foreground">
              Your account details and permissions
            </Typography>
          </Box>
          <Box className="p-6 space-y-6">
            {/* User ID */}
            <Box className="flex items-center justify-between py-2">
              <Box className="flex items-center gap-3">
                <Iconify icon="solar:hashtag-circle-bold" className="w-5 h-5 text-muted-foreground" />
                <Typography variant="body2" className="font-medium">
                  User ID
                </Typography>
              </Box>
              <Typography variant="body2" className="text-muted-foreground">
                #{profile.id}
              </Typography>
            </Box>

            <Separator />

            {/* Email */}
            <Box className="flex items-center justify-between py-2">
              <Box className="flex items-center gap-3">
                <Iconify icon="solar:letter-bold" className="w-5 h-5 text-muted-foreground" />
                <Typography variant="body2" className="font-medium">
                  Email Address
                </Typography>
              </Box>
              <Typography variant="body2" className="text-muted-foreground">
                {profile.email}
              </Typography>
            </Box>

            <Separator />

            {/* Roles */}
            <Box className="flex items-start justify-between py-2">
              <Box className="flex items-center gap-3">
                <Iconify icon="solar:shield-user-bold" className="w-5 h-5 text-muted-foreground" />
                <Typography variant="body2" className="font-medium">
                  Roles
                </Typography>
              </Box>
              <Box className="flex flex-wrap gap-2 justify-end">
                {profile.roles && profile.roles.length > 0 ? (
                  profile.roles.map((role) => (
                    <Badge key={role} variant="outline" className="text-sm capitalize">
                      {role}
                    </Badge>
                  ))
                ) : (
                  <Typography variant="body2" className="text-muted-foreground">
                    No roles assigned
                  </Typography>
                )}
              </Box>
            </Box>

            <Separator />

            {/* Account Status */}
            <Box className="flex items-center justify-between py-2">
              <Box className="flex items-center gap-3">
                <Iconify icon="solar:check-circle-bold" className="w-5 h-5 text-muted-foreground" />
                <Typography variant="body2" className="font-medium">
                  Account Status
                </Typography>
              </Box>
              <Badge variant={profile.is_active === 1 ? 'default' : 'secondary'}>
                {profile.is_active === 1 ? 'Active' : 'Inactive'}
              </Badge>
            </Box>

            <Separator />

            {/* Created At */}
            <Box className="flex items-center justify-between py-2">
              <Box className="flex items-center gap-3">
                <Iconify icon="solar:calendar-bold" className="w-5 h-5 text-muted-foreground" />
                <Typography variant="body2" className="font-medium">
                  Member Since
                </Typography>
              </Box>
              <Typography variant="body2" className="text-muted-foreground">
                {profile.created_at
                  ? new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
