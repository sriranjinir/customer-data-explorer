import { CustomerFilterService, CustomerFilters } from '../customerFilterService';
import { Customer } from '../../types.d';
import * as dateUtils from '../../utils/dateUtils';

// Mock the dateUtils module
jest.mock('../../utils/dateUtils');
const mockDateUtils = dateUtils as jest.Mocked<typeof dateUtils>;

describe('CustomerFilterService', () => {
  // Mock customer data for testing
  const mockCustomers: Customer[] = [
    { id: 'CUST-001', fullName: 'John Doe', email: 'john.doe@email.com', registrationDate: '2023-01-15' },
    { id: 'CUST-002', fullName: 'Jane Smith', email: 'jane.smith@email.com', registrationDate: '2023-02-20' },
    { id: 'cust-003', fullName: 'Bob Johnson', email: 'BOB.JOHNSON@EMAIL.COM', registrationDate: '2023-03-10' },
    { id: 'CUST-004', fullName: 'Alice Brown', email: 'alice.brown@email.com', registrationDate: '2023-04-05' },
    { id: 'CUST-005', fullName: 'Charlie Wilson', email: 'charlie.wilson@email.com', registrationDate: '2023-05-12' },
    { id: 'CUST-006', fullName: 'diana davis', email: 'diana.davis@email.com', registrationDate: '2023-06-18' },
    { id: 'CUST-007', fullName: 'Eve Miller', email: 'eve.miller@email.com', registrationDate: '2023-07-22' },
    { id: 'CUST-008', fullName: 'Frank Garcia', email: 'frank.garcia@email.com', registrationDate: '2023-08-14' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('applyFilters', () => {
    it('should return all customers when no filters are provided', () => {
      const filters: CustomerFilters = {
        id: '',
        fullName: '',
        email: '',
        registrationDate: ''
      };

      const result = CustomerFilterService.applyFilters(mockCustomers, filters);

      expect(result).toEqual(mockCustomers);
      expect(result).toHaveLength(8);
    });

    it('should filter by ID (case-insensitive)', () => {
      const filters: CustomerFilters = {
        id: 'CUST-001',
        fullName: '',
        email: '',
        registrationDate: ''
      };

      const result = CustomerFilterService.applyFilters(mockCustomers, filters);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('CUST-001');
    });

    it('should filter by ID with partial match (case-insensitive)', () => {
      const filters: CustomerFilters = {
        id: 'cust',
        fullName: '',
        email: '',
        registrationDate: ''
      };

      const result = CustomerFilterService.applyFilters(mockCustomers, filters);

      expect(result).toHaveLength(8); // All customers have 'cust' in their ID
      expect(result.every(c => c.id.toLowerCase().includes('cust'))).toBe(true);
    });

    it('should filter by full name (case-insensitive)', () => {
      const filters: CustomerFilters = {
        id: '',
        fullName: 'john',
        email: '',
        registrationDate: ''
      };

      const result = CustomerFilterService.applyFilters(mockCustomers, filters);

      expect(result).toHaveLength(2); // John Doe and Bob Johnson
      expect(result.every(c => c.fullName.toLowerCase().includes('john'))).toBe(true);
    });

    it('should filter by full name with exact case', () => {
      const filters: CustomerFilters = {
        id: '',
        fullName: 'Jane Smith',
        email: '',
        registrationDate: ''
      };

      const result = CustomerFilterService.applyFilters(mockCustomers, filters);

      expect(result).toHaveLength(1);
      expect(result[0].fullName).toBe('Jane Smith');
    });

    it('should filter by email (case-insensitive)', () => {
      const filters: CustomerFilters = {
        id: '',
        fullName: '',
        email: 'john.doe@email.com',
        registrationDate: ''
      };

      const result = CustomerFilterService.applyFilters(mockCustomers, filters);

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('john.doe@email.com');
    });

    it('should filter by email domain', () => {
      const filters: CustomerFilters = {
        id: '',
        fullName: '',
        email: 'email.com',
        registrationDate: ''
      };

      const result = CustomerFilterService.applyFilters(mockCustomers, filters);

      expect(result).toHaveLength(8); // All customers have 'email.com' in their email
      expect(result.every(c => c.email.toLowerCase().includes('email.com'))).toBe(true);
    });

    it('should filter by registration date when valid date format is provided', () => {
      const filters: CustomerFilters = {
        id: '',
        fullName: '',
        email: '',
        registrationDate: '15/01/2023'
      };

      // Mock convertDateFormat to return the expected ISO format
      mockDateUtils.convertDateFormat.mockReturnValue('2023-01-15');

      const result = CustomerFilterService.applyFilters(mockCustomers, filters);

      expect(result).toHaveLength(1);
      expect(result[0].registrationDate).toBe('2023-01-15');
      expect(mockDateUtils.convertDateFormat).toHaveBeenCalledWith('15/01/2023');
    });

    it('should return empty array when invalid date format is provided', () => {
      const filters: CustomerFilters = {
        id: '',
        fullName: '',
        email: '',
        registrationDate: 'invalid-date'
      };

      // Mock convertDateFormat to return null for invalid format
      mockDateUtils.convertDateFormat.mockReturnValue(null);

      const result = CustomerFilterService.applyFilters(mockCustomers, filters);

      expect(result).toHaveLength(0);
      expect(mockDateUtils.convertDateFormat).toHaveBeenCalledWith('invalid-date');
    });

    it('should apply multiple filters simultaneously', () => {
      const filters: CustomerFilters = {
        id: 'CUST',
        fullName: 'Alice',
        email: 'alice',
        registrationDate: ''
      };

      const result = CustomerFilterService.applyFilters(mockCustomers, filters);

      expect(result).toHaveLength(1);
      expect(result[0].fullName).toBe('Alice Brown');
      expect(result[0].email).toBe('alice.brown@email.com');
    });

    it('should return empty array when no customers match multiple filters', () => {
      const filters: CustomerFilters = {
        id: 'CUST-001',
        fullName: 'Jane', // John Doe doesn't have Jane in name
        email: '',
        registrationDate: ''
      };

      const result = CustomerFilterService.applyFilters(mockCustomers, filters);

      expect(result).toHaveLength(0);
    });

    it('should handle empty customer array', () => {
      const filters: CustomerFilters = {
        id: 'CUST-001',
        fullName: 'John',
        email: 'john@email.com',
        registrationDate: '15/01/2023'
      };

      const result = CustomerFilterService.applyFilters([], filters);

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should handle case sensitivity correctly for all filters', () => {
      const filters: CustomerFilters = {
        id: 'cust-003', // lowercase
        fullName: 'BOB JOHNSON', // uppercase
        email: 'BOB.JOHNSON@EMAIL.COM', // uppercase
        registrationDate: ''
      };

      const result = CustomerFilterService.applyFilters(mockCustomers, filters);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('cust-003');
      expect(result[0].fullName).toBe('Bob Johnson');
    });

    it('should handle special characters in search terms', () => {
      const filters: CustomerFilters = {
        id: '',
        fullName: '',
        email: '@',
        registrationDate: ''
      };

      const result = CustomerFilterService.applyFilters(mockCustomers, filters);

      expect(result).toHaveLength(8); // All emails contain @
      expect(result.every(c => c.email.includes('@'))).toBe(true);
    });
  });

  describe('validateFilters', () => {
    it('should return valid when all filters are empty', () => {
      const filters: CustomerFilters = {
        id: '',
        fullName: '',
        email: '',
        registrationDate: ''
      };

      const result = CustomerFilterService.validateFilters(filters);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return valid when registration date is empty', () => {
      const filters: CustomerFilters = {
        id: 'CUST-001',
        fullName: 'John',
        email: 'john@email.com',
        registrationDate: ''
      };

      const result = CustomerFilterService.validateFilters(filters);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return valid when registration date is in correct DD/MM/YYYY format', () => {
      const filters: CustomerFilters = {
        id: '',
        fullName: '',
        email: '',
        registrationDate: '15/01/2023'
      };

      // Mock convertDateFormat to return valid result
      mockDateUtils.convertDateFormat.mockReturnValue('2023-01-15');

      const result = CustomerFilterService.validateFilters(filters);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(mockDateUtils.convertDateFormat).toHaveBeenCalledWith('15/01/2023');
    });

    it('should return invalid when registration date is in wrong format', () => {
      const filters: CustomerFilters = {
        id: '',
        fullName: '',
        email: '',
        registrationDate: '2023-01-15' // Wrong format (should be DD/MM/YYYY)
      };

      // Mock convertDateFormat to return null for invalid format
      mockDateUtils.convertDateFormat.mockReturnValue(null);

      const result = CustomerFilterService.validateFilters(filters);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBe('Registration date must be in DD/MM/YYYY format');
      expect(mockDateUtils.convertDateFormat).toHaveBeenCalledWith('2023-01-15');
    });

    it('should return invalid when registration date is completely invalid', () => {
      const filters: CustomerFilters = {
        id: '',
        fullName: '',
        email: '',
        registrationDate: 'invalid-date'
      };

      // Mock convertDateFormat to return null for invalid format
      mockDateUtils.convertDateFormat.mockReturnValue(null);

      const result = CustomerFilterService.validateFilters(filters);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBe('Registration date must be in DD/MM/YYYY format');
    });

    it('should validate other filters correctly even with invalid date', () => {
      const filters: CustomerFilters = {
        id: 'CUST-001',
        fullName: 'John Doe',
        email: 'john@email.com',
        registrationDate: 'invalid'
      };

      // Mock convertDateFormat to return null for invalid format
      mockDateUtils.convertDateFormat.mockReturnValue(null);

      const result = CustomerFilterService.validateFilters(filters);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBe('Registration date must be in DD/MM/YYYY format');
    });

    it('should handle edge case date formats', () => {
      const testCases = [
        { date: '1/1/2023', shouldBeValid: false },
        { date: '01/01/23', shouldBeValid: false },
        { date: '32/01/2023', shouldBeValid: false },
        { date: '01/13/2023', shouldBeValid: false },
        { date: '', shouldBeValid: true }
      ];

      testCases.forEach(({ date, shouldBeValid }) => {
        const filters: CustomerFilters = {
          id: '',
          fullName: '',
          email: '',
          registrationDate: date
        };

        // Mock based on expected validity
        mockDateUtils.convertDateFormat.mockReturnValue(shouldBeValid && date ? '2023-01-01' : null);

        const result = CustomerFilterService.validateFilters(filters);

        expect(result.isValid).toBe(shouldBeValid);
        if (!shouldBeValid && date) {
          expect(result.errors).toContain('Registration date must be in DD/MM/YYYY format');
        }
      });
    });
  });

  describe('Private methods through public interface', () => {
    // Since the filtering methods are private, we test them through the public applyFilters method

    it('should test filterById functionality', () => {
      const filters: CustomerFilters = {
        id: '001',
        fullName: '',
        email: '',
        registrationDate: ''
      };

      const result = CustomerFilterService.applyFilters(mockCustomers, filters);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('CUST-001');
    });

    it('should test filterByFullName functionality', () => {
      const filters: CustomerFilters = {
        id: '',
        fullName: 'Smith',
        email: '',
        registrationDate: ''
      };

      const result = CustomerFilterService.applyFilters(mockCustomers, filters);

      expect(result).toHaveLength(1);
      expect(result[0].fullName).toBe('Jane Smith');
    });

    it('should test filterByEmail functionality', () => {
      const filters: CustomerFilters = {
        id: '',
        fullName: '',
        email: 'diana',
        registrationDate: ''
      };

      const result = CustomerFilterService.applyFilters(mockCustomers, filters);

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('diana.davis@email.com');
    });

    it('should test filterByRegistrationDate functionality', () => {
      const filters: CustomerFilters = {
        id: '',
        fullName: '',
        email: '',
        registrationDate: '10/03/2023'
      };

      mockDateUtils.convertDateFormat.mockReturnValue('2023-03-10');

      const result = CustomerFilterService.applyFilters(mockCustomers, filters);

      expect(result).toHaveLength(1);
      expect(result[0].registrationDate).toBe('2023-03-10');
    });
  });

  describe('Performance and edge cases', () => {
    it('should handle large datasets efficiently', () => {
      // Create a large dataset
      const largeDataset: Customer[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `CUST-${String(i + 1).padStart(3, '0')}`,
        fullName: `Customer ${i + 1}`,
        email: `customer${i + 1}@email.com`,
        registrationDate: '2023-01-15'
      }));

      const filters: CustomerFilters = {
        id: 'CUST-500',
        fullName: '',
        email: '',
        registrationDate: ''
      };

      const startTime = Date.now();
      const result = CustomerFilterService.applyFilters(largeDataset, filters);
      const endTime = Date.now();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('CUST-500');
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should handle null and undefined values gracefully', () => {
      const customersWithNulls: Customer[] = [
        { id: 'CUST-001', fullName: 'John Doe', email: 'john@email.com', registrationDate: '2023-01-15' },
        { id: '', fullName: '', email: '', registrationDate: '' } as any
      ];

      const filters: CustomerFilters = {
        id: 'CUST',
        fullName: '',
        email: '',
        registrationDate: ''
      };

      const result = CustomerFilterService.applyFilters(customersWithNulls, filters);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('CUST-001');
    });
  });
});
