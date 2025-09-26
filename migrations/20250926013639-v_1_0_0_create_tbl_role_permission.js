'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('role_permission', {
      permission_id: {
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

    await queryInterface.addConstraint('role_permission', {
      fields: ['permission_id', 'role_id'],
      type: 'primary key',
      name: 'pk_role_permission',
    });

    await queryInterface.addConstraint('role_permission', {
      fields: ['permission_id'],
      type: 'foreign key',
      name: 'fk_rolepermission_permission_id',
      references: {
        table: 'permission',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('role_permission', {
      fields: ['role_id'],
      type: 'foreign key',
      name: 'fk_rolepermission_role_id',
      references: {
        table: 'role',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Thêm index (theo file SQL bạn đưa)
    await queryInterface.addIndex('role_permission', ['permission_id'], {
      name: 'idx_rolepermission_permission_id',
    });
    await queryInterface.addIndex('role_permission', ['role_id'], {
      name: 'idx_rolepermission_role_id',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('role_permission');
  }
};
