import validator from 'validator';

import bcrypt from '../utilities/bcrypt';
import utitlities from '../utilities/paginate';
import validate from '../utilities/validateId';

const User = require('../models').User;
const Document = require('../models').Document;


export default {
  /**
    * signUp: Create a new user document
    * @function signUp
    * @param {object} req
    * @param {object} res
    *  @return {object} Json data and a token
    */
  signUp: (req, res) => {
    if (!req.body.name || !req.body.email || !req.body.password) {
      return res.status(400)
        .send({ message: 'Please crosscheck your information' });
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
        res.status(400)
          .send({
            message:
            'Your signup was not completed, please crosscheck your information',
            error,
          })
      );
  },

  /**
    * login: Logs a user in
    * @function login
    * @param {object} req
    * @param {object} res
    * @return {object} Json data and a token
    */
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
          response[0].dataValues.id,
          response[0].dataValues.email, response[0].dataValues.name,
          response[0].dataValues.roleId
        );
        return res.status(200).json({ message: 'login successful', token });
      }
      return res.json({
        message: 'The email/password is incorrect'
      });
    })
      .catch(error => res.status(400).send(error));
  },

  /**
    * allUsers: return a paginated json object containing all users
    * @function getAllUsers
    * @param {object} req
    * @param {object} res
    * @return {object} Json data
    */
  getAllUsers: (req, res) => {
    const query = {
      attributes: ['id', 'name', 'email']
    };
    query.limit = Math.abs(req.query.limit) || 10;
    query.offset = Math.abs(req.query.offset) || 0;
    User
      .findAll(query)
      .then((users) => {
        const count = users.length;
        utitlities.paginate(count, query.limit, query.offset, users, res);
      })
      .catch(error => res.status(400).send(error));
  },

  /**
    * getUser: Get a user
    * @function getUser
    * @param {object} req
    * @param {object} res
    * @return {object} Json data
    */
  getUser: (req, res) => {
    if (validate.id(req.params.id)) {
      return res.status(400)
        .send({ message: 'Please use an integer value' });
    }
    const id = parseInt(req.params.id, 10);
    if (id !== req.decoded.id && !req.isAdmin) {
      return res.status(400).send({
        message: 'You do not have access to this users information'
      });
    }
    User
      .findById(req.params.id, {
        attributes: ['name', 'email', 'id']
      })
      .then((user) => {
        res.status(200).send(user);
      })
      .catch(error => res.status(400).send(error));
  },

  /**
   * updateUser: This updates a users information
   * @function updateUser
   * @param {object} req
   * @param {object} res
   * @return {object} Json data
   */
  updateUser: (req, res) => {
    let hashedPassword;
    if (!req.body.name && !req.body.email && !req.body.password) {
      return res.status(400).send({
        message: 'Please cross check your request'
      });
    }
    if (validate.id(req.params.id)) {
      return res.status(400)
        .send({ message: 'Please use an integer value' });
    }

    if (req.body.email && !validator.isEmail(req.body.email)) {
      return res.status(400).send({ message: 'Please use a valid email' });
    }
    const id = parseInt(req.params.id, 10);
    if (id !== req.decoded.id) {
      return res.status(400).send({
        message: 'You cannot edit this users information'
      });
    }
    if (req.body.password) {
      hashedPassword = bcrypt.hash(req.body.password);
    }
    User
      .findById(req.params.id)
      .then((user) => {
        user
          .update({
            name: req.body.name || user.name,
            email: req.body.email || user.email,
            password: hashedPassword || user.password
          })
          .then(() => {
            const updatedUser = {
              name: user.name,
              email: user.email
            };
            res.status(200)
              .send({ message: 'User updated succesfully', updatedUser });
          })
          .catch(error => res.status(400).send(error));
      });
  },

  /**
    * deleteUser: Delete a user
    * @function deleteUser
    * @param {object} req
    * @param {object} res
    * @return {object} Json data
    */
  deleteUser: (req, res) => {
    if (validate.id(req.params.id)) {
      return res.status(400)
        .send({ message: 'Please use an integer value' });
    }

    const id = parseInt(req.params.id, 10);
    if (id === req.decoded.id) {
      return res.status(400)
        .send({ message: 'The admin cannot delete himself' });
    }
    User
      .findById(id)
      .then((user) => {
        user
          .destroy()
          .then(() => res
            .json({ message: 'User has been deleted successfully' }))
          .catch(error => res.status(400).send(error));
      })
      .catch(error => res.status(400).send(error));
  },

  /**
    * searchUserDocuments:Searches for all documents belonging to a user
    * @function searchUserDocuments
    * @param {object} req
    * @param {object} res
    * @return {object} Json data
    */
  searchUserDocuments: (req, res) => {
    if (validate.id(req.params.id)) {
      return res.status(400)
        .send({ message: 'Please use an integer value' });
    }

    const id = parseInt(req.params.id, 10);
    if (id !== req.decoded.id && !req.isAdmin) {
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
        if (user.Documents.length === 0) {
          return res.status(200)
            .send({ message: 'You currently do not have any documents' });
        }
        res.status(200).send(user.Documents);
      })
      .catch(error => res.status(400).send(error));
  },

  /**
    * searchUsers: Search for a particular user
    * @function searchUsers
    * @param {object} req
    * @param {object} res
    * @return {object} Json data
    */
  searchUsers: (req, res) => {
    const searchString = req.query.q.trim();
    const query = {
      where: { name: { $ilike: `%${searchString}%` } },
      attributes: ['id', 'name', 'email']
    };
    User
      .findAll(query)
      .then((user) => {
        if (user[0] === undefined) {
          return res.status(404).json({ message: 'This user doesn\'t exist' });
        }
        const message = 'User found successfully';
        return res.status(200).json({ message, user });
      })
      .catch(error => res.status(400).send(error));
  },

  /**
    * changeRole: Changes a particular users role
    * @function changeRole
    * @param {object} req
    * @param {object} res
    * @return {object} Json data
    */
  changeRole: (req, res) => {
    if (validate.id(req.params.id)) {
      return res.status(400)
        .send({ message: 'Please use an integer value' });
    }

    const id = parseInt(req.params.id, 10);
    if (id === 1) {
      return res.status(400)
        .send({ message: 'Admins cannot change their role' });
    }
    User
      .findById(id)
      .then((user) => {
        const role = parseInt(req.body.role, 10);
        if (role >= 1 && role <= 3) {
          user
            .update({
              roleId: req.body.role || user.roleId,
            })
            .then(() => res.status(200)
              .json({ message: 'Role changed', user }));
        } else {
          return res.status(404).json({ message: 'invalid command' });
        }
      })
      .catch(error => res.status(400).send(error));
  }
};
