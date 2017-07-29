'use strict';

module.exports = function (sequelize, DataTypes) {
  var Role = sequelize.define('Role', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });
  Role.associate = function (models) {
    Role.hasMany(models.User, {
      foreignKey: 'roleId',
      as: 'users'
    });
  };
  return Role;
};