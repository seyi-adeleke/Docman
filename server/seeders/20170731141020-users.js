const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config();

const saltRounds = 10;

module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Users', [{
    name: process.env.ANAME,
    email: process.env.AEMAIL,
    password: bcrypt.hashSync(process.env.APASSWORD, saltRounds),
    roleId: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  }], {}),
  down: queryInterface => queryInterface.bulkDelete('Users', null, {})
};
