/** Backend may register the resource as `contactmethod`, `contact_method`, or `contactmethods`. */
export const CONTACT_METHOD_VIEW_ANY = [
  'contactmethod.view',
  'contact_method.view',
  'contactmethods.view',
  /** Same bucket as other entries under Settings until granular permissions exist */
  'setting.view',
] as const;

export const CONTACT_METHOD_CREATE_ANY = [
  'contactmethod.create',
  'contact_method.create',
  'contactmethods.create',
  'setting.update',
] as const;

export const CONTACT_METHOD_UPDATE_ANY = [
  'contactmethod.update',
  'contact_method.update',
  'contactmethods.update',
  'setting.update',
] as const;

export const CONTACT_METHOD_DELETE_ANY = [
  'contactmethod.delete',
  'contact_method.delete',
  'contactmethods.delete',
  'setting.update',
] as const;
