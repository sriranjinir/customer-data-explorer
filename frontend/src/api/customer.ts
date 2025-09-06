import type { CustomerResponse, CustomerFilters } from '../types/customer-types';

export async function fetchCustomers(
  page: number,
  pageSize: number,
  filters?: CustomerFilters
): Promise<CustomerResponse> {
  const searchParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  // Add filters to search params if provided
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        searchParams.append(key, value);
      }
    });
  }

  const response = await fetch(`http://localhost:3000/customers?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch customers');
  }

  return response.json();
}
