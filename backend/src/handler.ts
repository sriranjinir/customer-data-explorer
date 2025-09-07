import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CustomerDataService } from './services/customerDataService';
import { CustomerFilterService, CustomerFilters } from './services/customerFilterService';
import { PaginationService } from './services/paginationService';
import { ResponseHandler } from './utils/responseHandler';

/**
 * Extracts and validates query parameters from the API Gateway event
 * @param event - API Gateway event object
 * @returns Parsed query parameters
 */
function extractQueryParams(event: APIGatewayProxyEvent) {
  const queryParams = event.queryStringParameters || {};

  return {
    page: parseInt(queryParams.page || '1', 10),
    pageSize: parseInt(queryParams.pageSize || '10', 10),
    filters: {
      id: queryParams.id || '',
      fullName: queryParams.fullName || '',
      email: queryParams.email || '',
      registrationDate: queryParams.registrationDate || '',
    } as CustomerFilters
  };
}

/**
 * Lambda handler for getting customers with filtering and pagination
 */
export const getCustomers = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Extract and validate query parameters
    const { page, pageSize, filters } = extractQueryParams(event);

    // Validate filters
    const filterValidation = CustomerFilterService.validateFilters(filters);
    if (!filterValidation.isValid) {
      return ResponseHandler.validationError(filterValidation.errors);
    }

    // Get all customers from data service
    const allCustomers = CustomerDataService.getAllCustomers();

    // Apply filters
    const filteredCustomers = CustomerFilterService.applyFilters(allCustomers, filters);

    // Apply pagination
    const paginationResult = PaginationService.paginate(filteredCustomers, page, pageSize);

    // Create response
    const response = PaginationService.createCustomerResponse(paginationResult);

    return ResponseHandler.success(response);

  } catch (error) {
    console.error('Error in getCustomers handler:', error);
    return ResponseHandler.error('Internal server error');
  }
};

/**
 * Lambda handler for health check endpoint
 */
export const healthCheck = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const healthData = {
      message: 'Customer Data Explorer API is healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      totalCustomers: CustomerDataService.getTotalCustomerCount()
    };

    return ResponseHandler.success(healthData);
  } catch (error) {
    console.error('Error in healthCheck handler:', error);
    return ResponseHandler.error('Health check failed');
  }
};
