// Central exports for all models with proper association handling
export { Product } from './Product';
export { Customer } from './Customer';
export { Order } from './Order';
export { OrderItem } from './OrderItem';
export { Webhook } from './Webhook';
export { Users } from './User';

// Import and initialize associations
import { initializeAssociations } from './associations';

// Initialize associations when models are imported
initializeAssociations();

// Re-export default exports for compatibility
import { Product } from './Product';
import { Customer } from './Customer';
import { Order } from './Order';
import { OrderItem } from './OrderItem';
import { Webhook } from './Webhook';
import { Users } from './User';

export default {
  Product,
  Customer,
  Order,
  OrderItem,
  Webhook,
  Users
}; 