import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CustomerTable } from '../CustomerTable';
import * as customerApi from '../../api/customer';
import type { CustomerResponse } from '../../types/customer-types';

// Mock the customer API
vi.mock('../../api/customer');

const mockFetchCustomers = vi.mocked(customerApi.fetchCustomers);

// Helper function to render component with QueryClient
const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

// Mock customer data
const mockCustomerData: CustomerResponse = {
  items: [
    {
      id: '1',
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      registrationDate: '2023-01-15T10:30:00Z'
    },
    {
      id: '2',
      fullName: 'Jane Smith',
      email: 'jane.smith@example.com',
      registrationDate: '2023-02-20T14:15:00Z'
    }
  ],
  total: 93,
  page: 1,
  pageSize: 20,
};

// Mock data with full page (20 items to enable Next button)
const mockFullPageData: CustomerResponse = {
  items: Array.from({ length: 20 }, (_, i) => ({
    id: `${i + 1}`,
    fullName: `Customer ${i + 1}`,
    email: `customer${i + 1}@example.com`,
    registrationDate: '2023-01-15T10:30:00Z'
  })),
  total: 93,
  page: 1,
  pageSize: 20,
};

const mockCustomerDataPage2: CustomerResponse = {
  items: [
    {
      id: '21',
      fullName: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      registrationDate: '2023-03-10T09:45:00Z'
    }
  ],
  total: 93,
  page: 2,
  pageSize: 20,
};

