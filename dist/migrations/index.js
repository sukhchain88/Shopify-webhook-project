import * as addErrorColumn from './20240318_add_error_column.js';
import sequelize from '../config/db.js';
async function runMigrations() {
    try {
        console.log('Running migrations...');
        await addErrorColumn.up(sequelize.getQueryInterface());
        console.log('✅ Migrations completed successfully');
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}
runMigrations();
