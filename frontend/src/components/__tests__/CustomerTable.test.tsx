import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { CustomerTable } from '../CustomerTable';
import { CustomerTableProvider } from '../../contexts/CustomerTableContext';
import { fetchCustomers } from '../../api/customer';
import type {CustomerResponse} from "../../types/customer-types.ts";

// Mock the API
vi.mock('../../api/customer');
const mockFetchCustomers = vi.mocked(fetchCustomers);

// Mock data
const mockCustomerData : CustomerResponse = {
    page: 0, pageSize: 0,
    items: [
    {
      id: 'CUST-001',
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      registrationDate: '2023-01-15'
    },
    {
      id: 'CUST-002',
      fullName: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      registrationDate: '2023-03-10'
    }
  ],
  total: 93
};

// Helper function to render with providers
const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <CustomerTableProvider>
        {component}
      </CustomerTableProvider>
    </QueryClientProvider>
  );
};

describe('CustomerTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    mockFetchCustomers.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithProviders(<CustomerTable />);

    expect(screen.getByText('Loading customer data...')).toBeInTheDocument();
  });

  it('should render error state when API call fails', async () => {
    mockFetchCustomers.mockRejectedValue(new Error('API Error'));

    renderWithProviders(<CustomerTable />);

    await waitFor(() => {
      expect(screen.getByText('Error loading customers. Please try again later.')).toBeInTheDocument();
    });
  });

  it('should render customer data when API call succeeds', async () => {
    mockFetchCustomers.mockResolvedValue(mockCustomerData);

    renderWithProviders(<CustomerTable />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('alice.johnson@example.com')).toBeInTheDocument();
    });
  });

  it('should render pagination controls', async () => {
    mockFetchCustomers.mockResolvedValue(mockCustomerData);

    renderWithProviders(<CustomerTable />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'span' &&
               element?.getAttribute('aria-label')?.includes('Page 1 of') === true;
      })).toBeInTheDocument();
    });
  });

  it('should disable previous button on first page', async () => {
    mockFetchCustomers.mockResolvedValue(mockCustomerData);

    renderWithProviders(<CustomerTable />);

    await waitFor(() => {
      const previousButton = screen.getByRole('button', { name: /previous/i });
      expect(previousButton).toBeDisabled();
    });
  });

  it('should render filter component', async () => {
    mockFetchCustomers.mockResolvedValue(mockCustomerData);

    renderWithProviders(<CustomerTable />);

    await waitFor(() => {
      expect(screen.getByLabelText(/filter by customer id/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/filter by customer name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/filter by customer email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/filter by registration date/i)).toBeInTheDocument();
    });
  });

  it('should render table headers correctly', async () => {
    mockFetchCustomers.mockResolvedValue(mockCustomerData);

    renderWithProviders(<CustomerTable />);

    await waitFor(() => {
      // Use more specific selectors for table headers
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      // Look specifically within the table header
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(4);
      expect(headers[0]).toHaveTextContent('Customer ID');
      expect(headers[1]).toHaveTextContent('Full Name');
      expect(headers[2]).toHaveTextContent('Email');
      expect(headers[3]).toHaveTextContent('Registration Date');
    });
  });

  it('should show total customer count', async () => {
    mockFetchCustomers.mockResolvedValue(mockCustomerData);

    renderWithProviders(<CustomerTable />);

    await waitFor(() => {
      expect(screen.getByText(/(93 total)/)).toBeInTheDocument();
    });
  });

  it('should render no customers message when no data', async () => {
    mockFetchCustomers.mockResolvedValue({filters: undefined, page: 0, pageSize: 0, items: [], total: 0 });

    renderWithProviders(<CustomerTable />);

    await waitFor(() => {
      expect(screen.getByText('No customer found.')).toBeInTheDocument();
    });
  });

  it('should handle next page click', async () => {
    // Mock data with enough items to enable next button
    const mockDataWithPagination: CustomerResponse = {
        page: 0, pageSize: 0,
        items: Array(10).fill(null).map((_, index) => ({
        id: `CUST-${String(index + 1).padStart(3, '0')}`,
        fullName: `Customer ${index + 1}`,
        email: `customer${index + 1}@example.com`,
        registrationDate: '2023-01-15'
      })),
      total: 93
    };

    mockFetchCustomers.mockResolvedValue(mockDataWithPagination);

    renderWithProviders(<CustomerTable />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Customer 1')).toBeInTheDocument();
    });

    // Clear previous calls
    mockFetchCustomers.mockClear();

    // Click next button
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(nextButton);

    // Verify the API was called with page 2
    await waitFor(() => {
      expect(mockFetchCustomers).toHaveBeenCalledWith(2, 10, expect.any(Object));
    });
  });
});
