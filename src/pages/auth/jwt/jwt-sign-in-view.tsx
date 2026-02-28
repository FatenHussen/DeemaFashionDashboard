import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/global-config';
import { Iconify } from 'src/shared/components/iconify';
import { Form, Field } from 'src/shared/components/hook-form';
import { Box, Alert, Button, IconButton, Typography } from 'src/shared/ui';

import { useAuthContext } from '../hooks';
import { getErrorMessage } from '../utils';
import { signInWithPassword } from '../context/jwt';

// ----------------------------------------------------------------------

export type SignInSchemaType = zod.infer<typeof SignInSchema>;

export const SignInSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  password: zod
    .string()
    .min(1, { message: 'Password is required!' })
    .min(6, { message: 'Password must be at least 6 characters!' }),
});

// ----------------------------------------------------------------------

export function JwtSignInView() {
  const router = useRouter();

  const showPassword = useBoolean();

  const { checkUserSession } = useAuthContext();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultValues: SignInSchemaType = {
    email: 'employee@admin.com',
    password: 'password',
  };

  const methods = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMessage(null);
      const { user } = await signInWithPassword({ email: data.email, password: data.password });

      // Refresh user session to get the latest user data
      await checkUserSession?.();

      // Redirect to admin dashboard (FCM token is handled in dashboard layout)
      window.location.href = CONFIG.auth.redirectPath;
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
        <Box className="absolute left-4 top-[38px] z-10 flex items-center pointer-events-none">
          <Iconify
            icon="solar:letter-bold"
            className="text-muted-foreground group-focus-within:text-primary transition-colors"
            width={20}
          />
        </Box>
        <Box className="pl-12">
          <Field.Text
            name="email"
            label="Email address"
            placeholder="Enter your email"
            className="transition-all duration-200"
          />
        </Box>
      </Box>

      {/* Password Field with Icon */}
      <Box className="group relative">
        <Box className="absolute left-4 top-[38px] z-10 flex items-center pointer-events-none">
          <Iconify
            icon="solar:lock-password-outline"
            className="text-muted-foreground group-focus-within:text-primary transition-colors"
            width={20}
          />
        </Box>
        <Box className="pl-12">
          <Field.Text
            name="password"
            label="Password"
            placeholder="Enter your password"
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
          Forgot password?
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
        {isSubmitting ? 'Logging in...' : 'Sign In'}
      </Button>
    </Box>
  );

  return (
    <Box className="w-full  max-w-md mx-auto">
      {/* Header Section */}
      <Box className="mb-8 text-center ">
        <Box className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <Iconify icon="solar:shield-check-bold" className="text-primary" width={32} />
        </Box>
        <Typography
          variant="h4"
          className="mb-2 font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
        >
          Welcome Back
        </Typography>
        <Typography variant="body2" className="text-muted-foreground">
          Sign in to continue to your account
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
      <Box className="p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm shadow-lg">
        <Form methods={methods} onSubmit={onSubmit}>
          {renderForm()}
        </Form>
      </Box>
    </Box>
  );
}
