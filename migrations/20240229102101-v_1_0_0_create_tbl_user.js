'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('tbl_user', {
      id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV1,
        primaryKey: true,
      },
      username: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.DataTypes.STRING,
        defaultValue: '',
      },
      password: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      created_at_unix_timestamp: {
        type: Sequelize.DataTypes.BIGINT,
        defaultValue: 0,
      },
      updated_at_unix_timestamp: {
        type: Sequelize.DataTypes.BIGINT,
        defaultValue: 0,
      },
      deleted_at: { type: 'TIMESTAMP' },
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable('tbl_user');
  },
};
