'use strict';

var _userControllers = require('./controllers/userControllers');

var _userControllers2 = _interopRequireDefault(_userControllers);

var _documentControllers = require('./controllers/documentControllers');

var _documentControllers2 = _interopRequireDefault(_documentControllers);

var _verifyUser = require('./utilities/verifyUser');

var _verifyUser2 = _interopRequireDefault(_verifyUser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (app) {
  app.post('/api/v1/users', _userControllers2.default.signUp);

  app.post('/api/v1/users/login', _userControllers2.default.login);
  app.get('/api/v1/users', _verifyUser2.default.isAdmin, _userControllers2.default.allUsers);

  app.get('/api/v1/users/:id', _verifyUser2.default.isLoggedIn, _userControllers2.default.getUser);
  app.put('/api/v1/users/:id', _verifyUser2.default.isLoggedIn, _userControllers2.default.updateUser);
  app.delete('/api/v1/users/:id', _verifyUser2.default.isAdmin, _userControllers2.default.deleteUser);
  app.get('/api/v1/users/:id/documents', _verifyUser2.default.isLoggedIn, _userControllers2.default.searchUserDocuments);

  app.post('/api/v1/documents', _verifyUser2.default.isLoggedIn, _documentControllers2.default.create);

  app.get('/api/v1/documents', _verifyUser2.default.isAdmin, _documentControllers2.default.list);
  app.get('/api/v1/documents/:id', _verifyUser2.default.isLoggedIn, _documentControllers2.default.findDocument);
  app.put('/api/v1/documents/:id', _verifyUser2.default.isLoggedIn, _documentControllers2.default.updateDocument);
  app.delete('/api/v1/documents/:id', _verifyUser2.default.isLoggedIn, _documentControllers2.default.deleteDocument);

  app.get('/api/v1/search/documents/', _verifyUser2.default.isLoggedIn, _documentControllers2.default.searchDocuments);
  app.get('/api/v1/search/users/', _verifyUser2.default.isLoggedIn, _userControllers2.default.searchUsers);

  app.put('/api/v1/users/:id/role', _verifyUser2.default.isAdmin, _userControllers2.default.changeRole);
};