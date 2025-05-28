import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'shopify_webhooks'
});

async function addTimestampColumns() {
  try {
    // Add created_at column if it doesn't exist
    await sequelize.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    `);
    
    // Add updated_at column if it doesn't exist
    await sequelize.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    `);
    
    console.log('Successfully added timestamp columns to products table');
  } catch (error) {
    console.error('Error adding timestamp columns:', error);
  } finally {
    await sequelize.close();
  }
}

addTimestampColumns(); 