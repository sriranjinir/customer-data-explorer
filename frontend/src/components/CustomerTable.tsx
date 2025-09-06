import React from 'react';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import { fetchCustomers } from '../api/customer';
import type { Customer, CustomerResponse } from '../types/customer-types';

// Styled components
const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin: 2rem;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const TableHeader = styled.thead`
    background-color: #f8f9fa;
`;

const TableHeaderCell = styled.th`
    padding: 12px 16px;
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
`;

const TableCell = styled.td<{ $fontWeight?: string }>`
    padding: 12px 16px;
    border: 1px solid #dee2e6;
    color: #495057;
    font-weight: ${props => props.$fontWeight || 'normal'};
`;

const EmailCell = styled(TableCell)`
    color: #6c757d;
`;

const PaginationContainer = styled.div`
    margin: 2rem;
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #dee2e6;
`;

const PaginationButton = styled.button<{ $disabled: boolean }>`
    padding: 8px 16px;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    background-color: ${props => props.$disabled ? '#e9ecef' : '#007bff'};
    color: ${props => props.$disabled ? '#6c757d' : '#fff'};
    cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
    font-weight: 500;
    transition: all 0.2s ease;
    
    &:hover:not(:disabled) {
        background-color: #0056b3;
    }
`;

const PageInfo = styled.span`
    padding: 8px 12px;
    font-weight: 600;
    color: #495057;
`;

const TotalInfo = styled.span`
    padding: 8px 12px;
    color: #6c757d;
    font-size: 0.9rem;
`;

export const CustomerTable = () => {
    const [page, setPage] = React.useState(1);
    const pageSize = 20;

    const { data, isLoading, error } = useQuery<CustomerResponse>({
        queryKey: ['customers', page, pageSize],
        queryFn: () => fetchCustomers(page, pageSize),
        placeholderData: (previousData) => previousData,
    });

    if (isLoading) return <div>Loading…</div>;
    if (error) return <div>Error loading customers</div>;

    const handlePreviousPage = () => {
        setPage(prev => Math.max(1, prev - 1));
    };

    const handleNextPage = () => {
        if (data && data.items.length === pageSize) {
            setPage(prev => prev + 1);
        }
    };

    return (
        <>
            <StyledTable aria-label="Customers">
                <TableHeader>
                    <tr>
                        <TableHeaderCell>Customer ID</TableHeaderCell>
                        <TableHeaderCell>Full Name</TableHeaderCell>
                        <TableHeaderCell>Email</TableHeaderCell>
                        <TableHeaderCell>Registration Date</TableHeaderCell>
                    </tr>
                </TableHeader>
                <tbody>
                    {data?.items.map((c: Customer, index: number) => (
                        <TableRow key={c.id} $isEven={index % 2 === 0}>
                            <TableCell>{c.id}</TableCell>
                            <TableCell $fontWeight="500">{c.fullName}</TableCell>
                            <EmailCell>{c.email}</EmailCell>
                            <TableCell>{new Date(c.registrationDate).toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                </tbody>
            </StyledTable>

            <PaginationContainer>
                <PaginationButton
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                    $disabled={page === 1}
                >
                    Previous
                </PaginationButton>
                <PageInfo>Page {page}</PageInfo>
                <PaginationButton
                    onClick={handleNextPage}
                    disabled={!data || data.items.length < pageSize}
                    $disabled={!data || data.items.length < pageSize}
                >
                    Next
                </PaginationButton>
                <TotalInfo>({data?.total || 0} total customers)</TotalInfo>
            </PaginationContainer>
        </>
    );
};
