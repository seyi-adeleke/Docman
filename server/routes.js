import usersController from './controllers/users.controllers';

module.exports = (app) => {
  app.post('/api/v1/users', usersController.signUp);

  app.post('/api/v1/users/login', usersController.login);
  app.get('/api/v1/users', usersController.allUsers);
};

