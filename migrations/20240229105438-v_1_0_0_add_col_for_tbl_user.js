'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'tbl_user',
          'CreatedAt',
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.DataTypes.NOW,
          },
          { transaction: t },
        ),
        queryInterface.addColumn(
          'tbl_user',
          'UpdatedAt',
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.DataTypes.NOW,
          },
          { transaction: t },
        ),
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('tbl_user', 'CreatedAt', {
          transaction: t,
        }),
        queryInterface.removeColumn('tbl_user', 'UpdatedAt', {
          transaction: t,
        }),
      ]);
    });
  },
};
