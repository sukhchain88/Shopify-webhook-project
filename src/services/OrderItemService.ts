import { OrderItem, Product, Order, Customer } from "../models";
import { Op } from "sequelize";
import sequelize from "../config/db";

export class OrderItemService {
  
  /**
   * Create order items from Shopify webhook line_items
   */
  static async createOrderItemsFromWebhook(orderId: number, lineItems: any[]) {
    try {
      const orderItems = [];
      
      for (const item of lineItems) {
        // Try to find matching local product by shopify_product_id
        let localProduct = null;
        if (item.product_id) {
          localProduct = await Product.findOne({
            where: {
              shopify_product_id: item.product_id.toString()
            }
          });
        }
        
        // Create order item
        const orderItem = await OrderItem.create({
          order_id: orderId,
          product_id: localProduct ? (localProduct as any).id : null,
          shopify_product_id: item.product_id?.toString(),
          shopify_variant_id: item.variant_id?.toString(),
          product_title: item.title || item.name || 'Unknown Product',
          product_variant_title: item.variant_title,
          sku: item.sku,
          quantity: parseInt(item.quantity) || 1,
          unit_price: parseFloat(item.price) || 0,
          total_price: parseFloat(item.price) * (parseInt(item.quantity) || 1),
          currency: 'USD', // You can extract this from the order
          discount_amount: parseFloat(item.total_discount) || 0,
          tax_amount: parseFloat(item.tax_lines?.reduce((sum: number, tax: any) => sum + parseFloat(tax.price || 0), 0)) || 0,
          product_metadata: {
            vendor: item.vendor,
            product_type: item.product_type,
            weight: item.grams,
            requires_shipping: item.requires_shipping,
            taxable: item.taxable,
            gift_card: item.gift_card,
            fulfillment_service: item.fulfillment_service,
            properties: item.properties || []
          }
        });
        
        orderItems.push(orderItem);
      }
      
      console.log(`✅ Created ${orderItems.length} order items for order ${orderId}`);
      return orderItems;
      
    } catch (error) {
      console.error('❌ Error creating order items from webhook:', error);
      throw error;
    }
  }
  
  /**
   * Get order items for a specific order
   */
  static async getOrderItems(orderId: number) {
    try {
      const orderItems = await OrderItem.findAll({
        where: { order_id: orderId },
        include: [
          {
            model: Product,
            as: 'product',
            required: false // LEFT JOIN - include even if product is deleted
          }
        ],
        order: [['created_at', 'ASC']]
      });
      
      return orderItems;
    } catch (error) {
      console.error('❌ Error fetching order items:', error);
      throw error;
    }
  }
  
  /**
   * Get all orders with their items and products
   */
  static async getOrdersWithItems(limit = 50, offset = 0) {
    try {
      const orders = await Order.findAll({
        include: [
          {
            model: Customer,
            required: false // LEFT JOIN - include even if customer is null
          },
          {
            model: OrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                required: false
              }
            ]
          }
        ],
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });
      
