import React from 'react';
import styled from 'styled-components';
import type {CustomerFilters} from '../types/customer-types';
import { media, responsivePadding, responsiveFontSize, responsiveButtonPadding } from '../styles/responsive';

interface FilterProps {
  filters: CustomerFilters;
  tempFilters: CustomerFilters;
  onFilterChange: (field: keyof CustomerFilters, value: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const FilterContainer = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  
  ${media.tablet} {
    padding: 1rem;
  }
  
  ${media.mobile} {
    padding: 0.75rem;
    margin-bottom: 0.75rem;
  }
`;

const FilterTitle = styled.h2`
  ${responsiveFontSize}
  font-weight: 600;
  margin-bottom: 1rem;
  color: #495057;
  font-size: 1.125rem;
  
  ${media.mobile} {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
  
  ${media.tablet} {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }
  
  ${media.mobile} {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }
`;

const FilterField = styled.div`
  display: flex;
  flex-direction: column;
`;

const FilterLabel = styled.label`
  ${responsiveFontSize}
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #495057;
`;

const FilterInput = styled.input`
  ${responsivePadding}
  ${responsiveFontSize}
  border: 1px solid #ced4da;
  border-radius: 4px;
  background-color: #fff;
  color: #495057;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
  
  &:disabled {
    background-color: #e9ecef;
    cursor: not-allowed;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  
  ${media.mobile} {
    gap: 0.5rem;
    flex-direction: column;
  }
`;

const FilterButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  ${responsiveButtonPadding}
  ${responsiveFontSize}
  border: 1px solid ${props => props.$variant === 'primary' ? '#007bff' : '#6c757d'};
  border-radius: 4px;
  background-color: ${props => props.$variant === 'primary' ? '#007bff' : '#6c757d'};
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.$variant === 'primary' ? '#0056b3' : '#545b62'};
    border-color: ${props => props.$variant === 'primary' ? '#0056b3' : '#545b62'};
  }
  
  &:focus {
    outline: 2px solid ${props => props.$variant === 'primary' ? '#007bff' : '#6c757d'};
    outline-offset: 2px;
  }
  
  &:disabled {
    background-color: #e9ecef;
    border-color: #dee2e6;
    color: #6c757d;
    cursor: not-allowed;
  }
`;

export const Filter: React.FC<FilterProps> = ({
  filters,
  tempFilters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  hasActiveFilters,
}) => {
  return (
    <FilterContainer>
      <FilterTitle>Filter Customers</FilterTitle>
      <FilterGrid>
        <FilterField>
          <FilterLabel htmlFor="filter-id">Customer ID</FilterLabel>
          <FilterInput
            id="filter-id"
            type="text"
            value={tempFilters.id}
            onChange={(e) => onFilterChange('id', e.target.value)}
            placeholder="Search by ID..."
            aria-label="Filter by customer ID"
          />
        </FilterField>

        <FilterField>
          <FilterLabel htmlFor="filter-fullName">Full Name</FilterLabel>
          <FilterInput
            id="filter-fullName"
            type="text"
            value={tempFilters.fullName}
            onChange={(e) => onFilterChange('fullName', e.target.value)}
            placeholder="Search by name..."
            aria-label="Filter by customer name"
          />
        </FilterField>

        <FilterField>
          <FilterLabel htmlFor="filter-email">Email</FilterLabel>
          <FilterInput
            id="filter-email"
            type="email"
            value={tempFilters.email}
            onChange={(e) => onFilterChange('email', e.target.value)}
            placeholder="Search by email..."
            aria-label="Filter by customer email"
          />
        </FilterField>

        <FilterField>
          <FilterLabel htmlFor="filter-registrationDate">Registration Date</FilterLabel>
          <FilterInput
            id="filter-registrationDate"
            type="text"
            value={tempFilters.registrationDate}
            onChange={(e) => onFilterChange('registrationDate', e.target.value)}
            placeholder="DD/MM/YYYY"
            aria-label="Filter by registration date"
          />
        </FilterField>
      </FilterGrid>

      <ButtonContainer>
        <FilterButton
          type="button"
          $variant="primary"
          onClick={onApplyFilters}
          aria-label="Apply filters to customer table"
        >
          Apply Filters
        </FilterButton>

        <FilterButton
          type="button"
          $variant="secondary"
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
          aria-label="Clear all filters"
        >
          Clear Filters
        </FilterButton>
      </ButtonContainer>
    </FilterContainer>
  );
};
