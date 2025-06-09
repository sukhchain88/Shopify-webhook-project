const { Sequelize } = require('sequelize');
const fs = require('fs');
require('dotenv').config();

// Database configuration
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

async function runMonthlyQueries() {
  try {
    console.log('🔧 Running Previous Month Queries...\n');
    
    // Query 1: Customers who placed orders in previous month
    console.log('📊 1. CUSTOMERS WHO PLACED ORDERS IN PREVIOUS MONTH:');
    console.log('=' .repeat(60));
    try {
      const [customers] = await sequelize.query(`
        SELECT DISTINCT 
            c.id as customer_id,
            c.first_name,
            c.last_name,
            c.email,
            c.phone,
            c.shopify_customer_id,
            COUNT(o.id) as total_orders,
            SUM(o.total_price) as total_spent
        FROM customers c
        INNER JOIN orders o ON c.shopify_customer_id = o.customer_id
        WHERE o.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND o.created_at < DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY c.id, c.first_name, c.last_name, c.email, c.phone, c.shopify_customer_id
        ORDER BY total_spent DESC
        LIMIT 5;
      `);
      
      if (customers.length > 0) {
        console.table(customers);
      } else {
        console.log('No customers found for previous month.');
      }
    } catch (error) {
      console.log('Error or no data:', error.message);
    }

    // Query 2: Orders from previous month
    console.log('\n📊 2. ORDERS FROM PREVIOUS MONTH:');
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
            o.financial_status,
            o.created_at as order_date
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.shopify_customer_id
        WHERE o.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND o.created_at < DATE_TRUNC('month', CURRENT_DATE)
        ORDER BY o.created_at DESC
        LIMIT 5;
      `);
      
      if (orders.length > 0) {
        console.table(orders);
      } else {
        console.log('No orders found for previous month.');
      }
    } catch (error) {
      console.log('Error or no data:', error.message);
    }

    // Query 3: Order items from previous month
    console.log('\n📊 3. ORDER ITEMS FROM PREVIOUS MONTH:');
    console.log('=' .repeat(60));
    try {
      const [orderItems] = await sequelize.query(`
        SELECT 
            oi.id as order_item_id,
            oi.order_id,
            oi.product_id,
            oi.quantity,
            oi.price,
            oi.title as product_title,
            o.created_at as order_date,
            c.first_name,
            c.last_name
        FROM order_items oi
        INNER JOIN orders o ON oi.order_id = o.shopify_order_id
        LEFT JOIN customers c ON o.customer_id = c.shopify_customer_id
        WHERE o.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND o.created_at < DATE_TRUNC('month', CURRENT_DATE)
        ORDER BY o.created_at DESC
        LIMIT 5;
      `);
      
      if (orderItems.length > 0) {
        console.table(orderItems);
      } else {
        console.log('No order items found for previous month.');
      }
    } catch (error) {
      console.log('Error or no data:', error.message);
    }

    // Query 4: Summary statistics
    console.log('\n📊 4. SUMMARY STATISTICS FOR PREVIOUS MONTH:');
    console.log('=' .repeat(60));
    try {
      const [summary] = await sequelize.query(`
        SELECT 
            COUNT(DISTINCT c.id) as unique_customers,
            COUNT(DISTINCT o.id) as total_orders,
            COUNT(oi.id) as total_order_items,
            SUM(o.total_price) as total_revenue,
            AVG(o.total_price) as average_order_value,
            SUM(oi.quantity) as total_items_sold
        FROM customers c
        INNER JOIN orders o ON c.shopify_customer_id = o.customer_id
        INNER JOIN order_items oi ON o.shopify_order_id = oi.order_id
        WHERE o.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND o.created_at < DATE_TRUNC('month', CURRENT_DATE);
      `);
      
      if (summary.length > 0 && summary[0].total_orders > 0) {
        console.table(summary);
      } else {
        console.log('No summary data available for previous month.');
      }
    } catch (error) {
      console.log('Error or no data:', error.message);
    }

    // Show current data for reference
    console.log('\n📊 5. CURRENT DATABASE STATISTICS (FOR REFERENCE):');
    console.log('=' .repeat(60));
    try {
      const [currentStats] = await sequelize.query(`
        SELECT 
            (SELECT COUNT(*) FROM customers) as total_customers,
            (SELECT COUNT(*) FROM orders) as total_orders,
            (SELECT COUNT(*) FROM order_items) as total_order_items,
            (SELECT COUNT(*) FROM products) as total_products;
      `);
      console.table(currentStats);
    } catch (error) {
      console.log('Error getting current stats:', error.message);
    }

    // Show recent data
    console.log('\n📊 6. MOST RECENT ORDERS (FOR REFERENCE):');
    console.log('=' .repeat(60));
    try {
      const [recentOrders] = await sequelize.query(`
        SELECT 
            o.id,
            o.shopify_order_id,
            o.total_price,
            o.created_at,
            c.first_name,
            c.last_name
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.shopify_customer_id
        ORDER BY o.created_at DESC
        LIMIT 5;
      `);
      
      if (recentOrders.length > 0) {
        console.table(recentOrders);
      } else {
        console.log('No orders in database.');
      }
    } catch (error) {
      console.log('Error getting recent orders:', error.message);
    }

  } catch (error) {
    console.error('❌ Error running queries:', error);
  } finally {
    await sequelize.close();
  }
}

runMonthlyQueries(); 