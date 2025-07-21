const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns to existing user table
    await queryInterface.addColumn('tbl_user', 'user_name', {
      type: DataTypes.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('tbl_user', 'account_type', {
      type: DataTypes.ENUM('IN_APP', 'GOOGLE'),
      allowNull: false,
      defaultValue: 'IN_APP',
    });

    await queryInterface.addColumn('tbl_user', 'picture', {
      type: DataTypes.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('tbl_user', 'bio', {
      type: DataTypes.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('tbl_user', 'gender', {
      type: DataTypes.ENUM('MALE', 'FEMALE'),
      allowNull: true,
    });

    // Create user follow table
    await queryInterface.createTable('tbl_user_follow', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true,
      },
      follower_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'tbl_user',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      following_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'tbl_user',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at_unix_timestamp: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
      },
      updated_at_unix_timestamp: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
      },
      CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      UpdatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add unique constraint to prevent duplicate follows
    await queryInterface.addIndex('tbl_user_follow', ['follower_id', 'following_id'], {
      unique: true,
      name: 'unique_follow_relationship'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove follow table
    await queryInterface.dropTable('tbl_user_follow');

    // Remove new columns from user table
    await queryInterface.removeColumn('tbl_user', 'user_name');
    await queryInterface.removeColumn('tbl_user', 'account_type');
    await queryInterface.removeColumn('tbl_user', 'picture');
    await queryInterface.removeColumn('tbl_user', 'bio');
    await queryInterface.removeColumn('tbl_user', 'gender');
  }
};