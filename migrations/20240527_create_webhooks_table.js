'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('webhooks', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      topic: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      shop_domain: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      payload: {
        type: Sequelize.JSON,
        allowNull: true
      },
      processed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      error: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('webhooks');
  }
}; 