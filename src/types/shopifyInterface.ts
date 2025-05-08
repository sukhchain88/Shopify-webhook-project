
  // Define what Shopify will return
  export type ShopifyProductResponse = {
    product: {
      id: number;
      title: string;
      // Add other fields you care about
    };
  };