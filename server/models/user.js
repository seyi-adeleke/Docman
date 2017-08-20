import jwt from 'jsonwebtoken';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
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
      allowNull: false,
    }
  });

  User.associate = (models) => {
    User.belongsTo(models.Role, {
      foreignKey: 'roleId',
      onDelete: 'CASCADE',
    });
    User.hasMany(models.Document, {
      foreignKey: 'userId',
      as: 'Documents',
    });
  };

  User.prototype.JWT = (id, email, name, roleId) =>
    jwt.sign({ id, email, name, roleId }, 'secret', { expiresIn: '24h' });

  return User;
};
