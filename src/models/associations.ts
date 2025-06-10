// Model associations to avoid circular dependencies
import { Product } from './Product';
import { Customer } from './Customer';  
import { Order } from './Order';
import { OrderItem } from './OrderItem';
import { Webhook } from './Webhook';
import { Users } from './User';

// Define all model associations in one place
export function initializeAssociations() {
  // Order and Customer associations
  Order.belongsTo(Customer, { foreignKey: 'customer_id' });
  Customer.hasMany(Order, { foreignKey: 'customer_id' });

  // OrderItem associations  
  OrderItem.belongsTo(Order, { 
    foreignKey: 'order_id',
    as: 'order'
  });

  OrderItem.belongsTo(Product, { 
    foreignKey: 'product_id',
    as: 'product'
  });

  Order.hasMany(OrderItem, { 
    foreignKey: 'order_id',
    as: 'items'
  });

  Product.hasMany(OrderItem, { 
    foreignKey: 'product_id',
    as: 'orderItems'
  });

  console.log('✅ Model associations initialized successfully');
}

export {
  Product,
  Customer,
  Order,
  OrderItem,
  Webhook,
  Users
}; 