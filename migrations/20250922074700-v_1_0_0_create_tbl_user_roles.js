'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Tạo bảng user_roles nếu chưa có
    const table = await queryInterface.describeTable('user_roles').catch(() => null);
    if (!table) {
      await queryInterface.createTable('user_roles', {
        user_id: {
          type: Sequelize.DataTypes.BIGINT,
          allowNull: false,
          references: { model: 'user', key: 'id' },
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
    }
    // Unique kết hợp user  role
    try {
      await queryInterface.addConstraint('user_roles', {
        fields: ['user_id', 'role_id'],
        type: 'unique',
        name: 'uk_user_roles_user_id_role_id',
      });
    } catch { }
    // Index cho tra cứu nhanh
    try { await queryInterface.addIndex('user_roles', ['user_id'], { name: 'idx_userrole_user_id' }); } catch { }
    try { await queryInterface.addIndex('user_roles', ['role_id'], { name: 'idx_userrole_role_id' }); } catch { }

  },

  async down(queryInterface, Sequelize) {
    try { await queryInterface.removeConstraint('user_roles', 'uk_user_roles_user_id_role_id'); } catch {}
    try { await queryInterface.dropTable('user_roles'); } catch {}
  }
};
