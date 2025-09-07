import { Customer } from '../types';
import * as customersData from '../data/customers.json';

/**
 * Customer data service for handling customer data operations
 */
export class CustomerDataService {
  private static customers: Customer[] = customersData.customers || [];

  /**
   * Gets all customers from the data source
   * @returns Array of all customers
   */
  public static getAllCustomers(): Customer[] {
    return this.customers;
  }

  /**
   * Gets a customer by ID
   * @param id - Customer ID to search for
   * @returns Customer object or undefined if not found
   */
  public static getCustomerById(id: string): Customer | undefined {
    return this.customers.find(customer => customer.id === id);
  }

  /**
   * Gets customers by a list of IDs
   * @param ids - Array of customer IDs
   * @returns Array of matching customers
   */
  public static getCustomersByIds(ids: string[]): Customer[] {
    return this.customers.filter(customer => ids.includes(customer.id));
  }

  /**
   * Gets the total count of customers
   * @returns Total number of customers
   */
  public static getTotalCustomerCount(): number {
    return this.customers.length;
  }

  /**
   * Checks if a customer exists by ID
   * @param id - Customer ID to check
   * @returns Boolean indicating if customer exists
   */
  public static customerExists(id: string): boolean {
    return this.customers.some(customer => customer.id === id);
  }
}
