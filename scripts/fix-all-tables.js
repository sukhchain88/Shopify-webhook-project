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

async function fixAllTables() {
  try {
    console.log('Fixing products table...');
    
    // Drop all timestamp columns from products table
    await sequelize.query(`ALTER TABLE products DROP COLUMN IF EXISTS "createdAt";`);
    await sequelize.query(`ALTER TABLE products DROP COLUMN IF EXISTS "updatedAt";`);
    await sequelize.query(`ALTER TABLE products DROP COLUMN IF EXISTS created_at;`);
    await sequelize.query(`ALTER TABLE products DROP COLUMN IF EXISTS updated_at;`);
    
    console.log('Fixed products table');
    
    console.log('Fixing webhooks table...');
    
    // Drop all timestamp columns from webhooks table
    await sequelize.query(`ALTER TABLE webhooks DROP COLUMN IF EXISTS "createdAt";`);
    await sequelize.query(`ALTER TABLE webhooks DROP COLUMN IF EXISTS "updatedAt";`);
    await sequelize.query(`ALTER TABLE webhooks DROP COLUMN IF EXISTS created_at;`);
    await sequelize.query(`ALTER TABLE webhooks DROP COLUMN IF EXISTS updated_at;`);
    
    console.log('Fixed webhooks table');
    
    // Check final structure of both tables
    console.log('\nFinal products table structure:');
    const [productsResults] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'products'
      ORDER BY column_name;
    `);
    console.log(productsResults);
    
    console.log('\nFinal webhooks table structure:');
    const [webhooksResults] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'webhooks'
      ORDER BY column_name;
    `);
    console.log(webhooksResults);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

fixAllTables(); 