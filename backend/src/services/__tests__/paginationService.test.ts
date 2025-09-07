import { PaginationService } from '../paginationService';
import { Customer } from '../../types.d';

describe('PaginationService', () => {
  // Mock customer data for testing
  const mockCustomers: Customer[] = [
    { id: 'CUST-001', fullName: 'John Doe', email: 'john@email.com', registrationDate: '2023-01-15' },
    { id: 'CUST-002', fullName: 'Jane Smith', email: 'jane@email.com', registrationDate: '2023-02-20' },
    { id: 'CUST-003', fullName: 'Bob Johnson', email: 'bob@email.com', registrationDate: '2023-03-10' },
    { id: 'CUST-004', fullName: 'Alice Brown', email: 'alice@email.com', registrationDate: '2023-04-05' },
    { id: 'CUST-005', fullName: 'Charlie Wilson', email: 'charlie@email.com', registrationDate: '2023-05-12' },
    { id: 'CUST-006', fullName: 'Diana Davis', email: 'diana@email.com', registrationDate: '2023-06-18' },
    { id: 'CUST-007', fullName: 'Eve Miller', email: 'eve@email.com', registrationDate: '2023-07-22' },
    { id: 'CUST-008', fullName: 'Frank Garcia', email: 'frank@email.com', registrationDate: '2023-08-14' },
    { id: 'CUST-009', fullName: 'Grace Lee', email: 'grace@email.com', registrationDate: '2023-09-03' },
    { id: 'CUST-010', fullName: 'Henry Taylor', email: 'henry@email.com', registrationDate: '2023-10-08' }
  ];

  describe('validatePaginationParams', () => {
    it('should return valid parameters when given positive integers', () => {
      const result = PaginationService.validatePaginationParams(2, 5);

      expect(result).toEqual({
        page: 2,
        pageSize: 5
      });
    });

    it('should default to page 1 when page is less than 1', () => {
      const result = PaginationService.validatePaginationParams(0, 10);

      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it('should default to page 1 when page is negative', () => {
      const result = PaginationService.validatePaginationParams(-5, 10);

      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it('should default to page 1 when page is NaN', () => {
      const result = PaginationService.validatePaginationParams(NaN, 10);

      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it('should default to pageSize 10 when pageSize is less than 1', () => {
      const result = PaginationService.validatePaginationParams(1, 0);

      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it('should default to pageSize 1 when pageSize is negative', () => {
      const result = PaginationService.validatePaginationParams(1, -3);

      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(1); // Math.max(1, -3) = 1
    });

    it('should default to pageSize 10 when pageSize is NaN', () => {
      const result = PaginationService.validatePaginationParams(1, NaN);

      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it('should cap pageSize at 100 when given value exceeds maximum', () => {
      const result = PaginationService.validatePaginationParams(1, 150);

      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(100);
    });

    it('should floor decimal page numbers', () => {
      const result = PaginationService.validatePaginationParams(2.7, 5.9);

      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(5);
    });

    it('should handle both parameters being invalid', () => {
      const result = PaginationService.validatePaginationParams(NaN, NaN);

      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });
  });

  describe('paginate', () => {
    it('should return correct pagination for first page', () => {
      const result = PaginationService.paginate(mockCustomers, 1, 3);

      expect(result).toEqual({
        items: mockCustomers.slice(0, 3),
        total: 10,
        page: 1,
        pageSize: 3,
        totalPages: 4,
        hasNextPage: true,
        hasPreviousPage: false
      });
    });

    it('should return correct pagination for middle page', () => {
      const result = PaginationService.paginate(mockCustomers, 2, 3);

      expect(result).toEqual({
        items: mockCustomers.slice(3, 6),
        total: 10,
        page: 2,
        pageSize: 3,
        totalPages: 4,
        hasNextPage: true,
        hasPreviousPage: true
      });
    });

    it('should return correct pagination for last page', () => {
      const result = PaginationService.paginate(mockCustomers, 4, 3);

      expect(result).toEqual({
        items: mockCustomers.slice(9, 10), // Only 1 item on last page
        total: 10,
        page: 4,
        pageSize: 3,
        totalPages: 4,
        hasNextPage: false,
        hasPreviousPage: true
      });
    });

    it('should handle empty array', () => {
      const result = PaginationService.paginate([], 1, 10);

      expect(result).toEqual({
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      });
    });

    it('should handle page size larger than total items', () => {
      const result = PaginationService.paginate(mockCustomers, 1, 20);

      expect(result).toEqual({
        items: mockCustomers,
        total: 10,
        page: 1,
        pageSize: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      });
    });

    it('should handle page number beyond available pages', () => {
      const result = PaginationService.paginate(mockCustomers, 10, 3);

      expect(result).toEqual({
        items: [],
        total: 10,
        page: 10,
        pageSize: 3,
        totalPages: 4,
        hasNextPage: false,
        hasPreviousPage: true
      });
    });

    it('should validate parameters internally', () => {
      // Test with invalid parameters that should be corrected
      const result = PaginationService.paginate(mockCustomers, -1, NaN);

      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.items).toEqual(mockCustomers);
      expect(result.total).toBe(10);
    });

    it('should calculate totalPages correctly for exact division', () => {
      const result = PaginationService.paginate(mockCustomers, 1, 5);

      expect(result.totalPages).toBe(2); // 10 items / 5 per page = 2 pages
    });

    it('should calculate totalPages correctly for inexact division', () => {
      const result = PaginationService.paginate(mockCustomers, 1, 3);

      expect(result.totalPages).toBe(4); // 10 items / 3 per page = 3.33... = 4 pages
    });

    it('should handle single item per page', () => {
      const result = PaginationService.paginate(mockCustomers.slice(0, 3), 2, 1);

      expect(result).toEqual({
        items: [mockCustomers[1]],
        total: 3,
        page: 2,
        pageSize: 1,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true
      });
    });

    it('should work with different data types', () => {
      const stringArray = ['a', 'b', 'c', 'd', 'e'];
      const result = PaginationService.paginate(stringArray, 2, 2);

      expect(result).toEqual({
        items: ['c', 'd'],
        total: 5,
        page: 2,
        pageSize: 2,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true
      });
    });
  });

  describe('createCustomerResponse', () => {
    it('should create customer response from pagination result', () => {
      const paginationResult = {
        items: mockCustomers.slice(0, 3),
        total: 10,
        page: 1,
        pageSize: 3,
        totalPages: 4,
        hasNextPage: true,
        hasPreviousPage: false
      };

      const result = PaginationService.createCustomerResponse(paginationResult);

      expect(result).toEqual({
        items: mockCustomers.slice(0, 3),
        total: 10,
        page: 1,
        pageSize: 3,
        totalPages: 4
      });
    });

    it('should handle empty pagination result', () => {
      const paginationResult = {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      };

      const result = PaginationService.createCustomerResponse(paginationResult);

      expect(result).toEqual({
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0
      });
    });

    it('should exclude navigation properties from response', () => {
      const paginationResult = {
        items: mockCustomers.slice(0, 2),
        total: 10,
        page: 2,
        pageSize: 2,
        totalPages: 5,
        hasNextPage: true,
        hasPreviousPage: true
      };

      const result = PaginationService.createCustomerResponse(paginationResult);

      expect(result).not.toHaveProperty('hasNextPage');
      expect(result).not.toHaveProperty('hasPreviousPage');
      expect(Object.keys(result)).toEqual(['items', 'total', 'page', 'pageSize', 'totalPages']);
    });
  });

  describe('Integration tests', () => {
    it('should work end-to-end for typical use case', () => {
      // Simulate a typical pagination workflow
      const page = 2;
      const pageSize = 4;

      // Step 1: Validate parameters
      const validatedParams = PaginationService.validatePaginationParams(page, pageSize);
      expect(validatedParams).toEqual({ page: 2, pageSize: 4 });

      // Step 2: Paginate data
      const paginationResult = PaginationService.paginate(mockCustomers, page, pageSize);
      expect(paginationResult.items).toHaveLength(4);
      expect(paginationResult.items).toEqual(mockCustomers.slice(4, 8));

      // Step 3: Create response
      const response = PaginationService.createCustomerResponse(paginationResult);
      expect(response.items).toHaveLength(4);
      expect(response.page).toBe(2);
      expect(response.totalPages).toBe(3);
    });

    it('should handle edge case of last page with fewer items', () => {
      const page = 3;
      const pageSize = 4;

      const paginationResult = PaginationService.paginate(mockCustomers, page, pageSize);
      expect(paginationResult.items).toHaveLength(2); // Only 2 items on last page
      expect(paginationResult.hasNextPage).toBe(false);
      expect(paginationResult.hasPreviousPage).toBe(true);

      const response = PaginationService.createCustomerResponse(paginationResult);
      expect(response.items).toHaveLength(2);
      expect(response.totalPages).toBe(3);
    });

    it('should maintain data integrity across pagination', () => {
      const pageSize = 3;
      const allPaginatedItems: Customer[] = [];

      // Collect all items from all pages
      for (let page = 1; page <= 4; page++) {
        const result = PaginationService.paginate(mockCustomers, page, pageSize);
        allPaginatedItems.push(...result.items);
      }

      // Verify all items are included and in correct order
      expect(allPaginatedItems).toEqual(mockCustomers);
    });
  });
});
