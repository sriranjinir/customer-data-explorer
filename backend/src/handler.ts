import type { APIGatewayProxyHandler } from 'aws-lambda';
import type { CustomerResponse, CustomerFilters } from './types';
import customers from './data/customers.json';

const DEFAULT_PAGE = 1, DEFAULT_PAGE_SIZE = 20, MAX_PAGE_SIZE = 100;

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const qs = event.queryStringParameters || {};
        const page = Math.max(1, parseInt(qs.page || '1', 10) || DEFAULT_PAGE);
        let pageSize = Math.min(MAX_PAGE_SIZE, parseInt(qs.pageSize || `${DEFAULT_PAGE_SIZE}`, 10) || DEFAULT_PAGE_SIZE);

        if (isNaN(page) || isNaN(pageSize) || pageSize <= 0) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Invalid pagination parameters' }) };
        }

        // Extract filters from query parameters
        const filters: CustomerFilters = {
            id: qs.id || undefined,
            fullName: qs.fullName || undefined,
            email: qs.email || undefined,
            registrationDate: qs.registrationDate || undefined,
        };

        // Apply filters
        let filteredCustomers = customers.filter(customer => {
            // Filter by ID (exact match)
            if (filters.id && !customer.id.toLowerCase().includes(filters.id.toLowerCase())) {
                return false;
            }

            // Filter by full name (partial match, case-insensitive)
            if (filters.fullName && !customer.fullName.toLowerCase().includes(filters.fullName.toLowerCase())) {
                return false;
            }

            // Filter by email (partial match, case-insensitive)
            if (filters.email && !customer.email.toLowerCase().includes(filters.email.toLowerCase())) {
                return false;
            }

            // Filter by registration date (partial match for formatted date)
            if (filters.registrationDate) {
                const formattedDate = new Date(customer.registrationDate).toLocaleDateString();
                if (!formattedDate.includes(filters.registrationDate)) {
                    return false;
                }
            }

            return true;
        });

        const start = (page - 1) * pageSize;
        const items = filteredCustomers.slice(start, start + pageSize);

        const result: CustomerResponse = {
            items,
            total: filteredCustomers.length,
            page,
            pageSize,
            totalPages: Math.ceil(filteredCustomers.length / pageSize),
            filters: Object.keys(filters).some(key => filters[key as keyof CustomerFilters]) ? filters : undefined
        };

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            body: JSON.stringify(result)
        };
    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error' }) };
    }
};
