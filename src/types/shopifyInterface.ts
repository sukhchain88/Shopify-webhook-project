// Define what Shopify will return
export type ShopifyProductResponse = {
  product: {
    id: number;
    title: string;
    // Add other fields you care about
  };
};

export type ShopifyOrderResponse = {
  order: {
    id: number;
    order_number: string;
    total_price: string;
    currency: string;
    financial_status: string;
    customer?: {
      id: number;
      email: string;
      first_name?: string;
      last_name?: string;
    };
    line_items?: Array<{
      id: number;
      quantity: number;
      price: string;
      title: string;
    }>;
  };
};