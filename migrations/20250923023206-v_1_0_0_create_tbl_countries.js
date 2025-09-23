'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('countries', {
      id: {
        type: Sequelize.DataTypes.SMALLINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      iso2: {
        type: Sequelize.DataTypes.CHAR(2),
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.DataTypes.STRING(100),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Thêm index (theo file SQL bạn đưa)
    await queryInterface.addIndex('countries', ['iso2'], {
      name: 'idx_countries_iso2',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('countries');
  }
};
