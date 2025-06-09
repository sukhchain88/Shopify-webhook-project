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

async function checkSchema() {
  try {
    console.log('🔧 Checking Database Schema...\n');
    
    // Check customers table schema
    console.log('📊 CUSTOMERS TABLE SCHEMA:');
    console.log('=' .repeat(60));
    const [customers] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'customers' 
      ORDER BY ordinal_position;
    `);
    console.table(customers);
    
    // Check orders table schema
    console.log('\n📊 ORDERS TABLE SCHEMA:');
    console.log('=' .repeat(60));
    const [orders] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      ORDER BY ordinal_position;
    `);
    console.table(orders);
    
    // Check order_items table schema
    console.log('\n📊 ORDER_ITEMS TABLE SCHEMA:');
    console.log('=' .repeat(60));
    const [orderItems] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'order_items' 
      ORDER BY ordinal_position;
    `);
    console.table(orderItems);
    
    // Sample data from each table
    console.log('\n📊 SAMPLE CUSTOMERS DATA:');
    console.log('=' .repeat(60));
    const [customerSample] = await sequelize.query(`
      SELECT id, shopify_customer_id, first_name, last_name, email 
      FROM customers 
      LIMIT 3;
    `);
    console.table(customerSample);
    
    console.log('\n📊 SAMPLE ORDERS DATA:');
    console.log('=' .repeat(60));
    const [orderSample] = await sequelize.query(`
      SELECT id, shopify_order_id, customer_id, total_price, created_at 
      FROM orders 
      LIMIT 3;
    `);
    console.table(orderSample);
    
    console.log('\n📊 SAMPLE ORDER_ITEMS DATA:');
    console.log('=' .repeat(60));
    const [orderItemSample] = await sequelize.query(`
      SELECT id, order_id, product_id, quantity, price, title 
      FROM order_items 
      LIMIT 3;
    `);
    console.table(orderItemSample);
    
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkSchema(); 