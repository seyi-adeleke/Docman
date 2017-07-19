import bcrypt from 'bcrypt';


export default {
  hash: password => bcrypt.hashSync(password, bcrypt.genSaltSync(8), null),

  comparePassword: (password, hashPassword) => bcrypt.compareSync(password, hashPassword),

};

