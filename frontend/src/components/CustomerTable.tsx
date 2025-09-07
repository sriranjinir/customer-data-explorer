import React from 'react';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import { fetchCustomers } from '../api/customer';
import type { Customer, CustomerResponse } from '../types/customer-types';
import { media, responsivePadding, responsiveFontSize, responsiveButtonPadding } from '../styles/responsive';
import { Filter } from './Filter';
import { useCustomerTable } from '../contexts/CustomerTableContext';

// Optimized styled components
const TableContainer = styled.div`
    width: 100%;
    overflow-x: auto;
    margin: 2rem 0;
    
    ${media.tablet} {
        margin: 1rem 0;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
`;

const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    min-width: 600px;
    
    ${media.tablet} {
        box-shadow: none;
    }
`;

const TableHeader = styled.thead`
    background-color: #f8f9fa;
`;

const TableHeaderCell = styled.th`
    ${responsivePadding}
    ${responsiveFontSize}
    border: 1px solid #dee2e6;
    text-align: left;
    font-weight: 600;
    color: #495057;
`;

const TableRow = styled.tr<{ $isEven: boolean }>`
    background-color: ${props => props.$isEven ? '#ffffff' : '#f8f9fa'};
    transition: background-color 0.2s ease;
    
    &:hover {
        background-color: #e9ecef;
    }
    
    &:focus-within {
        outline: 2px solid #007bff;
        outline-offset: 2px;
    }
`;

const TableCell = styled.td<{ $fontWeight?: string }>`
    ${responsivePadding}
    ${responsiveFontSize}
    border: 1px solid #dee2e6;
    color: #495057;
    font-weight: ${props => props.$fontWeight || 'normal'};
    
    ${media.mobile} {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 120px;
    }
`;

const EmailCell = styled(TableCell)`
    color: #6c757d;
    
    ${media.mobile} {
        max-width: 150px;
    }
`;

const PaginationContainer = styled.nav`
    margin: 2rem 0;
    padding: 1rem;
    display: flex;
    gap: 1rem;
    align-items: center;
    background-color: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #dee2e6;
    
    ${media.tablet} {
        margin: 1rem 0;
        padding: 0.75rem;
        gap: 0.75rem;
        flex-wrap: wrap;
        justify-content: center;
    }
    
    ${media.mobile} {
        margin: 0.5rem 0;
        padding: 0.5rem;
        gap: 0.5rem;
    }
`;

const PaginationButton = styled.button<{ $disabled: boolean }>`
    ${responsiveButtonPadding}
    border: 1px solid #dee2e6;
    border-radius: 4px;
    background-color: ${props => props.$disabled ? '#e9ecef' : '#007bff'};
    color: ${props => props.$disabled ? '#6c757d' : '#fff'};
    cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
    font-weight: 500;
    transition: all 0.2s ease;
    min-height: 44px;
    min-width: 44px;
    
    &:hover:not(:disabled) {
        background-color: #0056b3;
    }
    
    &:focus {
        outline: 2px solid #007bff;
        outline-offset: 2px;
    }
`;

const PageInfo = styled.span`
    padding: 8px 12px;
    font-weight: 600;
    color: #495057;
    
    ${media.tablet} {
        padding: 4px 8px;
        font-size: 14px;
    }
    
    ${media.mobile} {
        font-size: 12px;
        white-space: nowrap;
    }
`;

const TotalInfo = styled.span`
    padding: 8px 12px;
    color: #6c757d;
    font-size: 0.9rem;
    
    ${media.tablet} {
        padding: 4px 8px;
        font-size: 0.8rem;
    }
    
    ${media.mobile} {
        font-size: 0.75rem;
        text-align: center;
        width: 100%;
    }
`;

const StatusMessage = styled.div<{ $isError?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    font-size: 1.125rem;
    color: ${props => props.$isError ? '#dc3545' : '#495057'};
    background-color: ${props => props.$isError ? '#f8d7da' : 'transparent'};
    border: ${props => props.$isError ? '1px solid #f5c6cb' : 'none'};
    border-radius: ${props => props.$isError ? '4px' : '0'};
    margin: ${props => props.$isError ? '1rem 0' : '0'};
`;

