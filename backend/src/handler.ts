import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Customer, CustomerResponse } from './types';
import * as customersData from './data/customers.json';

const customers: Customer[] = customersData.customers || [];

// Helper function to convert DD/MM/YYYY to YYYY-MM-DD for comparison
function convertDateFormat(ddmmyyyy: string): string | null {
  if (!ddmmyyyy) return null;

  // Match DD/MM/YYYY format
  const dateMatch = ddmmyyyy.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!dateMatch) return null;

  const [, day, month, year] = dateMatch;
  // Convert to YYYY-MM-DD format with zero padding
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export const getCustomers = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const queryParams = event.queryStringParameters || {};
    const page = parseInt(queryParams.page || '1', 10);
    const pageSize = parseInt(queryParams.pageSize || '10', 10);

    // Extract filter parameters
    const filters = {
      id: queryParams.id || '',
      fullName: queryParams.fullName || '',
      email: queryParams.email || '',
      registrationDate: queryParams.registrationDate || '',
    };

    // Apply filters
    let filteredCustomers = customers.filter((customer) => {
      // Filter by ID
      if (filters.id && !customer.id.toLowerCase().includes(filters.id.toLowerCase())) {
        return false;
      }

      // Filter by Full Name
      if (filters.fullName && !customer.fullName.toLowerCase().includes(filters.fullName.toLowerCase())) {
        return false;
      }

      // Filter by Email
      if (filters.email && !customer.email.toLowerCase().includes(filters.email.toLowerCase())) {
        return false;
      }

      // Filter by Registration Date
      if (filters.registrationDate) {
        const filterDate = convertDateFormat(filters.registrationDate);
        if (!filterDate) {
          // If the date format is invalid, no match
          return false;
        }

        // Check if the customer's registration date matches the filter date
        if (customer.registrationDate !== filterDate) {
          return false;
        }
      }

      return true;
    });

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

    const response: CustomerResponse = {
      items: paginatedCustomers,
      total: filteredCustomers.length,
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Error fetching customers:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