      return orders;
    } catch (error) {
      console.error('❌ Error fetching orders with items:', error);
      throw error;
    }
  }
  
  /**
   * Get customer purchase history with products
   */
  static async getCustomerPurchaseHistory(customerId: number) {
    try {
      const orders = await Order.findAll({
        where: { customer_id: customerId },
        include: [
          {
            model: OrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                required: false
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });
      
      return orders;
    } catch (error) {
      console.error('❌ Error fetching customer purchase history:', error);
      throw error;
    }
  }
  
  /**
   * Get product sales analytics
   */
  static async getProductSalesAnalytics(productId?: number) {
    try {
      const whereClause = productId ? { product_id: productId } : {};
      
      const salesData = await OrderItem.findAll({
        where: whereClause,
        include: [
          {
            model: Product,
            as: 'product',
            required: false
          },
          {
            model: Order,
            as: 'order',
            required: true
          }
        ],
        order: [['created_at', 'DESC']]
      });
      
      // Calculate analytics
      const analytics = {
        total_items_sold: salesData.reduce((sum, item) => sum + item.quantity, 0),
        total_revenue: salesData.reduce((sum, item) => sum + Number(item.total_price), 0),
        unique_orders: new Set(salesData.map(item => item.order_id)).size,
        average_order_quantity: 0,
        average_unit_price: 0,
        sales_by_month: {} as any
      };
      
      if (salesData.length > 0) {
        analytics.average_order_quantity = analytics.total_items_sold / analytics.unique_orders;
        analytics.average_unit_price = analytics.total_revenue / analytics.total_items_sold;
        
        // Group by month
        salesData.forEach(item => {
          const month = new Date(item.created_at).toISOString().substring(0, 7); // YYYY-MM
          if (!analytics.sales_by_month[month]) {
            analytics.sales_by_month[month] = {
              quantity: 0,
              revenue: 0,
              orders: new Set()
            };
          }
          analytics.sales_by_month[month].quantity += item.quantity;
          analytics.sales_by_month[month].revenue += Number(item.total_price);
          analytics.sales_by_month[month].orders.add(item.order_id);
        });
        
        // Convert sets to counts
        Object.keys(analytics.sales_by_month).forEach(month => {
          analytics.sales_by_month[month].unique_orders = analytics.sales_by_month[month].orders.size;
          delete analytics.sales_by_month[month].orders;
        });
      }
      
      return {
        analytics,
        sales_data: salesData
      };
      
    } catch (error) {
      console.error('❌ Error fetching product sales analytics:', error);
      throw error;
    }
  }
  
  /**
   * Update order item
   */
  static async updateOrderItem(itemId: number, updateData: any) {
    try {
      const orderItem = await OrderItem.findByPk(itemId);
      if (!orderItem) {
        throw new Error('Order item not found');
      }
      
      // Recalculate total_price if quantity or unit_price changed
      if (updateData.quantity || updateData.unit_price) {
        const quantity = updateData.quantity || orderItem.quantity;
        const unitPrice = updateData.unit_price || orderItem.unit_price;
        updateData.total_price = quantity * unitPrice;
      }
      
      await orderItem.update(updateData);
      return orderItem;
      
    } catch (error) {
      console.error('❌ Error updating order item:', error);
      throw error;
    }
  }
  
  /**
   * Delete order item
   */
  static async deleteOrderItem(itemId: number) {
    try {
      const orderItem = await OrderItem.findByPk(itemId);
      if (!orderItem) {
        throw new Error('Order item not found');
      }
      
      await orderItem.destroy();
      return { message: 'Order item deleted successfully' };
      
    } catch (error) {
      console.error('❌ Error deleting order item:', error);
      throw error;
    }
  }
  
  /**
   * Search order items by product name or SKU
   */
  static async searchOrderItems(searchTerm: string, limit = 50) {
    try {
      // Use database-agnostic case-insensitive search
      // For SQLite: use LIKE with LOWER()
      // For PostgreSQL: use ILIKE
      const searchPattern = `%${searchTerm.toLowerCase()}%`;
      
      const orderItems = await OrderItem.findAll({
        where: {
          [Op.or]: [
            sequelize.where(
              sequelize.fn('LOWER', sequelize.col('product_title')),
              Op.like,
              searchPattern
            ),
            sequelize.where(
              sequelize.fn('LOWER', sequelize.col('sku')),
              Op.like,
              searchPattern
            ),
            sequelize.where(
              sequelize.fn('LOWER', sequelize.col('product_variant_title')),
              Op.like,
              searchPattern
            )
          ]
        },
        include: [
          {
            model: Product,
            as: 'product',
            required: false
          },
          {
            model: Order,
            as: 'order',
            required: true
          }
        ],
        limit,
        order: [['created_at', 'DESC']]
      });
      
      return orderItems;
    } catch (error) {
      console.error('❌ Error searching order items:', error);
      throw error;
    }
  }

  /**
   * Manually create order items for existing orders that don't have any
   * This is useful for orders created before the order items feature was implemented
   */
  static async createMissingOrderItems() {
    try {
      // Find orders that don't have any order items
      const ordersWithoutItems = await Order.findAll({
        include: [
          {
            model: OrderItem,
            as: 'items',
            required: false
          }
        ],
        where: {
          '$items.id$': null // Orders with no order items
        }
      });

      console.log(`Found ${ordersWithoutItems.length} orders without order items`);

      if (ordersWithoutItems.length === 0) {
        return { message: 'All orders already have order items', count: 0 };
      }

      let createdCount = 0;
      for (const order of ordersWithoutItems) {
        try {
          // Create a generic order item for orders without line items data
          await OrderItem.create({
            order_id: (order as any).id,
            product_id: null,
            shopify_product_id: null,
            shopify_variant_id: null,
            product_title: 'Unknown Product (Legacy Order)',
            product_variant_title: null,
            sku: null,
            quantity: 1,
            unit_price: (order as any).total_price || 0,
            total_price: (order as any).total_price || 0,
            currency: (order as any).currency || 'USD',
            discount_amount: 0,
            tax_amount: 0,
            product_metadata: {
              note: 'Created automatically for legacy order without line items data'
            }
          });
          createdCount++;
          console.log(`✅ Created order item for order ${(order as any).id}`);
        } catch (itemError) {
          console.error(`❌ Failed to create order item for order ${(order as any).id}:`, itemError);
        }
      }

      return {
        message: `Created order items for ${createdCount} orders`,
        count: createdCount,
        total_orders_processed: ordersWithoutItems.length
      };

    } catch (error) {
      console.error('❌ Error creating missing order items:', error);
      throw error;
    }
  }
} 