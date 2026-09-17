'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'metric_log',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        categoryId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'category',
            key: 'id',
          },
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        value: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        entryDate: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
      },
    );

    await queryInterface.addIndex('metric_log', ['categoryId', 'entryDate']);
    await queryInterface.addIndex('metric_log', ['entryDate']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('metric_log');
  },
};
