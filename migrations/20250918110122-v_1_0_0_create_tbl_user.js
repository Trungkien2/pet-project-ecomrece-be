'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user', {
      id: {
        type: Sequelize.DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      full_name: {
        type: Sequelize.DataTypes.STRING(255),
        allowNull: true,
      },
      email: {
        type: Sequelize.DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
      phone_number: {
        type: Sequelize.DataTypes.STRING(20),
        allowNull: true,
        unique: true,
      },
      password_hash: {
        type: Sequelize.DataTypes.STRING(255),
        allowNull: false,
      },
      email_verified_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
      },
      phone_verified_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
      },
      avatar_url: {
        type: Sequelize.DataTypes.STRING(255),
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
    await queryInterface.addIndex('user', ['email'], {
      name: 'idx_user_email',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user');
  },
};
