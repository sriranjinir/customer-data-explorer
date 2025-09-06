// Customer interface matching the frontend
export interface Customer {
  id: string;
  fullName: string;
  email: string;
  registrationDate: string;
}

// Response interface for paginated customer data
export interface CustomerResponse {
  items: Customer[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

declare module "*.json" {
  const value: Customer[];
  export default value;
}
