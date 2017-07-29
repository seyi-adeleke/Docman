'use strict';

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports.isLoggedIn = function (req, res, next) {
  if (!req.headers.authorization) {
    return res.send({ message: 'You are not logged in' });
  }
  var token = req.headers.authorization;
  _jsonwebtoken2.default.verify(token, 'secret', function (error, decoded) {
    if (error) {
      return res.send({ message: 'There was an error processing your request' });
    }
    req.decoded = decoded;
    if (req.decoded.roleId === 1) {
      req.isAdmin = true;
    }
    next();
  });
};

module.exports.isAdmin = function (req, res, next) {
  if (!req.headers.authorization) {
    return res.send({ message: 'You are not logged in' });
  }
  var token = req.headers.authorization;

  _jsonwebtoken2.default.verify(token, 'secret', function (error, decoded) {
    if (error) {
      return res.send({ message: 'There was an error processing your request' });
    }
    req.decoded = decoded;
    if (req.decoded.roleId !== 1) {
      return res.send({ message: 'You do not have access to this route' });
    }
    req.isAdmin = true;
    next();
  });
};