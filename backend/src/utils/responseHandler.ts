import { APIGatewayProxyResult } from 'aws-lambda';

/**
 * Standard API response utility for consistent response formatting
 */
export class ResponseHandler {
  private static readonly CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  /**
   * Creates a successful response
   * @param data - Response data
   * @param statusCode - HTTP status code (default: 200)
   * @returns API Gateway response object
   */
  public static success(data: any, statusCode: number = 200): APIGatewayProxyResult {
    return {
      statusCode,
      headers: this.CORS_HEADERS,
      body: JSON.stringify(data),
    };
  }

  /**
   * Creates an error response
   * @param message - Error message
   * @param statusCode - HTTP status code (default: 500)
   * @param details - Additional error details (optional)
   * @returns API Gateway response object
   */
  public static error(message: string, statusCode: number = 500, details?: any): APIGatewayProxyResult {
    const errorResponse = {
      error: message,
      ...(details && { details })
    };

    return {
      statusCode,
      headers: this.CORS_HEADERS,
      body: JSON.stringify(errorResponse),
    };
  }

  /**
   * Creates a validation error response
   * @param errors - Array of validation error messages
   * @returns API Gateway response object
   */
  public static validationError(errors: string[]): APIGatewayProxyResult {
    return this.error('Validation failed', 400, { validationErrors: errors });
  }

  /**
   * Creates a not found response
   * @param resource - Resource that was not found
   * @returns API Gateway response object
   */
  public static notFound(resource: string = 'Resource'): APIGatewayProxyResult {
    return this.error(`${resource} not found`, 404);
  }
}
