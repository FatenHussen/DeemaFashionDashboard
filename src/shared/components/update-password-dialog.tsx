import { z } from 'zod';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { useForm , FormProvider } from 'react-hook-form';
import { RHFTextField } from '@/shared/components/hook-form/rhf-text-field';
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogDescription,
} from '@/shared/ui/dialogTable';

// ----------------------------------------------------------------------

function createSchema(minLength: number, t: any) {
  return z
    .object({
      password: z.string().min(minLength, t('dialog.passwordMustBeAtLeast', { length: minLength })),
      password_confirmation: z.string().min(minLength, t('dialog.passwordMustBeAtLeast', { length: minLength })),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: t('dialog.passwordsDoNotMatch'),
      path: ['password_confirmation'],
    });
}

export type UpdatePasswordFormValues = {
  password: string;
  password_confirmation: string;
};

export interface UpdatePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdatePasswordFormValues) => Promise<void>;
  isSubmitting?: boolean;
  entityName?: string;
  minLength?: number;
}

export function UpdatePasswordDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  entityName = 'User',
  minLength = 6,
}: UpdatePasswordDialogProps) {
  const { t } = useTranslation('table');

  const methods = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(createSchema(minLength, t)),
    defaultValues: { password: '', password_confirmation: '' },
  });

  const handleSubmit = methods.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
      methods.reset();
      onOpenChange(false);
    } catch {
      // Error handled by caller (toast)
    }
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) methods.reset();
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Iconify icon="solar:lock-password-outline" width={24} height={24} className="text-primary" />
            {t('updatePassword', 'Update Password')}
          </DialogTitle>
          <DialogDescription>
            {t('dialog.setNewPasswordFor', { entity: entityName.toLowerCase() })}
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <RHFTextField
              name="password"
              label={t('dialog.newPassword')}
              type="password"
              placeholder={t('dialog.enterNewPassword')}
              fullWidth
            />
            <RHFTextField
              name="password_confirmation"
              label={t('dialog.confirmPassword')}
              type="password"
              placeholder={t('dialog.confirmNewPassword')}
              fullWidth
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outlined"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                {t('cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="mr-2">
                      <svg
                        className="animate-spin h-4 w-4 inline"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </span>
                    {t('updating', 'Updating...')}
                  </>
                ) : (
                  t('updatePassword', 'Update Password')
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
