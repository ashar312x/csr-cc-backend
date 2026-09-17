'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'category',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        parentId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'category',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        moduleType: {
          type: Sequelize.ENUM('CSR', 'CC'),
          allowNull: false,
        },
        isSpecial: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'user',
            key: 'id',
          },
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

    await queryInterface.addIndex('category', ['moduleType', 'parentId']);
    await queryInterface.addIndex('category', ['userId']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('category');
  },
};
