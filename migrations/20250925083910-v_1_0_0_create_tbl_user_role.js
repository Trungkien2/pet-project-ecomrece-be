'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_role', {
      user_id: {
        type: Sequelize.DataTypes.BIGINT,
        allowNull: false,
      },
      role_id: {
        type: Sequelize.DataTypes.BIGINT,
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

    await queryInterface.addConstraint('user_role', {
      fields: ['user_id', 'role_id'],
      type: 'primary key',
      name: 'pk_user_role',
    });

    await queryInterface.addConstraint('user_role', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_userrole_user_id',
      references: {
        table: 'user',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('user_role', {
      fields: ['role_id'],
      type: 'foreign key',
      name: 'fk_userrole_role_id',
      references: {
        table: 'role',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Thêm index (theo file SQL bạn đưa)
    await queryInterface.addIndex('user_role', ['user_id'], {
      name: 'idx_userrole_user_id',
    });
    await queryInterface.addIndex('user_role', ['role_id'], {
      name: 'idx_userrole_role_id',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_role');

  }
};
