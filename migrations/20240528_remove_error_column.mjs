import { DataTypes } from 'sequelize';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface) {
  await queryInterface.removeColumn('webhooks', 'error');
}

export async function down(queryInterface) {
  await queryInterface.addColumn('webhooks', 'error', {
    type: DataTypes.TEXT,
    allowNull: true
  });
} 