import bcrypt from 'bcrypt';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
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
    }
  });


  User.prototype.generateHash = password =>
    bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);

  User.prototype.validatePassword = (password, hashPassword) => {
    bcrypt.compareSync(password, hashPassword);
  };

  return User;
};
