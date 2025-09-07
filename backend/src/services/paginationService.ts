import { Customer, CustomerResponse } from '../types.d';

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Pagination service for handling data pagination logic
 */
export class PaginationService {
  /**
   * Validates pagination parameters
   * @param page - Page number (1-based)
   * @param pageSize - Number of items per page
   * @returns Validated pagination parameters
   */
  public static validatePaginationParams(page: number, pageSize: number): PaginationParams {
    const validatedPage = Math.max(1, Math.floor(page) || 1);
    const validatedPageSize = Math.max(1, Math.min(100, Math.floor(pageSize) || 10));

    return {
      page: validatedPage,
      pageSize: validatedPageSize
    };
  }

  /**
   * Applies pagination to an array of items
   * @param items - Array of items to paginate
   * @param page - Page number (1-based)
   * @param pageSize - Number of items per page
   * @returns Paginated result with metadata
   */
  public static paginate<T>(items: T[], page: number, pageSize: number): PaginationResult<T> {
    const { page: validPage, pageSize: validPageSize } = this.validatePaginationParams(page, pageSize);

    const total = items.length;
    const totalPages = Math.ceil(total / validPageSize);
    const startIndex = (validPage - 1) * validPageSize;
    const endIndex = startIndex + validPageSize;

    const paginatedItems = items.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      total,
      page: validPage,
      pageSize: validPageSize,
      totalPages,
      hasNextPage: validPage < totalPages,
      hasPreviousPage: validPage > 1
    };
  }

  /**
   * Creates a customer response object from pagination result
   * @param paginationResult - Result from paginate method
   * @returns CustomerResponse object
   */
  public static createCustomerResponse(paginationResult: PaginationResult<Customer>): CustomerResponse {
    return {
      items: paginationResult.items,
      total: paginationResult.total,
      page: paginationResult.page,
      pageSize: paginationResult.pageSize,
      totalPages: paginationResult.totalPages
    };
  }
}
