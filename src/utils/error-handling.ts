// src/utils/error-handling.ts
import { toast } from 'sonner';
import { PostgrestError } from '@supabase/supabase-js';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export enum ErrorCode {
  AUTHENTICATION = 'AUTH_ERROR',
  NETWORK = 'NETWORK_ERROR',
  DATABASE = 'DATABASE_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  GAME_LOGIC = 'GAME_LOGIC_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR',
}

interface ErrorHandlerOptions {
  showToast?: boolean;
  throwError?: boolean;
  context?: string;
}

export const handleError = (
  error: unknown,
  options: ErrorHandlerOptions = { showToast: true, throwError: false }
) => {
  const { showToast, throwError, context } = options;
  let appError: AppError;

  // Parse the error
  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof PostgrestError) {
    appError = new AppError(
      error.message,
      ErrorCode.DATABASE,
      error.code ? parseInt(error.code) : undefined,
      error
    );
  } else if (error instanceof Error) {
    appError = new AppError(error.message, ErrorCode.UNKNOWN, undefined, error);
  } else {
    appError = new AppError(
      'An unexpected error occurred',
      ErrorCode.UNKNOWN,
      undefined,
      error
    );
  }

  // Log the error
  console.error(`Error${context ? ` in ${context}` : ''}:`, {
    message: appError.message,
    code: appError.code,
    status: appError.status,
    originalError: appError.originalError,
  });

  // Show toast if requested
  if (showToast) {
    toast.error(appError.message);
  }

  // Throw if requested
  if (throwError) {
    throw appError;
  }

  return appError;
};

// API error handling wrapper
export const withErrorHandling = async <T>(
  promise: Promise<T>,
  options?: ErrorHandlerOptions
): Promise<T> => {
  try {
    return await promise;
  } catch (error) {
    handleError(error, options);
    throw error;
  }
};

// Validation error handler
export const handleValidationError = (
  errors: Record<string, string[]>,
  options?: ErrorHandlerOptions
) => {
  const firstError = Object.values(errors)[0]?.[0];
  if (firstError) {
    handleError(
      new AppError(firstError, ErrorCode.VALIDATION),
      options
    );
  }
};

// Game-specific error handlers
export const handleGameError = (
  error: unknown,
  context: string,
  options?: ErrorHandlerOptions
) => {
  handleError(error, {
    ...options,
    context: `Game - ${context}`,
  });
};

// Usage example:
// try {
//   await withErrorHandling(
//     supabase.from('games').insert({ /* game data */ }),
//     { context: 'Creating new game' }
//   );
// } catch (error) {
//   // Error has been handled, but you can add additional handling here
// }