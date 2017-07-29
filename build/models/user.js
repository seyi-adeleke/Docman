'use strict';

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  User.associate = function (models) {
    User.belongsTo(models.Role, {
      foreignKey: 'roleId',
      onDelete: 'CASCADE'
    });
    User.hasMany(models.Document, {
      foreignKey: 'userId',
      as: 'Documents'
    });
  };

  User.prototype.JWT = function (id, email, name, roleId) {
    return _jsonwebtoken2.default.sign({ id: id, email: email, name: name, roleId: roleId }, 'secret', { expiresIn: '24h' });
  };

  return User;
};