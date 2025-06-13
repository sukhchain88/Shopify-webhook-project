// Central exports for all models with proper association handling
export { Product } from './product';
export { Customer } from './customer';
export { Order } from './order';
export { OrderItem } from './OrderItem';
export { Webhook } from './webhook';
export { Users } from './user';
export { Job } from './Job';

// Import and initialize associations
import { initializeAssociations } from './associations';

// Initialize associations when models are imported
initializeAssociations();

// Re-export default exports for compatibility
import { Product } from './product';
import { Customer } from './customer';
import { Order } from './order';
import { OrderItem } from './OrderItem';
import { Webhook } from './webhook';
import { Users } from './user';
import { Job } from './Job';

export default {
  Product,
  Customer,
  Order,
  OrderItem,
  Webhook,
  Users,
  Job
}; 