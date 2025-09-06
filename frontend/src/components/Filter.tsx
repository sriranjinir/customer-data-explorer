import React from 'react';
import styled from 'styled-components';
import type { CustomerFilters } from '../types/customer-types';
import { media, responsivePadding } from '../styles/responsive';

// Styled components for Filter
const FilterContainer = styled.div`
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    padding: 1rem;
    margin-bottom: 1rem;
    
    ${media.mobile} {
        padding: 0.75rem;
    }
`;

const FilterGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1rem;
    
    ${media.tablet} {
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(2, 1fr);
        gap: 0.75rem;
    }
    
    ${media.mobile} {
        grid-template-columns: 1fr;
        grid-template-rows: repeat(4, 1fr);
        gap: 0.75rem;
    }
`;

const FilterGroup = styled.div`
    display: flex;
    flex-direction: column;
`;

const FilterLabel = styled.label`
    font-size: 0.875rem;
    font-weight: 500;
    color: #495057;
    margin-bottom: 0.25rem;
`;

const FilterInput = styled.input`
    ${responsivePadding}
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 0.875rem;
    background-color: white;
    color: #495057;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    
    &:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
    
    &::placeholder {
        color: #6c757d;
    }
`;

const FilterActions = styled.div`
    display: flex;
    gap: 0.5rem;
    align-items: center;
    
    ${media.mobile} {
        flex-direction: column;
        align-items: stretch;
    }
`;

const FilterButton = styled.button<{ $variant?: 'primary' | 'secondary'; $disabled?: boolean }>`
    padding: 6px 12px;
    border: 1px solid ${props => props.$variant === 'primary' ? '#007bff' : '#6c757d'};
    border-radius: 4px;
    background-color: ${props => {
        if (props.$disabled) return '#e9ecef';
        return props.$variant === 'primary' ? '#007bff' : '#6c757d';
    }};
    color: ${props => props.$disabled ? '#6c757d' : 'white'};
    font-size: 0.875rem;
    font-weight: 500;
    cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.15s ease-in-out;
    
    &:hover:not(:disabled) {
        background-color: ${props => props.$variant === 'primary' ? '#0056b3' : '#545b62'};
        border-color: ${props => props.$variant === 'primary' ? '#0056b3' : '#545b62'};
    }
    
    &:focus {
        outline: 2px solid #007bff;
        outline-offset: 2px;
    }
`;

const FilterSummary = styled.div`
    font-size: 0.875rem;
    color: #6c757d;
    margin-top: 0.5rem;
`;

const FilterTitle = styled.h2`
    margin: 0 0 1rem 0;
    font-size: 1.125rem;
    color: #495057;
`;

// Filter component props interface
interface FilterProps {
    filters: CustomerFilters;
    tempFilters: CustomerFilters;
    onFilterChange: (field: keyof CustomerFilters, value: string) => void;
    onApplyFilters: () => void;
    onClearFilters: () => void;
    hasActiveFilters: boolean;
}

// Filter configuration for different field types
const filterFields = [
    {
        key: 'id' as keyof CustomerFilters,
        label: 'Customer ID',
        placeholder: 'Search by ID...',
        ariaLabel: 'Filter by customer ID'
    },
    {
        key: 'fullName' as keyof CustomerFilters,
        label: 'Full Name',
        placeholder: 'Search by name...',
        ariaLabel: 'Filter by customer name'
    },
    {
        key: 'email' as keyof CustomerFilters,
        label: 'Email',
        placeholder: 'Search by email...',
        ariaLabel: 'Filter by customer email'
    },
    {
        key: 'registrationDate' as keyof CustomerFilters,
        label: 'Registration Date',
        placeholder: 'Search by date (MM/DD/YYYY)...',
        ariaLabel: 'Filter by registration date'
    }
];

export const Filter: React.FC<FilterProps> = ({
    filters,
    tempFilters,
    onFilterChange,
    onApplyFilters,
    onClearFilters,
    hasActiveFilters
}) => {
    // Handle Enter key in filter inputs
    const handleFilterKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            onApplyFilters();
        }
    };

    const activeFilterCount = Object.entries(filters).filter(([_, value]) => value).length;

    return (
        <FilterContainer>
            <FilterTitle>Filter Customers</FilterTitle>

            <FilterGrid>
                {filterFields.map(({ key, label, placeholder, ariaLabel }) => (
                    <FilterGroup key={key}>
                        <FilterLabel htmlFor={`filter-${key}`}>
                            {label}
                        </FilterLabel>
                        <FilterInput
                            id={`filter-${key}`}
                            type="text"
                            placeholder={placeholder}
                            value={tempFilters[key] || ''}
                            onChange={(e) => onFilterChange(key, e.target.value)}
                            onKeyDown={handleFilterKeyDown}
                            aria-label={ariaLabel}
                        />
                    </FilterGroup>
                ))}
            </FilterGrid>

            <FilterActions>
                <FilterButton
                    $variant="primary"
                    onClick={onApplyFilters}
                    aria-label="Apply filters to customer table"
                    type="button"
                >
                    Apply Filters
                </FilterButton>

                <FilterButton
                    $variant="secondary"
                    onClick={onClearFilters}
                    disabled={!hasActiveFilters}
                    $disabled={!hasActiveFilters}
                    aria-label="Clear all filters"
                    type="button"
                >
                    Clear Filters
                </FilterButton>

                {hasActiveFilters && (
                    <FilterSummary>
                        Active filters: {activeFilterCount}
                    </FilterSummary>
                )}
            </FilterActions>
        </FilterContainer>
    );
};
