/**
 * Backend "destructive action needs an explicit ack" convention.
 *
 * An endpoint that would touch linked records answers `409` with
 * `{ requires_confirmation: true, data: <impact> }` instead of acting. The caller shows
 * `data` to the user and repeats the same request with `confirm=true` to go through.
 *
 * The axios response interceptor turns those responses into this error (and never
 * toasts them) so the impact payload survives all the way to the calling component.
 */
export class ConfirmationRequiredError<TImpact = unknown> extends Error {
  readonly requiresConfirmation = true as const;

  /** The `data` object from the 409 body — endpoint-specific impact details. */
  readonly impact: TImpact;

  constructor(message: string, impact: TImpact) {
    super(message);
    this.name = 'ConfirmationRequiredError';
    this.impact = impact;
  }
}

export function isConfirmationRequiredError<TImpact = unknown>(
  error: unknown
): error is ConfirmationRequiredError<TImpact> {
  return error instanceof ConfirmationRequiredError;
}

// ----------------------------------------------------------------------

/**
 * Laravel `422` validation failure with the per-field messages preserved.
 *
 * The response interceptor still builds the same flattened `message` (so callers that
 * only read `error.message` are unaffected), but keeps `{ errors: { field: [...] } }`
 * here so a form can drop each message under the field that caused it.
 * Keys stay in Laravel's dotted form (`name.en`, `filters.category_id`), which is also
 * what react-hook-form's `setError` expects.
 */
export class ApiValidationError extends Error {
  readonly isValidationError = true as const;

  readonly fieldErrors: Record<string, string[]>;

  constructor(message: string, fieldErrors: Record<string, string[]>) {
    super(message);
    this.name = 'ApiValidationError';
    this.fieldErrors = fieldErrors;
  }
}

export function isApiValidationError(error: unknown): error is ApiValidationError {
  return error instanceof ApiValidationError;
}
