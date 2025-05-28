export interface CustomerData {
  id?: number;
  shop_domain: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  shopify_customer_id?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ShopifyCustomerResponse {
  customer: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    shop_domain: string;
    created_at: string;
    updated_at: string;
  };
}

export interface CustomerListResponse {
  customers: CustomerData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ShopifyCustomersResponse {
  customers: Array<{
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    shop_domain: string;
    created_at: string;
    updated_at: string;
  }>;
} 