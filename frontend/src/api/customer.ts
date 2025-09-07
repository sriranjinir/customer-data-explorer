import type {CustomerResponse, CustomerFilters} from '../types/customer-types';

const API_BASE_URL = 'http://localhost:3000/api';

export async function fetchCustomers(
  page: number = 1,
  pageSize: number = 10,
  filters: CustomerFilters = { id: '', fullName: '', email: '', registrationDate: '' }
): Promise<CustomerResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    ...Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '')
    ),
  });

  const response = await fetch(`${API_BASE_URL}/customers?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch customers: ${response.statusText}`);
  }

  return response.json();
}
