import usersController from './controllers/users.controllers';

module.exports = (app) => {
  app.post('/api/v1/users', usersController.signUp);
};

