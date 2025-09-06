export interface Customer {
  id: string;
  fullName: string;
  email: string;
  registrationDate: string;
}

export interface CustomerResponse {
  items: Customer[];
  total: number;
  page: number;
  pageSize: number;
}
