import { Customer } from '../types';
import { convertDateFormat } from '../utils/dateUtils';

export interface CustomerFilters {
  id?: string;
  fullName?: string;
  email?: string;
  registrationDate?: string;
}

/**
 * Customer filtering service with individual filter functions
 */
export class CustomerFilterService {
  /**
   * Filters customers by ID (case-insensitive partial match)
   */
  private static filterById(customers: Customer[], id: string): Customer[] {
    if (!id) return customers;
    return customers.filter(customer =>
      customer.id.toLowerCase().includes(id.toLowerCase())
    );
  }

  /**
   * Filters customers by full name (case-insensitive partial match)
   */
  private static filterByFullName(customers: Customer[], fullName: string): Customer[] {
    if (!fullName) return customers;
    return customers.filter(customer =>
      customer.fullName.toLowerCase().includes(fullName.toLowerCase())
    );
  }

  /**
   * Filters customers by email (case-insensitive partial match)
   */
  private static filterByEmail(customers: Customer[], email: string): Customer[] {
    if (!email) return customers;
    return customers.filter(customer =>
      customer.email.toLowerCase().includes(email.toLowerCase())
    );
  }

  /**
   * Filters customers by registration date (exact match after format conversion)
   */
  private static filterByRegistrationDate(customers: Customer[], registrationDate: string): Customer[] {
    if (!registrationDate) return customers;

    const filterDate = convertDateFormat(registrationDate);
    if (!filterDate) return []; // Invalid date format returns no results

    return customers.filter(customer =>
      customer.registrationDate === filterDate
    );
  }

  /**
   * Applies all filters to the customer list
   * @param customers - Array of customers to filter
   * @param filters - Filter criteria object
   * @returns Filtered array of customers
   */
  public static applyFilters(customers: Customer[], filters: CustomerFilters): Customer[] {
    let filteredCustomers = customers;

    // Apply each filter sequentially
    if (filters.id) {
      filteredCustomers = this.filterById(filteredCustomers, filters.id);
    }

    if (filters.fullName) {
      filteredCustomers = this.filterByFullName(filteredCustomers, filters.fullName);
    }

    if (filters.email) {
      filteredCustomers = this.filterByEmail(filteredCustomers, filters.email);
    }

    if (filters.registrationDate) {
      filteredCustomers = this.filterByRegistrationDate(filteredCustomers, filters.registrationDate);
    }

    return filteredCustomers;
  }

  /**
   * Validates filter parameters
   * @param filters - Filter criteria to validate
   * @returns Object with validation results
   */
  public static validateFilters(filters: CustomerFilters): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate registration date format if provided
    if (filters.registrationDate && !convertDateFormat(filters.registrationDate)) {
      errors.push('Registration date must be in DD/MM/YYYY format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
