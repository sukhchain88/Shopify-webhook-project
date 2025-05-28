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

async function removeErrorColumn() {
  try {
    await sequelize.query('ALTER TABLE webhooks DROP COLUMN IF EXISTS error;');
    console.log('Successfully removed error column from webhooks table');
  } catch (error) {
    console.error('Error removing column:', error);
  } finally {
    await sequelize.close();
  }
}

removeErrorColumn(); 