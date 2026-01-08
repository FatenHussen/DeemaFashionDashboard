import { z as zod } from 'zod';

// ----------------------------------------------------------------------

export const RoleSchema = zod.object({
  name: zod.string().min(1, { message: 'Role name is required!' }),
  permissions: zod
    .array(
      zod.object({
        id: zod.number(),
      })
    )
    .min(1, { message: 'At least one permission is required!' }),
});

export type RoleFormValues = zod.infer<typeof RoleSchema>;