describe('CustomerTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    mockFetchCustomers.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithQueryClient(<CustomerTable />);

    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('should render error state when API call fails', async () => {
    mockFetchCustomers.mockRejectedValue(new Error('API Error'));

    renderWithQueryClient(<CustomerTable />);

    await waitFor(() => {
      expect(screen.getByText('Error loading customers')).toBeInTheDocument();
    });
  });

  it('should render customer table with data', async () => {
    mockFetchCustomers.mockResolvedValue(mockCustomerData);

    renderWithQueryClient(<CustomerTable />);

    await waitFor(() => {
      expect(screen.getByRole('table', { name: 'Customers' })).toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByText('Customer ID')).toBeInTheDocument();
    expect(screen.getByText('Full Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Registration Date')).toBeInTheDocument();

    // Check customer data is rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();

    // Check total customers count
    expect(screen.getByText('(93 total customers)')).toBeInTheDocument();
  });

  it('should format registration dates correctly', async () => {
    mockFetchCustomers.mockResolvedValue(mockCustomerData);

    renderWithQueryClient(<CustomerTable />);

    await waitFor(() => {
      const formattedDate = new Date('2023-01-15T10:30:00Z').toLocaleDateString();
      expect(screen.getByText(formattedDate)).toBeInTheDocument();
    });
  });

  it('should display current page number', async () => {
    mockFetchCustomers.mockResolvedValue(mockCustomerData);

    renderWithQueryClient(<CustomerTable />);

    await waitFor(() => {
      expect(screen.getByText('Page 1')).toBeInTheDocument();
    });
  });

  it('should disable Previous button on first page', async () => {
    mockFetchCustomers.mockResolvedValue(mockCustomerData);

    renderWithQueryClient(<CustomerTable />);

    await waitFor(() => {
      const previousButton = screen.getByRole('button', { name: 'Previous' });
      expect(previousButton).toBeDisabled();
    });
  });

  it('should enable Next button when there is a full page of data', async () => {
    mockFetchCustomers.mockResolvedValue(mockFullPageData);

    renderWithQueryClient(<CustomerTable />);

    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: 'Next' });
      expect(nextButton).not.toBeDisabled();
    });
  });

  it('should disable Next button when on last page or fewer items than page size', async () => {
    const lastPageData = {
      ...mockCustomerData,
      items: [mockCustomerData.items[0]], // Only 1 item, less than pageSize (20)
      page: 5
    };

    mockFetchCustomers.mockResolvedValue(lastPageData);

    renderWithQueryClient(<CustomerTable />);

    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: 'Next' });
      expect(nextButton).toBeDisabled();
    });
  });

  it('should navigate to next page when Next button is clicked', async () => {
    mockFetchCustomers
      .mockResolvedValueOnce(mockCustomerData)
      .mockResolvedValueOnce(mockCustomerDataPage2);

    renderWithQueryClient(<CustomerTable />);

    await waitFor(() => {
      expect(screen.getByText('Page 1')).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: 'Next' });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Page 2')).toBeInTheDocument();
    });

    // Verify API was called with correct parameters
    expect(mockFetchCustomers).toHaveBeenCalledWith(2, 20);
  });

  it('should navigate to previous page when Previous button is clicked', async () => {
    // Start on page 2
    mockFetchCustomers
      .mockResolvedValueOnce(mockCustomerDataPage2)
      .mockResolvedValueOnce(mockCustomerData);

    renderWithQueryClient(<CustomerTable />);

    // Manually set page to 2 by clicking next first
    await waitFor(() => {
      expect(screen.getByText('Page 1')).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: 'Next' });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Page 2')).toBeInTheDocument();
    });

    const previousButton = screen.getByRole('button', { name: 'Previous' });
    expect(previousButton).not.toBeDisabled();

    fireEvent.click(previousButton);

    await waitFor(() => {
      expect(screen.getByText('Page 1')).toBeInTheDocument();
    });
  });

  it('should not go below page 1 when Previous is clicked on first page', async () => {
    mockFetchCustomers.mockResolvedValue(mockCustomerData);

    renderWithQueryClient(<CustomerTable />);

    await waitFor(() => {
      expect(screen.getByText('Page 1')).toBeInTheDocument();
    });

    const previousButton = screen.getByRole('button', { name: 'Previous' });
    expect(previousButton).toBeDisabled();

    // Even if we force click (though it should be disabled), page should stay 1
    fireEvent.click(previousButton);

    expect(screen.getByText('Page 1')).toBeInTheDocument();
    // Should still only have been called once (initial load)
    expect(mockFetchCustomers).toHaveBeenCalledTimes(1);
  });

  it('should call fetchCustomers with correct parameters on initial load', async () => {
    mockFetchCustomers.mockResolvedValue(mockCustomerData);

    renderWithQueryClient(<CustomerTable />);

    await waitFor(() => {
      expect(mockFetchCustomers).toHaveBeenCalledWith(1, 20);
    });
  });

  it('should display empty table when no customers are returned', async () => {
    const emptyData: CustomerResponse = {
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    };

    mockFetchCustomers.mockResolvedValue(emptyData);

    renderWithQueryClient(<CustomerTable />);

    await waitFor(() => {
      expect(screen.getByRole('table', { name: 'Customers' })).toBeInTheDocument();
      expect(screen.getByText('(0 total customers)')).toBeInTheDocument();
    });

    // Should not have any customer rows
    const tbody = screen.getByRole('table').querySelector('tbody');
    expect(tbody?.children).toHaveLength(0);
  });

  it('should handle customer data with special characters', async () => {
    const specialData: CustomerResponse = {
      items: [
        {
          id: '1',
          fullName: 'José María García-López',
          email: 'jose.garcia@example.com',
          registrationDate: '2023-01-15T10:30:00Z'
        }
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    };

    mockFetchCustomers.mockResolvedValue(specialData);

    renderWithQueryClient(<CustomerTable />);

    await waitFor(() => {
      expect(screen.getByText('José María García-López')).toBeInTheDocument();
    });
  });

  it('should handle pagination correctly', async () => {
    mockFetchCustomers.mockResolvedValue(mockFullPageData);

    renderWithQueryClient(<CustomerTable />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Page 1')).toBeInTheDocument();
      expect(screen.getByText('Customer 1')).toBeInTheDocument();
    });

    // Check that Next button is enabled for full page
    const nextButton = screen.getByRole('button', { name: 'Next' });
    expect(nextButton).not.toBeDisabled();

    // Check that Previous button is disabled on first page
    const previousButton = screen.getByRole('button', { name: 'Previous' });
    expect(previousButton).toBeDisabled();

    // Verify API was called with correct initial parameters
    expect(mockFetchCustomers).toHaveBeenCalledWith(1, 20);
  });

  it('should display correct customer count and pagination info', async () => {
    mockFetchCustomers.mockResolvedValue(mockFullPageData);

    renderWithQueryClient(<CustomerTable />);

    await waitFor(() => {
      // Check page display
      expect(screen.getByText('Page 1')).toBeInTheDocument();

      // Check total count
      expect(screen.getByText('(93 total customers)')).toBeInTheDocument();

      // Check that we have the expected number of rows (20 full page)
      const rows = screen.getAllByRole('row');
      // 1 header row + 20 data rows = 21 total
      expect(rows).toHaveLength(21);
    });
  });

  it('should render table structure correctly', async () => {
    mockFetchCustomers.mockResolvedValue(mockCustomerData);

    renderWithQueryClient(<CustomerTable />);

    await waitFor(() => {
      const table = screen.getByRole('table', { name: 'Customers' });
      expect(table).toBeInTheDocument();

      // Check table structure
      const thead = table.querySelector('thead');
      const tbody = table.querySelector('tbody');

      expect(thead).toBeInTheDocument();
      expect(tbody).toBeInTheDocument();

      // Check header columns
      const headerCells = thead?.querySelectorAll('th');
      expect(headerCells).toHaveLength(4);
    });
  });
});
