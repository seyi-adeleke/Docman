import bcrypt from '../utilities/bcrypt';

const User = require('../models').User;
const LocalStorage = require('node-localstorage').LocalStorage,
  localStorage = new LocalStorage('./scratch');

module.exports.signUp = (req, res) => {
  User.findAll({
    where: {
      email: req.body.email
    }
  })
    .then((response) => {
      if (response.length === 0) {
        const user = new User();
        return User
          .create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hash(req.body.password),
          })
          .then((userResponse) => {
            const token = user.JWT(
              userResponse.dataValues.id,
              userResponse.dataValues.email,
              userResponse.dataValues.name
            );
            localStorage.setItem('jwt', token);
            res.status(201).send({
              message: 'Registration Was Succesfull, You have been logged in'
            });
          })
          .catch((error) => {
            res.status(400).send(error);
          });
      } return res.json({
        message: 'This user exists'
      });
    })
    .catch(error =>
      res.status(400).send({
        message: 'Your signup was not completed, please crosscheck your information',
        error,
      })
    );
};

module.exports.login = (req, res) => {
  User.findAll({
    where: {
      email: req.body.email
    }
  }).then((response) => {
    if (response.length === 0) {
      return res.json({
        message: 'This account doesnt exist'
      });
    }
    const user = new User();
    const isValidPassword = bcrypt.comparePassword(
      req.body.password, response[0].dataValues.password);
    if (isValidPassword) {
      const token = user.JWT(
        response[0].dataValues.id, response[0].dataValues.email, response[0].dataValues.name
      );
      localStorage.setItem('jwt', token);
      return res.status(200).json({ message: 'login successful', token });
    }
    return res.json({
      message: 'email/password incorrect'
    });
  })
    .catch(error => res.status(400).send(error));
};

module.exports.allUsers = (req, res) => {
  User
    .findAll()
    .then(users => res.status(200).send(users))
    .catch(error => res.status(400).send(error));
};
