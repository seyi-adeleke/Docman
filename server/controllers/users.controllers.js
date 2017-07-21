import bcrypt from '../utilities/bcrypt';

const User = require('../models').User;
const Document = require('../models').Document;

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
            roleId: 2,
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
    .findAll({
      include: [{
        model: Document,
        as: 'Documents',
      }]
    })
    .then(users => res.status(200).send(users))
    .catch(error => res.status(400).send(error));
};


module.exports.getUser = (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (id !== req.decoded.id) {
    return res.send({
      message: 'Invalid command'
    });
  }
  User
    .findById(req.params.id, {
      include: [{
        model: Document,
        as: 'Documents',
      }]
    })
    .then((user) => {
      if (!user) {
        return res.status(404).send({
          message: 'user Not Found',
        });
      }
      return res.status(200).send(user);
    })
    .catch(error => res.status(400).send(error));
};


module.exports.updateUser = (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (id !== req.decoded.id) {
    return res.send({
      message: 'Invalid command'
    });
  }
  User
    .findById(req.params.id)
    .then((user) => {
      return user
        .update({
          name: req.body.name || user.name,
          email: req.body.email || user.email,
        })
        .then(() => res.status(200).send(user))
        .catch(error => res.status(400).send(error));
    })
    .catch(error => res.status(400).send(error));
};

module.exports.deleteUser = (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (id !== req.decoded.id) {
    return res.send({
      message: 'Invalid command'
    });
  }
  User
    .findById(req.params.id)
    .then((user) => {
      return user
        .destroy()
        .then(() => res.status(204).send())
        .catch(error => res.status(400).send(error));
    })
    .catch(error => res.status(400).send(error));
};

