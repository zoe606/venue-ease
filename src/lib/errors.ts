export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

// Common error codes
export const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  VENUE_NOT_FOUND: "VENUE_NOT_FOUND",
  CAPACITY_EXCEEDED: "CAPACITY_EXCEEDED",
  DATES_UNAVAILABLE: "DATES_UNAVAILABLE",
  INVALID_DATE_RANGE: "INVALID_DATE_RANGE",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export function handleApiError(error: unknown): { error: { code: string; message: string; details?: unknown }; status: number } {
  if (error instanceof AppError) {
    return {
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      status: error.statusCode,
    };
  }

  console.error("Unexpected error:", error);

  return {
    error: {
      code: ErrorCodes.INTERNAL_ERROR,
      message: "An unexpected error occurred",
    },
    status: 500,
  };
}
