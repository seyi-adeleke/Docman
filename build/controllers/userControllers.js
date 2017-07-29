'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bcrypt = require('../utilities/bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var User = require('../models').User;
var Document = require('../models').Document;

exports.default = {
  signUp: function signUp(req, res) {
    User.findAll({
      where: {
        email: req.body.email
      }
    }).then(function (response) {
      if (response.length === 0) {
        var user = new User();
        return User.create({
          name: req.body.name,
          email: req.body.email,
          password: _bcrypt2.default.hash(req.body.password),
          roleId: 2
        }).then(function (userResponse) {
          var token = user.JWT(userResponse.dataValues.id, userResponse.dataValues.email, userResponse.dataValues.name, userResponse.dataValues.roleId);
          res.status(201).send({
            message: 'Registration Was Succesfull, You have been logged in',
            token: token
          });
        }).catch(function (error) {
          res.status(400).send(error);
        });
      }return res.json({
        message: 'This user exists'
      });
    }).catch(function (error) {
      return res.status(400).send({
        message: 'Your signup was not completed, please crosscheck your information',
        error: error
      });
    });
  },

  login: function login(req, res) {
    User.findAll({
      where: {
        email: req.body.email
      }
    }).then(function (response) {
      if (response.length === 0) {
        return res.json({
          message: 'This account doesnt exist'
        });
      }
      var user = new User();
      var isValidPassword = _bcrypt2.default.comparePassword(req.body.password, response[0].dataValues.password);
      if (isValidPassword) {
        var token = user.JWT(response[0].dataValues.id, response[0].dataValues.email, response[0].dataValues.name, response[0].dataValues.roleId);
        return res.status(200).json({ message: 'login successful', token: token });
      }
      return res.json({
        message: 'email/password incorrect'
      });
    }).catch(function (error) {
      return res.status(400).send(error);
    });
  },

  allUsers: function allUsers(req, res) {
    var query = {
      include: [{
        model: Document,
        as: 'Documents'
      }]
    };
    if (req.query.limit && req.query.offset) {
      query.limit = req.query.limit;
      query.offset = req.query.offset;
    }
    User.findAll(query).then(function (users) {
      return res.status(200).send(users);
    }).catch(function (error) {
      return res.status(400).send(error);
    });
  },

  getUser: function getUser(req, res) {
    var id = parseInt(req.params.id, 10);
    if (id !== req.decoded.id && !req.isAdmin) {
      return res.status(400).send({
        message: 'You do not have access to this users information'
      });
    }
    User.findById(req.params.id, {
      include: [{
        model: Document,
        as: 'Documents'
      }]
    }).then(function (user) {
      return res.status(200).send(user);
    }).catch(function (error) {
      return res.status(400).send(error);
    });
  },

  updateUser: function updateUser(req, res) {
    var id = parseInt(req.params.id, 10);
    if (id !== req.decoded.id) {
      return res.status(400).send({
        message: 'Invalid command'
      });
    }
    User.findById(req.params.id).then(function (user) {
      user.update({
        name: req.body.name || user.name,
        email: req.body.email || user.email
      }).then(function () {
        return res.status(200).send(user);
      }).catch(function (error) {
        return res.status(400).send(error);
      });
    }).catch(function (error) {
      return res.status(400).send(error);
    });
  },

  deleteUser: function deleteUser(req, res) {
    var id = parseInt(req.params.id, 10);
    if (id !== req.decoded.id) {
      return res.status(400).send({
        message: 'Invalid command'
      });
    }
    User.findById(req.params.id).then(function (user) {
      user.destroy().then(function () {
        return res.status(204).send();
      }).catch(function (error) {
        return res.status(400).send(error);
      });
    }).catch(function (error) {
      return res.status(400).send(error);
    });
  },

  searchUserDocuments: function searchUserDocuments(req, res) {
    var id = parseInt(req.params.id, 10);
    if (id !== req.decoded.id) {
      return res.send({
        message: 'you dont have access to these documents'
      });
    }
    User.findById(req.params.id, {
      include: [{
        model: Document,
        as: 'Documents'
      }]
    }).then(function (user) {
      res.status(200).send(user.Documents);
    }).catch(function (error) {
      return res.status(400).send(error);
    });
  },

  searchUsers: function searchUsers(req, res) {
    var query = {
      where: { name: req.query.q }
    };
    User.findAll(query).then(function (user) {
      if (user === undefined) {
        return res.status(404).json({ message: 'this user doesnt exist' });
      }
      return res.status(200).json(user[0].dataValues);
    }).catch(function (error) {
      return res.status(400).send(error);
    });
  }
};