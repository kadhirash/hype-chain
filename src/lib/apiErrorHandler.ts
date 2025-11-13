import { NextResponse } from 'next/server';

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: any;
}

/**
 * Creates a standardized error response for API routes
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage: string = 'An error occurred',
  statusCode: number = 500
): NextResponse {
  // Log error with context
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  console.error(`[API Error] ${defaultMessage}:`, {
    message: errorMessage,
    stack: errorStack,
    timestamp: new Date().toISOString(),
  });

  // Don't expose internal error details to client
  const clientMessage = statusCode >= 500 
    ? defaultMessage 
    : errorMessage || defaultMessage;

  return NextResponse.json(
    {
      error: clientMessage,
      ...(process.env.NODE_ENV === 'development' && errorStack && {
        details: errorMessage,
      }),
    },
    { status: statusCode }
  );
}

/**
 * Handles common error types and returns appropriate responses
 */
export function handleApiError(error: unknown, context: string): NextResponse {
  if (error instanceof Error) {
    // Database errors
    if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
      return createErrorResponse(error, `${context}: Resource already exists`, 409);
    }
    
    if (error.message.includes('foreign key') || error.message.includes('violates foreign key')) {
      return createErrorResponse(error, `${context}: Invalid reference`, 400);
    }
    
    if (error.message.includes('not found') || error.message.includes('does not exist')) {
      return createErrorResponse(error, `${context}: Resource not found`, 404);
    }
    
    // Validation errors
    if (error.message.includes('invalid') || error.message.includes('validation')) {
      return createErrorResponse(error, `${context}: Invalid input`, 400);
    }
  }

  // Default error response
  return createErrorResponse(error, `${context}: Failed to process request`, 500);
}

/**
 * Validates required fields in request body
 */
export function validateRequiredFields(
  body: any,
  fields: string[]
): { isValid: boolean; missingFields?: string[] } {
  const missingFields = fields.filter(field => {
    const value = body[field];
    return value === undefined || value === null || value === '';
  });

  if (missingFields.length > 0) {
    return { isValid: false, missingFields };
  }

  return { isValid: true };
}

