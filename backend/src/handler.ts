import type { APIGatewayProxyHandler } from 'aws-lambda';
import type { CustomerResponse } from './types';
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

        const start = (page - 1) * pageSize;
        const items = customers.slice(start, start + pageSize);

        const result: CustomerResponse = {
            items,
            total: customers.length,
            page,
            pageSize,
            totalPages: Math.ceil(customers.length / pageSize)
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
