'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('role', {
      id: {
        type: Sequelize.DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true,
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
    await queryInterface.addIndex('role', ['name'], {
      name: 'idx_role_name',
    });
  },

  async down (queryInterface, Sequelize) {
        await queryInterface.dropTable('role');
  }
};
