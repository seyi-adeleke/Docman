import usersController from './controllers/userControllers';
import documentsController from './controllers/documentControllers';

import verify from './utilities/verifyUser';

module.exports = (app) => {
  app.post('/api/v1/users',
    usersController.signUp);

  app.post('/api/v1/users/login',
    usersController.login);

  app.get('/api/v1/users',
    verify.isAdmin, usersController.getAllUsers);

  app.get('/api/v1/users/:id',
    verify.isLoggedIn, usersController.getUser);

  app.put('/api/v1/users/:id',
    verify.isLoggedIn, usersController.updateUser);

  app.delete('/api/v1/users/:id',
    verify.isAdmin, usersController.deleteUser);

  app.get('/api/v1/users/:id/documents',
    verify.isLoggedIn, usersController.getUserDocuments);

  app.post('/api/v1/documents',
    verify.isLoggedIn, documentsController.create);

  app.get('/api/v1/documents',
    verify.isLoggedIn, documentsController.getAllDocuments);

  app.get('/api/v1/documents/:id',
    verify.isLoggedIn, documentsController.findDocument);

  app.put('/api/v1/documents/:id',
    verify.isLoggedIn, documentsController.updateDocument);

  app.delete('/api/v1/documents/:id',
    verify.isLoggedIn, documentsController.deleteDocument);

  app.get('/api/v1/search/documents/',
    verify.isLoggedIn, documentsController.searchDocuments);

  app.get('/api/v1/search/users/',
    verify.isLoggedIn, usersController.searchUsers);

  app.put('/api/v1/users/:id/role',
    verify.isAdmin, usersController.changeRole);
};

