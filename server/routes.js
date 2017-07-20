import usersController from './controllers/users.controllers';
import verify from './utilities/verifyUser';

module.exports = (app) => {
  app.post('/api/v1/users', usersController.signUp);

  app.post('/api/v1/users/login', usersController.login);
  app.get('/api/v1/users', verify.isLoggedIn, usersController.allUsers);

  app.get('/api/v1/users/:id', verify.isLoggedIn, usersController.getUser);
  app.put('/api/v1/users/:id', verify.isLoggedIn, usersController.updateUser);
  app.delete('/api/v1/users/:id', verify.isLoggedIn, usersController.deleteUser);
};

