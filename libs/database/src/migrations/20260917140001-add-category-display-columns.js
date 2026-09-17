'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('category', 'eventLabel', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn('category', 'iconName', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn('category', 'iconColor', {
      type: Sequelize.STRING(20),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('category', 'eventLabel');
    await queryInterface.removeColumn('category', 'iconName');
    await queryInterface.removeColumn('category', 'iconColor');
  },
};
