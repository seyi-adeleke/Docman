'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  hash: function hash(password) {
    return _bcrypt2.default.hashSync(password, _bcrypt2.default.genSaltSync(8), null);
  },

  comparePassword: function comparePassword(password, hashPassword) {
    return _bcrypt2.default.compareSync(password, hashPassword);
  }

};