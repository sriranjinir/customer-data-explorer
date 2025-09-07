import { APIGatewayProxyEvent } from 'aws-lambda';
import { getCustomers, healthCheck } from '../handler';
import { CustomerDataService } from '../services/customerDataService';
import { CustomerFilterService } from '../services/customerFilterService';
import { PaginationService } from '../services/paginationService';
import { ResponseHandler } from '../utils/responseHandler';

// Mock all dependencies
jest.mock('../services/customerDataService');
jest.mock('../services/customerFilterService');
jest.mock('../services/paginationService');
jest.mock('../utils/responseHandler');

const mockCustomerDataService = CustomerDataService as jest.Mocked<typeof CustomerDataService>;
const mockCustomerFilterService = CustomerFilterService as jest.Mocked<typeof CustomerFilterService>;
const mockPaginationService = PaginationService as jest.Mocked<typeof PaginationService>;
const mockResponseHandler = ResponseHandler as jest.Mocked<typeof ResponseHandler>;

describe('Handler Tests', () => {
  describe('getCustomers', () => {
    const mockEvent: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: null,
    };

    const mockCustomers = [
      {
        id: 'CUST-001',
        fullName: 'John Doe',
        email: 'john.doe@email.com',
        registrationDate: '2023-01-15'
      },
      {
        id: 'CUST-002',
        fullName: 'Jane Smith',
        email: 'jane.smith@email.com',
        registrationDate: '2023-02-20'
      }
    ];

    const mockPaginationResult = {
      items: mockCustomers,
      total: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false
    };

    const mockCustomerResponse = {
      items: mockCustomers,
      total: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1
    };

    it('should successfully get customers with default parameters', async () => {
      mockCustomerFilterService.validateFilters.mockReturnValue({ isValid: true, errors: [] });
      mockCustomerDataService.getAllCustomers.mockReturnValue(mockCustomers);
      mockCustomerFilterService.applyFilters.mockReturnValue(mockCustomers);
      mockPaginationService.paginate.mockReturnValue(mockPaginationResult);
      mockPaginationService.createCustomerResponse.mockReturnValue(mockCustomerResponse);
      mockResponseHandler.success.mockReturnValue({
        statusCode: 200,
        headers: {},
        body: JSON.stringify(mockCustomerResponse)
      });

      const result = await getCustomers(mockEvent as APIGatewayProxyEvent);

      expect(mockCustomerDataService.getAllCustomers).toHaveBeenCalledTimes(1);
      expect(mockCustomerFilterService.validateFilters).toHaveBeenCalledWith({
        id: '',
        fullName: '',
        email: '',
        registrationDate: ''
      });
      expect(mockCustomerFilterService.applyFilters).toHaveBeenCalledWith(mockCustomers, {
        id: '',
        fullName: '',
        email: '',
        registrationDate: ''
      });
      expect(mockPaginationService.paginate).toHaveBeenCalledWith(mockCustomers, 1, 10);
      expect(mockPaginationService.createCustomerResponse).toHaveBeenCalledWith(mockPaginationResult);
      expect(mockResponseHandler.success).toHaveBeenCalledWith(mockCustomerResponse);
      expect(result.statusCode).toBe(200);
    });

    it('should handle custom query parameters', async () => {
      const eventWithParams: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: {
          page: '2',
          pageSize: '5',
          id: 'CUST-001',
          fullName: 'John',
          email: 'john@email.com',
          registrationDate: '15/01/2023'
        }
      };

      mockCustomerFilterService.validateFilters.mockReturnValue({ isValid: true, errors: [] });
      mockCustomerDataService.getAllCustomers.mockReturnValue(mockCustomers);
      mockCustomerFilterService.applyFilters.mockReturnValue([mockCustomers[0]]);
      mockPaginationService.paginate.mockReturnValue({
        ...mockPaginationResult,
        page: 2,
        pageSize: 5,
        items: [mockCustomers[0]]
      });
      mockPaginationService.createCustomerResponse.mockReturnValue({
        ...mockCustomerResponse,
        page: 2,
        pageSize: 5,
        items: [mockCustomers[0]]
      });
      mockResponseHandler.success.mockReturnValue({
        statusCode: 200,
        headers: {},
        body: JSON.stringify(mockCustomerResponse)
      });

      const result = await getCustomers(eventWithParams as APIGatewayProxyEvent);

      expect(mockCustomerFilterService.validateFilters).toHaveBeenCalledWith({
        id: 'CUST-001',
        fullName: 'John',
        email: 'john@email.com',
        registrationDate: '15/01/2023'
      });
      expect(mockPaginationService.paginate).toHaveBeenCalledWith([mockCustomers[0]], 2, 5);
    });

    it('should handle filter validation errors', async () => {
      const validationErrors = ['Invalid date format'];
      mockCustomerFilterService.validateFilters.mockReturnValue({
        isValid: false,
        errors: validationErrors
      });
      mockResponseHandler.validationError.mockReturnValue({
        statusCode: 400,
        headers: {},
        body: JSON.stringify({ error: 'Validation failed', details: { validationErrors } })
      });

      const result = await getCustomers(mockEvent as APIGatewayProxyEvent);

      expect(mockCustomerFilterService.validateFilters).toHaveBeenCalled();
      expect(mockResponseHandler.validationError).toHaveBeenCalledWith(validationErrors);
      expect(mockCustomerDataService.getAllCustomers).not.toHaveBeenCalled();
      expect(result.statusCode).toBe(400);
    });

    it('should handle empty customer list', async () => {
      const emptyCustomers: any[] = [];
      const emptyPaginationResult = {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      };
      const emptyResponse = {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0
      };

      mockCustomerFilterService.validateFilters.mockReturnValue({ isValid: true, errors: [] });
      mockCustomerDataService.getAllCustomers.mockReturnValue(emptyCustomers);
      mockCustomerFilterService.applyFilters.mockReturnValue(emptyCustomers);
      mockPaginationService.paginate.mockReturnValue(emptyPaginationResult);
      mockPaginationService.createCustomerResponse.mockReturnValue(emptyResponse);
      mockResponseHandler.success.mockReturnValue({
        statusCode: 200,
        headers: {},
        body: JSON.stringify(emptyResponse)
      });

      const result = await getCustomers(mockEvent as APIGatewayProxyEvent);

      expect(mockPaginationService.createCustomerResponse).toHaveBeenCalledWith(emptyPaginationResult);
      expect(result.statusCode).toBe(200);
    });

    it('should handle errors and return internal server error', async () => {
      const error = new Error('Database connection failed');
      mockCustomerFilterService.validateFilters.mockReturnValue({ isValid: true, errors: [] });
      mockCustomerDataService.getAllCustomers.mockImplementation(() => {
        throw error;
      });
      mockResponseHandler.error.mockReturnValue({
        statusCode: 500,
        headers: {},
        body: JSON.stringify({ error: 'Internal server error' })
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await getCustomers(mockEvent as APIGatewayProxyEvent);

      expect(consoleSpy).toHaveBeenCalledWith('Error in getCustomers handler:', error);
      expect(mockResponseHandler.error).toHaveBeenCalledWith('Internal server error');
      expect(result.statusCode).toBe(500);

      consoleSpy.mockRestore();
    });

    it('should parse numeric parameters correctly', async () => {
      const eventWithStringNumbers: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: {
          page: '3',
          pageSize: '15'
        }
      };

      mockCustomerFilterService.validateFilters.mockReturnValue({ isValid: true, errors: [] });
      mockCustomerDataService.getAllCustomers.mockReturnValue(mockCustomers);
      mockCustomerFilterService.applyFilters.mockReturnValue(mockCustomers);
      mockPaginationService.paginate.mockReturnValue(mockPaginationResult);
      mockPaginationService.createCustomerResponse.mockReturnValue(mockCustomerResponse);
      mockResponseHandler.success.mockReturnValue({
        statusCode: 200,
        headers: {},
        body: JSON.stringify(mockCustomerResponse)
      });

      // Act
      await getCustomers(eventWithStringNumbers as APIGatewayProxyEvent);

      // Assert
      expect(mockPaginationService.paginate).toHaveBeenCalledWith(mockCustomers, 3, 15);
    });

    it('should handle malformed query parameters gracefully', async () => {
      const eventWithInvalidParams: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: {
          page: 'invalid',
          pageSize: 'abc',
          id: null as any
        }
      };

      mockCustomerFilterService.validateFilters.mockReturnValue({ isValid: true, errors: [] });
      mockCustomerDataService.getAllCustomers.mockReturnValue(mockCustomers);
      mockCustomerFilterService.applyFilters.mockReturnValue(mockCustomers);
      mockPaginationService.paginate.mockReturnValue(mockPaginationResult);
      mockPaginationService.createCustomerResponse.mockReturnValue(mockCustomerResponse);
      mockResponseHandler.success.mockReturnValue({
        statusCode: 200,
        headers: {},
        body: JSON.stringify(mockCustomerResponse)
      });

      await getCustomers(eventWithInvalidParams as APIGatewayProxyEvent);

      // parseInt('invalid') and parseInt('abc') return NaN, which are passed to paginate
      // The PaginationService.paginate internally validates and falls back to defaults
      expect(mockPaginationService.paginate).toHaveBeenCalledWith(mockCustomers, NaN, NaN);
      expect(mockCustomerFilterService.validateFilters).toHaveBeenCalledWith({
        id: '',
        fullName: '',
        email: '',
        registrationDate: ''
      });
    });
  });

  describe('healthCheck', () => {
    const mockEvent: Partial<APIGatewayProxyEvent> = {};

    it('should return health status successfully', async () => {
      const totalCustomers = 50;
      const expectedHealthData = {
        message: 'Customer Data Explorer API is healthy',
        timestamp: expect.any(String),
        version: '1.0.0',
        totalCustomers: totalCustomers
      };

      mockCustomerDataService.getTotalCustomerCount.mockReturnValue(totalCustomers);
      mockResponseHandler.success.mockReturnValue({
        statusCode: 200,
        headers: {},
        body: JSON.stringify(expectedHealthData)
      });

      const result = await healthCheck(mockEvent as APIGatewayProxyEvent);

      expect(mockCustomerDataService.getTotalCustomerCount).toHaveBeenCalledTimes(1);
      expect(mockResponseHandler.success).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Customer Data Explorer API is healthy',
          version: '1.0.0',
          totalCustomers: totalCustomers,
          timestamp: expect.any(String)
        })
      );
      expect(result.statusCode).toBe(200);
    });

    it('should include correct timestamp format', async () => {
      mockCustomerDataService.getTotalCustomerCount.mockReturnValue(10);
      mockResponseHandler.success.mockReturnValue({
        statusCode: 200,
        headers: {},
        body: JSON.stringify({})
      });

      await healthCheck(mockEvent as APIGatewayProxyEvent);

      const callArgs = mockResponseHandler.success.mock.calls[0][0];
      expect(callArgs.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should handle errors in health check', async () => {
      const error = new Error('Service unavailable');
      mockCustomerDataService.getTotalCustomerCount.mockImplementation(() => {
        throw error;
      });
      mockResponseHandler.error.mockReturnValue({
        statusCode: 500,
        headers: {},
        body: JSON.stringify({ error: 'Health check failed' })
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await healthCheck(mockEvent as APIGatewayProxyEvent);

      expect(consoleSpy).toHaveBeenCalledWith('Error in healthCheck handler:', error);
      expect(mockResponseHandler.error).toHaveBeenCalledWith('Health check failed');
      expect(result.statusCode).toBe(500);

      consoleSpy.mockRestore();
    });
  });

  describe('extractQueryParams helper function', () => {
    it('should extract query parameters correctly through getCustomers', async () => {
      const eventWithAllParams: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: {
          page: '2',
          pageSize: '20',
          id: 'CUST-123',
          fullName: 'Test User',
          email: 'test@example.com',
          registrationDate: '01/01/2023'
        }
      };

      mockCustomerFilterService.validateFilters.mockReturnValue({ isValid: true, errors: [] });
      mockCustomerDataService.getAllCustomers.mockReturnValue([]);
      mockCustomerFilterService.applyFilters.mockReturnValue([]);
      mockPaginationService.paginate.mockReturnValue({
        items: [],
        total: 0,
        page: 2,
        pageSize: 20,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: true
      });
      mockPaginationService.createCustomerResponse.mockReturnValue({
        items: [],
        total: 0,
        page: 2,
        pageSize: 20,
        totalPages: 0
      });
      mockResponseHandler.success.mockReturnValue({
        statusCode: 200,
        headers: {},
        body: '{}'
      });

      await getCustomers(eventWithAllParams as APIGatewayProxyEvent);

      expect(mockPaginationService.paginate).toHaveBeenCalledWith([], 2, 20);
      expect(mockCustomerFilterService.validateFilters).toHaveBeenCalledWith({
        id: 'CUST-123',
        fullName: 'Test User',
        email: 'test@example.com',
        registrationDate: '01/01/2023'
      });
    });
  });
});
