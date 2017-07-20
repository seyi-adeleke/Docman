import jwt from 'jsonwebtoken';

const LocalStorage = require('node-localstorage').LocalStorage,
  localStorage = new LocalStorage('./scratch');

module.exports.isLoggedIn = (req, res, next) => {
  if (!localStorage.getItem('jwt')) {
    return res.send({ message: 'You are not logged in' });
  }
  const token = localStorage.getItem('jwt');
  jwt.verify(token, 'secret', (error, decoded) => {
    if (error) {
      return res.send({ message: 'There was an error processing your request' });
    }
    req.decoded = decoded;
    next();
  });
};