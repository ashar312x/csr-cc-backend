'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('metric_log', 'value', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('metric_log', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('metric_log', 'description');
    await queryInterface.changeColumn('metric_log', 'value', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
