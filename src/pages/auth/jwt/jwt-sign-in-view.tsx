import { z as zod } from 'zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import i18n from 'src/lib/i18n';
import { Iconify } from 'src/shared/components/iconify';
import { Form, Field } from 'src/shared/components/hook-form';
import { Box, Link, Alert, Button, IconButton, Typography } from 'src/shared/ui';

import { getPostLoginRedirectPath } from 'src/auth/post-login-redirect';

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
  email: zod.string().min(1).email(),
  password: zod.string().min(1).min(6),
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
      await signInWithPassword({
        email: data.email,
        password: data.password,
      });

      window.location.href = getPostLoginRedirectPath();
    } catch (error) {
      console.error(error);
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
    }
  });

  const inputClass =
    'h-12 rounded-2xl border-0 bg-muted shadow-none ring-1 ring-inset ring-black/[0.06] transition-colors focus:ring-2 focus:ring-primary/25';

  const renderForm = () => (
    <Box className="flex flex-col gap-5">
      <Field.Text
        name="email"
        floatingLabel={false}
        placeholder={t('auth.emailPlaceholder')}
        variant="filled"
        size="lg"
        className={inputClass}
        startAdornment={
          <Iconify icon="solar:letter-bold" className="text-muted-foreground" width={20} />
        }
      />

      <Field.Text
        name="password"
        floatingLabel={false}
        placeholder={t('auth.passwordPlaceholder')}
        type={showPassword.value ? 'text' : 'password'}
        variant="filled"
        size="lg"
        className={inputClass}
        startAdornment={
          <Iconify icon="solar:lock-password-outline" className="text-muted-foreground" width={20} />
        }
        endAdornment={
          <IconButton
            type="button"
            onClick={showPassword.onToggle}
            size="small"
            className="text-muted-foreground hover:text-foreground"
          >
            <Iconify
              icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
              width={20}
            />
          </IconButton>
        }
      />

      <Box className="-mt-1 flex justify-end">
        <Link
          component={RouterLink}
          href={paths.faqs}
          underline="hover"
          color="primary"
          className="text-sm font-medium text-primary"
        >
          {t('auth.forgotPassword')}
        </Link>
      </Box>

      <Button
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        className="h-12 rounded-2xl border-0 bg-primary text-base font-semibold !text-white shadow-[0_8px_24px_-8px_rgba(255,160,0,0.45)] hover:bg-primary/90 hover:!text-white"
      >
        {isSubmitting ? t('auth.loggingIn') : t('auth.signIn')}
      </Button>
    </Box>
  );

  return (
    <Box className="relative w-full max-w-none">
      {/* Brand */}
      <Box className="flex flex-col justify-center items-start auth-login-enter mb-8 flex flex-wrap items-center ">
        <img
          src="/logo/logo.jpg"
          alt={tc('appTitle')}
          className="h-24 w-auto max-w-[240px] object-contain object-left"
        />
        {/* <Typography variant="h6" className="font-bold tracking-tight text-foreground">
          {tc('appTitle')}
        </Typography> */}
      </Box>

      <Box className="auth-login-enter auth-login-enter-delay-1 mb-8 text-start">
        <Typography
          variant="h4"
          className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem] sm:leading-tight"
        >
          {t('auth.welcomeBack')}
        </Typography>
        <Typography variant="body2" className="text-muted-foreground text-sm leading-relaxed sm:text-base">
          {t('auth.signInSubtitle')}
        </Typography>
      </Box>

      {!!errorMessage && (
        <Alert
          severity="error"
          className="auth-login-enter auth-login-enter-delay-2 mb-6 rounded-2xl border border-destructive/20 bg-destructive/[0.07]"
          icon={<Iconify icon="solar:danger-bold" width={20} />}
        >
          <Typography variant="body2">{errorMessage}</Typography>
        </Alert>
      )}

      <Box className="auth-login-enter auth-login-enter-delay-2">
        <Form methods={methods} onSubmit={onSubmit}>
          {renderForm()}
        </Form>
      </Box>
    </Box>
  );
}
