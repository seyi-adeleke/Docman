import bcrypt from '../utilities/bcrypt';
import paginate from '../utilities/paginate';

const User = require('../models').User;
const Document = require('../models').Document;


export default {
  signUp: (req, res) => {
    if (req.body.name === undefined || req.body.email === undefined || req.body.password === undefined) {
      return res.status(400).send({ message: 'Please crosscheck your information' });
    }
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
                userResponse.dataValues.name,
                userResponse.dataValues.roleId
              );
              res.status(201).send({
                message: 'Registration Was Succesfull, You have been logged in',
                token
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
  },

  login: (req, res) => {
    if (req.body.password === undefined) {
      return res.status(404).json({ message: 'Please input a password' });
    }
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
          response[0].dataValues.id, response[0].dataValues.email, response[0].dataValues.name,
          response[0].dataValues.roleId
        );
        return res.status(200).json({ message: 'login successful', token });
      }
      return res.json({
        message: 'email/password incorrect'
      });
    })
      .catch(error => res.status(400).send(error));
  },

  allUsers: (req, res) => {
    const query = {
    };
    query.limit = Math.abs(req.query.limit) || 10;
    query.offset = Math.abs(req.query.offset) || 0;
    User
      .findAll(query)
      .then((users) => {
        const count = users.length;
        paginate.information(count, query.limit, query.offset, users, res);
      })
      .catch(error => res.status(400).send(error));
  },

  getUser: (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (id !== req.decoded.id && !req.isAdmin) {
      return res.status(400).send({
        message: 'You do not have access to this users information'
      });
    }
    User
      .findById(req.params.id, {
        include: [{
          model: Document,
          as: 'Documents',
          attributes: ['title', 'content', 'access']
        }],
        attributes: ['name', 'email']
      })
      .then((user) => {
        res.status(200).send(user);
      })
      .catch(error => res.status(400).send(error));
  },

  updateUser: (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (id !== req.decoded.id) {
      return res.status(400).send({
        message: 'You cannot edit this users information'
      });
    }
    User
      .findById(req.params.id)
      .then((user) => {
        user
          .update({
            name: req.body.name || user.name,
            email: req.body.email || user.email,
          })
          .then(() => res.status(200).send(user))
          .catch(error => res.status(400).send(error));
      })
      .catch(error => res.status(400).send(error));
  },

  deleteUser: (req, res) => {
    const id = parseInt(req.params.id, 10);
    User
      .findById(id)
      .then((user) => {
        user
          .destroy()
          .then(() => res.status(204).send());
      })
      .catch(error => res.status(400).send(error));
  },

  searchUserDocuments: (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (id !== req.decoded.id) {
      return res.send({
        message: 'you dont have access to these documents'
      });
    }
    User
      .findById(req.params.id, {
        include: [{
          model: Document,
          as: 'Documents',
          attributes: ['title', 'content', 'access']
        }]
      })
      .then((user) => {
        res.status(200).send(user.Documents);
      })
      .catch(error => res.status(400).send(error));
  },

  searchUsers: (req, res) => {
    const query = {
      where: { name: req.query.q },
    };
    User
      .findAll(query)
      .then((user) => {
        if (user[0] === undefined) {
          return res.status(404).json({ message: 'This user doesn\'t exist' });
        }
        const searchedUser = {
          name: user[0].dataValues.name,
          email: user[0].dataValues.email,
        };
        const message = 'User found successfully';
        return res.status(200).json({ message, searchedUser });
      })
      .catch(error => res.status(400).send(error));
  },

  changeRole: (req, res) => {
    const id = parseInt(req.params.id, 10);
    User
      .findById(id)
      .then((user) => {
        const role = parseInt(req.body.role, 10);
        if (role >= 1 && role <= 3) {
          user
            .update({
              roleId: req.body.role || user.roleId,
            })
            .then(() => res.status(200).json({ message: 'Role changed', user }));
        } else {
          return res.status(404).json({ message: 'invalid command' });
        }
      })
      .catch(error => res.status(400).send(error));
  }
};
