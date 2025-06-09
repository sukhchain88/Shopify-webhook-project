const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "postgres",
  process.env.DB_USER || "postgres", 
  process.env.DB_PASSWORD || "postgres",
  {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    dialect: "postgres",
    logging: false
  }
);

async function runCorrectedMonthlyQueries() {
  try {
    console.log('🔧 Running CORRECTED Previous Month Queries...\n');
    
    // Query 1: Orders from previous month (since many orders have NULL customer_id)
    console.log('📊 1. ALL ORDERS FROM PREVIOUS MONTH:');
    console.log('=' .repeat(60));
    try {
      const [orders] = await sequelize.query(`
        SELECT 
            o.id as order_id,
            o.shopify_order_id,
            o.customer_id,
            c.first_name,
            c.last_name,
            o.total_price,
            o.currency,
            o.status,
            o.created_at as order_date
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.id
        WHERE o.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND o.created_at < DATE_TRUNC('month', CURRENT_DATE)
        ORDER BY o.created_at DESC
        LIMIT 10;
      `);
      
      if (orders.length > 0) {
        console.table(orders);
      } else {
        console.log('No orders found for previous month.');
      }
    } catch (error) {
      console.log('Error:', error.message);
    }

    // Query 2: Order items from previous month
    console.log('\n📊 2. ORDER ITEMS FROM PREVIOUS MONTH:');
    console.log('=' .repeat(60));
    try {
      const [orderItems] = await sequelize.query(`
        SELECT 
            oi.id as order_item_id,
            oi.order_id,
            oi.shopify_product_id,
            oi.quantity,
            oi.unit_price,
            oi.total_price,
            oi.product_title,
            o.created_at as order_date,
            c.first_name,
            c.last_name
        FROM order_items oi
        INNER JOIN orders o ON oi.order_id = o.id
        LEFT JOIN customers c ON o.customer_id = c.id
        WHERE o.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND o.created_at < DATE_TRUNC('month', CURRENT_DATE)
        ORDER BY o.created_at DESC
        LIMIT 10;
      `);
      
      if (orderItems.length > 0) {
        console.table(orderItems);
      } else {
        console.log('No order items found for previous month.');
      }
    } catch (error) {
      console.log('Error:', error.message);
    }

    // Query 3: Orders without customer association (NULL customer_id)
    console.log('\n📊 3. ORDERS WITHOUT CUSTOMER ASSOCIATION (PREVIOUS MONTH):');
    console.log('=' .repeat(60));
    try {
      const [ordersWithoutCustomers] = await sequelize.query(`
        SELECT 
            o.id as order_id,
            o.shopify_order_id,
            o.total_price,
            o.currency,
            o.status,
            o.created_at as order_date,
            COUNT(oi.id) as total_items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND o.created_at < DATE_TRUNC('month', CURRENT_DATE)
          AND o.customer_id IS NULL
        GROUP BY o.id, o.shopify_order_id, o.total_price, o.currency, o.status, o.created_at
        ORDER BY o.created_at DESC
        LIMIT 10;
      `);
      
      if (ordersWithoutCustomers.length > 0) {
        console.table(ordersWithoutCustomers);
      } else {
        console.log('No orders without customers found for previous month.');
      }
    } catch (error) {
      console.log('Error:', error.message);
    }

    // Query 4: Summary for recent data (since previous month might be empty)
    console.log('\n📊 4. SUMMARY OF ALL TIME DATA:');
    console.log('=' .repeat(60));
    try {
      const [summary] = await sequelize.query(`
        SELECT 
            COUNT(DISTINCT c.id) as customers_with_orders,
            COUNT(DISTINCT o.id) as total_orders,
            COUNT(DISTINCT CASE WHEN o.customer_id IS NULL THEN o.id END) as orders_without_customers,
            COUNT(oi.id) as total_order_items,
            SUM(o.total_price) as total_revenue,
            AVG(o.total_price) as average_order_value
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.id
        LEFT JOIN order_items oi ON o.id = oi.order_id;
      `);
      console.table(summary);
    } catch (error) {
      console.log('Error getting summary:', error.message);
    }

    // Query 5: Recent orders for reference
    console.log('\n📊 5. MOST RECENT ORDERS (FOR REFERENCE):');
    console.log('=' .repeat(60));
    try {
      const [recentOrders] = await sequelize.query(`
        SELECT 
            o.id,
            o.shopify_order_id,
            o.customer_id,
            o.total_price,
            o.created_at,
            c.first_name,
            c.last_name,
            COUNT(oi.id) as items_count
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id, o.shopify_order_id, o.customer_id, o.total_price, o.created_at, c.first_name, c.last_name
        ORDER BY o.created_at DESC
        LIMIT 5;
      `);
      console.table(recentOrders);
    } catch (error) {
      console.log('Error getting recent orders:', error.message);
    }

    // Query 6: Check if we have any data from previous month at all
    console.log('\n📊 6. DATE RANGE CHECK:');
    console.log('=' .repeat(60));
    try {
      const [dateCheck] = await sequelize.query(`
        SELECT 
            MIN(created_at) as earliest_order,
            MAX(created_at) as latest_order,
            COUNT(*) as total_orders,
            DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') as previous_month_start,
            DATE_TRUNC('month', CURRENT_DATE) as current_month_start
        FROM orders;
      `);
      console.table(dateCheck);
    } catch (error) {
      console.log('Error checking dates:', error.message);
    }

  } catch (error) {
    console.error('❌ Error running queries:', error);
  } finally {
    await sequelize.close();
  }
}

runCorrectedMonthlyQueries(); 