export const CustomerTable = () => {
    const { state, actions } = useCustomerTable();
    const { page, pageSize, filters, tempFilters } = state;

    const { data, isLoading, error } = useQuery<CustomerResponse>({
        queryKey: ['customers', page, pageSize, filters],
        queryFn: () => fetchCustomers(page, pageSize, filters),
        placeholderData: (previousData) => previousData,
    });

    const totalPages = data ? Math.ceil(data.total / pageSize) : 0;
    const hasActiveFilters = Object.values(filters).some(value => value);

    const handlePreviousPage = () => {
        if (page > 1) {
            const newPage = Math.max(1, page - 1);
            actions.setPage(newPage);
        }
    };

    const handleNextPage = () => {
        if (data && data.items.length === pageSize && page < totalPages) {
            const newPage = page + 1;
            actions.setPage(newPage);
        }
    };

    const handleApplyFilters = () => {
        actions.applyFilters();
    };

    const handleClearFilters = () => {
        actions.clearFilters();
    };

    const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            action();
        }
    };

    if (isLoading) {
        return (
            <StatusMessage role="status" aria-live="polite">
                Loading customer data...
            </StatusMessage>
        );
    }

    if (error) {
        return (
            <StatusMessage $isError role="alert">
                Error loading customers. Please try again later.
            </StatusMessage>
        );
    }

    return (
        <>
            <Filter
                filters={filters}
                tempFilters={tempFilters}
                onFilterChange={actions.updateTempFilter}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
                hasActiveFilters={hasActiveFilters}
            />

            <TableContainer>
                <StyledTable
                    id="customer-table"
                    aria-label="Customer data table"
                    aria-describedby="table-description"
                >
                    <caption id="table-description" className="sr-only">
                        Table showing customer information including ID, name, email, and registration date.
                        {hasActiveFilters && 'Results are filtered. '}
                        Currently showing page {page} of {totalPages}.
                    </caption>
                    <TableHeader>
                        <tr>
                            <TableHeaderCell scope="col">Customer ID</TableHeaderCell>
                            <TableHeaderCell scope="col">Full Name</TableHeaderCell>
                            <TableHeaderCell scope="col">Email</TableHeaderCell>
                            <TableHeaderCell scope="col">Registration Date</TableHeaderCell>
                        </tr>
                    </TableHeader>
                    <tbody>
                    {data && data.items.length === 0 ? (
                            <tr>
                                <TableCell colSpan={4}>
                                    <StatusMessage role="status" aria-live="polite">
                                        No customer found.
                                    </StatusMessage>
                                </TableCell>
                            </tr>
                        ) :
                        (data?.items.map((customer: Customer, index: number) => (
                            <TableRow
                                key={customer.id}
                                $isEven={index % 2 === 0}
                                tabIndex={0}
                            >
                                <TableCell>{customer.id}</TableCell>
                                <TableCell $fontWeight="500">{customer.fullName}</TableCell>
                                <EmailCell>{customer.email}</EmailCell>
                                <TableCell>
                                    <time dateTime={customer.registrationDate}>
                                        {new Date(customer.registrationDate).toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        })}
                                    </time>
                                </TableCell>
                            </TableRow>
                        )))}
                    </tbody>
                </StyledTable>
            </TableContainer>

            <PaginationContainer aria-label="Customer table pagination">
                <PaginationButton
                    onClick={handlePreviousPage}
                    onKeyDown={(e) => handleKeyDown(e, handlePreviousPage)}
                    disabled={page === 1}
                    $disabled={page === 1}
                    aria-label={`Previous page. Currently on page ${page} of ${totalPages}`}
                    type="button"
                >
                    Previous
                </PaginationButton>

                <PageInfo aria-label={`Page ${page} of ${totalPages}`}>
                    Page {page} of {totalPages}
                </PageInfo>

                <PaginationButton
                    onClick={handleNextPage}
                    onKeyDown={(e) => handleKeyDown(e, handleNextPage)}
                    disabled={!data || data.items.length < pageSize || page >= totalPages}
                    $disabled={!data || data.items.length < pageSize || page >= totalPages}
                    aria-label={`Next page. Currently on page ${page} of ${totalPages}`}
                    type="button"
                >
                    Next
                </PaginationButton>

                <TotalInfo aria-label={`Total customers: ${data?.total || 0}`}>
                    ({data?.total || 0} total {hasActiveFilters ? ' (filtered)' : ''})
                </TotalInfo>
            </PaginationContainer>
        </>
    );
};
