import { z as zod } from 'zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import { RouterLink } from 'src/routes/components';

import i18n from 'src/lib/i18n';
import { Iconify } from 'src/shared/components/iconify';
import { Form, Field } from 'src/shared/components/hook-form';
import { Box, Alert, Button, IconButton, Typography } from 'src/shared/ui';

import {
  fetchPermissionsFromMe,
  getPostLoginRedirectPath,
  extractPermissionsFromLoginResponse,
} from 'src/auth/post-login-redirect';

import { useAuthContext } from '../hooks';
import { getErrorMessage } from '../utils';
import { signInWithPassword } from '../context/jwt';

// ----------------------------------------------------------------------

export type SignInSchemaType = zod.infer<typeof SignInSchema>;

const createSignInSchema = () =>
  zod.object({
    email: zod
      .string()
      .min(1, { message: i18n.t('required', { ns: 'validation' }) })
      .email({ message: i18n.t('email', { ns: 'validation' }) }),
    password: zod
      .string()
      .min(1, { message: i18n.t('required', { ns: 'validation' }) })
      .min(6, { message: i18n.t('minLength', { ns: 'validation', min: 6 }) }),
  });

// Default schema for initialization
export const SignInSchema = zod.object({
  email: zod
    .string()
    .min(1)
    .email(),
  password: zod
    .string()
    .min(1)
    .min(6),
});

// ----------------------------------------------------------------------

export function JwtSignInView() {
  const { t, i18n: i18nInstance } = useTranslation('table');
  const { t: tc } = useTranslation('common');
  const showPassword = useBoolean();

  useAuthContext();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const signInSchema = useMemo(() => createSignInSchema(), [i18nInstance.language]);

  const defaultValues: SignInSchemaType = {
    email: 'employee@admin.com',
    password: 'password',
  };

  const methods = useForm<SignInSchemaType>({
    resolver: zodResolver(signInSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMessage(null);
      const { user, responseData } = await signInWithPassword({
        email: data.email,
        password: data.password,
      });

      // Redirect: statistics if has stats.view, else first permitted sidebar item
      // Do this BEFORE checkUserSession to avoid race with GuestGuard's returnTo redirect
      let permissions = extractPermissionsFromLoginResponse(user, responseData);
      if (permissions.length === 0) {
        permissions = await fetchPermissionsFromMe();
      }
      const redirectPath = getPostLoginRedirectPath(permissions);
      window.location.href = redirectPath;

      // Skip checkUserSession - new page will init session; prevents GuestGuard from redirecting to returnTo
    } catch (error) {
      console.error(error);
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
    }
  });

  const renderForm = () => (
    <Box className="gap-6 flex flex-col">
      {/* Email Field with Icon */}
      <Box className="group relative">
        <Box className="absolute start-3 sm:start-4 top-[38px] z-10 flex items-center pointer-events-none">
          <Iconify
            icon="solar:letter-bold"
            className="text-muted-foreground group-focus-within:text-primary transition-colors"
            width={20}
          />
        </Box>
        <Box className="ps-10 sm:ps-12">
          <Field.Text
            name="email"
            label={t('auth.emailAddress')}
            placeholder={t('auth.emailPlaceholder')}
            className="transition-all duration-200"
          />
        </Box>
      </Box>

      {/* Password Field with Icon */}
      <Box className="group relative">
        <Box className="absolute start-3 sm:start-4 top-[38px] z-10 flex items-center pointer-events-none">
          <Iconify
            icon="solar:lock-password-outline"
            className="text-muted-foreground group-focus-within:text-primary transition-colors"
            width={20}
          />
        </Box>
        <Box className="ps-10 sm:ps-12">
          <Field.Text
            name="password"
            label={t('auth.password')}
            placeholder={t('auth.passwordPlaceholder')}
            type={showPassword.value ? 'text' : 'password'}
            className="transition-all duration-200"
            endAdornment={
              <IconButton
                onClick={showPassword.onToggle}
                size="small"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Iconify
                  icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                  width={20}
                />
              </IconButton>
            }
          />
        </Box>
      </Box>

      {/* Forgot Password Link */}
      <Box className="flex items-center justify-between">
        <Box />
        <RouterLink
          href="#"
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
        >
          <Iconify icon="solar:info-circle-bold" width={16} />
          {t('auth.forgotPassword')}
        </RouterLink>
      </Box>

      {/* Login Button */}
      <Button
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        className="mt-2 h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
      >
        {!isSubmitting && <Iconify icon="solar:check-circle-bold" width={20} />}
        {isSubmitting ? t('auth.loggingIn') : t('auth.signIn')}
      </Button>
    </Box>
  );

  return (
    <Box className="w-full max-w-md mx-auto px-4 sm:px-6 md:px-8">
      {/* Header Section */}
      <Box className="mb-6 sm:mb-8 text-center">
        <Box className="mb-6 inline-flex items-center justify-center p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-sm">
          <img
            src="/logo/logo.png"
            alt={tc('logoAlt')}
            className="h-12 w-auto sm:h-14 object-contain"
          />
        </Box>
        <Typography
          variant="h4"
          className="mb-2 text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
        >
          {t('auth.welcomeBack')}
        </Typography>
        <Typography variant="body2" className="text-muted-foreground text-sm sm:text-base">
          {t('auth.signInSubtitle')}
        </Typography>
      </Box>

      {/* Error Alert */}
      {!!errorMessage && (
        <Alert
          severity="error"
          className="mb-6 rounded-xl border border-destructive/20 bg-destructive/5"
          icon={<Iconify icon="solar:danger-bold" width={20} />}
        >
          <Typography variant="body2">{errorMessage}</Typography>
        </Alert>
      )}

      {/* Form */}
      <Box className="p-4 sm:p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Form methods={methods} onSubmit={onSubmit}>
          {renderForm()}
        </Form>
      </Box>
    </Box>
  );
}
