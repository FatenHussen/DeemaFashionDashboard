/**
 * Resolves a user-facing message from API errors.
 * Matches axios interceptor behavior: rejected errors are often `Error` with message already set.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  const e = error as {
    response?: { data?: { message?: string; errors?: Record<string, string[] | string> } };
  };
  const data = e.response?.data;
  if (data?.message && typeof data.message === 'string') {
    return data.message;
  }
  const errors = data?.errors;
  if (errors && typeof errors === 'object') {
    for (const value of Object.values(errors)) {
      if (Array.isArray(value) && value[0] && typeof value[0] === 'string') {
        return value[0];
      }
      if (typeof value === 'string' && value.trim()) {
        return value;
      }
    }
  }
  return fallback;
}
