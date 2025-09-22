'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('role_permission', {
      permission_id: {
        type: Sequelize.DataTypes.BIGINT,
        allowNull: false,
        references: { model: 'permission', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      role_id: {
        type: Sequelize.DataTypes.BIGINT,
        allowNull: false,
        references: { model: 'roles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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

    try {
      await queryInterface.addConstraint('role_permission', {
        fields: ['permission_id', 'role_id'],
        type: 'unique',
        name: 'uk_permission_role_permission_id_role_id',
      });
    } catch { }
    // Index cho tra cứu nhanh
    try { await queryInterface.addIndex('role_permission', ['permission_id'], { name: 'idx_permissionrole_permission_id' }); } catch { }
    try { await queryInterface.addIndex('role_permission', ['role_id'], { name: 'idx_permissionrole_role_id' }); } catch { }
  },

  async down(queryInterface, Sequelize) {
    try { await queryInterface.removeConstraint('role_permission', 'uk_permission_role_permission_id_role_id'); } catch { }
    try { await queryInterface.dropTable('role_permission'); } catch { }
  }
};
