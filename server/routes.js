import usersController from './controllers/users.controllers';
import verify from './utilities/verifyUser';

module.exports = (app) => {
  app.post('/api/v1/users', usersController.signUp);

  app.post('/api/v1/users/login', usersController.login);
  app.get('/api/v1/users', verify.isLoggedIn, usersController.allUsers);
};

