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

async function checkAndFixTable() {
  try {
    // Check current table structure
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'products';
    `);
    
    console.log('Current table structure:', results);
    
    // Drop problematic timestamp columns
    await sequelize.query(`ALTER TABLE products DROP COLUMN IF EXISTS "createdAt";`);
    await sequelize.query(`ALTER TABLE products DROP COLUMN IF EXISTS "updatedAt";`);
    await sequelize.query(`ALTER TABLE products DROP COLUMN IF EXISTS created_at;`);
    await sequelize.query(`ALTER TABLE products DROP COLUMN IF EXISTS updated_at;`);
    
    console.log('Dropped timestamp columns');
    
    // Check structure again
    const [newResults] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'products';
    `);
    
    console.log('New table structure:', newResults);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkAndFixTable(); 