const User = require('../models').User;

module.exports.signUp = (req, res) => {
  User.findAll({
    where: {
      email: req.body.email
    }
  })
    .then((response) => {
      if (response.length === 0) {
        const user = new User();
        return User
          .create({
            name: req.body.name,
            email: req.body.email,
            password: user.generateHash(req.body.password),
          })
          .then(user => res.status(201).send({
            message: 'Registration Was Succesfull'
          }))
          .catch(error =>
            res.status(400).send(error)
          );
      } return res.json({
        message: 'This user exists'
      });
    })
    .catch(error =>
      res.status(400).send(error)
    );
};
