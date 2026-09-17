'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'metric_log_attachment',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        metricLogId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'metric_log',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        fileName: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        mimeType: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        sizeBytes: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        storagePath: {
          type: Sequelize.STRING(500),
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
      },
    );

    await queryInterface.addIndex('metric_log_attachment', ['metricLogId']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('metric_log_attachment');
  },
};
