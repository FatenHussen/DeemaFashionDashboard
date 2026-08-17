/**
 * Backend "destructive action needs an explicit ack" convention.
 *
 * An endpoint that would touch linked records answers `409` with
 * `{ requires_confirmation: true, data: <impact> }` instead of acting. The caller shows
 * `data` to the user and repeats the same request with `confirm=true` to go through.
 *
 * The axios response interceptor turns those responses into this error (and skips the
 * global toast) so the impact payload survives all the way to the calling component.
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
