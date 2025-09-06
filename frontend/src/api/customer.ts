import type { CustomerResponse } from '../types/customer-types';

export async function fetchCustomers(page: number, pageSize: number): Promise<CustomerResponse> {
  const response = await fetch(`http://localhost:3000/customers?page=${page}&pageSize=${pageSize}`);

  if (!response.ok) {
    throw new Error('Failed to fetch customers');
  }

  return response.json();
}
